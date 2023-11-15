import {conceptUriForId, serviceUriForId} from "./commonQueries";
import {query, sparqlEscapeDateTime, sparqlEscapeUri, update} from "mu";
import {APPLICATION_GRAPH} from "../config";

export async function unlinkConcept(publicServiceUUID) {
    const serviceUri = await serviceUriForId(publicServiceUUID);
    const conceptUri = await getConceptOfInstance(serviceUri);
    await unlink(serviceUri);
    if (conceptUri) {
        await updateModified(serviceUri);
        const instancesFromConcept = await getInstancesOfConcept(conceptUri);
        if (instancesFromConcept.length === 0) {

            const displayConfigurationUri = await getDisplayConfiguration(conceptUri);
            if (displayConfigurationUri) {
                await updateIsInstantiated(displayConfigurationUri, false);
            } else {
                console.error('No displayConfiguration found');
            }
        }
    }
}

export async function linkConcept(publicServiceUUID, conceptUUID) {
    const serviceUri = await serviceUriForId(publicServiceUUID, 'cpsv:PublicService');
    const conceptUri = await serviceUriForId(conceptUUID, 'lpdcExt:ConceptualPublicService');
    if (conceptUri) {
        const snapshotUri = await getVersionedSourceOfConcept(conceptUri);
        await link(serviceUri, conceptUri, snapshotUri);
        await updateModified(serviceUri);

        const displayConfigurationUri = await getDisplayConfiguration(conceptUri);
        if (displayConfigurationUri) {
            await updateIsInstantiated(displayConfigurationUri, true);
        } else {
            console.error('No displayConfiguration found');
        }
    }
}

async function updateModified(serviceUri) {
    const now = new Date().toISOString();
    const updateModifiedQuery = `
        DELETE {
             GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
                ${sparqlEscapeUri(serviceUri)} <http://purl.org/dc/terms/modified> ?oldModified .
            }
        }
        INSERT {
             GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
                ${sparqlEscapeUri(serviceUri)} <http://purl.org/dc/terms/modified> ${sparqlEscapeDateTime(now)} .
            }
        }
        WHERE {
             GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
                ${sparqlEscapeUri(serviceUri)} <http://purl.org/dc/terms/modified> ?oldModified .
            }
        }
    `;
    await update(updateModifiedQuery);
}

async function getDisplayConfiguration(conceptUri) {
    const getDisplayConfigurationQuery = `
        SELECT ?o WHERE {
                ${sparqlEscapeUri(conceptUri)} <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasConceptDisplayConfiguration> ?o .
        }    
    `;
    return (await query(getDisplayConfigurationQuery)).results.bindings[0]?.o?.value;
}

async function updateIsInstantiated(displayConfigurationUri, boolean) {
    const updateIsInstantiatedQuery = `
            DELETE {
                GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
                    ${sparqlEscapeUri(displayConfigurationUri)} <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#conceptInstantiated> ?o .
                }
            }
            INSERT {
                GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
                    ${sparqlEscapeUri(displayConfigurationUri)} <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#conceptInstantiated> "${boolean}"^^<http://mu.semte.ch/vocabularies/typed-literals/boolean> .
                }
            }
            WHERE {
                GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
                    ${sparqlEscapeUri(displayConfigurationUri)} <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#conceptInstantiated> ?o .
                }
            }        
        `;
    await update(updateIsInstantiatedQuery);
}

async function getConceptOfInstance(instanceUri) {
    const getConceptFromInstance = `
        SELECT DISTINCT ?o WHERE {
                ${sparqlEscapeUri(instanceUri)} <http://purl.org/dc/terms/source> ?o .
        }    
    `;
    return (await query(getConceptFromInstance))?.results.bindings[0]?.o?.value;
}

async function getInstancesOfConcept(conceptUri) {
    const getInstancesFromConcept = `
         SELECT ?s WHERE {
                ?s <http://purl.org/dc/terms/source> ${sparqlEscapeUri(conceptUri)} .
        }
    `;
    return (await query(getInstancesFromConcept)).results.bindings.map(instance => instance.s.value);
}

async function getVersionedSourceOfConcept(conceptUri) {
    const queryString = `
         SELECT ?o WHERE {
            ${sparqlEscapeUri(conceptUri)} <http://mu.semte.ch/vocabularies/ext/hasVersionedSource> ?o .
        }
    `;
    return (await query(queryString)).results.bindings[0]?.o?.value;
}

async function unlink(serviceUri) {
    const deleteSourceAndHasVersionedSourceQuery = `
        DELETE {
            GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
               ${sparqlEscapeUri(serviceUri)} <http://purl.org/dc/terms/source> ?concept .
               ${sparqlEscapeUri(serviceUri)} <http://mu.semte.ch/vocabularies/ext/hasVersionedSource> ?snapshot .
            }
        }
        WHERE {
            GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
                OPTIONAL {
                    ${sparqlEscapeUri(serviceUri)} <http://purl.org/dc/terms/source> ?concept .
                }
                OPTIONAL {
                    ${sparqlEscapeUri(serviceUri)} <http://mu.semte.ch/vocabularies/ext/hasVersionedSource> ?snapshot .
                }
            }
        }`
    ;
    await update(deleteSourceAndHasVersionedSourceQuery);
}

async function link(serviceUri, conceptUri, snapshotUri) {
    const createSourceQuery = `
        DELETE {
             GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
                ${sparqlEscapeUri(serviceUri)} <http://purl.org/dc/terms/source> ?o .
                ${sparqlEscapeUri(serviceUri)} <http://mu.semte.ch/vocabularies/ext/hasVersionedSource> ?snapshot .
            }
        }
        INSERT {
             GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
                ${sparqlEscapeUri(serviceUri)} <http://purl.org/dc/terms/source> ${sparqlEscapeUri(conceptUri)} .
                ${sparqlEscapeUri(serviceUri)} <http://mu.semte.ch/vocabularies/ext/hasVersionedSource> ${sparqlEscapeUri(snapshotUri)} .
            }
        }
        WHERE {
             GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
                OPTIONAL {
                    ${sparqlEscapeUri(serviceUri)} <http://purl.org/dc/terms/source> ?o .
                }
                OPTIONAL {
                    ${sparqlEscapeUri(serviceUri)} <http://mu.semte.ch/vocabularies/ext/hasVersionedSource> ?snapshot .
                }
            }
        }
    `;
    await update(createSourceQuery);
}