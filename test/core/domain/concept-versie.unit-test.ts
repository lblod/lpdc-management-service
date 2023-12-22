import {ConceptVersie, ProductType, TargetAudienceType} from "../../../src/core/domain/concept-versie";
import {uuid} from "../../../mu-helper";
import {ConceptVersieTestBuilder} from "./concept-versie-test-builder";
import {TaalString} from "../../../src/core/domain/taal-string";

describe('is functionally changed', () => {

    type TestCase = [string, ConceptVersie, ConceptVersie];

    const aConceptVersieUuid = uuid();
    const aConceptVersie =
        ConceptVersieTestBuilder
            .aFullConceptVersie()
            .build();

    const functionallyUnchangedTestCases: TestCase[]
        = [
        ['same data',
            aConceptVersie,
            aConceptVersie],
        ['equal data',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withId(aConceptVersieUuid)
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withId(aConceptVersieUuid)
                .build()]
    ];

    for (const testCase of functionallyUnchangedTestCases) {
        test(`not functionally changed when ${testCase[0]}`, () => {
            expect(ConceptVersie.isFunctionallyChanged(testCase[1], testCase[2])).toBeFalsy();
        });
    }

    const functionallyChangedTestCases: TestCase[]
        = [
        ['title changed',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withTitle(TaalString.of("text-en"))
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withTitle(TaalString.of("text-en-changed"))
                .build()],
        ['description changed',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withDescription(TaalString.of("text-en"))
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withDescription(TaalString.of("text-en-changed"))
                .build()],
        ['additional description changed',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withAdditionalDescription(TaalString.of("text-en"))
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withAdditionalDescription(TaalString.of("text-en-changed"))
                .build()],
        ['exception changed',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withException(TaalString.of("text-en"))
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withException(TaalString.of("text-en-changed"))
                .build()],
        ['regulation changed',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withRegulation(TaalString.of("text-en"))
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withRegulation(TaalString.of("text-en-changed"))
                .build()],
        ['start date changed',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withStartDate(new Date('2023-11-10'))
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withStartDate(new Date('2023-11-09'))
                .build()],
        ['start date appeared',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withStartDate(undefined)
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withStartDate(new Date('2023-11-09'))
                .build()],
        ['start date disappeared',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withStartDate(new Date('2023-11-09'))
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withStartDate(undefined)
                .build()],
        ['end date changed',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withEndDate(new Date('2023-11-10'))
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withEndDate(new Date('2023-11-09'))
                .build()],
        ['end date appeared',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withEndDate(undefined)
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withEndDate(new Date('2023-11-09'))
                .build()],
        ['end date disappeared',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withEndDate(new Date('2023-11-09'))
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withEndDate(undefined)
                .build()],
        ['type changed',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withType(ProductType.FINANCIEELVOORDEEL)
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withType(ProductType.BEWIJS)
                .build()],
        ['type appeared',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withType(undefined)
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withType(ProductType.FINANCIEELVOORDEEL)
                .build()],
        ['type disappeared',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withType(ProductType.FINANCIEELVOORDEEL)
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withType(undefined)
                .build()],
        ['target audience updated',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withTargetAudiences(new Set([TargetAudienceType.BURGER]))
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withTargetAudiences(new Set([TargetAudienceType.VLAAMSEOVERHEID]))
                .build()],
        ['target audience added',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withTargetAudiences(new Set([TargetAudienceType.BURGER]))
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withTargetAudiences(new Set([TargetAudienceType.VLAAMSEOVERHEID, TargetAudienceType.BURGER]))
                .build()],
        ['target audience removed',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withTargetAudiences(new Set([TargetAudienceType.VLAAMSEOVERHEID, TargetAudienceType.BURGER]))
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withTargetAudiences(new Set([TargetAudienceType.BURGER]))
                .build()]

    ];

    for (const testCase of functionallyChangedTestCases) {
        test(`functionally changed when ${testCase[0]}`, () => {
            expect(ConceptVersie.isFunctionallyChanged(testCase[1], testCase[2])).toBeTruthy();
        });
    }


});