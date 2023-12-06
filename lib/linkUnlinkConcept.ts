import { removeReviewStatus, serviceUriForId } from "./commonQueries";
import { query, sparqlEscapeDateTime, sparqlEscapeUri, update } from "../mu-helper";
import { APPLICATION_GRAPH } from "../config";

export async function unlinkConcept(instanceUUID) {
    const instanceUri = await serviceUriForId(instanceUUID, 'cpsv:PublicService');
    const conceptUri = await getConceptOfInstance(instanceUri);
    await unlink(instanceUri);
    await removeReviewStatus(instanceUri);
    await updateModified(instanceUri);

    if (conceptUri) {
        const instancesFromConcept = await getInstancesOfConcept(conceptUri);
        if (instancesFromConcept.length === 0) {

            const displayConfigurationUri = await getDisplayConfiguration(conceptUri);
            if (displayConfigurationUri) {
                await updateDisplayConfiguration(displayConfigurationUri, false, false);
            } else {
                console.error('No displayConfiguration found');
            }
        }
    }
}

export async function linkConcept(instanceUUID, conceptUUID) {
    const instanceUri = await serviceUriForId(instanceUUID, 'cpsv:PublicService');
    const conceptUri = await serviceUriForId(conceptUUID, 'lpdcExt:ConceptualPublicService');
    if (conceptUri) {
        const snapshotUri = await getVersionedSourceOfConcept(conceptUri);
        await link(instanceUri, conceptUri, snapshotUri);
        await updateModified(instanceUri);

        const displayConfigurationUri = await getDisplayConfiguration(conceptUri);
        if (displayConfigurationUri) {
            await updateDisplayConfiguration(displayConfigurationUri, true, false);
        } else {
            console.error('No displayConfiguration found');
        }
    }
}

async function updateModified(instanceUri) {
    const now = new Date().toISOString();
    const updateModifiedQuery = `
        DELETE {
             GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
                ${sparqlEscapeUri(instanceUri)} <http://purl.org/dc/terms/modified> ?oldModified .
            }
        }
        INSERT {
             GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
                ${sparqlEscapeUri(instanceUri)} <http://purl.org/dc/terms/modified> ${sparqlEscapeDateTime(now)} .
            }
        }
        WHERE {
             GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
                ${sparqlEscapeUri(instanceUri)} <http://purl.org/dc/terms/modified> ?oldModified .
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

async function updateDisplayConfiguration(displayConfigurationUri, isInstantiated, isNew) {
    const updateIsInstantiatedQuery = `
            DELETE {
                GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
                    ${sparqlEscapeUri(displayConfigurationUri)} <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#conceptInstantiated> ?conceptIsInstantiated .
                    ${sparqlEscapeUri(displayConfigurationUri)} <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#conceptIsNew> ?conceptIsNew .
                }
            }
            INSERT {
                GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
                    ${sparqlEscapeUri(displayConfigurationUri)} <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#conceptInstantiated> "${isInstantiated}"^^<http://mu.semte.ch/vocabularies/typed-literals/boolean> .
                    ${sparqlEscapeUri(displayConfigurationUri)} <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#conceptIsNew> "${isNew}"^^<http://mu.semte.ch/vocabularies/typed-literals/boolean> .
                }
            }
            WHERE {
                GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
                    ${sparqlEscapeUri(displayConfigurationUri)} <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#conceptInstantiated> ?conceptIsInstantiated .
                    ${sparqlEscapeUri(displayConfigurationUri)} <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#conceptIsNew> ?conceptIsNew .
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

async function unlink(instanceUri) {
    const deleteSourceAndHasVersionedSourceQuery = `
        DELETE {
            GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
               ${sparqlEscapeUri(instanceUri)} <http://purl.org/dc/terms/source> ?concept .
               ${sparqlEscapeUri(instanceUri)} <http://mu.semte.ch/vocabularies/ext/hasVersionedSource> ?snapshot .
            }
        }
        WHERE {
            GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
                OPTIONAL {
                    ${sparqlEscapeUri(instanceUri)} <http://purl.org/dc/terms/source> ?concept .
                }
                OPTIONAL {
                    ${sparqlEscapeUri(instanceUri)} <http://mu.semte.ch/vocabularies/ext/hasVersionedSource> ?snapshot .
                }
            }
        }`
    ;
    await update(deleteSourceAndHasVersionedSourceQuery);
}

async function link(instanceUri, conceptUri, snapshotUri) {
    const createSourceQuery = `
        DELETE {
             GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
                ${sparqlEscapeUri(instanceUri)} <http://purl.org/dc/terms/source> ?o .
                ${sparqlEscapeUri(instanceUri)} <http://mu.semte.ch/vocabularies/ext/hasVersionedSource> ?snapshot .
            }
        }
        INSERT {
             GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
                ${sparqlEscapeUri(instanceUri)} <http://purl.org/dc/terms/source> ${sparqlEscapeUri(conceptUri)} .
                ${sparqlEscapeUri(instanceUri)} <http://mu.semte.ch/vocabularies/ext/hasVersionedSource> ${sparqlEscapeUri(snapshotUri)} .
            }
        }
        WHERE {
             GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
                OPTIONAL {
                    ${sparqlEscapeUri(instanceUri)} <http://purl.org/dc/terms/source> ?o .
                }
                OPTIONAL {
                    ${sparqlEscapeUri(instanceUri)} <http://mu.semte.ch/vocabularies/ext/hasVersionedSource> ?snapshot .
                }
            }
        }
    `;
    await update(createSourceQuery);
}