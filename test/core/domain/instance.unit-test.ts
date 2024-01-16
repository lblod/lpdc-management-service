import {aFullInstance} from "./instance-test-builder";
import {Iri} from "../../../src/core/domain/shared/iri";
import {FormatPreservingDate} from "../../../src/core/domain/format-preserving-date";
import {buildSpatialRefNis2019Iri} from "./iri-test-builder";
import {BestuurseenheidTestBuilder} from "./bestuureenheid-test-builder";

describe('constructing', () => {
    test('Undefined id throws error', () => {
        expect(() => aFullInstance().withId(undefined).build()).toThrow(new Error('id should not be undefined'));
    });

    test('Invalid iri id throws error', () => {
        expect(() => aFullInstance().withId(new Iri('  ')).build()).toThrow(new Error('iri should not be blank'));
    });
    test('Undefined createdBy throws error', () => {
        expect(() => aFullInstance().withCreatedBy(undefined).build()).toThrow(new Error('createdBy should not be undefined'));
    });

    test('Invalid iri createdBy throws error', () => {
        expect(() => aFullInstance().withCreatedBy(new Iri('  ')).build()).toThrow(new Error('iri should not be blank'));
    });

    test('Undefined uuid throws error', () => {
        expect(() => aFullInstance().withUuid(undefined).build()).toThrow(new Error('uuid should not be undefined'));
    });

    test('Blank uuid throws error', () => {
        expect(() => aFullInstance().withUuid('   ').build()).toThrow(new Error('uuid should not be blank'));
    });

    describe('dateCreated', () => {

        test('Invalid dateCreated throws error', () => {
            expect(() => aFullInstance().withDateCreated(FormatPreservingDate.of(undefined)).build()).toThrow(new Error('dateCreated should not be undefined'));
        });

        test('Undefined dateCreated throws error', () => {
            expect(() => aFullInstance().withDateCreated(undefined).build()).toThrow(new Error('dateCreated should not be undefined'));
        });
        test('Blank dateCreated throws error', () => {
            expect(() => aFullInstance().withDateCreated(FormatPreservingDate.of('')).build()).toThrow(new Error('dateCreated should not be undefined'));
        });
    });

    describe('dateModified', () => {

        test('Invalid dateModified throws error', () => {
            expect(() => aFullInstance().withDateModified(FormatPreservingDate.of(undefined)).build()).toThrow(new Error('dateModified should not be undefined'));
        });

        test('Undefined dateModified throws error', () => {
            expect(() => aFullInstance().withDateModified(undefined).build()).toThrow(new Error('dateModified should not be undefined'));
        });
        test('Blank dateModified throws error', () => {
            expect(() => aFullInstance().withDateModified(FormatPreservingDate.of('')).build()).toThrow(new Error('dateModified should not be undefined'));
        });
    });

    test('Absent status throws error', () => {
        expect(() => aFullInstance().withStatus(undefined).build()).toThrow(new Error('status should not be undefined'));
    });

    test('Spatials with duplicates throws error', () => {
        expect(() => aFullInstance().withSpatials([buildSpatialRefNis2019Iri(1), buildSpatialRefNis2019Iri(1)]).build()).toThrow(new Error('spatials should not contain duplicates'));
    });

    test('CompetentAuthorities with duplicates throws error', () => {
        expect(() => aFullInstance().withCompetentAuthorities([BestuurseenheidTestBuilder.BORGLOON_IRI, BestuurseenheidTestBuilder.BORGLOON_IRI]).build()).toThrow(new Error('competentAuthorities should not contain duplicates'));
    });

    test('ExecutingAuthorities with duplicates throws error', () => {
        expect(() => aFullInstance().withExecutingAuthorities([BestuurseenheidTestBuilder.PEPINGEN_IRI, BestuurseenheidTestBuilder.PEPINGEN_IRI]).build()).toThrow(new Error('executingAuthorities should not contain duplicates'));
    });


});