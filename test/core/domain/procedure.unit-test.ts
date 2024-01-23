import {aFullProcedure} from "./procedure-test-builder";
import {Iri} from "../../../src/core/domain/shared/iri";
import {Procedure} from "../../../src/core/domain/procedure";
import {uuid} from "../../../mu-helper";
import {EvidenceTestBuilder} from "./evidence-test-builder";
import {aMinimalLanguageString} from "./language-string-test-builder";
import {Website, WebsiteBuilder} from "../../../src/core/domain/website";
import {WebsiteTestBuilder} from "./website-test-builder";

describe('forConcept', () => {
    test('Undefined id throws error', () => {
        const procedure = aFullProcedure().withId(undefined);
        expect(() => Procedure.forConcept(procedure.build())).toThrow(new Error('id should not be undefined'));
    });
    test('Invalid iri id throws error', () => {
        expect(() => Procedure.forConcept(aFullProcedure().withId(new Iri('   ')).build())).toThrow(new Error('iri should not be blank'));
    });

    test('Undefined uuid throws error', () => {
        const procedure = aFullProcedure().withUuid(undefined);
        expect(() => Procedure.forConcept(procedure.build())).toThrow(new Error('uuid should not be undefined'));
    });
    test('Blank uuid throws error', () => {
        const procedure = aFullProcedure().withUuid('   ');
        expect(() => Procedure.forConcept(procedure.build())).toThrow(new Error('uuid should not be blank'));
    });

    test('Undefined title throws error', () => {
        const procedure = aFullProcedure().withTitle(undefined);
        expect(() => Procedure.forConcept(procedure.build())).toThrow(new Error('title should not be undefined'));
    });

    test('Undefined description throws error', () => {
        const procedure = aFullProcedure().withDescription(undefined);
        expect(() => Procedure.forConcept(procedure.build())).toThrow(new Error('description should not be undefined'));
    });

    describe('website ', () => {
        test('valid website does not throw error', () => {
            const uuidValue = uuid();
            const validWebsite = Website.reconstitute(WebsiteBuilder.buildIri(uuidValue), uuid(), aMinimalLanguageString(EvidenceTestBuilder.TITLE).build(),
                aMinimalLanguageString(EvidenceTestBuilder.DESCRIPTION).build(), WebsiteTestBuilder.URL, undefined);
            const procedure = aFullProcedure().withWebsites([validWebsite]);
            expect(() => Procedure.forConcept(procedure.build())).not.toThrow();
        });

        test('invalid evidence does throw error', () => {
            const uuidValue = uuid();
            const validWebsite = Website.reconstitute(WebsiteBuilder.buildIri(uuidValue), undefined, aMinimalLanguageString(EvidenceTestBuilder.TITLE).build(),
                aMinimalLanguageString(EvidenceTestBuilder.DESCRIPTION).build(), WebsiteTestBuilder.URL, undefined);
            const procedure = aFullProcedure().withWebsites([validWebsite]);
            expect(() => Procedure.forConcept(procedure.build())).toThrow();
        });
    });
});

describe('forConceptSnapshot', () => {

    test('Undefined id throws error', () => {
        const procedure = aFullProcedure().withId(undefined);
        expect(() => Procedure.forConceptSnapshot(procedure.build())).toThrow(new Error('id should not be undefined'));
    });
    test('Invalid iri id throws error', () => {
        expect(() => Procedure.forConceptSnapshot(aFullProcedure().withId(new Iri('   ')).build())).toThrow(new Error('iri should not be blank'));
    });
    test('Uuid is undefined ', () => {
        const procedure = aFullProcedure().build();
        expect(Procedure.forConceptSnapshot(procedure).uuid).toBeUndefined();
    });
    test('Undefined title throws error', () => {
        const procedure = aFullProcedure().withTitle(undefined).build();
        expect(() => Procedure.forConceptSnapshot(procedure)).toThrow(new Error('title should not be undefined'));
    });
    test('Undefined description throws error', () => {
        const procedure = aFullProcedure().withDescription(undefined).build();
        expect(() => Procedure.forConceptSnapshot(procedure)).toThrow(new Error('description should not be undefined'));
    });
    describe('website ', () => {
        test('valid website does not throw error', () => {
            const uuidValue = uuid();
            const validWebsite = Website.reconstitute(
                WebsiteBuilder.buildIri(uuidValue),
                undefined,
                aMinimalLanguageString(EvidenceTestBuilder.TITLE).build(),
                aMinimalLanguageString(EvidenceTestBuilder.DESCRIPTION).build(),
                WebsiteTestBuilder.URL,
                undefined
            );
            const procedure = aFullProcedure().withWebsites([validWebsite]);
            expect(() => Procedure.forConceptSnapshot(procedure.build())).not.toThrow();
        });

        test('invalid evidence does throw error', () => {
            const uuidValue = uuid();
            const validWebsite = Website.reconstitute(
                WebsiteBuilder.buildIri(uuidValue),
                undefined,
                undefined,
                undefined,
                WebsiteTestBuilder.URL,
                undefined
            );
            const procedure = aFullProcedure().withWebsites([validWebsite]);
            expect(() => Procedure.forConceptSnapshot(procedure.build())).toThrow();
        });
    });
});