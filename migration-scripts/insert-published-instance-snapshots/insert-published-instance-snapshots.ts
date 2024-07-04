import {Iri} from "../../src/core/domain/shared/iri";
import {PREFIX, PUBLIC_GRAPH} from "../../config";
import {sparqlEscapeDateTime, sparqlEscapeUri, uuid} from "../../mu-helper";
import {DirectDatabaseAccess} from "../../test/driven/persistence/direct-database-access";
import {
    BestuurseenheidSparqlTestRepository
} from "../../test/driven/persistence/bestuurseenheid-sparql-test-repository";
import {Bestuurseenheid} from "../../src/core/domain/bestuurseenheid";
import {InstanceSparqlRepository} from "../../src/driven/persistence/instance-sparql-repository";
import {DomainToQuadsMapper} from "../../src/driven/persistence/domain-to-quads-mapper";
import {PublishedInstanceSnapshotBuilder} from "../../src/core/domain/published-instance-snapshot";
import fs from "fs";
import {InstanceStatusType} from "../../src/core/domain/types";
import {FormatPreservingDate} from "../../src/core/domain/format-preserving-date";

const sparqlUrl = process.env.SPARQL_URL;

const instanceRepository = new InstanceSparqlRepository(sparqlUrl);
const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(sparqlUrl);
const directDatabaseAccess = new DirectDatabaseAccess(sparqlUrl);

async function main() {

    let totalInstancesProcessed = 0;

    const bestuurseenhedenIds: Iri[] = await getAllBestuurseenheden();
    console.log("total bestuurseenheden " + bestuurseenhedenIds.length);

    for (const bestuurseenheidId of bestuurseenhedenIds) {
        const bestuurseenheid = await bestuurseenheidRepository.findById(bestuurseenheidId);
        const instanceIds = await getAllPublishedInstanceIdsForBestuurseenheidWithoutPublishedSnapshot(bestuurseenheid);

        const segmentedBestuurseenheidId = bestuurseenheidId.value.split('/');
        const uuidExtractedFromBestuurseenheidId = segmentedBestuurseenheidId[segmentedBestuurseenheidId.length - 1];

        let insertQuads = [];
        const baseFileName = `${now()}-insert-published-instance-snapshots-${uuidExtractedFromBestuurseenheidId}`;

        for (const {id: instanceId, datePublished} of instanceIds) {
            const instance = await instanceRepository.findById(bestuurseenheid, instanceId);

            if (instance.dateSent
                && instance.status === InstanceStatusType.VERZONDEN) {

                const publishedInstanceSnapshot = PublishedInstanceSnapshotBuilder.from(instance);
                const publishedInstanceSnapshotTriples = new DomainToQuadsMapper(bestuurseenheid.userGraph()).publishedInstanceSnapshotToQuads(publishedInstanceSnapshot);

                insertQuads.push(...publishedInstanceSnapshotTriples.map(quad => quad.toNT()));
                insertQuads.push(`<${publishedInstanceSnapshot.id.value}> <http://schema.org/datePublished> ${sparqlEscapeDateTime(datePublished.value)}.`);

                totalInstancesProcessed++;

                if (insertQuads.length > 1000) {
                    fs.writeFileSync(`./migration-results/${baseFileName}-${insertQuads.length}.sparql`,
                        `INSERT DATA {
                            GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                                ${insertQuads.join('\n')}
                            }
                            }
                                `);
                    insertQuads = [];
                }

            }
        }

        if (insertQuads.length > 0) {
            fs.writeFileSync(`./migration-results/${baseFileName}-${insertQuads.length}.sparql`,
                `INSERT DATA {
                            GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                                ${insertQuads.join('\n')}
                                }
                            }
                                `);
        }

        console.log(`total instances processed ` + totalInstancesProcessed);
    }

    console.log('total instances processed ' + totalInstancesProcessed);

    const deleteDatePublishedInstances = `
            ${PREFIX.lpdcExt}
            ${PREFIX.schema}
            
             DELETE {
                GRAPH ?g {
                    ?id schema:datePublished ?datePublished
                }
            }  
            WHERE {
                GRAPH ?g {
                    ?id a lpdcExt:InstancePublicService;
                        schema:datePublished ?datePublished.                
                }
            }
            `;
    fs.writeFileSync(`./migration-results/${now()}-delete-date-published-instances.sparql`, deleteDatePublishedInstances);

    let totalTombstonesProcessed = 0;

    for (const bestuurseenheidId of bestuurseenhedenIds) {
        const bestuurseenheid = await bestuurseenheidRepository.findById(bestuurseenheidId);
        const tombstoneIds = await getAllPublishedTombstonesForBestuurseenheid(bestuurseenheid);

        const segmentedBestuurseenheidId = bestuurseenheidId.value.split('/');
        const uuidExtractedFromBestuurseenheidId = segmentedBestuurseenheidId[segmentedBestuurseenheidId.length - 1];

        const insertQuads = [];
        const baseFileName = `${now()}-insert-tombstone-instance-snapshots-${uuidExtractedFromBestuurseenheidId}`;

        for (const {id: instanceId, dateDeleted, datePublished} of tombstoneIds) {
            const uniqueId = uuid();
            const tombstoneId = PublishedInstanceSnapshotBuilder.buildIri(uniqueId);

            insertQuads.push(`<${tombstoneId.value}> a <https://www.w3.org/ns/activitystreams#Tombstone>.`);
            insertQuads.push(`<${tombstoneId.value}> <https://www.w3.org/ns/activitystreams#formerType> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>.`);
            insertQuads.push(`<${tombstoneId.value}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#isPublishedVersionOf> <${instanceId.value}>.`);
            insertQuads.push(`<${tombstoneId.value}> <https://www.w3.org/ns/activitystreams#deleted>  ${sparqlEscapeDateTime(dateDeleted.value)} .`);
            insertQuads.push(`<${tombstoneId.value}> <http://www.w3.org/ns/prov#generatedAtTime>  ${sparqlEscapeDateTime(dateDeleted.value)} .`);
            insertQuads.push(`<${tombstoneId.value}> <http://schema.org/datePublished>  ${sparqlEscapeDateTime(datePublished.value)} .`);

            totalTombstonesProcessed = totalTombstonesProcessed + 1;
        }

        if (insertQuads.length > 0) {
            fs.writeFileSync(`./migration-results/${baseFileName}.sparql`,
                `INSERT DATA {
                            GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                                ${insertQuads.join('\n')}
                            }
                            }
                                `);
        }
        console.log(`total tombstones processed ` + totalTombstonesProcessed);
    }
    console.log(`total tombstones processed ` + totalTombstonesProcessed);

    const deleteTombstoneInstances = `
            ${PREFIX.as}
            ${PREFIX.lpdcExt}
            
             DELETE {
                GRAPH ?g {
                     ?s ?p ?o
                }
            }  
            WHERE {
                GRAPH ?g {
                    ?s a as:Tombstone;
                         ?p ?o .
                    FILTER NOT EXISTS {
                        ?s lpdcExt:isPublishedVersionOf ?instanceid.
                    } 
                }
            }

            `;
    fs.writeFileSync(`./migration-results/${now()}-delete-tombstone-instances.sparql`, deleteTombstoneInstances);


}

