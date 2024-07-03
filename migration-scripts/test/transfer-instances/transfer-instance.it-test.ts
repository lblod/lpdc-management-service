import {TransferInstanceService} from "../../transfer-instances/transfer-instance-service";
import {TEST_SPARQL_ENDPOINT} from "../../../test/test.config";
import {InstanceSparqlRepository} from "../../../src/driven/persistence/instance-sparql-repository";
import {
    FormalInformalChoiceSparqlRepository
} from "../../../src/driven/persistence/formal-informal-choice-sparql-repository";
import {aBestuurseenheid} from "../../../test/core/domain/bestuurseenheid-test-builder";
import {aFormalInformalChoice} from "../../../test/core/domain/formal-informal-choice-test-builder";
import {aFullInstance, aMinimalInstance} from "../../../test/core/domain/instance-test-builder";
import {
    BestuurseenheidSparqlTestRepository
} from "../../../test/driven/persistence/bestuurseenheid-sparql-test-repository";
import {
    ChosenFormType,
    CompetentAuthorityLevelType,
    InstancePublicationStatusType,
    InstanceStatusType
} from "../../../src/core/domain/types";
import {Language} from "../../../src/core/domain/language";
import {Bestuurseenheid} from "../../../src/core/domain/bestuurseenheid";
import {FormatPreservingDate} from "../../../src/core/domain/format-preserving-date";
import {InvariantError} from "../../../src/core/domain/shared/lpdc-error";

