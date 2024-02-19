import {restoreRealTime, setFixedTime} from "../../fixed-time";
import {aFullInstanceSnapshot} from "./instance-snapshot-test-builder";
import {
    CompetentAuthorityLevelType,
    ExecutingAuthorityLevelType,
    LanguageType,
    PublicationMediumType,
    TargetAudienceType,
    ThemeType,
    YourEuropeCategoryType
} from "../../../src/core/domain/types";
import {BestuurseenheidTestBuilder} from "./bestuurseenheid-test-builder";
import {LanguageString} from "../../../src/core/domain/language-string";
import {FormatPreservingDate} from "../../../src/core/domain/format-preserving-date";
import {buildCodexVlaanderenIri, buildSpatialRefNis2019Iri} from "./iri-test-builder";
import {uuid} from "../../../mu-helper";

beforeAll(() => setFixedTime());
afterAll(() => restoreRealTime());


describe('constructing', () => {

    test('undefined id throws error', () => {
        expect(() => aFullInstanceSnapshot().withId(undefined).build()).toThrow(new Error('id should not be absent'));
    });

    test('Undefined createdBy throws error', () => {
        expect(() => aFullInstanceSnapshot().withCreatedBy(undefined).build()).toThrow(new Error('createdBy should not be absent'));
    });

    test('Undefined title throws error', () => {
        expect(() => aFullInstanceSnapshot().withTitle(undefined).build()).toThrow(new Error('title should not be absent'));
    });

    test('Undefined description throws error', () => {
        expect(() => aFullInstanceSnapshot().withDescription(undefined).build()).toThrow(new Error('description should not be absent'));
    });

    test('TargetAudience with duplicates throws error', () => {
        expect(() => aFullInstanceSnapshot().withTargetAudiences([TargetAudienceType.BURGER, TargetAudienceType.BURGER]).build())
            .toThrow(new Error('targetAudiences should not contain duplicates'));
    });

    test('Themes with duplicates throws error', () => {
        expect(() => aFullInstanceSnapshot().withThemes([ThemeType.WELZIJNGEZONDHEID, ThemeType.WELZIJNGEZONDHEID]).build())
            .toThrow(new Error('themes should not contain duplicates'));
    });

    test('CompetentAuthorityLevels with duplicates throws error', () => {
        expect(() => aFullInstanceSnapshot().withCompetentAuthorityLevels([CompetentAuthorityLevelType.LOKAAL, CompetentAuthorityLevelType.LOKAAL]).build())
            .toThrow(new Error('competentAuthorityLevels should not contain duplicates'));
    });

    test('CompetentAuthorities with duplicates throws error', () => {
        expect(() => aFullInstanceSnapshot().withCompetentAuthorities([BestuurseenheidTestBuilder.BORGLOON_IRI, BestuurseenheidTestBuilder.BORGLOON_IRI]).build())
            .toThrow(new Error('competentAuthorities should not contain duplicates'));
    });

    test('ExecutingAuthorityLevels with duplicates throws error', () => {
        expect(() => aFullInstanceSnapshot().withExecutingAuthorityLevels([ExecutingAuthorityLevelType.LOKAAL, ExecutingAuthorityLevelType.LOKAAL]).build())
            .toThrow(new Error('executingAuthorityLevels should not contain duplicates'));
    });

    test('ExecutingAuthorities with duplicates throws error', () => {
        expect(() => aFullInstanceSnapshot().withExecutingAuthorities([BestuurseenheidTestBuilder.PEPINGEN_IRI, BestuurseenheidTestBuilder.PEPINGEN_IRI]).build())
            .toThrow(new Error('executingAuthorities should not contain duplicates'));
    });

    test('PublicationMedia with duplicates throws error', () => {
        expect(() => aFullInstanceSnapshot().withPublicationMedia([PublicationMediumType.YOUREUROPE, PublicationMediumType.YOUREUROPE]).build())
            .toThrow(new Error('publicationMedia should not contain duplicates'));
    });

    test('YourEuropeCategories with duplicates throws error', () => {
        expect(() => aFullInstanceSnapshot().withYourEuropeCategories([YourEuropeCategoryType.BEDRIJF, YourEuropeCategoryType.BEDRIJF]).build())
            .toThrow(new Error('yourEuropeCategories should not contain duplicates'));
    });

    test('keywords with duplicates throws error', () => {
        expect(() => aFullInstanceSnapshot().withKeywords([LanguageString.of('overlijden'), LanguageString.of('overlijden')]).build())
            .toThrow(new Error('keywords should not contain duplicates'));
    });

    test('languages with duplicates throws error', () => {
        expect(() => aFullInstanceSnapshot().withLanguages([LanguageType.ENG, LanguageType.ENG]).build())
            .toThrow(new Error('languages should not contain duplicates'));
    });

    test('Undefined isVersionOfInstance throws error', () => {
        expect(() => aFullInstanceSnapshot().withIsVersionOfInstance(undefined).build()).toThrow(new Error('isVersionOfInstance should not be absent'));
    });

    describe('dateCreated', () => {

        test('Undefined dateCreated throws error', () => {
            expect(() => aFullInstanceSnapshot().withDateCreated(undefined).build()).toThrow(new Error('dateCreated should not be absent'));
        });

        test('Blank dateCreated throws error', () => {
            expect(() => aFullInstanceSnapshot().withDateCreated(FormatPreservingDate.of('')).build()).toThrow(new Error('dateCreated should not be absent'));
        });

    });

    describe('dateModified', () => {

        test('Undefined dateModified throws error', () => {
            expect(() => aFullInstanceSnapshot().withDateModified(undefined).build()).toThrow(new Error('dateModified should not be absent'));
        });

        test('Blank dateModified throws error', () => {
            expect(() => aFullInstanceSnapshot().withDateModified(FormatPreservingDate.of('')).build()).toThrow(new Error('dateModified should not be absent'));
        });

    });

    describe('generatedAtTime', () => {

        test('Undefined generatedAtTime throws error', () => {
            expect(() => aFullInstanceSnapshot().withGeneratedAtTime(undefined).build()).toThrow(new Error('generatedAtTime should not be absent'));
        });

        test('Blank generatedAtTime throws error', () => {
            expect(() => aFullInstanceSnapshot().withGeneratedAtTime(FormatPreservingDate.of('')).build()).toThrow(new Error('generatedAtTime should not be absent'));
        });

    });

    test('Undefined isArchived throws error', () => {
        expect(() => aFullInstanceSnapshot().withIsArchived(undefined).build()).toThrow(new Error('isArchived should not be absent'));
    });

    test('Spatials with duplicates throws error', () => {
        expect(() => aFullInstanceSnapshot().withSpatials([buildSpatialRefNis2019Iri(1), buildSpatialRefNis2019Iri(1)]).build())
            .toThrow(new Error('spatials should not contain duplicates'));
    });

    test('legalResources with duplicates throws error', () => {
        const iri = uuid();
        expect(() => aFullInstanceSnapshot().withLegalResources([buildCodexVlaanderenIri(iri), buildCodexVlaanderenIri(iri)]).build())
            .toThrow(new Error('legalResources should not contain duplicates'));
    });


});
