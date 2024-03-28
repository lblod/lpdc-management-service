import {aFormalInformalChoice} from "./formal-informal-choice-test-builder";
import {ChosenFormType} from "../../../src/core/domain/types";
import {aMinimalConcept} from "./concept-test-builder";
import {LanguageString} from "../../../src/core/domain/language-string";
import {SelectFormLanguageDomainService} from "../../../src/core/domain/select-form-language-domain-service";
import {Language} from "../../../src/core/domain/language";
import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {aBestuurseenheid} from "./bestuurseenheid-test-builder";
import {BestuurseenheidSparqlTestRepository} from "../../driven/persistence/bestuurseenheid-sparql-test-repository";
import {aMinimalInstance} from "./instance-test-builder";
import {
    FormalInformalChoiceSparqlRepository
} from "../../../src/driven/persistence/formal-informal-choice-sparql-repository";

describe('select form language for concept', () => {

    const formalInformalChoiceRepository = new FormalInformalChoiceSparqlRepository(TEST_SPARQL_ENDPOINT);
    const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const selectFormLanguageDomainService = new SelectFormLanguageDomainService(formalInformalChoiceRepository);

    test('When chosenForm informal and concept in informal version then formLanguage should be @nl-be-x-informal', async () => {
        const bestuurseenheid =
            aBestuurseenheid()
                .build();
        await bestuurseenheidRepository.save(bestuurseenheid);

        const formalInformalChoice =
            aFormalInformalChoice()
                .withChosenForm(ChosenFormType.INFORMAL)
                .withBestuurseenheidId(bestuurseenheid.id)
                .build();
        await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

        const concept =
            aMinimalConcept()
                .withTitle(
                    LanguageString.of(undefined, 'nl', undefined, 'nl informal', 'nl generated formal', undefined)
                )
                .build();

        const selectedLanguage = await selectFormLanguageDomainService.selectForConcept(concept, bestuurseenheid);
        expect(selectedLanguage).toEqual(Language.INFORMAL);
    });

    test('When chosenForm informal and concept in formal version then formLanguage should be @nl-be-x-generated-informal', async () => {
        const bestuurseenheid =
            aBestuurseenheid()
                .build();
        await bestuurseenheidRepository.save(bestuurseenheid);

        const formalInformalChoice =
            aFormalInformalChoice()
                .withChosenForm(ChosenFormType.INFORMAL)
                .withBestuurseenheidId(bestuurseenheid.id)
                .build();
        await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

        const concept =
            aMinimalConcept()
                .withTitle(
                    LanguageString.of(undefined, 'nl', 'nl formal', undefined, undefined, 'nl generated informal')
                )
                .build();

        const selectedLanguage = await selectFormLanguageDomainService.selectForConcept(concept, bestuurseenheid);
        expect(selectedLanguage).toEqual(Language.GENERATED_INFORMAL);
    });

    test('When chosenForm informal and concept only generated languages then formLanguage should be @nl-be-x-generated-informal', async () => {
        const bestuurseenheid =
            aBestuurseenheid()
                .build();
        await bestuurseenheidRepository.save(bestuurseenheid);

        const formalInformalChoice =
            aFormalInformalChoice()
                .withChosenForm(ChosenFormType.INFORMAL)
                .withBestuurseenheidId(bestuurseenheid.id)
                .build();
        await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

        const concept =
            aMinimalConcept()
                .withTitle(
                    LanguageString.of(undefined, 'nl', undefined, undefined, 'nl generated formal', 'nl generated informal')
                )
                .build();

        const selectedLanguage = await selectFormLanguageDomainService.selectForConcept(concept, bestuurseenheid);
        expect(selectedLanguage).toEqual(Language.GENERATED_INFORMAL);
    });


    test('When chosenForm informal and concept both formal and informal then formLanguage should be @nl-be-x-informal', async () => {
        const bestuurseenheid =
            aBestuurseenheid()
                .build();
        await bestuurseenheidRepository.save(bestuurseenheid);

        const formalInformalChoice =
            aFormalInformalChoice()
                .withChosenForm(ChosenFormType.INFORMAL)
                .withBestuurseenheidId(bestuurseenheid.id)
                .build();
        await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

        const concept =
            aMinimalConcept()
                .withTitle(
                    LanguageString.of(undefined, 'nl', 'nl formal', 'nl informal', undefined, undefined)
                )
                .build();

        const selectedLanguage = await selectFormLanguageDomainService.selectForConcept(concept, bestuurseenheid);
        expect(selectedLanguage).toEqual(Language.INFORMAL);
    });

    test('When chosenForm informal and concept contains only nl then formLanguage should be @nl', async () => {
        const bestuurseenheid =
            aBestuurseenheid()
                .build();
        await bestuurseenheidRepository.save(bestuurseenheid);

        const formalInformalChoice =
            aFormalInformalChoice()
                .withChosenForm(ChosenFormType.INFORMAL)
                .withBestuurseenheidId(bestuurseenheid.id)
                .build();
        await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

        const concept =
            aMinimalConcept()
                .withTitle(
                    LanguageString.of(undefined, 'nl', undefined, undefined, undefined, undefined)
                )
                .build();

        const selectedLanguage = await selectFormLanguageDomainService.selectForConcept(concept, bestuurseenheid);
        expect(selectedLanguage).toEqual(Language.NL);
    });

    test('When chosenForm formal and concept in formal version then formLanguage should be @nl-be-x-formal', async () => {
        const bestuurseenheid =
            aBestuurseenheid()
                .build();
        await bestuurseenheidRepository.save(bestuurseenheid);

        const formalInformalChoice =
            aFormalInformalChoice()
                .withChosenForm(ChosenFormType.FORMAL)
                .withBestuurseenheidId(bestuurseenheid.id)
                .build();
        await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

        const concept =
            aMinimalConcept()
                .withTitle(
                    LanguageString.of(undefined, 'nl', 'nl formal', undefined, undefined, 'nl generated informal')
                )
                .build();

        const selectedLanguage = await selectFormLanguageDomainService.selectForConcept(concept, bestuurseenheid);
        expect(selectedLanguage).toEqual(Language.FORMAL);
    });

    test('When chosenForm formal and concept in informal version then formLanguage should be @nl-be-x-generated-formal', async () => {
        const bestuurseenheid =
            aBestuurseenheid()
                .build();
        await bestuurseenheidRepository.save(bestuurseenheid);

        const formalInformalChoice =
            aFormalInformalChoice()
                .withChosenForm(ChosenFormType.FORMAL)
                .withBestuurseenheidId(bestuurseenheid.id)
                .build();
        await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

        const concept =
            aMinimalConcept()
                .withTitle(
                    LanguageString.of(undefined, 'nl', undefined, 'nl informal', 'nl generated formal', undefined)
                )
                .build();

        const selectedLanguage = await selectFormLanguageDomainService.selectForConcept(concept, bestuurseenheid);
        expect(selectedLanguage).toEqual(Language.GENERATED_FORMAL);
    });

    test('When chosenForm formal and concept only generated languages then formLanguage should be @nl', async () => {
        const bestuurseenheid =
            aBestuurseenheid()
                .build();
        await bestuurseenheidRepository.save(bestuurseenheid);

        const formalInformalChoice =
            aFormalInformalChoice()
                .withChosenForm(ChosenFormType.FORMAL)
                .withBestuurseenheidId(bestuurseenheid.id)
                .build();
        await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

        const concept =
            aMinimalConcept()
                .withTitle(
                    LanguageString.of(undefined, 'nl', undefined, undefined, 'nl generated formal', 'nl generated informal')
                )
                .build();

        const selectedLanguage = await selectFormLanguageDomainService.selectForConcept(concept, bestuurseenheid);
        expect(selectedLanguage).toEqual(Language.NL);
    });

    test('When chosenForm formal and concept both formal and informal then formLanguage should be @nl-be-x-formal', async () => {
        const bestuurseenheid =
            aBestuurseenheid()
                .build();
        await bestuurseenheidRepository.save(bestuurseenheid);

        const formalInformalChoice =
            aFormalInformalChoice()
                .withChosenForm(ChosenFormType.FORMAL)
                .withBestuurseenheidId(bestuurseenheid.id)
                .build();
        await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

        const concept =
            aMinimalConcept()
                .withTitle(
                    LanguageString.of(undefined, 'nl', 'nl formal', 'nl informal', undefined, undefined)
                )
                .build();

        const selectedLanguage = await selectFormLanguageDomainService.selectForConcept(concept, bestuurseenheid);
        expect(selectedLanguage).toEqual(Language.FORMAL);
    });

    test('When chosenForm formal and concept only in nl then formLanguage should be @nl', async () => {
        const bestuurseenheid =
            aBestuurseenheid()
                .build();
        await bestuurseenheidRepository.save(bestuurseenheid);

        const formalInformalChoice =
            aFormalInformalChoice()
                .withChosenForm(ChosenFormType.FORMAL)
                .withBestuurseenheidId(bestuurseenheid.id)
                .build();
        await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

        const concept =
            aMinimalConcept()
                .withTitle(
                    LanguageString.of(undefined, 'nl', undefined, undefined, undefined, undefined)
                )
                .build();

        const selectedLanguage = await selectFormLanguageDomainService.selectForConcept(concept, bestuurseenheid);
        expect(selectedLanguage).toEqual(Language.NL);
    });

    test('When no chosenForm and concept in formal version then formLanguage should be @nl-be-x-formal', async () => {
        const bestuurseenheid =
            aBestuurseenheid()
                .build();
        await bestuurseenheidRepository.save(bestuurseenheid);

        const concept =
            aMinimalConcept()
                .withTitle(
                    LanguageString.of(undefined, 'nl', 'nl formal', undefined, undefined, 'nl generated informal')
                )
                .build();

        const selectedLanguage = await selectFormLanguageDomainService.selectForConcept(concept, bestuurseenheid);
        expect(selectedLanguage).toEqual(Language.FORMAL);
    });

    test('When no chosenForm and concept in informal version then formLanguage should be @nl-be-x-generated-formal', async () => {
        const bestuurseenheid =
            aBestuurseenheid()
                .build();
        await bestuurseenheidRepository.save(bestuurseenheid);

        const concept =
            aMinimalConcept()
                .withTitle(
                    LanguageString.of(undefined, 'nl', undefined, 'nl informal', 'nl generated formal', undefined)
                )
                .build();

        const selectedLanguage = await selectFormLanguageDomainService.selectForConcept(concept, bestuurseenheid);
        expect(selectedLanguage).toEqual(Language.GENERATED_FORMAL);
    });

    test('When no chosenForm and concept only generated languages then formLanguage should be @nl', async () => {
        const bestuurseenheid =
            aBestuurseenheid()
                .build();
        await bestuurseenheidRepository.save(bestuurseenheid);

        const concept =
            aMinimalConcept()
                .withTitle(
                    LanguageString.of(undefined, 'nl', undefined, undefined, 'nl generated formal', 'nl generated informal')
                )
                .build();

        const selectedLanguage = await selectFormLanguageDomainService.selectForConcept(concept, bestuurseenheid);
        expect(selectedLanguage).toEqual(Language.NL);
    });

    test('When no chosenForm and concept both formal and informal then formLanguage should be @nl-be-x-formal', async () => {
        const bestuurseenheid =
            aBestuurseenheid()
                .build();
        await bestuurseenheidRepository.save(bestuurseenheid);

        const concept =
            aMinimalConcept()
                .withTitle(
                    LanguageString.of(undefined, 'nl', 'nl formal', 'nl informal', undefined, undefined)
                )
                .build();

        const selectedLanguage = await selectFormLanguageDomainService.selectForConcept(concept, bestuurseenheid);
        expect(selectedLanguage).toEqual(Language.FORMAL);
    });

    test('When no chosenForm and concept only in nl then formLanguage should be @nl', async () => {
        const bestuurseenheid =
            aBestuurseenheid()
                .build();
        await bestuurseenheidRepository.save(bestuurseenheid);

        const concept =
            aMinimalConcept()
                .withTitle(
                    LanguageString.of(undefined, 'nl', undefined, undefined, undefined, undefined)
                )
                .build();

        const selectedLanguage = await selectFormLanguageDomainService.selectForConcept(concept, bestuurseenheid);
        expect(selectedLanguage).toEqual(Language.NL);
    });

});

