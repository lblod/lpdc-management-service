import {Iri} from "../../src/core/domain/shared/iri";
import {PREFIX, PUBLIC_GRAPH} from "../../config";
import {sparqlEscapeUri} from "../../mu-helper";
import {DirectDatabaseAccess} from "../../test/driven/persistence/direct-database-access";
import {
    BestuurseenheidSparqlTestRepository
} from "../../test/driven/persistence/bestuurseenheid-sparql-test-repository";
import {Bestuurseenheid} from "../../src/core/domain/bestuurseenheid";
import {InstanceSparqlRepository} from "../../src/driven/persistence/instance-sparql-repository";
import {Instance} from "../../src/core/domain/instance";
import {NotFoundError, SystemError} from "../../src/core/domain/shared/lpdc-error";
import {InstanceStatusType} from "../../src/core/domain/types";
import {wait} from "ts-retry-promise";

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

        const uuidsForBestuursEenheid: UUIDS[] = [];

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
                uuidsForBestuursEenheid.push(uuidsForInstance);
                uuidsForInstance.instance = instance;

                totalInstancesProcessed++;

                try {
                    await fetchInstanceByValue(uuidExtractedFromId, instance);
                    uuidsForInstance.extractedFromIdFound = true;
                } catch (NotFoundError) {
                    try {
                        await fetchInstanceByValue(uuidAsValue, instance);
                        uuidsForInstance.asValueFound = true;
                    } catch (NotFoundError) { /* empty */
                        if (instance.status === InstanceStatusType.VERSTUURD) {
                            throw new Error(`instantie ${instance.id} is verstuurd, but cannot be found in ipdc ...`);
                        }
                    }
                }
                if (uuidsForInstance.extractedFromIdFound
                    && uuidsForInstance.asValueFound) {
                    throw new Error(`instantie ${instance.id} found two times ...`);
                }
            }
        }

        const instancesForWhichUuidExtractedFromIdIsLeading =
            uuidsForBestuursEenheid
                .filter(uuids => (uuids.extractedFromIdFound || (!uuids.extractedFromIdFound && !uuids.asValueFound)));

        const instancesForWhichUuidAsValueFrom =
            uuidsForBestuursEenheid
                .filter(uuids => uuids.asValueFound);

        instancesForWhichUuidExtractedFromIdIsLeading.forEach(uuids => {
            console.log(`${uuids.instance.id} [${uuids.extractedFromId}:${uuids.extractedFromIdFound}]  [${uuids.asValue}:${uuids.asValueFound}]`);
        });
        //TODO LPDC-1172: write out sparql queries if size  instancesForWhichUuidExtractedFromIdIsLeading > 0

        instancesForWhichUuidAsValueFrom.forEach(uuids => {
            console.log(`${uuids.instance.id} [${uuids.extractedFromId}:${uuids.extractedFromIdFound}]  [${uuids.asValue}:${uuids.asValueFound}]`);
        });
        //TODO LPDC-1172: write out sparql queries if size  instancesForWhichUuidAsValueFrom > 0

        console.log(`total instances processed ` + totalInstancesProcessed);

        //TODO LPDC-1172: remove if condition ...
        if (totalInstancesProcessed > 5000) {
            break;
        }
    }
    console.log('total instances processed ' + totalInstancesProcessed);
}

//copied from instance-informal-language-strings-fetcher.ipdc.ts
async function fetchInstanceByValue(uuid: string, instance: Instance): Promise<string> {
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