describe('transfer instance', () => {
    const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const instanceRepository = new InstanceSparqlRepository(TEST_SPARQL_ENDPOINT);
    const formalInformalChoiceRepository = new FormalInformalChoiceSparqlRepository(TEST_SPARQL_ENDPOINT);
    const transferInstanceService = new TransferInstanceService(bestuurseenheidRepository, instanceRepository, formalInformalChoiceRepository);
    let fromAuthority: Bestuurseenheid;
    let toAuthority: Bestuurseenheid;

    beforeEach(async () => {
        fromAuthority = aBestuurseenheid().build();
        toAuthority = aBestuurseenheid().build();
        await bestuurseenheidRepository.save(fromAuthority);
        await bestuurseenheidRepository.save(toAuthority);

    });

    test('createdBy gets updated', async () => {
        const instance = aMinimalInstance().withCreatedBy(fromAuthority.id).build();
        await instanceRepository.save(fromAuthority, instance);
        const transferredInstance = await transferInstanceService.transfer(instance.id, fromAuthority.id, toAuthority.id);

        expect(transferredInstance.createdBy).toEqual(toAuthority.id);

    });

    test('dateCreated and dateModified are updated', async () => {
        const instance = aMinimalInstance().withCreatedBy(fromAuthority.id).build();
        await instanceRepository.save(fromAuthority, instance);
        const transferredInstance = await transferInstanceService.transfer(instance.id, fromAuthority.id, toAuthority.id);

        expect(instance.dateCreated.before(transferredInstance.dateCreated)).toBeTrue();
        expect(instance.dateModified.before(transferredInstance.dateModified)).toBeTrue();
    });

    test('forMunicipalityMerger is false', async () => {
        const instance = aMinimalInstance().withCreatedBy(fromAuthority.id).withForMunicipalityMerger(true).build();
        await instanceRepository.save(fromAuthority, instance);
        const transferredInstance = await transferInstanceService.transfer(instance.id, fromAuthority.id, toAuthority.id);

        expect(transferredInstance.forMunicipalityMerger).toBeFalse();
    });

    test('datePublished and dateSent are empty', async () => {
        const instance = aMinimalInstance().withCreatedBy(fromAuthority.id).withStatus(InstanceStatusType.VERZONDEN).withPublicationStatus(InstancePublicationStatusType.GEPUBLICEERD).withDateSent(FormatPreservingDate.now()).withDatePublished(FormatPreservingDate.now()).build();
        await instanceRepository.save(fromAuthority, instance);

        const transferredInstance = await transferInstanceService.transfer(instance.id, fromAuthority.id, toAuthority.id);

        expect(transferredInstance.datePublished).toBeUndefined();
        expect(transferredInstance.dateSent).toBeUndefined();
    });

    test('status is ontwerp and no publicationStatus', async () => {
        const instance = aMinimalInstance().withCreatedBy(fromAuthority.id).withStatus(InstanceStatusType.VERZONDEN).withPublicationStatus(InstancePublicationStatusType.GEPUBLICEERD).withDateSent(FormatPreservingDate.now()).withDatePublished(FormatPreservingDate.now()).build();
        await instanceRepository.save(fromAuthority, instance);

        const transferredInstance = await transferInstanceService.transfer(instance.id, fromAuthority.id, toAuthority.id);

        expect(transferredInstance.status).toEqual(InstanceStatusType.ONTWERP);
        expect(transferredInstance.publicationStatus).toBeUndefined();
    });

    test('copyOf is empty', async () => {
        const anotherInstance = aFullInstance().withCreatedBy(fromAuthority.id).build();
        await instanceRepository.save(fromAuthority, anotherInstance);

        const instance = aMinimalInstance().withCreatedBy(fromAuthority.id).withCopyOf(anotherInstance.id).build();
        await instanceRepository.save(fromAuthority, instance);
        const transferredInstance = await transferInstanceService.transfer(instance.id, fromAuthority.id, toAuthority.id);

        expect(transferredInstance.copyOf).toBeUndefined();
    });

    test('when forMunicipalityMerger is false, clear spatial and executingAuthority', async () => {
        const instance = aFullInstance().withCreatedBy(fromAuthority.id).withForMunicipalityMerger(false).build();
        await instanceRepository.save(fromAuthority, instance);
        const transferredInstance = await transferInstanceService.transfer(instance.id, fromAuthority.id, toAuthority.id);

        expect(instance.spatials).not.toBeEmpty();
        expect(transferredInstance.spatials).toBeEmpty();

        expect(instance.executingAuthorities).not.toBeEmpty();
        expect(transferredInstance.executingAuthorities).toBeEmpty();
    });

    test('when forMunicipalityMerger is false and componentAuthorityLevel is Lokale overheid, clear hadCompetentAuthority ', async () => {
        const lokaleOverheidInstance = aFullInstance().withCreatedBy(fromAuthority.id).withForMunicipalityMerger(false).withCompetentAuthorityLevels([CompetentAuthorityLevelType.LOKAAL, CompetentAuthorityLevelType.VLAAMS]).build();
        const europeeseInstance = aFullInstance().withCreatedBy(fromAuthority.id).withForMunicipalityMerger(false).withCompetentAuthorityLevels([CompetentAuthorityLevelType.EUROPEES]).build();
        const provincialeInstance = aFullInstance().withCreatedBy(fromAuthority.id).withForMunicipalityMerger(false).withCompetentAuthorityLevels([CompetentAuthorityLevelType.PROVINCIAAL]).build();

        await instanceRepository.save(fromAuthority, lokaleOverheidInstance);
        await instanceRepository.save(fromAuthority, europeeseInstance);
        await instanceRepository.save(fromAuthority, provincialeInstance);
        const transferredLokaleInstance = await transferInstanceService.transfer(lokaleOverheidInstance.id, fromAuthority.id, toAuthority.id);
        const transferredEuropeeseInstance = await transferInstanceService.transfer(europeeseInstance.id, fromAuthority.id, toAuthority.id);
        const transferredProvincialeInstance = await transferInstanceService.transfer(provincialeInstance.id, fromAuthority.id, toAuthority.id);

        expect(transferredLokaleInstance.competentAuthorities).toBeEmpty();
        expect(transferredEuropeeseInstance.competentAuthorities).not.toBeEmpty();
        expect(transferredProvincialeInstance.competentAuthorities).not.toBeEmpty();
    });

    describe('needsConversionFromFormalToInformal', () => {
        test('given authority without formalInformalChoice and instance in nl, needsConversion is false', async () => {
            const instance = aMinimalInstance().withDutchLanguageVariant(Language.NL).withCreatedBy(fromAuthority.id).build();
            await instanceRepository.save(fromAuthority, instance);

            const transferredInstance = await transferInstanceService.transfer(instance.id, fromAuthority.id, toAuthority.id);

            expect(transferredInstance.needsConversionFromFormalToInformal).toEqual(false);
        });
        test('given authority with formal formalInformalChoice and formal instance, needsConversion is false', async () => {
            const toFormalInformalChoice = aFormalInformalChoice().withChosenForm(ChosenFormType.FORMAL).withBestuurseenheidId(toAuthority.id).build();
            await formalInformalChoiceRepository.save(toAuthority, toFormalInformalChoice);

            const instance = aMinimalInstance().withCreatedBy(fromAuthority.id).withDutchLanguageVariant(Language.FORMAL).build();
            await instanceRepository.save(fromAuthority, instance);

            const transferredInstance = await transferInstanceService.transfer(instance.id, fromAuthority.id, toAuthority.id);

            expect(transferredInstance.needsConversionFromFormalToInformal).toEqual(false);
        });
        test('given authority with informal formalInformalChoice and informal instance, needsConversion is false', async () => {
            const toFormalInformalChoice = aFormalInformalChoice().withChosenForm(ChosenFormType.INFORMAL).withBestuurseenheidId(toAuthority.id).build();
            await formalInformalChoiceRepository.save(toAuthority, toFormalInformalChoice);

            const instance = aMinimalInstance().withDutchLanguageVariant(Language.INFORMAL).withCreatedBy(fromAuthority.id).build();

            await instanceRepository.save(fromAuthority, instance);

            const transferredInstance = await transferInstanceService.transfer(instance.id, fromAuthority.id, toAuthority.id);

            expect(transferredInstance.needsConversionFromFormalToInformal).toEqual(false);
        });

        test('given authority with formal formalInformalChoice and informal instance, throws error', async () => {
            const toFormalInformalChoice = aFormalInformalChoice().withChosenForm(ChosenFormType.FORMAL).withBestuurseenheidId(toAuthority.id).build();
            await formalInformalChoiceRepository.save(toAuthority, toFormalInformalChoice);

            const instance = aMinimalInstance().withDutchLanguageVariant(Language.INFORMAL).withCreatedBy(fromAuthority.id).build();

            await instanceRepository.save(fromAuthority, instance);

            await expect(transferInstanceService.transfer(instance.id, fromAuthority.id, toAuthority.id)).rejects.toThrowWithMessage(InvariantError, "transforming informal instance to formal is not possible");
        });

        test('given authority with informal formalInformalChoice and non-informal instance, sets needsConversionFromFormalToInformal to true', async () => {
            const toFormalInformalChoice = aFormalInformalChoice().withChosenForm(ChosenFormType.INFORMAL).withBestuurseenheidId(toAuthority.id).build();
            await formalInformalChoiceRepository.save(toAuthority, toFormalInformalChoice);

            const formalInstance = aMinimalInstance().withDutchLanguageVariant(Language.FORMAL).withCreatedBy(fromAuthority.id).build();
            const nlInstance = aMinimalInstance().withDutchLanguageVariant(Language.NL).withCreatedBy(fromAuthority.id).build();
            const informalInstance = aMinimalInstance().withDutchLanguageVariant(Language.INFORMAL).withCreatedBy(fromAuthority.id).build();

            await instanceRepository.save(fromAuthority, formalInstance);
            await instanceRepository.save(fromAuthority, nlInstance);
            await instanceRepository.save(fromAuthority, informalInstance);


            const transferredFormalInstance = await transferInstanceService.transfer(formalInstance.id, fromAuthority.id, toAuthority.id);
            const transferredNlInstance = await transferInstanceService.transfer(nlInstance.id, fromAuthority.id, toAuthority.id);
            const transferredInformalInstance = await transferInstanceService.transfer(informalInstance.id, fromAuthority.id, toAuthority.id);

            expect(transferredFormalInstance.needsConversionFromFormalToInformal).toBeTrue();
            expect(transferredNlInstance.needsConversionFromFormalToInformal).toBeTrue();
            expect(transferredInformalInstance.needsConversionFromFormalToInformal).toBeFalse();
        });
    });
});
