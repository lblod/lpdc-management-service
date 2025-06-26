import { FormApplicationService } from "../../../src/core/application/form-application-service";
import {
  ValidateInstanceForPublishApplicationService,
  INACTIVE_AUTHORITY_ERROR_MESSAGE,
  EXPIRED_SPATIAL_ERROR_MESSAGE,
} from "../../../src/core/application/validate-instance-for-publish-application-service";
import { ConceptSparqlRepository } from "../../../src/driven/persistence/concept-sparql-repository";
import { TEST_SPARQL_ENDPOINT } from "../../test.config";
import { SelectConceptLanguageDomainService } from "../../../src/core/domain/select-concept-language-domain-service";
import { SemanticFormsMapperImpl } from "../../../src/driven/persistence/semantic-forms-mapper-impl";
import {
  aBestuurseenheid,
  anInactiveBestuurseenheid,
  someCompetentAuthorities,
  someExecutingAuthorities,
} from "../domain/bestuurseenheid-test-builder";
import {
  InstanceTestBuilder,
  aFullInstance,
} from "../domain/instance-test-builder";
import { FormDefinitionFileRepository } from "../../../src/driven/persistence/form-definition-file-repository";
import { CodeSparqlRepository } from "../../../src/driven/persistence/code-sparql-repository";
import { aFullContactPointForInstance } from "../domain/contact-point-test-builder";
import { aFullAddressForInstance } from "../domain/address-test-builder";
import { LanguageString } from "../../../src/core/domain/language-string";
import { FormalInformalChoiceSparqlRepository } from "../../../src/driven/persistence/formal-informal-choice-sparql-repository";
import { ConceptSnapshotSparqlRepository } from "../../../src/driven/persistence/concept-snapshot-sparql-repository";
import { InstanceSparqlRepository } from "../../../src/driven/persistence/instance-sparql-repository";
import { BestuurseenheidSparqlTestRepository } from "../../driven/persistence/bestuurseenheid-sparql-test-repository";
import { uuid } from "../../../mu-helper";
import {
  buildBestuurseenheidIri,
  buildOvoCodeIri,
  buildNutsCodeIri,
  buildWegwijsIri,
} from "../domain/iri-test-builder";
import {
  BestuurseenheidClassificatieCode,
  BestuurseenheidStatusCode,
} from "../../../src/core/domain/bestuurseenheid";
import { SpatialSparqlTestRepository } from "../../driven/persistence/spatial-sparql-test-repository";
import {
  SpatialTestBuilder,
  aSpatial,
  aSpatialWithFutureEndDate,
  anExpiredSpatial,
} from "../domain/spatial-test-builder";
import { CodeSchema } from "../../../src/core/port/driven/persistence/code-repository";
import { AuthorityLevelSparqlRepository } from "../../../src/driven/persistence/authority-level-sparql-repository";

