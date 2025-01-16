import { FormalInformalChoiceSparqlRepository } from "../../../src/driven/persistence/formal-informal-choice-sparql-repository";
import { TEST_SPARQL_ENDPOINT } from "../../test.config";
import { NewFormalInformalChoiceDomainService } from "../../../src/core/domain/new-formal-informal-choice-domain-service";
import { aBestuurseenheid } from "./bestuurseenheid-test-builder";
import { BestuurseenheidSparqlTestRepository } from "../../driven/persistence/bestuurseenheid-sparql-test-repository";
import { aMinimalInstance } from "./instance-test-builder";
import { Language } from "../../../src/core/domain/language";
import { ChosenFormType } from "../../../src/core/domain/types";
import { InstanceSparqlRepository } from "../../../src/driven/persistence/instance-sparql-repository";

describe("new formal informal choice and sync needsConversionFromFormalInformalOnInstance domain service", () => {
  const formalInformalChoiceSparqlRepository =
    new FormalInformalChoiceSparqlRepository(TEST_SPARQL_ENDPOINT);
  const instanceSparqlRepository = new InstanceSparqlRepository(
    TEST_SPARQL_ENDPOINT,
  );
  const newFormalInformalChoiceAndSyncInstanceDomainService =
    new NewFormalInformalChoiceDomainService(
      formalInformalChoiceSparqlRepository,
      instanceSparqlRepository,
    );
  const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(
    TEST_SPARQL_ENDPOINT,
  );

  test("given formal, nl and informal instances, when choose informal, then saves formalInformalChoice and set needsConversionFromFormalToInformal on true for formal and nl instance", async () => {
    const bestuurseenheid = aBestuurseenheid().build();
    const anotherBestuurseenheid = aBestuurseenheid().build();
    await bestuurseenheidRepository.save(bestuurseenheid);
    await bestuurseenheidRepository.save(anotherBestuurseenheid);

    const formalInstance = aMinimalInstance()
      .withDutchLanguageVariant(Language.FORMAL)
      .withCreatedBy(bestuurseenheid.id)
      .build();
    const informalInstance = aMinimalInstance()
      .withDutchLanguageVariant(Language.INFORMAL)
      .withCreatedBy(bestuurseenheid.id)
      .build();
    const nlInstance = aMinimalInstance()
      .withDutchLanguageVariant(Language.NL)
      .withCreatedBy(bestuurseenheid.id)
      .build();

    const formalInstanceForOtherBestuurseenheid = aMinimalInstance()
      .withDutchLanguageVariant(Language.FORMAL)
      .withCreatedBy(anotherBestuurseenheid.id)
      .build();
    const informalInstanceForOtherBestuurseenheid = aMinimalInstance()
      .withDutchLanguageVariant(Language.INFORMAL)
      .withCreatedBy(anotherBestuurseenheid.id)
      .build();
    const nlInstanceForOtherBestuurseenheid = aMinimalInstance()
      .withDutchLanguageVariant(Language.NL)
      .withCreatedBy(anotherBestuurseenheid.id)
      .build();

    await instanceSparqlRepository.save(bestuurseenheid, formalInstance);
    await instanceSparqlRepository.save(bestuurseenheid, informalInstance);
    await instanceSparqlRepository.save(bestuurseenheid, nlInstance);

    await instanceSparqlRepository.save(
      anotherBestuurseenheid,
      formalInstanceForOtherBestuurseenheid,
    );
    await instanceSparqlRepository.save(
      anotherBestuurseenheid,
      informalInstanceForOtherBestuurseenheid,
    );
    await instanceSparqlRepository.save(
      anotherBestuurseenheid,
      nlInstanceForOtherBestuurseenheid,
    );

    const formalChoice =
      await newFormalInformalChoiceAndSyncInstanceDomainService.saveFormalInformalChoiceAndSyncInstances(
        bestuurseenheid,
        ChosenFormType.INFORMAL,
      );

    const actualFormalInstance = await instanceSparqlRepository.findById(
      bestuurseenheid,
      formalInstance.id,
    );
    const actualInformalInstance = await instanceSparqlRepository.findById(
      bestuurseenheid,
      informalInstance.id,
    );
    const actualNlInstance = await instanceSparqlRepository.findById(
      bestuurseenheid,
      nlInstance.id,
    );

    const actualFormalInstanceForOtherBestuurseenheid =
      await instanceSparqlRepository.findById(
        anotherBestuurseenheid,
        formalInstanceForOtherBestuurseenheid.id,
      );
    const actualInformalInstanceForOtherBestuurseenheid =
      await instanceSparqlRepository.findById(
        anotherBestuurseenheid,
        informalInstanceForOtherBestuurseenheid.id,
      );
    const actualNlInstanceForOtherBestuurseenheid =
      await instanceSparqlRepository.findById(
        anotherBestuurseenheid,
        nlInstanceForOtherBestuurseenheid.id,
      );

    const actualFormalChoice =
      await formalInformalChoiceSparqlRepository.findByBestuurseenheid(
        bestuurseenheid,
      );

    expect(actualFormalChoice).toEqual(formalChoice);

    expect(actualFormalInstance.needsConversionFromFormalToInformal).toBeTrue();
    expect(
      actualInformalInstance.needsConversionFromFormalToInformal,
    ).toBeFalse();
    expect(actualNlInstance.needsConversionFromFormalToInformal).toBeTrue();

    expect(
      actualFormalInstanceForOtherBestuurseenheid.needsConversionFromFormalToInformal,
    ).toBeFalse();
    expect(
      actualInformalInstanceForOtherBestuurseenheid.needsConversionFromFormalToInformal,
    ).toBeFalse();
    expect(
      actualNlInstanceForOtherBestuurseenheid.needsConversionFromFormalToInformal,
    ).toBeFalse();
  });

  test("given formal, nl and informal instance, when choose formal, then saves formalInformalChoice and does not change needsConversionFromFormalToInformal", async () => {
    const bestuurseenheid = aBestuurseenheid().build();
    const anotherBestuurseenheid = aBestuurseenheid().build();
    await bestuurseenheidRepository.save(bestuurseenheid);
    await bestuurseenheidRepository.save(anotherBestuurseenheid);

    const formalInstance = aMinimalInstance()
      .withDutchLanguageVariant(Language.FORMAL)
      .withCreatedBy(bestuurseenheid.id)
      .build();
    const informalInstance = aMinimalInstance()
      .withDutchLanguageVariant(Language.INFORMAL)
      .withCreatedBy(bestuurseenheid.id)
      .build();
    const nlInstance = aMinimalInstance()
      .withDutchLanguageVariant(Language.NL)
      .withCreatedBy(bestuurseenheid.id)
      .build();

    const formalInstanceForOtherBestuurseenheid = aMinimalInstance()
      .withDutchLanguageVariant(Language.FORMAL)
      .withCreatedBy(anotherBestuurseenheid.id)
      .build();
    const informalInstanceForOtherBestuurseenheid = aMinimalInstance()
      .withDutchLanguageVariant(Language.INFORMAL)
      .withCreatedBy(anotherBestuurseenheid.id)
      .build();
    const nlInstanceForOtherBestuurseenheid = aMinimalInstance()
      .withDutchLanguageVariant(Language.NL)
      .withCreatedBy(anotherBestuurseenheid.id)
      .build();

    await instanceSparqlRepository.save(bestuurseenheid, formalInstance);
    await instanceSparqlRepository.save(bestuurseenheid, informalInstance);
    await instanceSparqlRepository.save(bestuurseenheid, nlInstance);

    await instanceSparqlRepository.save(
      anotherBestuurseenheid,
      formalInstanceForOtherBestuurseenheid,
    );
    await instanceSparqlRepository.save(
      anotherBestuurseenheid,
      informalInstanceForOtherBestuurseenheid,
    );
    await instanceSparqlRepository.save(
      anotherBestuurseenheid,
      nlInstanceForOtherBestuurseenheid,
    );

    const formalChoice =
      await newFormalInformalChoiceAndSyncInstanceDomainService.saveFormalInformalChoiceAndSyncInstances(
        bestuurseenheid,
        ChosenFormType.FORMAL,
      );

    const actualFormalInstance = await instanceSparqlRepository.findById(
      bestuurseenheid,
      formalInstance.id,
    );
    const actualInformalInstance = await instanceSparqlRepository.findById(
      bestuurseenheid,
      informalInstance.id,
    );
    const actualNlInstance = await instanceSparqlRepository.findById(
      bestuurseenheid,
      nlInstance.id,
    );

    const actualFormalInstanceForOtherBestuurseenheid =
      await instanceSparqlRepository.findById(
        anotherBestuurseenheid,
        formalInstanceForOtherBestuurseenheid.id,
      );
    const actualInformalInstanceForOtherBestuurseenheid =
      await instanceSparqlRepository.findById(
        anotherBestuurseenheid,
        informalInstanceForOtherBestuurseenheid.id,
      );
    const actualNlInstanceForOtherBestuurseenheid =
      await instanceSparqlRepository.findById(
        anotherBestuurseenheid,
        nlInstanceForOtherBestuurseenheid.id,
      );

    const actualFormalChoice =
      await formalInformalChoiceSparqlRepository.findByBestuurseenheid(
        bestuurseenheid,
      );

    expect(actualFormalChoice).toEqual(formalChoice);

    expect(
      actualFormalInstance.needsConversionFromFormalToInformal,
    ).toBeFalse();
    expect(
      actualInformalInstance.needsConversionFromFormalToInformal,
    ).toBeFalse();
    expect(actualNlInstance.needsConversionFromFormalToInformal).toBeFalse();

    expect(
      actualFormalInstanceForOtherBestuurseenheid.needsConversionFromFormalToInformal,
    ).toBeFalse();
    expect(
      actualInformalInstanceForOtherBestuurseenheid.needsConversionFromFormalToInformal,
    ).toBeFalse();
    expect(
      actualNlInstanceForOtherBestuurseenheid.needsConversionFromFormalToInformal,
    ).toBeFalse();
  });
});
