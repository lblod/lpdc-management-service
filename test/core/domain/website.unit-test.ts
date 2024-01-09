import {aFullWebsite} from "./website-test-builder";
import {Website} from "../../../src/core/domain/website";
import {Iri} from "../../../src/core/domain/shared/iri";


describe('forConcept', () => {
    test('Undefined id throws error', () => {
        const website = aFullWebsite().withId(undefined);
        expect(() => Website.forConcept(website.build())).toThrow(new Error('id should not be undefined'));
    });
    test('Invalid iri id throws error', () => {
        expect(() => Website.forConcept(aFullWebsite().withId(new Iri('   ')).build())).toThrow(new Error('iri should not be blank'));
    });

    test('Undefined uuid throws error', () => {
        const website = aFullWebsite().withUuid(undefined);
        expect(() => Website.forConcept(website.build())).toThrow(new Error('uuid should not be undefined'));
    });
    test('Blank uuid throws error', () => {
        const website = aFullWebsite().withUuid('   ');
        expect(() => Website.forConcept(website.build())).toThrow(new Error('uuid should not be blank'));
    });

    test('Undefined title throws error', () => {
        const website = aFullWebsite().withTitle(undefined);
        expect(() => Website.forConcept(website.build())).toThrow(new Error('title should not be undefined'));
    });

    test('Undefined url throws error', () => {
        const website = aFullWebsite().withUrl(undefined);
        expect(() => Website.forConcept(website.build())).toThrow(new Error('url should not be undefined'));
    });
    test('Blank url throws error', () => {
        const website = aFullWebsite().withUrl('   ');
        expect(() => Website.forConcept(website.build())).toThrow(new Error('url should not be blank'));
    });
});

describe('forConceptSnapshot', () => {

    test('Undefined id throws error', () => {
        const website = aFullWebsite().withId(undefined);
        expect(() => Website.forConceptSnapshot(website.build())).toThrow(new Error('id should not be undefined'));
    });
    test('Invalid iri id throws error', () => {
        expect(() => Website.forConceptSnapshot(aFullWebsite().withId(new Iri('   ')).build())).toThrow(new Error('iri should not be blank'));
    });
    test('Uuid is undefined ', () => {
        const website = aFullWebsite().build();
        expect(Website.forConceptSnapshot(website).uuid).toBeUndefined();
    });
    test('Undefined title throws error', () => {
        const website = aFullWebsite().withTitle(undefined).build();
        expect(() => Website.forConceptSnapshot(website)).toThrow(new Error('title should not be undefined'));
    });
    test('Undefined url throws error', () => {
        const website = aFullWebsite().withUrl(undefined);
        expect(() => Website.forConceptSnapshot(website.build())).toThrow(new Error('url should not be undefined'));
    });
    test('Blank url throws error', () => {
        const website = aFullWebsite().withUrl('   ');
        expect(() => Website.forConceptSnapshot(website.build())).toThrow(new Error('url should not be blank'));
    });
});