import {aBestuurseenheid} from "./bestuurseenheid-test-builder";
import {Bestuurseenheid, BestuurseenheidClassificatieCode} from "../../../src/core/domain/bestuurseenheid";
import {uuid} from "../../../mu-helper";
import {Iri} from "../../../src/core/domain/shared/iri";
import {InvariantError} from "../../../src/core/domain/shared/lpdc-error";
import {buildNutsCodeIri} from "./iri-test-builder";

test('Undefined id throws error', () => {
    expect(() => new Bestuurseenheid(undefined, uuid(), 'Pepingen', BestuurseenheidClassificatieCode.GEMEENTE, [])).toThrowWithMessage(InvariantError, 'id mag niet ontbreken');
});

test('Invalid iri id throws error', () => {
    expect(() => new Bestuurseenheid(new Iri('   '), uuid(), 'Pepingen', BestuurseenheidClassificatieCode.GEMEENTE, [])).toThrowWithMessage(InvariantError, 'iri mag niet leeg zijn');
});

test('Undefined uuid throws error', () => {
    expect(() => new Bestuurseenheid(new Iri('http://anIri'), undefined, 'Pepingen', BestuurseenheidClassificatieCode.GEMEENTE, [])).toThrowWithMessage(InvariantError, 'uuid mag niet ontbreken');
});

test('Undefined prefLabel throws error', () => {
    expect(() => new Bestuurseenheid(new Iri('http://anIri'), uuid(), undefined, BestuurseenheidClassificatieCode.GEMEENTE, [])).toThrowWithMessage(InvariantError, 'prefLabel mag niet ontbreken');
});

test('Undefined classificatieCode throws error', () => {
    expect(() => new Bestuurseenheid(new Iri('http://anIri'), uuid(), 'prefLabel', undefined, [])).toThrowWithMessage(InvariantError, 'classificatieCode mag niet ontbreken');
});

test('Undefined classificatieCode does not throw error for ABB', () => {
    expect(new Bestuurseenheid(Bestuurseenheid.abb, uuid(),'prefLabel', undefined, [])).not.toBeUndefined();
});

test('spatials with duplicates throws error', () => {
    expect(() => aBestuurseenheid().withSpatials([buildNutsCodeIri(12312), buildNutsCodeIri(12312)]).build()).toThrow('spatials mag geen duplicaten bevatten');
});

test('userGraph', () => {
    const uniqueId = uuid();
    const bestuurseenheid =
        aBestuurseenheid()
            .withUuid(uniqueId)
            .build();

    expect(bestuurseenheid.userGraph().value).toEqual(`http://mu.semte.ch/graphs/organizations/${uniqueId}/LoketLB-LPDCGebruiker`);
});

