import {aBestuurseenheid} from "./bestuurseenheid-test-builder";
import {aFullInstance, aMinimalPublishedInstance} from "./instance-test-builder";
import {Language} from "../../../src/core/domain/language";
import {
    ConvertInstanceToInformalDomainService
} from "../../../src/core/domain/convert-instance-to-informal-domain-service";
import {TEST_SPARQL_ENDPOINT, TNI_IPDC_AUTHENTICATION_KEY, TNI_IPDC_ENDPOINT} from "../../test.config";
import {InvariantError} from "../../../src/core/domain/shared/lpdc-error";
import {ChosenFormType, InstanceStatusType} from "../../../src/core/domain/types";
import {FormatPreservingDate} from "../../../src/core/domain/format-preserving-date";
import {LanguageString} from "../../../src/core/domain/language-string";
import {aFullRequirementForInstance} from "./requirement-test-builder";
import {aFullProcedureForInstance} from "./procedure-test-builder";
import {aFullCostForInstance} from "./cost-test-builder";
import {aFullFinancialAdvantageForInstance} from "./financial-advantage-test-builder";
import {aFullWebsiteForInstance, anotherFullWebsiteForInstance} from "./website-test-builder";
import {
    FormalInformalChoiceSparqlRepository
} from "../../../src/driven/persistence/formal-informal-choice-sparql-repository";
import {aFormalInformalChoice} from "./formal-informal-choice-test-builder";
import {
    InstanceInformalLanguageStringsFetcherIpdc
} from "../../../src/driven/external/instance-informal-language-strings-fetcher-ipdc";
import {restoreRealTime, setFixedTime} from "../../fixed-time";
import {uuid as uuidv4} from "../../../mu-helper";
import {aFullEvidenceForInstance} from "./evidence-test-builder";
import {aFullLegalResourceForInstance} from "./legal-resource-test-builder";
import {
    instancePublishedOnIpdcTni
} from "../../driven/external/instance-informal-language-strings-fetcher-ipdc.it-test";
import {InstanceBuilder} from "../../../src/core/domain/instance";
import {InstanceSparqlTestRepository} from "../../driven/persistence/instance-sparql-test-repository";

