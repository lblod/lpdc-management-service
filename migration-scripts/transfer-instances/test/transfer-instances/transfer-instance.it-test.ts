import { TransferInstanceService } from "../../transfer-instance-service";
import { TEST_SPARQL_ENDPOINT } from "../../../../test/test.config";
import { InstanceSparqlRepository } from "../../../../src/driven/persistence/instance-sparql-repository";
import { FormalInformalChoiceSparqlRepository } from "../../../../src/driven/persistence/formal-informal-choice-sparql-repository";
import { aBestuurseenheid } from "../../../../test/core/domain/bestuurseenheid-test-builder";
import { aFormalInformalChoice } from "../../../../test/core/domain/formal-informal-choice-test-builder";
import {
  aFullInstance,
  aMinimalInstance,
  aMinimalPublishedInstance,
  InstanceTestBuilder,
} from "../../../../test/core/domain/instance-test-builder";
import { BestuurseenheidSparqlTestRepository } from "../../../../test/driven/persistence/bestuurseenheid-sparql-test-repository";
import {
  ChosenFormType,
  InstanceStatusType,
} from "../../../../src/core/domain/types";
import { Language } from "../../../../src/core/domain/language";
import { Bestuurseenheid } from "../../../../src/core/domain/bestuurseenheid";
import { FormatPreservingDate } from "../../../../src/core/domain/format-preserving-date";
import { InvariantError } from "../../../../src/core/domain/shared/lpdc-error";
import { aFullRequirementForInstance } from "../../../../test/core/domain/requirement-test-builder";
import { aFullProcedureForInstance } from "../../../../test/core/domain/procedure-test-builder";
import { aFullWebsiteForInstance } from "../../../../test/core/domain/website-test-builder";
import { aFullCostForInstance } from "../../../../test/core/domain/cost-test-builder";
import { aFullFinancialAdvantageForInstance } from "../../../../test/core/domain/financial-advantage-test-builder";
import { aFullLegalResourceForInstance } from "../../../../test/core/domain/legal-resource-test-builder";
import { aFullContactPointForInstance } from "../../../../test/core/domain/contact-point-test-builder";
import {
  AddressTestBuilder,
  aFullAddressForInstance,
} from "../../../../test/core/domain/address-test-builder";
import { LanguageString } from "../../../../src/core/domain/language-string";
import { AdressenRegisterFetcherStub } from "../adressen-register-fetcher-stub";

