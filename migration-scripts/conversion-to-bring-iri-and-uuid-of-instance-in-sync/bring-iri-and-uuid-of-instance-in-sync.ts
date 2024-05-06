import {Iri} from "../../src/core/domain/shared/iri";
import {PREFIX, PUBLIC_GRAPH} from "../../config";
import {sparqlEscapeString, sparqlEscapeUri} from "../../mu-helper";
import {DirectDatabaseAccess} from "../../test/driven/persistence/direct-database-access";
import {
    BestuurseenheidSparqlTestRepository
} from "../../test/driven/persistence/bestuurseenheid-sparql-test-repository";
import {Bestuurseenheid} from "../../src/core/domain/bestuurseenheid";
import {InstanceSparqlRepository} from "../../src/driven/persistence/instance-sparql-repository";
import {Instance} from "../../src/core/domain/instance";
import {NotFoundError, SystemError} from "../../src/core/domain/shared/lpdc-error";
import {wait} from "ts-retry-promise";
import fs from "fs";

const sparqlUrl = process.env.SPARQL_URL;

const instanceRepository = new InstanceSparqlRepository(sparqlUrl);
const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(sparqlUrl);
const directDatabaseAccess = new DirectDatabaseAccess(sparqlUrl);

const ipdcUrl = process.env.IPDC_API_URL;
const ipdcAuthenticationKey = process.env.IPDC_API_AUTHENTICATION_KEY;

type UUIDS = {
    instance?: Instance;
    extractedFromId?: string;
    extractedFromIdFound?: boolean;
    asValue?: string;
    asValueFound?: boolean;
}


