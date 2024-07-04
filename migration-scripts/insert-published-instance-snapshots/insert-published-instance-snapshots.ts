import {Iri} from "../../src/core/domain/shared/iri";
import {PREFIX, PUBLIC_GRAPH} from "../../config";
import {sparqlEscapeDateTime, sparqlEscapeUri} from "../../mu-helper";
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
        let baseFileName = `${now()}-insert-published-instance-snapshots-${uuidExtractedFromBestuurseenheidId}`;

        for (const {id: instanceId, datePublished} of instanceIds) {
            const instance = await instanceRepository.findById(bestuurseenheid, instanceId);

            if (instance.dateSent !== undefined
                && instance.status === InstanceStatusType.VERZONDEN) {

                const publishedInstanceSnapshot = PublishedInstanceSnapshotBuilder.from(instance);
                const publishedInstanceSnapshotTriples = new DomainToQuadsMapper(bestuurseenheid.userGraph()).publishedInstanceSnapshotToQuads(publishedInstanceSnapshot);

                insertQuads.push(...publishedInstanceSnapshotTriples.map(quad => quad.toNT()));
                insertQuads.push(`<${publishedInstanceSnapshot.id.value}> <http://schema.org/datePublished> ${sparqlEscapeDateTime(datePublished.value)}.`);

                totalInstancesProcessed++;

                if (insertQuads.length > 1000) {
                    fs.writeFileSync(`./migration-results/${baseFileName}.sparql`,
                        `INSERT DATA {
                            GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                                ${insertQuads.join('\n')}
                            }
                            }
                                `);
                    insertQuads = [];
                    baseFileName = `${now()}-insert-published-instance-snapshots-${uuidExtractedFromBestuurseenheidId}`;
                }

            }
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

        console.log(`total instances processed ` + totalInstancesProcessed);
    }

    //TODO: LPDC-1236: write out ONE sparql script that cleans up the date published from all instances (not from tombstones)?; to be run last

    console.log('total instances processed ' + totalInstancesProcessed);
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

function now() {
    const now = new Date();
    return `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}${(now.getHours() + 1).toString().padStart(2, '0')}${(now.getMinutes() + 1).toString().padStart(2, '0')}${(now.getSeconds() + 1).toString().padStart(2, '0')}`;
}


type InstanceAndDatePublished = {
    id: Iri,
    datePublished: FormatPreservingDate,

}

main();