import {aBestuurseenheid} from "./bestuurseenheid-test-builder";
import {aFullInstance, aMinimalInstance} from "./instance-test-builder";
import {Language} from "../../../src/core/domain/language";
import {
    ConfirmInstanceIsAlreadyInformalDomainService
} from "../../../src/core/domain/confirm-instance-is-already-informal-domain-service";
import {InstanceSparqlRepository} from "../../../src/driven/persistence/instance-sparql-repository";
import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {InvariantError} from "../../../src/core/domain/shared/lpdc-error";
import {ChosenFormType, InstancePublicationStatusType, InstanceStatusType} from "../../../src/core/domain/types";
import {FormatPreservingDate} from "../../../src/core/domain/format-preserving-date";
import {LanguageString} from "../../../src/core/domain/language-string";
import {restoreRealTime, setFixedTime} from "../../fixed-time";
import {aFullRequirementForInstance} from "./requirement-test-builder";
import {aFullProcedureForInstance} from "./procedure-test-builder";
import {aFullCostForInstance} from "./cost-test-builder";
import {aFullFinancialAdvantageForInstance} from "./financial-advantage-test-builder";
import {aFullWebsiteForInstance} from "./website-test-builder";
import {
    FormalInformalChoiceSparqlRepository
} from "../../../src/driven/persistence/formal-informal-choice-sparql-repository";
import {aFormalInformalChoice} from "./formal-informal-choice-test-builder";

