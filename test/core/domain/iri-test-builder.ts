import {Iri} from "../../../src/core/domain/shared/iri";

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

export function buildVerwijstNaarIri(uniqueId: string): Iri {
    return new Iri(`https://data.vlaanderen.be/id/adres/${uniqueId}`);
}

export function buildSessionIri(uniqueId: string): Iri {
    return new Iri(`http://mu.semte.ch/sessions/${uniqueId}`);
}

export function buildNutsCodeIri(aNumber: number): Iri {
    return new Iri(`http://data.europa.eu/nuts/code/BE${aNumber}`);
}

export function buildWerkingsgebiedenIri(uniqueId: string): Iri {
    return new Iri(`http://data.lblod.info/id/werkingsgebieden/${uniqueId}`);
}

export function buildInstanceSnapshotIri(uniqueId: string): Iri {
    return new Iri(`http://data.lblod.info/id/public-service-snapshot/${uniqueId}`);
}

export function randomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}