describe('Convert Instance To Informal Domain Service', () => {

    const instanceTestRepository = new InstanceSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const formalInformalChoiceRepository = new FormalInformalChoiceSparqlRepository(TEST_SPARQL_ENDPOINT);
    const instanceInformalLanguageStringsFetcher = new InstanceInformalLanguageStringsFetcherIpdc(TNI_IPDC_ENDPOINT, TNI_IPDC_AUTHENTICATION_KEY);
    const convertInstanceToInformalDomainService = new ConvertInstanceToInformalDomainService(
        instanceTestRepository,
        formalInformalChoiceRepository,
        instanceInformalLanguageStringsFetcher);

    describe('Confirm instance already informal', () => {
        beforeAll(() => {
            setFixedTime();
        });
        afterAll(() => restoreRealTime());

        test('When instance dutchLanguageVersion already is informal, then throw error', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aMinimalPublishedInstance()
                .withTitle(LanguageString.of(undefined, undefined, 'titel'))
                .withDescription(LanguageString.of(undefined, undefined, 'beschrijving'))
                .withDutchLanguageVariant(Language.INFORMAL)
                .build();
            await instanceTestRepository.save(bestuurseenheid, instance);

            const formalInformalChoice = aFormalInformalChoice().withChosenForm(ChosenFormType.INFORMAL).build();
            await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

            await expect(() => convertInstanceToInformalDomainService.confirmInstanceIsAlreadyInformal(bestuurseenheid, instance, instance.dateModified))
                .rejects.toThrowWithMessage(InvariantError, 'Instantie is reeds in de je-vorm');
        });

        test('When instance is not published, then throw error', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withStatus(InstanceStatusType.VERZONDEN)
                .withDateSent(FormatPreservingDate.now())
                .withNeedsConversionFromFormalToInformal(true)
                .build();

            await instanceTestRepository.save(bestuurseenheid, instance, false);

            const formalInformalChoice = aFormalInformalChoice().withChosenForm(ChosenFormType.INFORMAL).build();
            await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

            await expect(() => convertInstanceToInformalDomainService.confirmInstanceIsAlreadyInformal(bestuurseenheid, instance, instance.dateModified))
                .rejects.toThrowWithMessage(InvariantError, 'Instantie moet gepubliceerd zijn');
        });

        test('When instance is not verzonden, then throw error', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withStatus(InstanceStatusType.VERZONDEN)
                .withDateSent(FormatPreservingDate.now())
                .withNeedsConversionFromFormalToInformal(true)
                .build();
            await instanceTestRepository.save(bestuurseenheid, instance);

            const formalInformalChoice = aFormalInformalChoice().withChosenForm(ChosenFormType.INFORMAL).build();
            await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

            const instanceOntwerp = InstanceBuilder.from(instance)
                .withStatus(InstanceStatusType.ONTWERP)
                .build();

            await expect(() => convertInstanceToInformalDomainService.confirmInstanceIsAlreadyInformal(bestuurseenheid, instanceOntwerp, instanceOntwerp.dateModified))
                .rejects.toThrowWithMessage(InvariantError, 'Instantie is al in status ontwerp');
        });

        test('When bestuurseenheid chose formal, then throw error', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withStatus(InstanceStatusType.VERZONDEN)
                .withDateSent(FormatPreservingDate.now())
                .withDutchLanguageVariant(Language.FORMAL)
                .withNeedsConversionFromFormalToInformal(false)
                .build();
            await instanceTestRepository.save(bestuurseenheid, instance);

            const formalInformalChoice = aFormalInformalChoice().withChosenForm(ChosenFormType.FORMAL).build();
            await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

            await expect(() => convertInstanceToInformalDomainService.confirmInstanceIsAlreadyInformal(bestuurseenheid, instance, instance.dateModified))
                .rejects.toThrowWithMessage(InvariantError, 'Je moet gekozen hebben voor de je-vorm');
        });

        test('When bestuurseenheid did not not make formalInformal choice yet, then throw error', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withStatus(InstanceStatusType.VERZONDEN)
                .withDateSent(FormatPreservingDate.now())
                .withDutchLanguageVariant(Language.FORMAL)
                .withNeedsConversionFromFormalToInformal(false)
                .build();
            await instanceTestRepository.save(bestuurseenheid, instance);

            await expect(() => convertInstanceToInformalDomainService.confirmInstanceIsAlreadyInformal(bestuurseenheid, instance, instance.dateModified))
                .rejects.toThrowWithMessage(InvariantError, 'Je moet gekozen hebben voor de je-vorm');
        });

        test('When needConversionFromFormalToInformal is false, then throw error', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withStatus(InstanceStatusType.VERZONDEN)
                .withDateSent(FormatPreservingDate.now())
                .withDutchLanguageVariant(Language.FORMAL)
                .withNeedsConversionFromFormalToInformal(false)
                .build();
            await instanceTestRepository.save(bestuurseenheid, instance);

            const formalInformalChoice = aFormalInformalChoice().withChosenForm(ChosenFormType.INFORMAL).build();
            await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

            await expect(() => convertInstanceToInformalDomainService.confirmInstanceIsAlreadyInformal(bestuurseenheid, instance, instance.dateModified))
                .rejects.toThrowWithMessage(InvariantError, 'Instantie moet u naar je conversie nodig hebben');
        });

        test('should transform all language fields nl or nl-be-x-formal languageStrings to nl-be-x-informal', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withStatus(InstanceStatusType.VERZONDEN)
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
                .withLegalResources([
                    aFullLegalResourceForInstance().withOrder(0).build(),
                    aFullLegalResourceForInstance().withOrder(1).build(),
                ])
                .build();
            await instanceTestRepository.save(bestuurseenheid, instance);

            const formalInformalChoice = aFormalInformalChoice().withChosenForm(ChosenFormType.INFORMAL).build();
            await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

            await convertInstanceToInformalDomainService.confirmInstanceIsAlreadyInformal(bestuurseenheid, instance, instance.dateModified);

            const actualInstance = await instanceTestRepository.findById(bestuurseenheid, instance.id);

            expect(actualInstance.calculatedInstanceLanguages()).toEqual([Language.INFORMAL]);
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
            expect(actualInstance.legalResources[0].title).toEqual(LanguageString.of(undefined, undefined, 'Legal Resource Title - nl-formal'));
            expect(actualInstance.legalResources[0].description).toEqual(LanguageString.of(undefined, undefined, 'Legal Resource Description - nl-formal'));
            expect(actualInstance.legalResources[1].title).toEqual(LanguageString.of(undefined, undefined, 'Legal Resource Title - nl-formal'));
            expect(actualInstance.legalResources[1].description).toEqual(LanguageString.of(undefined, undefined, 'Legal Resource Description - nl-formal'));
        });

        test('confirmInstanceIsAlreadyInformal should set dutchLanguageVersion to nl-be-x-informal', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withStatus(InstanceStatusType.VERZONDEN)
                .withDateSent(FormatPreservingDate.of('2024-01-16T00:00:00.672Z'))
                .withDutchLanguageVariant(Language.FORMAL)
                .withNeedsConversionFromFormalToInformal(true)
                .build();
            await instanceTestRepository.save(bestuurseenheid, instance);

            const formalInformalChoice = aFormalInformalChoice().withChosenForm(ChosenFormType.INFORMAL).build();
            await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

            await convertInstanceToInformalDomainService.confirmInstanceIsAlreadyInformal(bestuurseenheid, instance, instance.dateModified);

            const actualInstance = await instanceTestRepository.findById(bestuurseenheid, instance.id);
            expect(actualInstance.dutchLanguageVariant).toEqual(Language.INFORMAL);
        });

        test('confirmInstanceIsAlreadyInformal should set needsFormalToInformalConversion to false', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withStatus(InstanceStatusType.VERZONDEN)
                .withDateSent(FormatPreservingDate.of('2024-01-16T00:00:00.672Z'))
                .withDutchLanguageVariant(Language.FORMAL)
                .withNeedsConversionFromFormalToInformal(true)
                .build();
            await instanceTestRepository.save(bestuurseenheid, instance);

            const formalInformalChoice = aFormalInformalChoice().withChosenForm(ChosenFormType.INFORMAL).build();
            await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

            await convertInstanceToInformalDomainService.confirmInstanceIsAlreadyInformal(bestuurseenheid, instance, instance.dateModified);

            const actualInstance = await instanceTestRepository.findById(bestuurseenheid, instance.id);
            expect(actualInstance.needsConversionFromFormalToInformal).toBeFalse();
        });

        test('confirmInstanceIsAlreadyInformal should set publish instance again', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withStatus(InstanceStatusType.VERZONDEN)
                .withDateSent(FormatPreservingDate.of('2024-01-16T00:00:00.672Z'))
                .withDutchLanguageVariant(Language.FORMAL)
                .withNeedsConversionFromFormalToInformal(true)
                .build();
            await instanceTestRepository.save(bestuurseenheid, instance);

            const formalInformalChoice = aFormalInformalChoice().withChosenForm(ChosenFormType.INFORMAL).build();
            await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

            await convertInstanceToInformalDomainService.confirmInstanceIsAlreadyInformal(bestuurseenheid, instance, instance.dateModified);

            const actualInstance = await instanceTestRepository.findById(bestuurseenheid, instance.id);
            expect(actualInstance.status).toEqual(InstanceStatusType.VERZONDEN);
            expect(actualInstance.dateSent).toEqual(FormatPreservingDate.now());
        });
    });

    describe('Convert instance to informal', () => {

        test('When instance dutchLanguageVersion already is informal, then throw error', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const uuid = 'e8843fda-b3a8-4334-905c-8e49eb12203b';
            const id = InstanceBuilder.buildIri(uuid);

            const instance = aFullInstance()
                .withId(id)
                .withUuid(uuid)
                .withCreatedBy(bestuurseenheid.id)
                .withStatus(InstanceStatusType.VERZONDEN)
                .withDateSent(FormatPreservingDate.of('2024-01-16T00:00:00.672Z'))
                .withDutchLanguageVariant(Language.FORMAL)
                .withNeedsConversionFromFormalToInformal(true)
                .withRequirements([
                    aFullRequirementForInstance().withUuid(uuidv4()).withEvidence(aFullEvidenceForInstance().withUuid(uuidv4()).build()).build(),
                ])
                .withProcedures([
                    aFullProcedureForInstance().withUuid(uuidv4()).withWebsites([aFullWebsiteForInstance().withUuid(uuidv4()).withOrder(1).build(), anotherFullWebsiteForInstance(uuidv4()).withOrder(2).build()]).build()
                ])
                .build()
                .transformToInformal();

            await instanceTestRepository.save(bestuurseenheid, instance);

            const formalInformalChoice = aFormalInformalChoice().withChosenForm(ChosenFormType.INFORMAL).build();
            await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

            await expect(() => convertInstanceToInformalDomainService.convertInstanceToInformal(bestuurseenheid, instance, instance.dateModified))
                .rejects.toThrowWithMessage(InvariantError, 'Instantie is reeds in de je-vorm');
        });

        test('When instance is not published, then throw error', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withStatus(InstanceStatusType.VERZONDEN)
                .withDateSent(FormatPreservingDate.of('2024-01-16T00:00:00.672Z'))
                .withNeedsConversionFromFormalToInformal(true)
                .build();

            await instanceTestRepository.save(bestuurseenheid, instance, false);

            const formalInformalChoice = aFormalInformalChoice().withChosenForm(ChosenFormType.INFORMAL).build();
            await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

            await expect(() => convertInstanceToInformalDomainService.convertInstanceToInformal(bestuurseenheid, instance, instance.dateModified))
                .rejects.toThrowWithMessage(InvariantError, 'Instantie moet gepubliceerd zijn');
        });

        test('When instance is not verzonden, then throw error', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withStatus(InstanceStatusType.VERZONDEN)
                .withDateSent(FormatPreservingDate.now())
                .withNeedsConversionFromFormalToInformal(true)
                .build();
            await instanceTestRepository.save(bestuurseenheid, instance);

            const formalInformalChoice = aFormalInformalChoice().withChosenForm(ChosenFormType.INFORMAL).build();
            await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

            const instanceOntwerp = InstanceBuilder.from(instance)
                .withStatus(InstanceStatusType.ONTWERP)
                .build();

            await expect(() => convertInstanceToInformalDomainService.convertInstanceToInformal(bestuurseenheid, instanceOntwerp, instanceOntwerp.dateModified))
                .rejects.toThrowWithMessage(InvariantError, 'Instantie is al in status ontwerp');
        });

        test('When bestuurseenheid chose formal, then throw error', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withStatus(InstanceStatusType.VERZONDEN)
                .withDateSent(FormatPreservingDate.of('2024-01-16T00:00:00.672Z'))
                .withDutchLanguageVariant(Language.FORMAL)
                .withNeedsConversionFromFormalToInformal(false)
                .build();

            await instanceTestRepository.save(bestuurseenheid, instance);

            const formalInformalChoice = aFormalInformalChoice().withChosenForm(ChosenFormType.FORMAL).build();
            await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

            await expect(() => convertInstanceToInformalDomainService.convertInstanceToInformal(bestuurseenheid, instance, instance.dateModified))
                .rejects.toThrowWithMessage(InvariantError, 'Je moet gekozen hebben voor de je-vorm');
        });

        test('When bestuurseenheid did not not make formalInformal choice yet, then throw error', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withStatus(InstanceStatusType.VERZONDEN)
                .withDateSent(FormatPreservingDate.of('2024-01-16T00:00:00.672Z'))
                .withDutchLanguageVariant(Language.FORMAL)
                .withNeedsConversionFromFormalToInformal(false)
                .build();

            await instanceTestRepository.save(bestuurseenheid, instance);

            await expect(() => convertInstanceToInformalDomainService.convertInstanceToInformal(bestuurseenheid, instance, instance.dateModified))
                .rejects.toThrowWithMessage(InvariantError, 'Je moet gekozen hebben voor de je-vorm');
        });

        test('When needConversionFromFormalToInformal is false, then throw error', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = InstanceBuilder.from(instancePublishedOnIpdcTni)
                .withCreatedBy(bestuurseenheid.id)
                .withStatus(InstanceStatusType.VERZONDEN)
                .withDateSent(FormatPreservingDate.of('2024-01-16T00:00:00.672Z'))
                .withDutchLanguageVariant(Language.FORMAL)
                .withNeedsConversionFromFormalToInformal(false)
                .withDateModified(FormatPreservingDate.of("2024-04-24T14:09:32.778Z"))
                .build();

            await instanceTestRepository.save(bestuurseenheid, instance);

            const formalInformalChoice = aFormalInformalChoice().withChosenForm(ChosenFormType.INFORMAL).build();
            await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

            await expect(() => convertInstanceToInformalDomainService.convertInstanceToInformal(bestuurseenheid, instance, instance.dateModified))
                .rejects.toThrowWithMessage(InvariantError, 'Instantie moet u naar je conversie nodig hebben');
        });

        test('convertInstanceToInformal should merge informal fields from ipdc into the instance, reopen instance , set needsFormalToInformalConversion to false and dutchLanguageVersion to nl-be-x-informal ', async () => {
            const bestuurseenheid = aBestuurseenheid().build();

            const instance =
                InstanceBuilder.from(instancePublishedOnIpdcTni)
                    .withCreatedBy(bestuurseenheid.id)
                    .withStatus(InstanceStatusType.VERZONDEN)
                    .withDateSent(FormatPreservingDate.of('2024-01-16T00:00:00.672Z'))
                    .withDateModified(FormatPreservingDate.of("2024-04-24T14:09:32.778Z"))
                    .withDutchLanguageVariant(Language.FORMAL)
                    .withNeedsConversionFromFormalToInformal(true)
                    .build();

            await instanceTestRepository.save(bestuurseenheid, instance);

            const formalInformalChoice = aFormalInformalChoice().withChosenForm(ChosenFormType.INFORMAL).build();
            await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

            await convertInstanceToInformalDomainService.convertInstanceToInformal(bestuurseenheid, instance, instance.dateModified);

            const actualInstance = await instanceTestRepository.findById(bestuurseenheid, instance.id);
            expect(actualInstance.status).toEqual(InstanceStatusType.ONTWERP);
            expect(actualInstance.needsConversionFromFormalToInformal).toBeFalse();
            expect(actualInstance.dutchLanguageVariant).toEqual(Language.INFORMAL);
        });
    });


});
