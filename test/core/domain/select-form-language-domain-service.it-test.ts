import {aFormalInformalChoice} from "./formal-informal-choice-test-builder";
import {ChosenFormType} from "../../../src/core/domain/types";
import {aMinimalConcept} from "./concept-test-builder";
import {LanguageString} from "../../../src/core/domain/language-string";
import {SelectFormLanguageDomainService} from "../../../src/core/domain/select-form-language-domain-service";
import {Language} from "../../../src/core/domain/language";
import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {aBestuurseenheid} from "./bestuurseenheid-test-builder";
import {BestuurseenheidSparqlTestRepository} from "../../driven/persistence/bestuurseenheid-sparql-test-repository";
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
                    LanguageString.of('nl', undefined, 'nl informal', 'nl generated formal', undefined)
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
                    LanguageString.of('nl', 'nl formal', undefined, undefined, 'nl generated informal')
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
                    LanguageString.of('nl', undefined, undefined, 'nl generated formal', 'nl generated informal')
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
                    LanguageString.of('nl', 'nl formal', 'nl informal', undefined, undefined)
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
                    LanguageString.of('nl', undefined, undefined, undefined, undefined)
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
                    LanguageString.of('nl', 'nl formal', undefined, undefined, 'nl generated informal')
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
                    LanguageString.of( 'nl', undefined, 'nl informal', 'nl generated formal', undefined)
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
                    LanguageString.of('nl', undefined, undefined, 'nl generated formal', 'nl generated informal')
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
                    LanguageString.of('nl', 'nl formal', 'nl informal', undefined, undefined)
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
                    LanguageString.of('nl', undefined, undefined, undefined, undefined)
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
                    LanguageString.of('nl', 'nl formal', undefined, undefined, 'nl generated informal')
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
                    LanguageString.of('nl', undefined, 'nl informal', 'nl generated formal', undefined)
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
                    LanguageString.of('nl', undefined, undefined, 'nl generated formal', 'nl generated informal')
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
                    LanguageString.of('nl', 'nl formal', 'nl informal', undefined, undefined)
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
                    LanguageString.of('nl', undefined, undefined, undefined, undefined)
                )
                .build();

        const selectedLanguage = await selectFormLanguageDomainService.selectForConcept(concept, bestuurseenheid);
        expect(selectedLanguage).toEqual(Language.NL);
    });

});