async function getAllBestuurseenheden(): Promise<Iri[]> {
    const query = `
            ${PREFIX.besluit}
            SELECT ?id WHERE {
                GRAPH ${sparqlEscapeUri(PUBLIC_GRAPH)} {
                    ?id a besluit:Bestuurseenheid .
                }
            }
        `;
    const bestuurseenheden = await directDatabaseAccess.list(query);
    return bestuurseenheden.map(bestuurseenheid => new Iri(bestuurseenheid['id'].value));
}

async function getAllPublishedInstanceIdsForBestuurseenheidWithoutPublishedSnapshot(bestuurseenheid: Bestuurseenheid): Promise<InstanceAndDatePublished[]> {
    const query = `
            ${PREFIX.lpdcExt}
            ${PREFIX.schema}
            
            SELECT ?id ?datePublished WHERE {
                GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                    ?id a lpdcExt:InstancePublicService;
                        schema:datePublished ?datePublished.
                        
                    FILTER NOT EXISTS {
                        ?publishedSnapshot lpdcExt:isPublishedVersionOf ?id
                    }    
                }
            }
            `;
    const results = await directDatabaseAccess.list(query);
    return results.map(result => {
        return {
            id: new Iri(result['id'].value),
            datePublished: FormatPreservingDate.of(result['datePublished'].value),
        };
    });
}

async function getAllPublishedTombstonesForBestuurseenheid(bestuurseenheid: Bestuurseenheid): Promise<TombstoneData[]> {
    const query = `
            ${PREFIX.lpdcExt}
            ${PREFIX.schema}
            ${PREFIX.as}           
            
            SELECT ?id ?dateDeleted ?datePublished WHERE {
                GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                    ?id a as:Tombstone;
                        schema:datePublished ?datePublished;
                        as:deleted ?dateDeleted;
                        as:formerType lpdcExt:InstancePublicService.
                    FILTER NOT EXISTS {
                        ?id lpdcExt:isPublishedVersionOf ?instanceid.
                    } 
                }
            }
            `;
    const results = await directDatabaseAccess.list(query);
    return results.map(result => {
        return {
            id: new Iri(result['id'].value),
            dateDeleted: FormatPreservingDate.of(result['dateDeleted'].value),
            datePublished: FormatPreservingDate.of(result['datePublished'].value),
        };
    });
}

function now() {
    const now = new Date();
    return `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}${(now.getHours() + 1).toString().padStart(2, '0')}${(now.getMinutes() + 1).toString().padStart(2, '0')}${(now.getSeconds() + 1).toString().padStart(2, '0')}`;
}


type InstanceAndDatePublished = {
    id: Iri,
    datePublished: FormatPreservingDate,
}

type TombstoneData = {
    id: Iri,
    datePublished: FormatPreservingDate,
    dateDeleted: FormatPreservingDate,
}

main();