describe("transfer instance", () => {
  const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(
    TEST_SPARQL_ENDPOINT,
  );
  const instanceRepository = new InstanceSparqlRepository(TEST_SPARQL_ENDPOINT);
  const formalInformalChoiceRepository =
    new FormalInformalChoiceSparqlRepository(TEST_SPARQL_ENDPOINT);
  const adressenRegisterFetcher = new AdressenRegisterFetcherStub();
  const transferInstanceService = new TransferInstanceService(
    bestuurseenheidRepository,
    instanceRepository,
    formalInformalChoiceRepository,
    adressenRegisterFetcher,
  );
  let fromAuthority: Bestuurseenheid;
  let toAuthority: Bestuurseenheid;

  beforeEach(async () => {
    fromAuthority = aBestuurseenheid().build();
    toAuthority = aBestuurseenheid().build();
    await bestuurseenheidRepository.save(fromAuthority);
    await bestuurseenheidRepository.save(toAuthority);
  });

  test("createdBy gets updated", async () => {
    const instance = aMinimalInstance().withCreatedBy(fromAuthority.id).build();
    await instanceRepository.save(fromAuthority, instance);
    const transferredInstance = await transferInstanceService.transfer(
      instance.id,
      fromAuthority,
      toAuthority,
      false,
      true,
    );

    expect(transferredInstance.createdBy).toEqual(toAuthority.id);
  });

  test("dateCreated and dateModified are updated", async () => {
    const instance = aMinimalInstance().withCreatedBy(fromAuthority.id).build();
    await instanceRepository.save(fromAuthority, instance);
    const transferredInstance = await transferInstanceService.transfer(
      instance.id,
      fromAuthority,
      toAuthority,
      false,
      true,
    );

    expect(
      instance.dateCreated.before(transferredInstance.dateCreated),
    ).toBeTrue();
    expect(
      instance.dateModified.before(transferredInstance.dateModified),
    ).toBeTrue();
  });

  test("forMunicipalityMerger is true", async () => {
    const instance = aMinimalInstance()
      .withCreatedBy(fromAuthority.id)
      .withForMunicipalityMerger(true)
      .build();
    await instanceRepository.save(fromAuthority, instance);
    const transferredInstance = await transferInstanceService.transfer(
      instance.id,
      fromAuthority,
      toAuthority,
      false,
      true,
    );

    expect(transferredInstance.forMunicipalityMerger).toBeTrue();
  });

  test("status is ontwerp and dateSent are empty", async () => {
    const instance = aMinimalPublishedInstance()
      .withCreatedBy(fromAuthority.id)
      .withStatus(InstanceStatusType.VERZONDEN)
      .withDateSent(FormatPreservingDate.now())
      .build();
    await instanceRepository.save(fromAuthority, instance);

    const transferredInstance = await transferInstanceService.transfer(
      instance.id,
      fromAuthority,
      toAuthority,
      false,
      true,
    );

    expect(transferredInstance.status).toEqual(InstanceStatusType.ONTWERP);
    expect(transferredInstance.dateSent).toBeUndefined();
  });

  test("copyOf is empty", async () => {
    const anotherInstance = aFullInstance()
      .withCreatedBy(fromAuthority.id)
      .build();
    await instanceRepository.save(fromAuthority, anotherInstance);

    const instance = aMinimalInstance()
      .withCreatedBy(fromAuthority.id)
      .withCopyOf(anotherInstance.id)
      .build();
    await instanceRepository.save(fromAuthority, instance);
    const transferredInstance = await transferInstanceService.transfer(
      instance.id,
      fromAuthority,
      toAuthority,
      false,
      true,
    );

    expect(transferredInstance.copyOf).toBeUndefined();
  });

  test("when forMunicipalityMerger is false, clear spatials", async () => {
    const instance = aMinimalInstance()
      .withSpatials(InstanceTestBuilder.SPATIALS)
      .withExecutingAuthorities(InstanceTestBuilder.EXECUTING_AUTHORITIES)
      .withCreatedBy(fromAuthority.id)
      .withForMunicipalityMerger(false)
      .build();
    await instanceRepository.save(fromAuthority, instance);
    const transferredInstance = await transferInstanceService.transfer(
      instance.id,
      fromAuthority,
      toAuthority,
      false,
      true,
    );

    expect(instance.spatials).not.toBeEmpty();
    expect(transferredInstance.spatials).toBeEmpty();
  });

  test("deep copy fields with new uuids", async () => {
    const instance = aFullInstance()
      .withCreatedBy(fromAuthority.id)
      .withStatus(InstanceStatusType.VERZONDEN)
      .withDateSent(FormatPreservingDate.of("2024-01-16T00:00:00.672Z"))
      .withDutchLanguageVariant(Language.FORMAL)
      .withNeedsConversionFromFormalToInformal(true)
      .withForMunicipalityMerger(true)
      .withRequirements([
        aFullRequirementForInstance().withOrder(0).build(),
        aFullRequirementForInstance()
          .withOrder(1)
          .withEvidence(undefined)
          .build(),
      ])
      .withProcedures([
        aFullProcedureForInstance().withOrder(0).build(),
        aFullProcedureForInstance().withOrder(1).withWebsites([]).build(),
      ])
      .withWebsites([
        aFullWebsiteForInstance().withOrder(0).build(),
        aFullWebsiteForInstance().withOrder(1).build(),
      ])
      .withCosts([
        aFullCostForInstance().withOrder(0).build(),
        aFullCostForInstance().withOrder(1).build(),
      ])
      .withFinancialAdvantages([
        aFullFinancialAdvantageForInstance().withOrder(0).build(),
        aFullFinancialAdvantageForInstance().withOrder(1).build(),
      ])
      .withContactPoints([
        aFullContactPointForInstance().withOrder(0).build(),
        aFullContactPointForInstance()
          .withOrder(1)
          .withAddress(undefined)
          .build(),
      ])
      .withLegalResources([
        aFullLegalResourceForInstance().withOrder(0).build(),
        aFullLegalResourceForInstance().withOrder(1).build(),
      ])
      .build();

    await instanceRepository.save(fromAuthority, instance);
    const updatedInstance = await transferInstanceService.transfer(
      instance.id,
      fromAuthority,
      toAuthority,
      false,
      true,
    );

    expect(updatedInstance.calculatedInstanceLanguages()).toEqual([
      Language.FORMAL,
    ]);
    expect(updatedInstance.id).not.toEqual(instance.id);
    expect(updatedInstance.uuid).not.toEqual(instance.uuid);
    expect(updatedInstance.createdBy).toEqual(toAuthority.id);
    expect(updatedInstance.title).toEqual(instance.title);
    expect(updatedInstance.description).toEqual(instance.description);
    expect(updatedInstance.additionalDescription).toEqual(
      instance.additionalDescription,
    );
    expect(updatedInstance.exception).toEqual(instance.exception);
    expect(updatedInstance.regulation).toEqual(instance.regulation);
    expect(updatedInstance.startDate).toEqual(instance.startDate);
    expect(updatedInstance.endDate).toEqual(instance.endDate);
    expect(updatedInstance.type).toEqual(instance.type);
    expect(updatedInstance.targetAudiences).toEqual(instance.targetAudiences);
    expect(updatedInstance.themes).toEqual(instance.themes);
    expect(updatedInstance.competentAuthorities).toEqual(
      instance.competentAuthorities,
    );
    expect(updatedInstance.competentAuthorityLevels).toEqual(
      instance.competentAuthorityLevels,
    );
    expect(updatedInstance.executingAuthorities).toEqual(
      instance.executingAuthorities,
    );
    expect(updatedInstance.executingAuthorityLevels).toEqual(
      instance.executingAuthorityLevels,
    );
    expect(updatedInstance.publicationMedia).toEqual(instance.publicationMedia);
    expect(updatedInstance.yourEuropeCategories).toEqual(
      instance.yourEuropeCategories,
    );
    expect(updatedInstance.keywords).toEqual(instance.keywords);

    expect(updatedInstance.requirements.length).toEqual(
      instance.requirements.length,
    );
    expect(updatedInstance.requirements[0].id).not.toEqual(
      instance.requirements[0].id,
    );
    expect(updatedInstance.requirements[0].uuid).not.toEqual(
      instance.requirements[0].uuid,
    );
    expect(updatedInstance.requirements[0].title).toEqual(
      instance.requirements[0].title,
    );
    expect(updatedInstance.requirements[0].description).toEqual(
      instance.requirements[0].description,
    );
    expect(updatedInstance.requirements[0].order).toEqual(
      instance.requirements[0].order,
    );
    expect(updatedInstance.requirements[0].evidence.id).not.toEqual(
      instance.requirements[0].evidence.id,
    );
    expect(updatedInstance.requirements[0].evidence.uuid).not.toEqual(
      instance.requirements[0].evidence.uuid,
    );
    expect(updatedInstance.requirements[0].evidence.title).toEqual(
      instance.requirements[0].evidence.title,
    );
    expect(updatedInstance.requirements[0].evidence.description).toEqual(
      instance.requirements[0].evidence.description,
    );
    expect(updatedInstance.requirements[1].id).not.toEqual(
      instance.requirements[1].id,
    );
    expect(updatedInstance.requirements[1].uuid).not.toEqual(
      instance.requirements[1].uuid,
    );
    expect(updatedInstance.requirements[1].title).toEqual(
      instance.requirements[1].title,
    );
    expect(updatedInstance.requirements[1].description).toEqual(
      instance.requirements[1].description,
    );
    expect(updatedInstance.requirements[1].order).toEqual(
      instance.requirements[1].order,
    );
    expect(updatedInstance.requirements[1].evidence).toBeUndefined();

    expect(updatedInstance.procedures.length).toEqual(
      instance.procedures.length,
    );
    expect(updatedInstance.procedures[0].id).not.toEqual(
      instance.procedures[0].id,
    );
    expect(updatedInstance.procedures[0].uuid).not.toEqual(
      instance.procedures[0].uuid,
    );
    expect(updatedInstance.procedures[0].title).toEqual(
      instance.procedures[0].title,
    );
    expect(updatedInstance.procedures[0].description).toEqual(
      instance.procedures[0].description,
    );
    expect(updatedInstance.procedures[0].order).toEqual(
      instance.procedures[0].order,
    );
    expect(updatedInstance.procedures[0].websites.length).toEqual(
      instance.procedures[0].websites.length,
    );
    expect(updatedInstance.procedures[0].websites[0].id).not.toEqual(
      instance.procedures[0].websites[0].id,
    );
    expect(updatedInstance.procedures[0].websites[0].uuid).not.toEqual(
      instance.procedures[0].websites[0].uuid,
    );
    expect(updatedInstance.procedures[0].websites[0].title).toEqual(
      instance.procedures[0].websites[0].title,
    );
    expect(updatedInstance.procedures[0].websites[0].description).toEqual(
      updatedInstance.procedures[0].websites[0].description,
    );
    expect(updatedInstance.procedures[0].websites[0].order).toEqual(
      updatedInstance.procedures[0].websites[0].order,
    );
    expect(updatedInstance.procedures[0].websites[0].url).toEqual(
      updatedInstance.procedures[0].websites[0].url,
    );
    expect(updatedInstance.procedures.length).toEqual(
      instance.procedures.length,
    );
    expect(updatedInstance.procedures[1].id).not.toEqual(
      instance.procedures[1].id,
    );
    expect(updatedInstance.procedures[1].uuid).not.toEqual(
      instance.procedures[1].uuid,
    );
    expect(updatedInstance.procedures[1].title).toEqual(
      instance.procedures[1].title,
    );
    expect(updatedInstance.procedures[1].description).toEqual(
      instance.procedures[1].description,
    );
    expect(updatedInstance.procedures[1].order).toEqual(
      instance.procedures[1].order,
    );
    expect(updatedInstance.procedures[1].websites).toBeEmpty();

    expect(updatedInstance.websites.length).toEqual(instance.websites.length);
    expect(updatedInstance.websites[0].id).not.toEqual(instance.websites[0].id);
    expect(updatedInstance.websites[0].uuid).not.toEqual(
      instance.websites[0].uuid,
    );
    expect(updatedInstance.websites[0].title).toEqual(
      instance.websites[0].title,
    );
    expect(updatedInstance.websites[0].description).toEqual(
      updatedInstance.websites[0].description,
    );
    expect(updatedInstance.websites[0].order).toEqual(
      updatedInstance.websites[0].order,
    );
    expect(updatedInstance.websites[0].url).toEqual(
      updatedInstance.websites[0].url,
    );
    expect(updatedInstance.websites[1].id).not.toEqual(instance.websites[1].id);
    expect(updatedInstance.websites[1].uuid).not.toEqual(
      instance.websites[1].uuid,
    );
    expect(updatedInstance.websites[1].title).toEqual(
      instance.websites[1].title,
    );
    expect(updatedInstance.websites[1].description).toEqual(
      updatedInstance.websites[1].description,
    );
    expect(updatedInstance.websites[1].order).toEqual(
      updatedInstance.websites[1].order,
    );
    expect(updatedInstance.websites[1].url).toEqual(
      updatedInstance.websites[1].url,
    );

    expect(updatedInstance.costs.length).toEqual(instance.costs.length);
    expect(updatedInstance.costs[0].id).not.toEqual(instance.costs[0].id);
    expect(updatedInstance.costs[0].uuid).not.toEqual(instance.costs[0].uuid);
    expect(updatedInstance.costs[0].title).toEqual(instance.costs[0].title);
    expect(updatedInstance.costs[0].description).toEqual(
      instance.costs[0].description,
    );
    expect(updatedInstance.costs[0].order).toEqual(instance.costs[0].order);
    expect(updatedInstance.costs[1].id).not.toEqual(instance.costs[1].id);
    expect(updatedInstance.costs[1].uuid).not.toEqual(instance.costs[1].uuid);
    expect(updatedInstance.costs[1].title).toEqual(instance.costs[1].title);
    expect(updatedInstance.costs[1].description).toEqual(
      instance.costs[1].description,
    );
    expect(updatedInstance.costs[1].order).toEqual(instance.costs[1].order);

    expect(updatedInstance.financialAdvantages.length).toEqual(
      instance.financialAdvantages.length,
    );
    expect(updatedInstance.financialAdvantages[0].id).not.toEqual(
      instance.financialAdvantages[0].id,
    );
    expect(updatedInstance.financialAdvantages[0].uuid).not.toEqual(
      instance.financialAdvantages[0].uuid,
    );
    expect(updatedInstance.financialAdvantages[0].title).toEqual(
      instance.financialAdvantages[0].title,
    );
    expect(updatedInstance.financialAdvantages[0].description).toEqual(
      instance.financialAdvantages[0].description,
    );
    expect(updatedInstance.financialAdvantages[0].order).toEqual(
      instance.financialAdvantages[0].order,
    );
    expect(updatedInstance.financialAdvantages[1].id).not.toEqual(
      instance.financialAdvantages[1].id,
    );
    expect(updatedInstance.financialAdvantages[1].uuid).not.toEqual(
      instance.financialAdvantages[1].uuid,
    );
    expect(updatedInstance.financialAdvantages[1].title).toEqual(
      instance.financialAdvantages[1].title,
    );
    expect(updatedInstance.financialAdvantages[1].description).toEqual(
      instance.financialAdvantages[1].description,
    );
    expect(updatedInstance.financialAdvantages[1].order).toEqual(
      instance.financialAdvantages[1].order,
    );

    expect(updatedInstance.contactPoints.length).toEqual(
      instance.contactPoints.length,
    );
    expect(updatedInstance.contactPoints[0].id).not.toEqual(
      instance.contactPoints[0].id,
    );
    expect(updatedInstance.contactPoints[0].uuid).not.toEqual(
      instance.contactPoints[0].uuid,
    );
    expect(updatedInstance.contactPoints[0].url).toEqual(
      instance.contactPoints[0].url,
    );
    expect(updatedInstance.contactPoints[0].email).toEqual(
      instance.contactPoints[0].email,
    );
    expect(updatedInstance.contactPoints[0].telephone).toEqual(
      instance.contactPoints[0].telephone,
    );
    expect(updatedInstance.contactPoints[0].openingHours).toEqual(
      instance.contactPoints[0].openingHours,
    );
    expect(updatedInstance.contactPoints[0].order).toEqual(
      instance.contactPoints[0].order,
    );
    expect(updatedInstance.contactPoints[0].address.id).not.toEqual(
      instance.contactPoints[0].address.id,
    );
    expect(updatedInstance.contactPoints[0].address.uuid).not.toEqual(
      instance.contactPoints[0].address.uuid,
    );
    expect(updatedInstance.contactPoints[0].address.gemeentenaam).toEqual(
      instance.contactPoints[0].address.gemeentenaam,
    );
    expect(updatedInstance.contactPoints[0].address.land).toEqual(
      instance.contactPoints[0].address.land,
    );
    expect(updatedInstance.contactPoints[0].address.huisnummer).toEqual(
      instance.contactPoints[0].address.huisnummer,
    );
    expect(updatedInstance.contactPoints[0].address.busnummer).toEqual(
      instance.contactPoints[0].address.busnummer,
    );
    expect(updatedInstance.contactPoints[0].address.postcode).toEqual(
      instance.contactPoints[0].address.postcode,
    );
    expect(updatedInstance.contactPoints[0].address.straatnaam).toEqual(
      instance.contactPoints[0].address.straatnaam,
    );
    expect(updatedInstance.contactPoints[0].address.verwijstNaar).toEqual(
      instance.contactPoints[0].address.verwijstNaar,
    );
    expect(updatedInstance.contactPoints[1].id).not.toEqual(
      instance.contactPoints[1].id,
    );
    expect(updatedInstance.contactPoints[1].uuid).not.toEqual(
      instance.contactPoints[1].uuid,
    );
    expect(updatedInstance.contactPoints[1].url).toEqual(
      instance.contactPoints[1].url,
    );
    expect(updatedInstance.contactPoints[1].email).toEqual(
      instance.contactPoints[1].email,
    );
    expect(updatedInstance.contactPoints[1].telephone).toEqual(
      instance.contactPoints[1].telephone,
    );
    expect(updatedInstance.contactPoints[1].openingHours).toEqual(
      instance.contactPoints[1].openingHours,
    );
    expect(updatedInstance.contactPoints[1].order).toEqual(
      instance.contactPoints[1].order,
    );
    expect(updatedInstance.contactPoints[1].address).toBeUndefined();

    expect(updatedInstance.conceptId).toEqual(instance.conceptId);
    expect(updatedInstance.conceptSnapshotId).toEqual(
      instance.conceptSnapshotId,
    );
    expect(updatedInstance.productId).toEqual(instance.productId);
    expect(updatedInstance.languages).toEqual(instance.languages);
    expect(updatedInstance.dutchLanguageVariant).toEqual(
      instance.dutchLanguageVariant,
    );
    expect(updatedInstance.reviewStatus).toEqual(instance.reviewStatus);
    expect(updatedInstance.reviewStatus).toEqual(instance.reviewStatus);

    expect(updatedInstance.legalResources.length).toEqual(
      instance.legalResources.length,
    );
    expect(updatedInstance.legalResources[0].id).not.toEqual(
      instance.legalResources[0].id,
    );
    expect(updatedInstance.legalResources[0].uuid).not.toEqual(
      instance.legalResources[0].uuid,
    );
    expect(updatedInstance.legalResources[0].title).toEqual(
      instance.legalResources[0].title,
    );
    expect(updatedInstance.legalResources[0].description).toEqual(
      instance.legalResources[0].description,
    );
    expect(updatedInstance.legalResources[0].order).toEqual(
      instance.legalResources[0].order,
    );
    expect(updatedInstance.legalResources[1].id).not.toEqual(
      instance.legalResources[1].id,
    );
    expect(updatedInstance.legalResources[1].uuid).not.toEqual(
      instance.legalResources[1].uuid,
    );
    expect(updatedInstance.legalResources[1].title).toEqual(
      instance.legalResources[1].title,
    );
    expect(updatedInstance.legalResources[1].description).toEqual(
      instance.legalResources[1].description,
    );
    expect(updatedInstance.legalResources[1].order).toEqual(
      instance.legalResources[1].order,
    );
  });

  describe("needsConversionFromFormalToInformal", () => {
    test("given authority without formalInformalChoice and instance in nl, needsConversion is false", async () => {
      const instance = aMinimalInstance()
        .withDutchLanguageVariant(Language.NL)
        .withCreatedBy(fromAuthority.id)
        .build();
      await instanceRepository.save(fromAuthority, instance);

      const transferredInstance = await transferInstanceService.transfer(
        instance.id,
        fromAuthority,
        toAuthority,
        false,
        true,
      );

      expect(transferredInstance.needsConversionFromFormalToInformal).toEqual(
        false,
      );
    });

    test("given authority with formal formalInformalChoice and formal instance, needsConversion is false", async () => {
      const toFormalInformalChoice = aFormalInformalChoice()
        .withChosenForm(ChosenFormType.FORMAL)
        .withBestuurseenheidId(toAuthority.id)
        .build();
      await formalInformalChoiceRepository.save(
        toAuthority,
        toFormalInformalChoice,
      );

      const instance = aMinimalInstance()
        .withCreatedBy(fromAuthority.id)
        .withDutchLanguageVariant(Language.FORMAL)
        .build();
      await instanceRepository.save(fromAuthority, instance);

      const transferredInstance = await transferInstanceService.transfer(
        instance.id,
        fromAuthority,
        toAuthority,
        false,
        true,
      );

      expect(transferredInstance.needsConversionFromFormalToInformal).toEqual(
        false,
      );
    });

    test("given authority with informal formalInformalChoice and informal instance, needsConversion is false", async () => {
      const toFormalInformalChoice = aFormalInformalChoice()
        .withChosenForm(ChosenFormType.INFORMAL)
        .withBestuurseenheidId(toAuthority.id)
        .build();
      await formalInformalChoiceRepository.save(
        toAuthority,
        toFormalInformalChoice,
      );

      const instance = aMinimalInstance()
        .withDutchLanguageVariant(Language.INFORMAL)
        .withCreatedBy(fromAuthority.id)
        .build();

      await instanceRepository.save(fromAuthority, instance);

      const transferredInstance = await transferInstanceService.transfer(
        instance.id,
        fromAuthority,
        toAuthority,
        false,
        true,
      );

      expect(transferredInstance.needsConversionFromFormalToInformal).toEqual(
        false,
      );
    });

    test("given authority with formal formalInformalChoice and informal instance, throws error", async () => {
      const toFormalInformalChoice = aFormalInformalChoice()
        .withChosenForm(ChosenFormType.FORMAL)
        .withBestuurseenheidId(toAuthority.id)
        .build();
      await formalInformalChoiceRepository.save(
        toAuthority,
        toFormalInformalChoice,
      );

      const instance = aMinimalInstance()
        .withDutchLanguageVariant(Language.INFORMAL)
        .withCreatedBy(fromAuthority.id)
        .build();

      await instanceRepository.save(fromAuthority, instance);

      await expect(
        transferInstanceService.transfer(
          instance.id,
          fromAuthority,
          toAuthority,
          false,
          true,
        ),
      ).rejects.toThrowWithMessage(
        InvariantError,
        "transforming informal instance to formal is not possible",
      );
    });

    test("given authority with informal formalInformalChoice and non-informal instance, sets needsConversionFromFormalToInformal to true", async () => {
      const toFormalInformalChoice = aFormalInformalChoice()
        .withChosenForm(ChosenFormType.INFORMAL)
        .withBestuurseenheidId(toAuthority.id)
        .build();
      await formalInformalChoiceRepository.save(
        toAuthority,
        toFormalInformalChoice,
      );

      const formalInstance = aMinimalInstance()
        .withDutchLanguageVariant(Language.FORMAL)
        .withCreatedBy(fromAuthority.id)
        .build();
      const nlInstance = aMinimalInstance()
        .withDutchLanguageVariant(Language.NL)
        .withCreatedBy(fromAuthority.id)
        .build();
      const informalInstance = aMinimalInstance()
        .withDutchLanguageVariant(Language.INFORMAL)
        .withCreatedBy(fromAuthority.id)
        .build();

      await instanceRepository.save(fromAuthority, formalInstance);
      await instanceRepository.save(fromAuthority, nlInstance);
      await instanceRepository.save(fromAuthority, informalInstance);

      const transferredFormalInstance = await transferInstanceService.transfer(
        formalInstance.id,
        fromAuthority,
        toAuthority,
        false,
        true,
      );
      const transferredNlInstance = await transferInstanceService.transfer(
        nlInstance.id,
        fromAuthority,
        toAuthority,
        false,
        true,
      );
      const transferredInformalInstance =
        await transferInstanceService.transfer(
          informalInstance.id,
          fromAuthority,
          toAuthority,
          false,
          true,
        );

      expect(
        transferredFormalInstance.needsConversionFromFormalToInformal,
      ).toBeTrue();
      expect(
        transferredNlInstance.needsConversionFromFormalToInformal,
      ).toBeTrue();
      expect(
        transferredInformalInstance.needsConversionFromFormalToInformal,
      ).toBeFalse();
    });
  });

  describe("addresses", () => {
    test("given unexisting address, take over fields and keep addressId and postcode empty", async () => {
      const straatnaam = LanguageString.of(
        AdressenRegisterFetcherStub.INCORRECT_STREETNAME,
      );
      const contactPoint = aFullContactPointForInstance()
        .withAddress(
          aFullAddressForInstance()
            .withGemeentenaam(
              LanguageString.of(AddressTestBuilder.GEMEENTENAAM),
            )
            .withStraatnaam(straatnaam)
            .withPostcode(undefined)
            .withLand(undefined)
            .withVerwijstNaar(undefined)
            .build(),
        )
        .build();
      const instance = aMinimalInstance()
        .withCreatedBy(fromAuthority.id)
        .withContactPoints([contactPoint])
        .build();

      await instanceRepository.save(fromAuthority, instance);
      const transferredInstance = await transferInstanceService.transfer(
        instance.id,
        fromAuthority,
        toAuthority,
        false,
        true,
      );

      expect(
        transferredInstance.contactPoints[0].address.gemeentenaam.nl,
      ).toEqual(AddressTestBuilder.GEMEENTENAAM);
      expect(transferredInstance.contactPoints[0].address.land).toBeUndefined();
      expect(transferredInstance.contactPoints[0].address.huisnummer).toEqual(
        AddressTestBuilder.HUISNUMMER,
      );
      expect(transferredInstance.contactPoints[0].address.busnummer).toEqual(
        AddressTestBuilder.BUSNUMMER,
      );
      expect(transferredInstance.contactPoints[0].address.straatnaam).toEqual(
        straatnaam,
      );
      expect(
        transferredInstance.contactPoints[0].address.postcode,
      ).toBeUndefined();
      expect(
        transferredInstance.contactPoints[0].address.verwijstNaar,
      ).toBeUndefined();
    });
  });
});