describe("ValidateInstanceForPublishApplicationService", () => {
  describe("validate", () => {
    const conceptRepository = new ConceptSparqlRepository(TEST_SPARQL_ENDPOINT);
    const conceptSnapshotRepository = new ConceptSnapshotSparqlRepository(
      TEST_SPARQL_ENDPOINT,
    );
    const instanceRepository = new InstanceSparqlRepository(
      TEST_SPARQL_ENDPOINT,
    );
    const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(
      TEST_SPARQL_ENDPOINT,
    );
    const spatialRepository = new SpatialSparqlTestRepository(
      TEST_SPARQL_ENDPOINT,
    );
    const formDefinitionRepository = new FormDefinitionFileRepository();
    const codeRepository = new CodeSparqlRepository(TEST_SPARQL_ENDPOINT);
    const formalInformalChoiceRepository =
      new FormalInformalChoiceSparqlRepository(TEST_SPARQL_ENDPOINT);
    const selectConceptLanguageDomainService =
      new SelectConceptLanguageDomainService();
    const semanticFormsMapper = new SemanticFormsMapperImpl();
    const formApplicationService = new FormApplicationService(
      conceptRepository,
      conceptSnapshotRepository,
      instanceRepository,
      formDefinitionRepository,
      codeRepository,
      formalInformalChoiceRepository,
      selectConceptLanguageDomainService,
      semanticFormsMapper,
    );
    const authorityLevelRepository = new AuthorityLevelSparqlRepository(
      TEST_SPARQL_ENDPOINT,
    );

    const validateInstanceForPublishApplicationService =
      new ValidateInstanceForPublishApplicationService(
        formApplicationService,
        instanceRepository,
        bestuurseenheidRepository,
        spatialRepository,
        codeRepository,
        authorityLevelRepository,
      );

    beforeAll(async () => {
      someCompetentAuthorities().forEach(
        async (unit) => await bestuurseenheidRepository.save(unit.build()),
      );

      someExecutingAuthorities().forEach(
        async (unit) => await bestuurseenheidRepository.save(unit.build()),
      );

      await spatialRepository.save(
        aSpatial()
          .withId(SpatialTestBuilder.OUD_HEVERLEE_SPATIAL_IRI)
          .withUuid(String(SpatialTestBuilder.OUD_HEVERLEE_SPATIAL_UUID))
          .build(),
      );
      await spatialRepository.save(
        aSpatial()
          .withId(SpatialTestBuilder.PEPINGEN_SPATIAL_IRI)
          .withUuid(String(SpatialTestBuilder.PEPINGEN_SPATIAL_UUID))
          .build(),
      );
    });

    test("when valid instance for publish, returns empty array", async () => {
      // NOTE (26/06/2025): For some reason this test occasionally fails due to
      // an `INACTIVE_AUTHORITY_ERROR_MESSAGE` being returned.  Possibly, there
      // is a race condition where this test is executed earlier than all
      // necessary data was persisted or something.  If this happens, try to
      // rerun the tests to check whether it fails consistently or not.
      const bestuurseenheid = aBestuurseenheid().build();
      const instance = aFullInstance().build();
      await instanceRepository.save(bestuurseenheid, instance);

      const errorList =
        await validateInstanceForPublishApplicationService.validate(
          instance.id,
          bestuurseenheid,
        );
      expect(errorList).toEqual([]);
    });

    test("when one of forms invalid, returns list with error", async () => {
      const bestuurseenheid = aBestuurseenheid().build();
      const instance = aFullInstance().withTitle(undefined).build();
      await instanceRepository.save(bestuurseenheid, instance);

      const errorList =
        await validateInstanceForPublishApplicationService.validate(
          instance.id,
          bestuurseenheid,
        );
      expect(errorList).toEqual([
        {
          formId: "inhoud",
          message:
            'Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!',
        },
      ]);
    });

    test("when both forms invalid, returns list with both error", async () => {
      const bestuurseenheid = aBestuurseenheid().build();
      const instance = aFullInstance()
        .withTitle(undefined)
        .withSpatials([])
        .build();
      await instanceRepository.save(bestuurseenheid, instance);

      const errorList =
        await validateInstanceForPublishApplicationService.validate(
          instance.id,
          bestuurseenheid,
        );
      expect(errorList).toEqual([
        {
          formId: "inhoud",
          message:
            'Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!',
        },
        {
          formId: "eigenschappen",
          message:
            'Er zijn fouten opgetreden in de tab "eigenschappen". Gelieve deze te verbeteren!',
        },
      ]);
    });

    test("when one of forms is invalid and adres is invalid, only form error is returned in errorlist", async () => {
      const bestuurseenheid = aBestuurseenheid().build();
      const instance = aFullInstance()
        .withTitle(undefined)
        .withContactPoints([
          aFullContactPointForInstance()
            .withAddress(
              aFullAddressForInstance().withVerwijstNaar(undefined).build(),
            )
            .build(),
        ])
        .build();
      await instanceRepository.save(bestuurseenheid, instance);

      const errorList =
        await validateInstanceForPublishApplicationService.validate(
          instance.id,
          bestuurseenheid,
        );
      expect(errorList).toEqual([
        {
          formId: "inhoud",
          message:
            'Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!',
        },
      ]);
    });

    test("when form is valid and and adres is invalid, adres error is returned in errorlist", async () => {
      const bestuurseenheid = aBestuurseenheid().build();
      const instance = aFullInstance()
        .withContactPoints([
          aFullContactPointForInstance()
            .withAddress(
              aFullAddressForInstance().withVerwijstNaar(undefined).build(),
            )
            .build(),
        ])
        .build();
      await instanceRepository.save(bestuurseenheid, instance);

      const errorList =
        await validateInstanceForPublishApplicationService.validate(
          instance.id,
          bestuurseenheid,
        );
      expect(errorList).toEqual([
        {
          message: "Minstens één van de adresgegevens is niet geldig",
        },
      ]);
    });

    test("when form is valid and languages for description is blank wile titel is not, language error is returned in errorlist", async () => {
      const bestuurseenheid = aBestuurseenheid().build();
      const instance = aFullInstance()
        .withTitle(LanguageString.of(undefined, "titel"))
        .withDescription(LanguageString.of(undefined, " "))
        .withPublicationMedia([])
        .build();
      await instanceRepository.save(bestuurseenheid, instance);

      const errorList =
        await validateInstanceForPublishApplicationService.validate(
          instance.id,
          bestuurseenheid,
        );
      expect(errorList).toEqual([
        {
          message:
            "Binnen eenzelfde taal moeten titel en beschrijving beide ingevuld (of leeg) zijn",
        },
      ]);
    });

    test("when form is valid and languages for description nl is blank, language error is returned in errorlist", async () => {
      const bestuurseenheid = aBestuurseenheid().build();
      const instance = aFullInstance()
        .withTitle(LanguageString.of(undefined, "titel"))
        .withDescription(LanguageString.of(undefined, ""))
        .withPublicationMedia([])
        .build();
      await instanceRepository.save(bestuurseenheid, instance);

      const errorList =
        await validateInstanceForPublishApplicationService.validate(
          instance.id,
          bestuurseenheid,
        );
      expect(errorList).toEqual([
        {
          formId: "inhoud",
          message:
            'Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!',
        },
      ]);
    });

    test("when form is valid and languages for title nl is blank, language error is returned in errorlist", async () => {
      const bestuurseenheid = aBestuurseenheid().build();
      const instance = aFullInstance()
        .withTitle(LanguageString.of(undefined, ""))
        .withDescription(LanguageString.of(undefined, "description"))
        .withPublicationMedia([])
        .build();
      await instanceRepository.save(bestuurseenheid, instance);

      const errorList =
        await validateInstanceForPublishApplicationService.validate(
          instance.id,
          bestuurseenheid,
        );
      expect(errorList).toEqual([
        {
          formId: "inhoud",
          message:
            'Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!',
        },
      ]);
    });

    test("when form is valid and languages for description is blank and title is not, language error is returned in errorlist", async () => {
      const bestuurseenheid = aBestuurseenheid().build();
      const instance = aFullInstance()
        .withTitle(LanguageString.of(undefined, "title"))
        .withDescription(LanguageString.of(undefined, " "))
        .withPublicationMedia([])
        .build();
      await instanceRepository.save(bestuurseenheid, instance);

      const errorList =
        await validateInstanceForPublishApplicationService.validate(
          instance.id,
          bestuurseenheid,
        );
      expect(errorList).toEqual([
        {
          message:
            "Binnen eenzelfde taal moeten titel en beschrijving beide ingevuld (of leeg) zijn",
        },
      ]);
    });

    test("results in no error when a competent authority with status Active is assigned", async () => {
      const authorityUuid = uuid();
      const authorityIri = buildBestuurseenheidIri(authorityUuid);
      const authority = aBestuurseenheid()
        .withId(authorityIri)
        .withUuid(authorityUuid)
        .withPrefLabel("Unit with Active status")
        .withClassificatieCode(BestuurseenheidClassificatieCode.GEMEENTE)
        .withStatus(BestuurseenheidStatusCode.ACTIVE)
        .build();
      await bestuurseenheidRepository.save(authority);

      const bestuurseenheid = aBestuurseenheid().build();
      const instance = aFullInstance()
        .withCompetentAuthorities([authority.id])
        .build();
      await instanceRepository.save(bestuurseenheid, instance);

      const errorList =
        await validateInstanceForPublishApplicationService.validate(
          instance.id,
          bestuurseenheid,
        );

      expect(errorList).toEqual([]);
    });

    test("results in no error when a competent authority with status In formation is assigned", async () => {
      const authorityUuid = uuid();
      const authorityIri = buildBestuurseenheidIri(authorityUuid);
      const authority = aBestuurseenheid()
        .withId(authorityIri)
        .withUuid(authorityUuid)
        .withPrefLabel("Unit with In formation status")
        .withClassificatieCode(BestuurseenheidClassificatieCode.GEMEENTE)
        .withStatus(BestuurseenheidStatusCode.IN_FORMATION)
        .build();
      await bestuurseenheidRepository.save(authority);

      const bestuurseenheid = aBestuurseenheid().build();
      const instance = aFullInstance()
        .withCompetentAuthorities([authority.id])
        .build();
      await instanceRepository.save(bestuurseenheid, instance);

      const errorList =
        await validateInstanceForPublishApplicationService.validate(
          instance.id,
          bestuurseenheid,
        );

      expect(errorList).toEqual([]);
    });

    test("results in no error when an executing authority with status Active is assigned", async () => {
      const authorityUuid = uuid();
      const authorityIri = buildBestuurseenheidIri(authorityUuid);
      const authority = aBestuurseenheid()
        .withId(authorityIri)
        .withUuid(authorityUuid)
        .withPrefLabel("Unit with Active status")
        .withClassificatieCode(BestuurseenheidClassificatieCode.GEMEENTE)
        .withStatus(BestuurseenheidStatusCode.ACTIVE)
        .build();
      await bestuurseenheidRepository.save(authority);

      const bestuurseenheid = aBestuurseenheid().build();
      const instance = aFullInstance()
        .withExecutingAuthorities([authority.id])
        .build();
      await instanceRepository.save(bestuurseenheid, instance);

      const errorList =
        await validateInstanceForPublishApplicationService.validate(
          instance.id,
          bestuurseenheid,
        );

      expect(errorList).toEqual([]);
    });

    test("results in no error when an executing authority with status In formation is assigned", async () => {
      const authorityUuid = uuid();
      const authorityIri = buildBestuurseenheidIri(authorityUuid);
      const authority = aBestuurseenheid()
        .withId(authorityIri)
        .withUuid(authorityUuid)
        .withPrefLabel("Unit with In formation status")
        .withClassificatieCode(BestuurseenheidClassificatieCode.GEMEENTE)
        .withStatus(BestuurseenheidStatusCode.IN_FORMATION)
        .build();
      await bestuurseenheidRepository.save(authority);

      const bestuurseenheid = aBestuurseenheid().build();
      const instance = aFullInstance()
        .withExecutingAuthorities([authority.id])
        .build();
      await instanceRepository.save(bestuurseenheid, instance);

      const errorList =
        await validateInstanceForPublishApplicationService.validate(
          instance.id,
          bestuurseenheid,
        );

      expect(errorList).toEqual([]);
    });

    test("results in an error when an inactive competent authority is assigned", async () => {
      const authorityUuid = uuid();
      const authorityIri = buildBestuurseenheidIri(authorityUuid);
      const authority = aBestuurseenheid()
        .withId(authorityIri)
        .withUuid(authorityUuid)
        .withPrefLabel("Inactive")
        .withClassificatieCode(BestuurseenheidClassificatieCode.GEMEENTE)
        .withStatus(BestuurseenheidStatusCode.INACTIVE)
        .build();
      await bestuurseenheidRepository.save(authority);

      const bestuurseenheid = aBestuurseenheid().build();
      const instance = aFullInstance()
        .withCompetentAuthorities([authority.id])
        .build();
      await instanceRepository.save(bestuurseenheid, instance);

      const errorList =
        await validateInstanceForPublishApplicationService.validate(
          instance.id,
          bestuurseenheid,
        );

      expect(errorList).toEqual([
        { message: INACTIVE_AUTHORITY_ERROR_MESSAGE },
      ]);
    });

    test("results in an error when an inactive executing authority is assigned", async () => {
      const authorityUuid = uuid();
      const authorityIri = buildBestuurseenheidIri(authorityUuid);
      const authority = aBestuurseenheid()
        .withId(authorityIri)
        .withUuid(authorityUuid)
        .withPrefLabel("Inactive")
        .withClassificatieCode(BestuurseenheidClassificatieCode.GEMEENTE)
        .withStatus(BestuurseenheidStatusCode.INACTIVE)
        .build();
      await bestuurseenheidRepository.save(authority);

      const bestuurseenheid = aBestuurseenheid().build();
      const instance = aFullInstance()
        .withExecutingAuthorities([authority.id])
        .build();
      await instanceRepository.save(bestuurseenheid, instance);

      const errorList =
        await validateInstanceForPublishApplicationService.validate(
          instance.id,
          bestuurseenheid,
        );

      expect(errorList).toEqual([
        { message: INACTIVE_AUTHORITY_ERROR_MESSAGE },
      ]);
    });

    test("results in an error when a competent authority without status is assigned", async () => {
      const authorityUuid = uuid();
      const authorityIri = buildBestuurseenheidIri(authorityUuid);
      const authority = aBestuurseenheid()
        .withId(authorityIri)
        .withUuid(authorityUuid)
        .withPrefLabel("Unit without status")
        .withClassificatieCode(BestuurseenheidClassificatieCode.GEMEENTE)
        .withStatus(undefined)
        .build();
      await bestuurseenheidRepository.save(authority);

      const bestuurseenheid = aBestuurseenheid().build();
      const instance = aFullInstance()
        .withCompetentAuthorities([authority.id])
        .build();
      await instanceRepository.save(bestuurseenheid, instance);

      const errorList =
        await validateInstanceForPublishApplicationService.validate(
          instance.id,
          bestuurseenheid,
        );

      expect(errorList).toEqual([
        { message: INACTIVE_AUTHORITY_ERROR_MESSAGE },
      ]);
    });

    test("results in an error when an executing authority without status is assigned", async () => {
      const authorityUuid = uuid();
      const authorityIri = buildBestuurseenheidIri(authorityUuid);
      const authority = aBestuurseenheid()
        .withId(authorityIri)
        .withUuid(authorityUuid)
        .withPrefLabel("Unit without status")
        .withClassificatieCode(BestuurseenheidClassificatieCode.GEMEENTE)
        .withStatus(undefined)
        .build();
      await bestuurseenheidRepository.save(authority);

      const bestuurseenheid = aBestuurseenheid().build();
      const instance = aFullInstance()
        .withExecutingAuthorities([authority.id])
        .build();
      await instanceRepository.save(bestuurseenheid, instance);

      const errorList =
        await validateInstanceForPublishApplicationService.validate(
          instance.id,
          bestuurseenheid,
        );

      expect(errorList).toEqual([
        { message: INACTIVE_AUTHORITY_ERROR_MESSAGE },
      ]);
    });

    test("results in an error when an non-existing competent authority is assigned", async () => {
      const bestuurseenheid = aBestuurseenheid().build();
      const instance = aFullInstance()
        .withCompetentAuthorities([
          buildBestuurseenheidIri("ThisOrganisationDoesNotExist"),
        ])
        .build();
      await instanceRepository.save(bestuurseenheid, instance);

      const errorList =
        await validateInstanceForPublishApplicationService.validate(
          instance.id,
          bestuurseenheid,
        );

      expect(errorList).toEqual([
        { message: INACTIVE_AUTHORITY_ERROR_MESSAGE },
      ]);
    });

    test("results in an error when an non-existing executing authority is assigned", async () => {
      const bestuurseenheid = aBestuurseenheid().build();
      const instance = aFullInstance()
        .withExecutingAuthorities([
          buildBestuurseenheidIri("ThisOrganisationDoesNotExist"),
        ])
        .build();
      await instanceRepository.save(bestuurseenheid, instance);

      const errorList =
        await validateInstanceForPublishApplicationService.validate(
          instance.id,
          bestuurseenheid,
        );

      expect(errorList).toEqual([
        { message: INACTIVE_AUTHORITY_ERROR_MESSAGE },
      ]);
    });

    test("results in an error when an inactive competent authority and a non-existing executing authority are assigned", async () => {
      const inactiveAuthority = anInactiveBestuurseenheid().build();

      const bestuurseenheid = aBestuurseenheid().build();
      const instance = aFullInstance()
        .withCompetentAuthorities([inactiveAuthority.id])
        .withExecutingAuthorities([
          buildBestuurseenheidIri("ThisOrganisationDoesNotExist"),
        ])
        .build();
      await instanceRepository.save(bestuurseenheid, instance);

      const errorList =
        await validateInstanceForPublishApplicationService.validate(
          instance.id,
          bestuurseenheid,
        );

      expect(errorList).toEqual([
        { message: INACTIVE_AUTHORITY_ERROR_MESSAGE },
      ]);
    });

    test("results in an error when a non-existing competent authority and an inactive executing authority are assigned", async () => {
      const inactiveAuthority = anInactiveBestuurseenheid().build();

      const bestuurseenheid = aBestuurseenheid().build();
      const instance = aFullInstance()
        .withCompetentAuthorities([
          buildBestuurseenheidIri("ThisOrganisationDoesNotExist"),
        ])
        .withExecutingAuthorities([inactiveAuthority.id])
        .build();
      await instanceRepository.save(bestuurseenheid, instance);

      const errorList =
        await validateInstanceForPublishApplicationService.validate(
          instance.id,
          bestuurseenheid,
        );

      expect(errorList).toEqual([
        { message: INACTIVE_AUTHORITY_ERROR_MESSAGE },
      ]);
    });

    test("results in an error when a non-existing competent and executing authority are assigned", async () => {
      const bestuurseenheid = aBestuurseenheid().build();
      const instance = aFullInstance()
        .withCompetentAuthorities([
          buildBestuurseenheidIri("ThisOrganisationDoesNotExist"),
        ])
        .withExecutingAuthorities([
          buildBestuurseenheidIri("ThisOrganisationDoesNotExist"),
        ])
        .build();
      await instanceRepository.save(bestuurseenheid, instance);

      const errorList =
        await validateInstanceForPublishApplicationService.validate(
          instance.id,
          bestuurseenheid,
        );

      expect(errorList).toEqual([
        { message: INACTIVE_AUTHORITY_ERROR_MESSAGE },
      ]);
    });

    test("results in no error when no executing authority is assigned", async () => {
      const bestuurseenheid = aBestuurseenheid().build();
      const instance = aFullInstance().withExecutingAuthorities([]).build();
      await instanceRepository.save(bestuurseenheid, instance);

      const errorList =
        await validateInstanceForPublishApplicationService.validate(
          instance.id,
          bestuurseenheid,
        );

      expect(errorList).toEqual([]);
    });

    test("results in an error when an expired spatial is assigned", async () => {
      const expiredSpatial = anExpiredSpatial().build();
      await spatialRepository.save(expiredSpatial);

      const bestuurseenheid = aBestuurseenheid().build();
      const instance = aFullInstance()
        .withSpatials([expiredSpatial.id])
        .build();
      await instanceRepository.save(bestuurseenheid, instance);

      const errorList =
        await validateInstanceForPublishApplicationService.validate(
          instance.id,
          bestuurseenheid,
        );

      expect(errorList).toEqual([{ message: EXPIRED_SPATIAL_ERROR_MESSAGE }]);
    });

    test("results in no error when a spatial without end date is assigned", async () => {
      const spatial = aSpatial().build();
      await spatialRepository.save(spatial);

      const bestuurseenheid = aBestuurseenheid().build();
      const instance = aFullInstance().withSpatials([spatial.id]).build();
      await instanceRepository.save(bestuurseenheid, instance);

      const errorList =
        await validateInstanceForPublishApplicationService.validate(
          instance.id,
          bestuurseenheid,
        );

      expect(errorList).toEqual([]);
    });

    test("results in no error when a spatial with an end date in the future is assigned", async () => {
      const spatial = aSpatialWithFutureEndDate().build();
      await spatialRepository.save(spatial);

      const bestuurseenheid = aBestuurseenheid().build();
      const instance = aFullInstance().withSpatials([spatial.id]).build();
      await instanceRepository.save(bestuurseenheid, instance);

      const errorList =
        await validateInstanceForPublishApplicationService.validate(
          instance.id,
          bestuurseenheid,
        );

      expect(errorList).toEqual([]);
    });

    test("results in an error when a spatial that does not exist is assigned", async () => {
      const bestuurseenheid = aBestuurseenheid().build();
      const instance = aFullInstance()
        .withSpatials([buildNutsCodeIri(1000000)])
        .build();
      await instanceRepository.save(bestuurseenheid, instance);

      const errorList =
        await validateInstanceForPublishApplicationService.validate(
          instance.id,
          bestuurseenheid,
        );

      expect(errorList).toEqual([{ message: EXPIRED_SPATIAL_ERROR_MESSAGE }]);
    });

    test("results in two errors when an inactive competent authority is provided and an expired spatial", async () => {
      const expiredSpatial = anExpiredSpatial().build();
      await spatialRepository.save(expiredSpatial);

      const inactiveAuthority = anInactiveBestuurseenheid().build();
      await bestuurseenheidRepository.save(inactiveAuthority);

      const bestuurseenheid = aBestuurseenheid().build();
      const instance = aFullInstance()
        .withCompetentAuthorities([inactiveAuthority.id])
        .withSpatials([expiredSpatial.id])
        .build();
      await instanceRepository.save(bestuurseenheid, instance);

      const errorList =
        await validateInstanceForPublishApplicationService.validate(
          instance.id,
          bestuurseenheid,
        );

      expect(errorList).toEqual([
        { message: INACTIVE_AUTHORITY_ERROR_MESSAGE },
        { message: EXPIRED_SPATIAL_ERROR_MESSAGE },
      ]);
    });

    test("results in two errors when an competent authority without status is provided and an expired spatial", async () => {
      const expiredSpatial = anExpiredSpatial().build();
      await spatialRepository.save(expiredSpatial);

      const authority = aBestuurseenheid().withStatus(undefined).build();
      await bestuurseenheidRepository.save(authority);

      const bestuurseenheid = aBestuurseenheid().build();
      const instance = aFullInstance()
        .withCompetentAuthorities([authority.id])
        .withSpatials([expiredSpatial.id])
        .build();
      await instanceRepository.save(bestuurseenheid, instance);

      const errorList =
        await validateInstanceForPublishApplicationService.validate(
          instance.id,
          bestuurseenheid,
        );

      expect(errorList).toEqual([
        { message: INACTIVE_AUTHORITY_ERROR_MESSAGE },
        { message: EXPIRED_SPATIAL_ERROR_MESSAGE },
      ]);
    });

    test("results in two errors when an inactive executing authority is provided and an expired spatial", async () => {
      const expiredSpatial = anExpiredSpatial().build();
      await spatialRepository.save(expiredSpatial);

      const inactiveAuthority = anInactiveBestuurseenheid().build();
      await bestuurseenheidRepository.save(inactiveAuthority);

      const bestuurseenheid = aBestuurseenheid().build();
      const instance = aFullInstance()
        .withExecutingAuthorities([inactiveAuthority.id])
        .withSpatials([expiredSpatial.id])
        .build();
      await instanceRepository.save(bestuurseenheid, instance);

      const errorList =
        await validateInstanceForPublishApplicationService.validate(
          instance.id,
          bestuurseenheid,
        );

      expect(errorList).toEqual([
        { message: INACTIVE_AUTHORITY_ERROR_MESSAGE },
        { message: EXPIRED_SPATIAL_ERROR_MESSAGE },
      ]);
    });

    test("results in two errors when an executing authority without status is provided and an expired spatial", async () => {
      const expiredSpatial = anExpiredSpatial().build();
      await spatialRepository.save(expiredSpatial);

      const inactiveAuthority = aBestuurseenheid()
        .withStatus(undefined)
        .build();
      await bestuurseenheidRepository.save(inactiveAuthority);

      const bestuurseenheid = aBestuurseenheid().build();
      const instance = aFullInstance()
        .withExecutingAuthorities([inactiveAuthority.id])
        .withSpatials([expiredSpatial.id])
        .build();
      await instanceRepository.save(bestuurseenheid, instance);

      const errorList =
        await validateInstanceForPublishApplicationService.validate(
          instance.id,
          bestuurseenheid,
        );

      expect(errorList).toEqual([
        { message: INACTIVE_AUTHORITY_ERROR_MESSAGE },
        { message: EXPIRED_SPATIAL_ERROR_MESSAGE },
      ]);
    });

    test("results in two errors when an inactive competent and executing authority is provided as well as an expired spatial", async () => {
      const expiredSpatial = anExpiredSpatial().build();
      await spatialRepository.save(expiredSpatial);

      const inactiveAuthority = anInactiveBestuurseenheid().build();
      await bestuurseenheidRepository.save(inactiveAuthority);

      const bestuurseenheid = aBestuurseenheid().build();
      const instance = aFullInstance()
        .withCompetentAuthorities([inactiveAuthority.id])
        .withExecutingAuthorities([inactiveAuthority.id])
        .withSpatials([expiredSpatial.id])
        .build();
      await instanceRepository.save(bestuurseenheid, instance);

      const errorList =
        await validateInstanceForPublishApplicationService.validate(
          instance.id,
          bestuurseenheid,
        );

      expect(errorList).toEqual([
        { message: INACTIVE_AUTHORITY_ERROR_MESSAGE },
        { message: EXPIRED_SPATIAL_ERROR_MESSAGE },
      ]);
    });

    test("results in two errors when a competent and executing authority without status is provided as well as an expired spatial", async () => {
      const expiredSpatial = anExpiredSpatial().build();
      await spatialRepository.save(expiredSpatial);

      const authority = aBestuurseenheid().withStatus(undefined).build();
      await bestuurseenheidRepository.save(authority);

      const bestuurseenheid = aBestuurseenheid().build();
      const instance = aFullInstance()
        .withCompetentAuthorities([authority.id])
        .withExecutingAuthorities([authority.id])
        .withSpatials([expiredSpatial.id])
        .build();
      await instanceRepository.save(bestuurseenheid, instance);

      const errorList =
        await validateInstanceForPublishApplicationService.validate(
          instance.id,
          bestuurseenheid,
        );

      expect(errorList).toEqual([
        { message: INACTIVE_AUTHORITY_ERROR_MESSAGE },
        { message: EXPIRED_SPATIAL_ERROR_MESSAGE },
      ]);
    });

    test("results in zero error when an existing concept code is assigned as competent authority", async () => {
      const iri = buildOvoCodeIri(uuid());
      await codeRepository.save(
        CodeSchema.IPDCOrganisaties,
        iri,
        "Some concept code",
        buildWegwijsIri(),
      );

      const bestuurseenheid = aBestuurseenheid().build();
      const instance = aFullInstance().withCompetentAuthorities([iri]).build();
      await instanceRepository.save(bestuurseenheid, instance);

      const errorList =
        await validateInstanceForPublishApplicationService.validate(
          instance.id,
          bestuurseenheid,
        );

      expect(errorList).toEqual([]);
    });

    test("should return one error message when assigning a non existing concept code as competent authority", async () => {
      const bestuurseenheid = aBestuurseenheid().build();
      const instance = aFullInstance()
        .withCompetentAuthorities([buildOvoCodeIri("DoesNotExist")])
        .build();
      await instanceRepository.save(bestuurseenheid, instance);

      const errorList =
        await validateInstanceForPublishApplicationService.validate(
          instance.id,
          bestuurseenheid,
        );

      expect(errorList).toEqual([
        { message: INACTIVE_AUTHORITY_ERROR_MESSAGE },
      ]);
    });

    test("should return zero error messages when an existing concept code is assigned as executing authority", async () => {
      const iri = buildOvoCodeIri(uuid());
      await codeRepository.save(
        CodeSchema.IPDCOrganisaties,
        iri,
        "Some concept code",
        buildWegwijsIri(),
      );

      const bestuurseenheid = aBestuurseenheid().build();
      const instance = aFullInstance().withExecutingAuthorities([iri]).build();
      await instanceRepository.save(bestuurseenheid, instance);

      const errorList =
        await validateInstanceForPublishApplicationService.validate(
          instance.id,
          bestuurseenheid,
        );

      expect(errorList).toEqual([]);
    });

    test("should return one error message when assigning a non existing concept code as executing authority", async () => {
      const bestuurseenheid = aBestuurseenheid().build();
      const instance = aFullInstance()
        .withExecutingAuthorities([buildOvoCodeIri("DoesNotExist")])
        .build();
      await instanceRepository.save(bestuurseenheid, instance);

      const errorList =
        await validateInstanceForPublishApplicationService.validate(
          instance.id,
          bestuurseenheid,
        );

      expect(errorList).toEqual([
        { message: INACTIVE_AUTHORITY_ERROR_MESSAGE },
      ]);
    });

    test("should return one error message when assigning a non existing concept code as competent and executing authority", async () => {
      const bestuurseenheid = aBestuurseenheid().build();
      const instance = aFullInstance()
        .withCompetentAuthorities([buildOvoCodeIri("DoesNotExist")])
        .withExecutingAuthorities([buildOvoCodeIri("AlsoDoesNotExist")])
        .build();
      await instanceRepository.save(bestuurseenheid, instance);

      const errorList =
        await validateInstanceForPublishApplicationService.validate(
          instance.id,
          bestuurseenheid,
        );

      expect(errorList).toEqual([
        { message: INACTIVE_AUTHORITY_ERROR_MESSAGE },
      ]);
    });

    test("should return zero error messages when instance has only valid and existing authorities", async () => {
      const iri = buildOvoCodeIri(uuid());
      await codeRepository.save(
        CodeSchema.IPDCOrganisaties,
        iri,
        "Some concept code",
        buildWegwijsIri(),
      );

      const bestuurseenheid = aBestuurseenheid().build();
      const instance = aFullInstance()
        .withCompetentAuthorities([
          iri,
          ...InstanceTestBuilder.COMPETENT_AUTHORITIES,
        ])
        .withExecutingAuthorities([
          iri,
          ...InstanceTestBuilder.EXECUTING_AUTHORITIES,
        ])
        .build();
      await instanceRepository.save(bestuurseenheid, instance);

      const errorList =
        await validateInstanceForPublishApplicationService.validate(
          instance.id,
          bestuurseenheid,
        );

      expect(errorList).toEqual([]);
    });

    test("should return two error messages when a non-existing concept is assigned as competent authority and an expired spatial is used", async () => {
      const expiredSpatial = anExpiredSpatial().build();
      await spatialRepository.save(expiredSpatial);

      const authority = aBestuurseenheid().withStatus(undefined).build();
      await bestuurseenheidRepository.save(authority);

      const bestuurseenheid = aBestuurseenheid().build();
      const instance = aFullInstance()
        .withCompetentAuthorities([buildOvoCodeIri("DoesNotExist")])
        .withSpatials([expiredSpatial.id])
        .build();
      await instanceRepository.save(bestuurseenheid, instance);

      const errorList =
        await validateInstanceForPublishApplicationService.validate(
          instance.id,
          bestuurseenheid,
        );

      expect(errorList).toEqual([
        { message: INACTIVE_AUTHORITY_ERROR_MESSAGE },
        { message: EXPIRED_SPATIAL_ERROR_MESSAGE },
      ]);
    });

    test("should return two error messages when a non-existing concept is assigned as executing authority and an expired spatial is used", async () => {
      const expiredSpatial = anExpiredSpatial().build();
      await spatialRepository.save(expiredSpatial);

      const authority = aBestuurseenheid().withStatus(undefined).build();
      await bestuurseenheidRepository.save(authority);

      const bestuurseenheid = aBestuurseenheid().build();
      const instance = aFullInstance()
        .withExecutingAuthorities([buildOvoCodeIri("DoesNotExist")])
        .withSpatials([expiredSpatial.id])
        .build();
      await instanceRepository.save(bestuurseenheid, instance);

      const errorList =
        await validateInstanceForPublishApplicationService.validate(
          instance.id,
          bestuurseenheid,
        );

      expect(errorList).toEqual([
        { message: INACTIVE_AUTHORITY_ERROR_MESSAGE },
        { message: EXPIRED_SPATIAL_ERROR_MESSAGE },
      ]);
    });

    test("should return two error messages when a non-existing concept is assigned as competent and executing authority, and an expired spatial is used", async () => {
      const expiredSpatial = anExpiredSpatial().build();
      await spatialRepository.save(expiredSpatial);

      const authority = aBestuurseenheid().withStatus(undefined).build();
      await bestuurseenheidRepository.save(authority);

      const bestuurseenheid = aBestuurseenheid().build();
      const instance = aFullInstance()
        .withCompetentAuthorities([buildOvoCodeIri("DoesNotExist")])
        .withExecutingAuthorities([buildOvoCodeIri("AlsoDoesNotExist")])
        .withSpatials([expiredSpatial.id])
        .build();
      await instanceRepository.save(bestuurseenheid, instance);

      const errorList =
        await validateInstanceForPublishApplicationService.validate(
          instance.id,
          bestuurseenheid,
        );

      expect(errorList).toEqual([
        { message: INACTIVE_AUTHORITY_ERROR_MESSAGE },
        { message: EXPIRED_SPATIAL_ERROR_MESSAGE },
      ]);
    });
  });
});
