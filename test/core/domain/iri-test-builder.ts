import {Iri} from "../../../src/core/domain/shared/iri";

export function buildConceptSnapshotIri(uniqueId: string): Iri {
    return `https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${uniqueId}`;
}

export function buildConceptIri(uniqueId: string): Iri {
    return `https://ipdc.tni-vlaanderen.be/id/concept/${uniqueId}`;
}

export function buildCodexVlaanderenIri(uniqueId: string): Iri {
    return `https://codex.vlaanderen.be/${uniqueId}`;
}