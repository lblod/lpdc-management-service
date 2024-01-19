import {aBestuurseenheid} from "./bestuurseenheid-test-builder";
import {Bestuurseenheid, BestuurseenheidClassificatieCode} from "../../../src/core/domain/bestuurseenheid";
import {uuid} from "../../../mu-helper";
import {Iri} from "../../../src/core/domain/shared/iri";
import {buildSpatialRefNis2019Iri} from "./iri-test-builder";

test('Undefined id throws error', () => {
    expect(() => new Bestuurseenheid(undefined, uuid(),'Pepingen', BestuurseenheidClassificatieCode.GEMEENTE, [])).toThrow(new Error('id should not be undefined'));
});

test('Invalid iri id throws error', () => {
    expect(() => new Bestuurseenheid(new Iri('   '), uuid(), 'Pepingen', BestuurseenheidClassificatieCode.GEMEENTE, [])).toThrow(new Error('iri should not be blank'));
});

test('Undefined uuid throws error', () => {
    expect(() => new Bestuurseenheid(new Iri('http://anIri'), undefined,'Pepingen', BestuurseenheidClassificatieCode.GEMEENTE, [])).toThrow(new Error('uuid should not be undefined'));
});

test('Undefined prefLabel throws error', () => {
    expect(() => new Bestuurseenheid(new Iri('http://anIri'), uuid(),undefined, BestuurseenheidClassificatieCode.GEMEENTE, [])).toThrow(new Error('prefLabel should not be undefined'));
});

test('Undefined classificatieCode throws error', () => {
    expect(() => new Bestuurseenheid(new Iri('http://anIri'), uuid(),'prefLabel', undefined, [])).toThrow(new Error('classificatieCode should not be undefined'));
});

test('Undefined classificatieCode does not throw error for ABB', () => {
    expect(new Bestuurseenheid(Bestuurseenheid.abb, uuid(),'prefLabel', undefined, [])).not.toBeUndefined();
});

test('spatials with duplicates throws error', () => {
    expect(() => aBestuurseenheid().withSpatials([buildSpatialRefNis2019Iri(12312), buildSpatialRefNis2019Iri(12312)]).build()).toThrow('spatials should not contain duplicates');
});

test('userGraph', () => {
    const uniqueId = uuid();
    const bestuurseenheid =
        aBestuurseenheid()
            .withUuid(uniqueId)
            .build();

    expect(bestuurseenheid.userGraph().value).toEqual(`http://mu.semte.ch/graphs/organizations/${uniqueId}/LoketLB-LPDCGebruiker`);

});
