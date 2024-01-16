import {aFullInstance} from "./instance-test-builder";
import {Iri} from "../../../src/core/domain/shared/iri";
import {FormatPreservingDate} from "../../../src/core/domain/format-preserving-date";

describe('constructing', () => {
    test('Undefined id throws error', () => {
        expect(() => aFullInstance().withId(undefined).build()).toThrow(new Error('id should not be undefined'));
    });

    test('Invalid iri id throws error', () => {
        expect(() => aFullInstance().withId(new Iri('  ')).build()).toThrow(new Error('iri should not be blank'));
    });
    test('Undefined bestuurseenheidId throws error', () => {
        expect(() => aFullInstance().withBestuurseenheidId(undefined).build()).toThrow(new Error('bestuurseenheidId should not be undefined'));
    });

    test('Invalid iri bestuurseenheidId throws error', () => {
        expect(() => aFullInstance().withBestuurseenheidId(new Iri('  ')).build()).toThrow(new Error('iri should not be blank'));
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

});