describe('Confirm instance already informal domain service', () => {

    const instanceRepository = new InstanceSparqlRepository(TEST_SPARQL_ENDPOINT);
    const formalInformalChoiceRepository = new FormalInformalChoiceSparqlRepository(TEST_SPARQL_ENDPOINT);
    const confirmInstanceIsAlreadyInformalDomainService = new ConfirmInstanceIsAlreadyInformalDomainService(instanceRepository, formalInformalChoiceRepository);

    beforeAll(() => setFixedTime());

    afterAll(() => restoreRealTime());

    test('When instance dutchLanguageVersion already is informal, then throw error', async () => {
        const bestuurseenheid = aBestuurseenheid().build();
        const instance = aMinimalInstance()
            .withTitle(LanguageString.of(undefined, undefined, 'titel informal'))
            .withStatus(InstanceStatusType.VERSTUURD)
            .withDateSent(FormatPreservingDate.now())
            .withPublicationStatus(InstancePublicationStatusType.GEPUBLICEERD)
            .withDatePublished(FormatPreservingDate.now())
            .withDutchLanguageVariant(Language.INFORMAL)
            .build();

        const formalInformalChoice = aFormalInformalChoice().withChosenForm(ChosenFormType.INFORMAL).build();
        await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

        await expect(() => confirmInstanceIsAlreadyInformalDomainService.confirmInstanceIsAlreadyInformal(bestuurseenheid, instance, instance.dateModified))
            .rejects.toThrowWithMessage(InvariantError, 'Instantie is reeds in de je-vorm');
    });

    test('When instance is is not published, then throw error', async () => {
        const bestuurseenheid = aBestuurseenheid().build();
        const instance = aFullInstance()
            .withStatus(InstanceStatusType.VERSTUURD)
            .withPublicationStatus(undefined)
            .withDatePublished(undefined)
            .withNeedsConversionFromFormalToInformal(true)
            .build();

        const formalInformalChoice = aFormalInformalChoice().withChosenForm(ChosenFormType.INFORMAL).build();
        await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

        await expect(() => confirmInstanceIsAlreadyInformalDomainService.confirmInstanceIsAlreadyInformal(bestuurseenheid, instance, instance.dateModified))
            .rejects.toThrowWithMessage(InvariantError, 'Instantie moet gepubliceerd zijn');
    });

    test('When bestuurseenheid chose formal, then throw error', async () => {
        const bestuurseenheid = aBestuurseenheid().build();
        const instance = aFullInstance()
            .withStatus(InstanceStatusType.VERSTUURD)
            .withPublicationStatus(InstancePublicationStatusType.GEPUBLICEERD)
            .withDatePublished(FormatPreservingDate.now())
            .withDutchLanguageVariant(Language.FORMAL)
            .withNeedsConversionFromFormalToInformal(false)
            .build();

        const formalInformalChoice = aFormalInformalChoice().withChosenForm(ChosenFormType.FORMAL).build();
        await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

        await expect(() => confirmInstanceIsAlreadyInformalDomainService.confirmInstanceIsAlreadyInformal(bestuurseenheid, instance, instance.dateModified))
            .rejects.toThrowWithMessage(InvariantError, 'Je moet gekozen hebben voor de je-vorm');
    });

    test('When bestuurseenheid did not not make formalInformal choice yet, then throw error', async () => {
        const bestuurseenheid = aBestuurseenheid().build();
        const instance = aFullInstance()
            .withPublicationStatus(InstancePublicationStatusType.GEPUBLICEERD)
            .withDatePublished(FormatPreservingDate.now())
            .withDutchLanguageVariant(Language.FORMAL)
            .withNeedsConversionFromFormalToInformal(false)
            .build();

        await expect(() => confirmInstanceIsAlreadyInformalDomainService.confirmInstanceIsAlreadyInformal(bestuurseenheid, instance, instance.dateModified))
            .rejects.toThrowWithMessage(InvariantError, 'Je moet gekozen hebben voor de je-vorm');
    });

    test('When needConversionFromUtoJe is false, then throw error', async () => {
        const bestuurseenheid = aBestuurseenheid().build();
        const instance = aFullInstance()
            .withStatus(InstanceStatusType.VERSTUURD)
            .withPublicationStatus(InstancePublicationStatusType.GEPUBLICEERD)
            .withDatePublished(FormatPreservingDate.now())
            .withDutchLanguageVariant(Language.FORMAL)
            .withNeedsConversionFromFormalToInformal(false)
            .build();

        const formalInformalChoice = aFormalInformalChoice().withChosenForm(ChosenFormType.INFORMAL).build();
        await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

        await expect(() => confirmInstanceIsAlreadyInformalDomainService.confirmInstanceIsAlreadyInformal(bestuurseenheid, instance, instance.dateModified))
            .rejects.toThrowWithMessage(InvariantError, 'Instantie moet u naar je conversie nodig hebben');
    });

    test('should transform all language fields nl or nl-be-x-formal languageStrings to nl-be-x-informal', async () => {
        const bestuurseenheid = aBestuurseenheid().build();
        const instance = aFullInstance()
            .withStatus(InstanceStatusType.VERSTUURD)
            .withPublicationStatus(InstancePublicationStatusType.GEPUBLICEERD)
            .withDatePublished(FormatPreservingDate.of('2024-01-16T00:00:00.672Z'))
            .withDateSent(FormatPreservingDate.of('2024-01-16T00:00:00.672Z'))
            .withDutchLanguageVariant(Language.FORMAL)
            .withNeedsConversionFromFormalToInformal(true)
            .withRequirements([
                aFullRequirementForInstance().withOrder(0).build(),
                aFullRequirementForInstance().withOrder(1).withEvidence(undefined).build()
            ])
            .withProcedures([
                aFullProcedureForInstance().withOrder(0).build(),
                aFullProcedureForInstance().withOrder(1).withWebsites([]).build(),
            ])
            .withWebsites([
                aFullWebsiteForInstance().withOrder(0).build(),
                aFullWebsiteForInstance().withOrder(1).build()
            ])
            .withCosts([
                aFullCostForInstance().withOrder(0).build(),
                aFullCostForInstance().withOrder(1).build(),
            ])
            .withFinancialAdvantages([
                aFullFinancialAdvantageForInstance().withOrder(0).build(),
                aFullFinancialAdvantageForInstance().withOrder(1).build(),
            ])
            .build();
        await instanceRepository.save(bestuurseenheid, instance);

        const formalInformalChoice = aFormalInformalChoice().withChosenForm(ChosenFormType.INFORMAL).build();
        await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

        await confirmInstanceIsAlreadyInformalDomainService.confirmInstanceIsAlreadyInformal(bestuurseenheid, instance, instance.dateModified);

        const actualInstance = await instanceRepository.findById(bestuurseenheid, instance.id);

        expect(actualInstance.calculatedInstanceNlLanguages()).toEqual([Language.INFORMAL]);
        expect(actualInstance.title).toEqual(LanguageString.of(undefined, undefined, 'Instance Title - nl-formal'));
        expect(actualInstance.description).toEqual(LanguageString.of(undefined, undefined, 'Instance Description - nl-formal'));
        expect(actualInstance.additionalDescription).toEqual(LanguageString.of(undefined, undefined, 'Instance Additional Description - nl-formal'));
        expect(actualInstance.exception).toEqual(LanguageString.of(undefined, undefined, 'Instance Exception - nl-formal'));
        expect(actualInstance.regulation).toEqual(LanguageString.of(undefined, undefined, 'Instance Regulation - nl-formal'));
        expect(actualInstance.requirements[0].title).toEqual(LanguageString.of(undefined, undefined, 'Requirement Title - nl-formal'));
        expect(actualInstance.requirements[0].description).toEqual(LanguageString.of(undefined, undefined, 'Requirement Description - nl-formal'));
        expect(actualInstance.requirements[0].evidence.title).toEqual(LanguageString.of(undefined, undefined, 'Evidence Title - nl-formal'));
        expect(actualInstance.requirements[0].evidence.description).toEqual(LanguageString.of(undefined, undefined, 'Evidence Description - nl-formal'));
        expect(actualInstance.requirements[1].title).toEqual(LanguageString.of(undefined, undefined, 'Requirement Title - nl-formal'));
        expect(actualInstance.requirements[1].description).toEqual(LanguageString.of(undefined, undefined, 'Requirement Description - nl-formal'));
        expect(actualInstance.procedures[0].title).toEqual(LanguageString.of(undefined, undefined, 'Procedure Title - nl-formal'));
        expect(actualInstance.procedures[0].description).toEqual(LanguageString.of(undefined, undefined, 'Procedure Description - nl-formal'));
        expect(actualInstance.procedures[0].websites[0].title).toEqual(LanguageString.of(undefined, undefined, 'Website Title - nl-formal'));
        expect(actualInstance.procedures[0].websites[0].description).toEqual(LanguageString.of(undefined, undefined, 'Website Description - nl-formal'));
        expect(actualInstance.procedures[1].title).toEqual(LanguageString.of(undefined, undefined, 'Procedure Title - nl-formal'));
        expect(actualInstance.procedures[1].description).toEqual(LanguageString.of(undefined, undefined, 'Procedure Description - nl-formal'));
        expect(actualInstance.websites[0].title).toEqual(LanguageString.of(undefined, undefined, 'Website Title - nl-formal'));
        expect(actualInstance.websites[0].description).toEqual(LanguageString.of(undefined, undefined, 'Website Description - nl-formal'));
        expect(actualInstance.websites[1].title).toEqual(LanguageString.of(undefined, undefined, 'Website Title - nl-formal'));
        expect(actualInstance.websites[1].description).toEqual(LanguageString.of(undefined, undefined, 'Website Description - nl-formal'));
        expect(actualInstance.costs[0].title).toEqual(LanguageString.of(undefined, undefined, 'Cost Title - nl-formal'));
        expect(actualInstance.costs[0].description).toEqual(LanguageString.of(undefined, undefined, 'Cost Description - nl-formal'));
        expect(actualInstance.costs[1].title).toEqual(LanguageString.of(undefined, undefined, 'Cost Title - nl-formal'));
        expect(actualInstance.costs[1].description).toEqual(LanguageString.of(undefined, undefined, 'Cost Description - nl-formal'));
        expect(actualInstance.financialAdvantages[0].title).toEqual(LanguageString.of(undefined, undefined, 'Financial Advantage Title - nl-formal'));
        expect(actualInstance.financialAdvantages[0].description).toEqual(LanguageString.of(undefined, undefined, 'Financial Advantage Description - nl-formal'));
        expect(actualInstance.financialAdvantages[1].title).toEqual(LanguageString.of(undefined, undefined, 'Financial Advantage Title - nl-formal'));
        expect(actualInstance.financialAdvantages[1].description).toEqual(LanguageString.of(undefined, undefined, 'Financial Advantage Description - nl-formal'));
    });

    test('confirmInstanceIsAlreadyInformal should set dutchLanguageVersion to nl-be-x-informal', async () => {
        const bestuurseenheid = aBestuurseenheid().build();
        const instance = aFullInstance()
            .withStatus(InstanceStatusType.VERSTUURD)
            .withPublicationStatus(InstancePublicationStatusType.GEPUBLICEERD)
            .withDatePublished(FormatPreservingDate.of('2024-01-16T00:00:00.672Z'))
            .withDateSent(FormatPreservingDate.of('2024-01-16T00:00:00.672Z'))
            .withDutchLanguageVariant(Language.FORMAL)
            .withNeedsConversionFromFormalToInformal(true)
            .build();
        await instanceRepository.save(bestuurseenheid, instance);

        const formalInformalChoice = aFormalInformalChoice().withChosenForm(ChosenFormType.INFORMAL).build();
        await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

        await confirmInstanceIsAlreadyInformalDomainService.confirmInstanceIsAlreadyInformal(bestuurseenheid, instance, instance.dateModified);

        const actualInstance = await instanceRepository.findById(bestuurseenheid, instance.id);
        expect(actualInstance.dutchLanguageVariant).toEqual(Language.INFORMAL);
    });

    test('confirmInstanceIsAlreadyInformal should set needsFormalToInformalConversion to false', async () => {
        const bestuurseenheid = aBestuurseenheid().build();
        const instance = aFullInstance()
            .withStatus(InstanceStatusType.VERSTUURD)
            .withPublicationStatus(InstancePublicationStatusType.GEPUBLICEERD)
            .withDatePublished(FormatPreservingDate.of('2024-01-16T00:00:00.672Z'))
            .withDateSent(FormatPreservingDate.of('2024-01-16T00:00:00.672Z'))
            .withDutchLanguageVariant(Language.FORMAL)
            .withNeedsConversionFromFormalToInformal(true)
            .build();
        await instanceRepository.save(bestuurseenheid, instance);

        const formalInformalChoice = aFormalInformalChoice().withChosenForm(ChosenFormType.INFORMAL).build();
        await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

        await confirmInstanceIsAlreadyInformalDomainService.confirmInstanceIsAlreadyInformal(bestuurseenheid, instance, instance.dateModified);

        const actualInstance = await instanceRepository.findById(bestuurseenheid, instance.id);
        expect(actualInstance.needsConversionFromFormalToInformal).toBeFalse();
    });

    test('confirmInstanceIsAlreadyInformal should set instance to to-republish', async () => {
        const bestuurseenheid = aBestuurseenheid().build();
        const instance = aFullInstance()
            .withStatus(InstanceStatusType.VERSTUURD)
            .withPublicationStatus(InstancePublicationStatusType.GEPUBLICEERD)
            .withDatePublished(FormatPreservingDate.of('2024-01-16T00:00:00.672Z'))
            .withDateSent(FormatPreservingDate.of('2024-01-16T00:00:00.672Z'))
            .withDutchLanguageVariant(Language.FORMAL)
            .withNeedsConversionFromFormalToInformal(true)
            .build();
        await instanceRepository.save(bestuurseenheid, instance);

        const formalInformalChoice = aFormalInformalChoice().withChosenForm(ChosenFormType.INFORMAL).build();
        await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

        await confirmInstanceIsAlreadyInformalDomainService.confirmInstanceIsAlreadyInformal(bestuurseenheid, instance, instance.dateModified);

        const actualInstance = await instanceRepository.findById(bestuurseenheid, instance.id);
        expect(actualInstance.dateSent).toEqual(FormatPreservingDate.now());
    });
});