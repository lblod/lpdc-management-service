import {serviceUriForId} from "./commonQueries";
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

        const getInstancesFromConcept = `
         SELECT ?s WHERE {
                ?s <http://purl.org/dc/terms/source> ${sparqlEscapeUri(conceptUri)} .
        }
    `;
        const instancesFromConcept = (await query(getInstancesFromConcept)).results.bindings;

        if (instancesFromConcept.length === 0) {

            const getDisplayConfigurationQuery = `
        SELECT ?o WHERE {
                ${sparqlEscapeUri(conceptUri)} <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasConceptDisplayConfiguration> ?o .
        }    
    `;
            const displayConfigurationUri = (await query(getDisplayConfigurationQuery)).results.bindings[0]?.o?.value;

            if (displayConfigurationUri) {
                const updateIsInstantiatedQuery = `
            DELETE {
                GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
                    ${sparqlEscapeUri(displayConfigurationUri)} <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#conceptInstantiated> ?o .
                }
            }
            INSERT {
                GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
                    ${sparqlEscapeUri(displayConfigurationUri)} <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#conceptInstantiated> "false"^^<http://mu.semte.ch/vocabularies/typed-literals/boolean> .
                }
            }
            WHERE {
                GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
                    ${sparqlEscapeUri(displayConfigurationUri)} <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#conceptInstantiated> ?o .
                }
            }        
        `;
                await update(updateIsInstantiatedQuery);
            } else {
                console.error('No displayConfiguration found');
            }
        }
    }
}