async function main() {


    let totalInstancesProcessed = 0;

    const bestuurseenhedenIds: Iri[] = await getAllBestuurseenheden();
    console.log("total bestuurseenheden " + bestuurseenhedenIds.length);

    for (const bestuurseenheidId of bestuurseenhedenIds) {
        const bestuurseenheid = await bestuurseenheidRepository.findById(bestuurseenheidId);
        const instanceIds = await getAllInstanceIdsForBestuurseenheid(bestuurseenheid);

        const uuidsForBestuurseenheid: UUIDS[] = [];

        const now = new Date();
        const segmentedBestuurseenheidId = bestuurseenheidId.value.split('/');
        const uuidExtractedFromBestuurseenheidId = segmentedBestuurseenheidId[segmentedBestuurseenheidId.length - 1];

        const formattedDate = `${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}${(now.getHours()+1).toString().padStart(2, '0')}${(now.getMinutes()+1).toString().padStart(2, '0')}${(now.getSeconds()+1).toString().padStart(2, '0')}`;

        const sparqlFileUuidExtractedFromIdIsLeading = `${formattedDate}-instance-copy-uuid-from-iri-to-uuid-triple-${uuidExtractedFromBestuurseenheidId}.sparql`;
        const sparqlFileUuidAsValueFromIsLeading = `${formattedDate}-instance-copy-uuid-from-value-to-iri-${uuidExtractedFromBestuurseenheidId}.sparql`;

        for (const instanceId of instanceIds) {
            const instance = await instanceRepository.findById(bestuurseenheid, instanceId);

            const segmentedId = instance.id.value.split('/');
            const uuidExtractedFromId = segmentedId[segmentedId.length - 1];

            const uuidAsValue = instance.uuid;

            if (uuidExtractedFromId !== uuidAsValue) {
                const uuidsForInstance: UUIDS = {
                    extractedFromId: uuidExtractedFromId,
                    asValue: uuidAsValue
                };
                uuidsForBestuurseenheid.push(uuidsForInstance);
                uuidsForInstance.instance = instance;

                totalInstancesProcessed++;

                try {
                    await fetchInstanceByUuid(uuidExtractedFromId, instance);
                    uuidsForInstance.extractedFromIdFound = true;
                } catch (NotFoundError) {
                    try {
                        await fetchInstanceByUuid(uuidAsValue, instance);
                        uuidsForInstance.asValueFound = true;
                    } catch (NotFoundError) { /* empty */
                    }
                }

                if (uuidsForInstance.extractedFromIdFound
                    && uuidsForInstance.asValueFound) {
                    throw new Error(`instantie ${instance.id} found two times ...`);
                }

                if (!uuidsForInstance.extractedFromIdFound
                    && !uuidsForInstance.asValueFound
                    && instance.datePublished) {
                    throw new Error(`instantie ${instance.id} is verstuurd (date published present), but cannot be found in ipdc ...`);
                }

            }
        }

        const instancesForWhichUuidExtractedFromIdIsLeading =
            uuidsForBestuurseenheid
                .filter(uuids => (uuids.extractedFromIdFound || (!uuids.extractedFromIdFound && !uuids.asValueFound)));

        const instancesForWhichUuidAsValueIsLeading =
            uuidsForBestuurseenheid
                .filter(uuids => uuids.asValueFound);


        if(instancesForWhichUuidExtractedFromIdIsLeading.length > 0) {

            instancesForWhichUuidExtractedFromIdIsLeading.forEach(uuids => {
                console.log(`${uuids.instance.id} [${uuids.extractedFromId}:${uuids.extractedFromIdFound}]  [${uuids.asValue}:${uuids.asValueFound}]`);
            });

            const instancesForWhichUuidExtractedFromIdIsLeadingSparqlQuery =
                `DELETE {
                    GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                        ?instance <http://mu.semte.ch/vocabularies/core/uuid> ?uuidtoupdate.
                    }
                }
                INSERT {
                    GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                        ?instance <http://mu.semte.ch/vocabularies/core/uuid> ?updateduuid.
                    }
                }
                WHERE {
                    GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                        VALUES (?instance ?uuidtoupdate ?updateduuid) {
                            ${instancesForWhichUuidExtractedFromIdIsLeading.map(uuids => `(${sparqlEscapeUri(uuids.instance.id)} ${sparqlEscapeString(uuids.asValue)} ${sparqlEscapeString(uuids.extractedFromId)})`).join('\r\n')}
                        }
                        ?instance a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>.
                        ?instance <http://mu.semte.ch/vocabularies/core/uuid> ?uuidtoupdate.
                        }                
                }`;

            fs.writeFileSync(`./migration-results/${sparqlFileUuidExtractedFromIdIsLeading}`, instancesForWhichUuidExtractedFromIdIsLeadingSparqlQuery);
            console.log(instancesForWhichUuidExtractedFromIdIsLeadingSparqlQuery);
        }

        if(instancesForWhichUuidAsValueIsLeading.length > 0) {

            instancesForWhichUuidAsValueIsLeading.forEach(uuids => {
                console.log(`${uuids.instance.id} [${uuids.extractedFromId}:${uuids.extractedFromIdFound}]  [${uuids.asValue}:${uuids.asValueFound}]`);
            });

            const instancesForWhichUuidAsValueIsLeadingSparqlQuery = `
                    DELETE {
                        GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                            ?instance ?anypredicate ?anyobject.
                        }
                    }
                    INSERT {
                        GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                            ?newinstanceid ?anypredicate ?anyobject.
                        }
                    }
                    WHERE {
                        GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                            VALUES (?instance ?uuidtoupdate ?updateduuid) {
                                ${instancesForWhichUuidAsValueIsLeading.map(uuids => `(${sparqlEscapeUri(uuids.instance.id)} ${sparqlEscapeString(uuids.extractedFromId)} ${sparqlEscapeString(uuids.asValue)})`).join('\r\n')}
                            }
                            ?instance a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>.
                            ?instance ?anypredicate ?anyobject.
                        }
                    
                        BIND(IRI(CONCAT(STR("http://data.lblod.info/id/public-service/"), STR(?updateduuid))) as ?newinstanceid)
                    }`;

            fs.writeFileSync(`./migration-results/${sparqlFileUuidAsValueFromIsLeading}`, instancesForWhichUuidAsValueIsLeadingSparqlQuery);
            console.log(instancesForWhichUuidAsValueIsLeadingSparqlQuery);
        }

        console.log(`total instances processed ` + totalInstancesProcessed);
    }

    console.log('total instances processed ' + totalInstancesProcessed);
}

//inspired by instance-informal-language-strings-fetcher.ipdc.ts
async function fetchInstanceByUuid(uuid: string, instance: Instance): Promise<string> {
    await wait(100);
    const response = await fetch(`${ipdcUrl}/doc/instantie/${uuid}`, {
        headers: {'Accept': 'application/ld+json', 'x-api-key': ipdcAuthenticationKey}
    });
    if (response.ok) {
        const instanceJson = await response.json();
        // ipdc generates a new iri-id for our id ; so we need to mimic in the read data that it is our id referenced ...
        instanceJson['@id'] = instance.id.value;
        return instanceJson;
    }
    if (response.status === 401) {
        console.error(await response.text());
        throw new SystemError(`Niet geauthenticeerd bij ipdc`);
    } else if (response.status === 404) {
        //console.error(await response.text());
        throw new NotFoundError(`Instantie ${instance.id} niet gevonden bij ipdc`);
    } else {
        //console.error(await response.text());
        throw new SystemError(`Er is een fout opgetreden bij het bevragen van Ipdc voor instantie ${instance.id}; status=[${response.status}]`);
    }
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

async function getAllInstanceIdsForBestuurseenheid(bestuurseenheid: Bestuurseenheid): Promise<Iri[]> {
    const query = `
            ${PREFIX.lpdcExt}
            SELECT ?id WHERE {
                GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                    ?id a lpdcExt:InstancePublicService .
                }
            }
            `;
    const instanceIds = await directDatabaseAccess.list(query);
    return instanceIds.map(instanceId => new Iri(instanceId['id'].value));
}

main();