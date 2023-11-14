import {conceptUriForId, serviceUriForId} from "./commonQueries";
import {query, sparqlEscapeDateTime, sparqlEscapeUri, update} from "mu";
import {APPLICATION_GRAPH} from "../config";

export async function unlinkConcept(publicServiceUUID) {
    const serviceUri = await serviceUriForId(publicServiceUUID);

    const getConceptFromInstance = `
        SELECT DISTINCT ?o WHERE {
                ${sparqlEscapeUri(serviceUri)} <http://purl.org/dc/terms/source> ?o .
        }    
    `;
    const conceptUri = (await query(getConceptFromInstance))?.results.bindings[0]?.o?.value;

    if (conceptUri) {
        const deleteSourceQuery = `
        DELETE {
            GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
                ${sparqlEscapeUri(serviceUri)} <http://purl.org/dc/terms/source> ?o .
            }
        }
        WHERE {
            GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
                ${sparqlEscapeUri(serviceUri)} <http://purl.org/dc/terms/source> ?o .
            }
        }
    `;
        await update(deleteSourceQuery);

        await updateModified(serviceUri);

        const getInstancesFromConcept = `
         SELECT ?s WHERE {
                ?s <http://purl.org/dc/terms/source> ${sparqlEscapeUri(conceptUri)} .
        }
    `;
        const instancesFromConcept = (await query(getInstancesFromConcept)).results.bindings;

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

export async function linkConcept(publicServiceUUID, conceptUUID){
    const serviceUri = await serviceUriForId(publicServiceUUID);
    const conceptUri = await conceptUriForId(conceptUUID);

    if(conceptUri){
        const createSourceQuery = `
        DELETE {
             GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
                ${sparqlEscapeUri(serviceUri)} <http://purl.org/dc/terms/source> ?o .
            }
        }

        INSERT {
             GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
                ${sparqlEscapeUri(serviceUri)} <http://purl.org/dc/terms/source> ${sparqlEscapeUri(conceptUri)} .
            }
        }
        WHERE {
             GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
                ${sparqlEscapeUri(serviceUri)} <http://purl.org/dc/terms/source> ?o .
            }
        }
    `;
        await update(createSourceQuery);

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

async function getDisplayConfiguration(conceptUri){
    const getDisplayConfigurationQuery = `
        SELECT ?o WHERE {
                ${sparqlEscapeUri(conceptUri)} <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasConceptDisplayConfiguration> ?o .
        }    
    `;
    return (await query(getDisplayConfigurationQuery)).results.bindings[0]?.o?.value;
}

async function updateIsInstantiated(displayConfigurationUri, boolean){
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