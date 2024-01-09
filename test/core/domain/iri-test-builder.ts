import {Iri} from "../../../src/core/domain/shared/iri";

//TODO LPDC-916: rename all methods to xxxId

export function buildConceptSnapshotIri(uniqueId: string): Iri {
    return new Iri(`https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${uniqueId}`);
}

export function buildConceptIri(uniqueId: string): Iri {
    return new Iri(`https://ipdc.tni-vlaanderen.be/id/concept/${uniqueId}`);
}

export function buildCodexVlaanderenIri(uniqueId: string): Iri {
    return new Iri(`https://codex.vlaanderen.be/${uniqueId}`);
}

export function buildConceptDisplayConfigurationIri(uniqueId: string): Iri {
    return new Iri(`http://data.lblod.info/id/conceptual-display-configuration/${uniqueId}`);
}

export function buildBestuurseenheidIri(uniqueId: string): Iri {
    return new Iri(`http://data.lblod.info/id/bestuurseenheden/${uniqueId}`);
}