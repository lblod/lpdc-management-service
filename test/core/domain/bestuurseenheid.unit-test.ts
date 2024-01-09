import {aBestuurseenheid, pepingenBestuurseenheid} from "./bestuureenheid-test-builder";
import {Bestuurseenheid, BestuurseenheidClassificatieCode} from "../../../src/core/domain/bestuurseenheid";
import {buildBestuurseenheidIri} from "./iri-test-builder";
import {uuid} from "../../../mu-helper";
import {Iri} from "../../../src/core/domain/shared/iri";

test('getUUID extracts the UUID from the id', () => {
    const pepingenUUID = '73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589';
    expect(pepingenBestuurseenheid().uuid).toEqual(pepingenUUID);

});
test('Undefined id throws error', () => {
    expect(() => new Bestuurseenheid(undefined, 'Pepingen', BestuurseenheidClassificatieCode.GEMEENTE)).toThrow(new Error('id should not be undefined'));
});

test('Invalid iri id throws error', () => {
    expect(() => new Bestuurseenheid(new Iri('   '), 'Pepingen', BestuurseenheidClassificatieCode.GEMEENTE)).toThrow(new Error('iri should not be blank'));
});

test('userGraph', () => {
    const uniqueId = uuid();
    const bestuurseenheid =
        aBestuurseenheid()
            .withId(buildBestuurseenheidIri(uniqueId))
            .build();

    expect(bestuurseenheid.userGraph().value).toEqual(`http://mu.semte.ch/graphs/organizations/${uniqueId}/LoketLB-LPDCGebruiker`);

});