describe('select form language for instance', () => {

    const formalInformalChoiceRepository = new FormalInformalChoiceSparqlRepository(TEST_SPARQL_ENDPOINT);
    const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const selectFormLanguageDomainService = new SelectFormLanguageDomainService(formalInformalChoiceRepository);

    test('Existing nl language on instance overrides formal informal choice', async () => {
        const bestuurseenheid =
            aBestuurseenheid()
                .build();
        await bestuurseenheidRepository.save(bestuurseenheid);

        const formalInformalChoice =
            aFormalInformalChoice()
                .withChosenForm(ChosenFormType.INFORMAL)
                .withBestuurseenheidId(bestuurseenheid.id)
                .build();
        await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

        const instance =
            aMinimalInstance()
                .withTitle(LanguageString.of('en', 'nl'))
                .build();

        const selectedLanguage = await selectFormLanguageDomainService.selectForInstance(instance, bestuurseenheid);
        expect(selectedLanguage).toEqual(Language.NL);
    });

    test('Existing nl formal language on instance overrides formal informal choice', async () => {
        const bestuurseenheid =
            aBestuurseenheid()
                .build();
        await bestuurseenheidRepository.save(bestuurseenheid);

        const formalInformalChoice =
            aFormalInformalChoice()
                .withChosenForm(ChosenFormType.INFORMAL)
                .withBestuurseenheidId(bestuurseenheid.id)
                .build();
        await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

        const instance =
            aMinimalInstance()
                .withTitle(LanguageString.of('en', undefined, 'nl formal'))
                .build();

        const selectedLanguage = await selectFormLanguageDomainService.selectForInstance(instance, bestuurseenheid);
        expect(selectedLanguage).toEqual(Language.FORMAL);
    });

    test('Existing nl informal language on instance overrides formal informal choice', async () => {
        const bestuurseenheid =
            aBestuurseenheid()
                .build();
        await bestuurseenheidRepository.save(bestuurseenheid);

        const formalInformalChoice =
            aFormalInformalChoice()
                .withChosenForm(ChosenFormType.FORMAL)
                .withBestuurseenheidId(bestuurseenheid.id)
                .build();
        await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

        const instance =
            aMinimalInstance()
                .withTitle(LanguageString.of('en', undefined, undefined, 'nl informal'))
                .build();

        const selectedLanguage = await selectFormLanguageDomainService.selectForInstance(instance, bestuurseenheid);
        expect(selectedLanguage).toEqual(Language.INFORMAL);
    });

    test('Instance without nl language uses formal informal choice formal', async () => {
        const bestuurseenheid =
            aBestuurseenheid()
                .build();
        await bestuurseenheidRepository.save(bestuurseenheid);

        const formalInformalChoice =
            aFormalInformalChoice()
                .withChosenForm(ChosenFormType.FORMAL)
                .withBestuurseenheidId(bestuurseenheid.id)
                .build();
        await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

        const instance =
            aMinimalInstance()
                .withTitle(undefined)
                .withDescription(undefined)
                .withAdditionalDescription(undefined)
                .withException(undefined)
                .withRegulation(undefined)
                .build();

        const selectedLanguage = await selectFormLanguageDomainService.selectForInstance(instance, bestuurseenheid);
        expect(selectedLanguage).toEqual(Language.FORMAL);
    });

    test('Instance without nl language uses formal informal choice informal', async () => {
        const bestuurseenheid =
            aBestuurseenheid()
                .build();
        await bestuurseenheidRepository.save(bestuurseenheid);

        const formalInformalChoice =
            aFormalInformalChoice()
                .withChosenForm(ChosenFormType.INFORMAL)
                .withBestuurseenheidId(bestuurseenheid.id)
                .build();
        await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

        const instance =
            aMinimalInstance()
                .withTitle(undefined)
                .withDescription(undefined)
                .withAdditionalDescription(undefined)
                .withException(undefined)
                .withRegulation(undefined)
                .build();

        const selectedLanguage = await selectFormLanguageDomainService.selectForInstance(instance, bestuurseenheid);
        expect(selectedLanguage).toEqual(Language.INFORMAL);
    });

    test('Instance without nl language and no formal informal choice made yet returns formal', async () => {
        const bestuurseenheid =
            aBestuurseenheid()
                .build();
        await bestuurseenheidRepository.save(bestuurseenheid);

        const instance =
            aMinimalInstance()
                .withTitle(undefined)
                .withDescription(undefined)
                .withAdditionalDescription(undefined)
                .withException(undefined)
                .withRegulation(undefined)
                .build();

        const selectedLanguage = await selectFormLanguageDomainService.selectForInstance(instance, bestuurseenheid);
        expect(selectedLanguage).toEqual(Language.FORMAL);
    });

});