import {serviceUriForId} from "./commonQueries";
import {query, sparqlEscapeUri, update} from "mu";
import {APPLICATION_GRAPH, PREFIXES} from "../config";

export async function confirmBijgewerktTot(publicServiceUUID, snapshotUri) {
    const instanceUri = await serviceUriForId(publicServiceUUID);
    if (instanceUri) {
        await updateHasVersionedSource(instanceUri, snapshotUri);
        const hasLatestFunctionalChangeUri = await getConceptLatestFunctionalChange(instanceUri);

        if (hasLatestFunctionalChangeUri === snapshotUri) {
            await removeReviewStatus(instanceUri);
        }
    }
}

async function getConceptLatestFunctionalChange(instanceUri) {
    const queryString = `
        ${PREFIXES}
        SELECT ?snapshotUri WHERE {
            ${sparqlEscapeUri(instanceUri)} a cpsv:PublicService .
            ${sparqlEscapeUri(instanceUri)} dct:source ?concept .
            ?concept lpdcExt:hasLatestFunctionalChange ?snapshotUri .
        }
    `;
    const result =  await query(queryString);
    return result.results.bindings[0]?.snapshotUri?.value;
}

async function updateHasVersionedSource(instanceUri, snapshotUri) {
    const queryString = `
        ${PREFIXES}
        DELETE {
            GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
                ${sparqlEscapeUri(instanceUri)} ext:hasVersionedSource ?version.
            }
        }
        INSERT {
            GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
                ${sparqlEscapeUri(instanceUri)} ext:hasVersionedSource ${sparqlEscapeUri(snapshotUri)}.
            }
        }
        WHERE {
            GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
                ${sparqlEscapeUri(instanceUri)} a cpsv:PublicService .
                OPTIONAL {
                    ${sparqlEscapeUri(instanceUri)} ext:hasVersionedSource ?version.
                }
            }
        }`;

    await update(queryString);
}

async function removeReviewStatus(instanceUri) {
    const conceptUpdated = 'http://lblod.data.gift/concepts/5a3168e2-f39b-4b5d-8638-29f935023c83'
    const queryString = `
        ${PREFIXES}
        DELETE {
            GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
                ${sparqlEscapeUri(instanceUri)} ext:reviewStatus ${sparqlEscapeUri(conceptUpdated)}.
            }
        } 
        WHERE {
            GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
                ${sparqlEscapeUri(instanceUri)} ext:reviewStatus ${sparqlEscapeUri(conceptUpdated)}.
            }
        }
    `;
    await update(queryString);
}