import { createApp } from "./mu-helper";
import bodyparser from "body-parser";
import {
  CONCEPT_SNAPSHOT_PROCESSING_CRON_PATTERN,
  INSTANCE_SNAPSHOT_PROCESSING_CRON_PATTERN,
  IPDC_API_ENDPOINT,
  IPDC_API_KEY,
} from "./config";
import { SessionSparqlRepository } from "./src/driven/persistence/session-sparql-repository";
import { BestuurseenheidSparqlRepository } from "./src/driven/persistence/bestuurseenheid-sparql-repository";
import { ConceptSnapshotSparqlRepository } from "./src/driven/persistence/concept-snapshot-sparql-repository";
import { ConceptSparqlRepository } from "./src/driven/persistence/concept-sparql-repository";
import { Iri } from "./src/core/domain/shared/iri";
import { ConceptSnapshotToConceptMergerDomainService } from "./src/core/domain/concept-snapshot-to-concept-merger-domain-service";
import { ConceptDisplayConfigurationSparqlRepository } from "./src/driven/persistence/concept-display-configuration-sparql-repository";
import { BestuurseenheidRegistrationCodeThroughSubjectPageOrApiFetcher } from "./src/driven/external/bestuurseenheid-registration-code-through-subject-page-or-api-fetcher";
import { CodeSparqlRepository } from "./src/driven/persistence/code-sparql-repository";
import { InstanceSparqlRepository } from "./src/driven/persistence/instance-sparql-repository";
import { NewInstanceDomainService } from "./src/core/domain/new-instance-domain-service";
import { Session } from "./src/core/domain/session";
import { authenticateAndAuthorizeRequest } from "./src/driving/sessions";
import { FormDefinitionFileRepository } from "./src/driven/persistence/form-definition-file-repository";
import { SelectConceptLanguageDomainService } from "./src/core/domain/select-concept-language-domain-service";
import { FormalInformalChoiceSparqlRepository } from "./src/driven/persistence/formal-informal-choice-sparql-repository";
import { FormApplicationService } from "./src/core/application/form-application-service";
import { Bestuurseenheid } from "./src/core/domain/bestuurseenheid";
import { DeleteInstanceDomainService } from "./src/core/domain/delete-instance-domain-service";
import { LinkConceptToInstanceDomainService } from "./src/core/domain/link-concept-to-instance-domain-service";
import { BringInstanceUpToDateWithConceptSnapshotVersionDomainService } from "./src/core/domain/bring-instance-up-to-date-with-concept-snapshot-version-domain-service";
import { UpdateInstanceApplicationService } from "./src/core/application/update-instance-application-service";
import { SemanticFormsMapperImpl } from "./src/driven/persistence/semantic-forms-mapper-impl";
import { InstanceSnapshotProcessorApplicationService } from "./src/core/application/instance-snapshot-processor-application-service";
import { InstanceSnapshotSparqlRepository } from "./src/driven/persistence/instance-snapshot-sparql-repository";
import { InstanceSnapshotToInstanceMergerDomainService } from "./src/core/domain/instance-snapshot-to-instance-merger-domain-service";
import { CronJob } from "cron";
import { EnsureLinkedAuthoritiesExistAsCodeListDomainService } from "./src/core/domain/ensure-linked-authorities-exist-as-code-list-domain-service";
import { Application, Request, Response } from "express";
import errorHandler from "./src/driving/error-handler";
import { NotFound } from "./src/driving/http-error";
import { InvariantError } from "./src/core/domain/shared/lpdc-error";
import { ValidateInstanceForPublishApplicationService } from "./src/core/application/validate-instance-for-publish-application-service";
import { ChosenFormType, FormType } from "./src/core/domain/types";
import { FormatPreservingDate } from "./src/core/domain/format-preserving-date";
import { FormalInformalChoice } from "./src/core/domain/formal-informal-choice";
import { NewFormalInformalChoiceDomainService } from "./src/core/domain/new-formal-informal-choice-domain-service";
import { ConvertInstanceToInformalDomainService } from "./src/core/domain/convert-instance-to-informal-domain-service";
import { InstanceInformalLanguageStringsFetcherIpdc } from "./src/driven/external/instance-informal-language-strings-fetcher-ipdc";
import { ConceptSnapshot } from "./src/core/domain/concept-snapshot";
import { InstanceSnapshotProcessingAuthorizationSparqlRepository } from "./src/driven/persistence/instance-snapshot-processing-authorization-sparql-repository";
import { VersionedLdesSnapshotSparqlRepository } from "./src/driven/persistence/versioned-ldes-snapshot-sparql-repository";
import { AdressenRegisterFetcher } from "./src/driven/external/adressen-register-fetcher";
import { ContactInfoOptionsSparqlRepository } from "./src/driven/persistence/contact-info-options-sparql-repository";
import { ConceptSnapshotProcessorApplicationService } from "./src/core/application/concept-snapshot-processor-application-service";
import { SpatialSparqlRepository } from "./src/driven/persistence/spatial-sparql-repository";
import { AuthorityLevelSparqlRepository } from "./src/driven/persistence/authority-level-sparql-repository";
import { PersoonSparqlRepository } from "./src/driven/persistence/persoon-sparql-repository";

//TODO: The original bodyparser is configured to only accept 'application/vnd.api+json'
//      The current endpoint(s) don't work with json:api. Also we need both types, as e.g. deltanotifier doesn't
//      send its data as such.
const app: Application = createApp();

const bodySizeLimit = process.env.MAX_BODY_SIZE || "5Mb";
app.use(bodyparser.json({ limit: bodySizeLimit }));

const sessionRepository = new SessionSparqlRepository();
const bestuurseenheidRepository = new BestuurseenheidSparqlRepository();
const persoonRepository = new PersoonSparqlRepository();
const conceptSnapshotRepository = new ConceptSnapshotSparqlRepository();
const conceptRepository = new ConceptSparqlRepository();
const conceptDisplayConfigurationRepository =
  new ConceptDisplayConfigurationSparqlRepository();
const bestuurseenheidRegistrationCodeFetcher =
  new BestuurseenheidRegistrationCodeThroughSubjectPageOrApiFetcher();
const codeRepository = new CodeSparqlRepository();
const authorityLevelRepository = new AuthorityLevelSparqlRepository();
const instanceRepository = new InstanceSparqlRepository();
const formDefinitionRepository = new FormDefinitionFileRepository();
const formalInformalChoiceRepository =
  new FormalInformalChoiceSparqlRepository();
const semanticFormsMapper = new SemanticFormsMapperImpl();
const instanceSnapshotRepository = new InstanceSnapshotSparqlRepository();
const instanceSnapshotProcessingAuthorizationRepository =
  new InstanceSnapshotProcessingAuthorizationSparqlRepository();
const versionedLdesSnapshotRepository =
  new VersionedLdesSnapshotSparqlRepository();
const spatialRepository = new SpatialSparqlRepository();

const linkedAuthorityCodeListDomainService =
  new EnsureLinkedAuthoritiesExistAsCodeListDomainService(
    bestuurseenheidRegistrationCodeFetcher,
    codeRepository,
  );

const conceptSnapshotToConceptMergerDomainService =
  new ConceptSnapshotToConceptMergerDomainService(
    conceptSnapshotRepository,
    conceptRepository,
    conceptDisplayConfigurationRepository,
    linkedAuthorityCodeListDomainService,
    instanceRepository,
  );

const conceptSnapshotProcessorApplicationService =
  new ConceptSnapshotProcessorApplicationService(
    conceptSnapshotToConceptMergerDomainService,
    versionedLdesSnapshotRepository,
  );
const selectConceptLanguageDomainService =
  new SelectConceptLanguageDomainService();

const newInstanceDomainService = new NewInstanceDomainService(
  instanceRepository,
  formalInformalChoiceRepository,
  selectConceptLanguageDomainService,
  conceptDisplayConfigurationRepository,
);

const deleteInstanceDomainService = new DeleteInstanceDomainService(
  instanceRepository,
  conceptDisplayConfigurationRepository,
);

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

const validateInstanceForPublishApplicationService =
  new ValidateInstanceForPublishApplicationService(
    formApplicationService,
    instanceRepository,
    bestuurseenheidRepository,
    spatialRepository,
    codeRepository,
    authorityLevelRepository,
  );

const linkConceptToInstanceDomainService =
  new LinkConceptToInstanceDomainService(
    instanceRepository,
    conceptRepository,
    conceptDisplayConfigurationRepository,
  );

const bringInstanceUpToDateWithConceptSnapshotVersionDomainService =
  new BringInstanceUpToDateWithConceptSnapshotVersionDomainService(
    instanceRepository,
    conceptRepository,
    conceptSnapshotRepository,
    selectConceptLanguageDomainService,
  );

const updateInstanceApplicationService = new UpdateInstanceApplicationService(
  instanceRepository,
  semanticFormsMapper,
);

const instanceSnapshotToInstanceMergerDomainService =
  new InstanceSnapshotToInstanceMergerDomainService(
    instanceSnapshotRepository,
    instanceRepository,
    conceptRepository,
    conceptDisplayConfigurationRepository,
    deleteInstanceDomainService,
    linkedAuthorityCodeListDomainService,
    instanceSnapshotProcessingAuthorizationRepository,
    bestuurseenheidRepository,
    spatialRepository,
    codeRepository,
  );

const instanceSnapshotProcessorApplicationService =
  new InstanceSnapshotProcessorApplicationService(
    instanceSnapshotToInstanceMergerDomainService,
    versionedLdesSnapshotRepository,
  );

const newFormalInformalChoiceAndSyncInstanceDomainService =
  new NewFormalInformalChoiceDomainService(
    formalInformalChoiceRepository,
    instanceRepository,
  );

const instanceInformalLanguageStringsFetcher =
  new InstanceInformalLanguageStringsFetcherIpdc(
    IPDC_API_ENDPOINT,
    IPDC_API_KEY,
  );

const convertInstanceToInformalDomainService =
  new ConvertInstanceToInformalDomainService(
    instanceRepository,
    formalInformalChoiceRepository,
    instanceInformalLanguageStringsFetcher,
  );

const addressFetcher = new AdressenRegisterFetcher();

const contactInfoOptionsRepository = new ContactInfoOptionsSparqlRepository();

app.get("/", function (_req, res): void {
  const message = `Hey there, you have reached the lpdc-management-service! Seems like I'm doing just fine, have a nice day! :)`;
  res.send(message);
});

app.use("/public-services/", async (req, res, next) => {
  await authenticateAndAuthorizeRequest(req, next, sessionRepository).catch(
    next,
  );
});

app.post("/public-services/", async (req, res, next) => {
  await createInstance(req, res).catch(next);
});

app.get(
  "/public-services/:instanceId/form/:formId",
  async function (req, res, next): Promise<any> {
    return await getInstanceForm(req, res).catch(next);
  },
);

app.get(
  "/public-services/:instanceId/is-published",
  async function (req, res, next): Promise<any> {
    return await isPublished(req, res).catch(next);
  },
);

app.delete(
  "/public-services/:instanceId",
  async function (req, res, next): Promise<any> {
    return await removeInstance(req, res).catch(next);
  },
);

app.put(
  "/public-services/:instanceId",
  async function (req, res, next): Promise<any> {
    return await updateInstance(req, res).catch(next);
  },
);

app.put(
  "/public-services/:instanceId/koppelen/:conceptId",
  async function (req, res, next): Promise<any> {
    return await linkConceptToInstance(req, res).catch(next);
  },
);

app.put(
  "/public-services/:instanceId/ontkoppelen",
  async function (req, res, next): Promise<any> {
    return await unlinkConceptFromInstance(req, res).catch(next);
  },
);

app.put(
  "/public-services/:instanceId/reopen",
  async function (req, res, next): Promise<any> {
    return await reopenInstance(req, res).catch(next);
  },
);

app.post(
  "/public-services/:instanceId/confirm-up-to-date-till",
  async function (req, res, next): Promise<any> {
    return await confirmUpToDateTill(req, res).catch(next);
  },
);

app.post(
  "/public-services/:instanceId/fully-take-concept-snapshot-over",
  async function (req, res, next): Promise<any> {
    return await fullyTakeConceptSnapshotOver(req, res).catch(next);
  },
);

app.post(
  "/public-services/:instanceId/confirm-instance-is-already-informal",
  async function (req, res, next): Promise<any> {
    return await confirmInstanceIsAlreadyInformal(req, res).catch(next);
  },
);

app.post(
  "/public-services/:instanceId/convert-instance-to-informal",
  async function (req, res, next): Promise<any> {
    return await convertInstanceToInformal(req, res).catch(next);
  },
);

app.put(
  "/public-services/:instanceId/validate-for-publish",
  async function (req, res, next): Promise<any> {
    return await validateForPublish(req, res).catch(next);
  },
);

app.put(
  "/public-services/:instanceId/publish",
  async function (req, res, next): Promise<any> {
    return await publishInstance(req, res).catch(next);
  },
);

app.post(
  "/public-services/:instanceId/copy",
  async function (req, res, next): Promise<any> {
    return await copyInstance(req, res).catch(next);
  },
);

app.use("/conceptual-public-services/", async (req, res, next) => {
  await authenticateAndAuthorizeRequest(req, next, sessionRepository).catch(
    next,
  );
});

app.get(
  "/conceptual-public-services/:conceptId/dutch-language-version",
  async (req, res, next): Promise<any> => {
    return await getDutchLanguageVersionForConcept(req, res).catch(next);
  },
);

app.get(
  "/conceptual-public-services/:conceptId/form/:formId",
  async function (req, res, next): Promise<any> {
    return await getConceptForm(req, res).catch(next);
  },
);

app.use("/concept-display-configuration/", async (req, res, next) => {
  await authenticateAndAuthorizeRequest(req, next, sessionRepository).catch(
    next,
  );
});

app.put(
  "/concept-display-configuration/:conceptDisplayConfigurationId/remove-is-new-flag",
  async function (req, res, next): Promise<any> {
    return await removeIsNewFlag(req, res).catch(next);
  },
);

app.use("/formal-informal-choices/", async (req, res, next) => {
  await authenticateAndAuthorizeRequest(req, next, sessionRepository).catch(
    next,
  );
});

app.post(
  "/formal-informal-choices/",
  async function (req, res, next): Promise<any> {
    return await createFormalInformalChoice(req, res).catch(next);
  },
);

app.get(
  "/formal-informal-choices/",
  async function (req, res, next): Promise<any> {
    return await getFormalInformalChoice(req, res).catch(next);
  },
);

app.use("/contact-info-options/", async (req, res, next) => {
  await authenticateAndAuthorizeRequest(req, next, sessionRepository).catch(
    next,
  );
});

app.get(
  "/contact-info-options/:fieldName",
  async (req, res, next): Promise<any> => {
    return await getContactPointOptions(req, res).catch(next);
  },
);

app.use("/address", async (req, res, next) => {
  await authenticateAndAuthorizeRequest(req, next, sessionRepository).catch(
    next,
  );
});

app.get("/address/municipalities", async (req, res, next): Promise<any> => {
  return await getMunicipalities(req, res).catch(next);
});

app.get("/address/streets", async (req, res, next): Promise<any> => {
  return await getStreets(req, res).catch(next);
});

app.get("/address/validate", async (req, res, next): Promise<any> => {
  return await validateAddress(req, res).catch(next);
});

app.use("/creator-options/", async (req, res, next) => {
  await authenticateAndAuthorizeRequest(req, next, sessionRepository).catch(
    next,
  );
});

app.get("/creator-options/", async (req, res, next): Promise<any> => {
    return await getCreatorOptions(req, res).catch(next);
  },
);

app.use("/concept-snapshot", async (req, res, next) => {
  await authenticateAndAuthorizeRequest(req, next, sessionRepository).catch(
    next,
  );
});

app.get("/concept-snapshot/compare/", async (req, res, next): Promise<any> => {
  return await compareSnapshots(req, res).catch(next);
});

//  Catch-all route for invalid routes
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((req, res, next) => {
  throw new NotFound();
});

app.use(errorHandler);

async function createInstance(req: Request, res: Response) {
  const body = req.body;
  const conceptIdRequestParam = body.conceptId;

  const session: Session = req["session"];

  const bestuurseenheid = await bestuurseenheidRepository.findById(
    session.bestuurseenheidId,
  );
  const persoonId = await persoonRepository.findByAccountId(
    session.accountId,
    session.bestuurseenheidId,
  );

  if (conceptIdRequestParam) {
    const conceptId = new Iri(conceptIdRequestParam);
    const concept = await conceptRepository.findById(conceptId);
    const newInstance = await newInstanceDomainService.createNewFromConcept(
      bestuurseenheid,
      persoonId,
      concept,
    );
    return res.status(201).json({
      data: {
        type: "public-service",
        id: newInstance.uuid,
        uri: newInstance.id.value,
      },
    });
  } else {
    const newInstance = await newInstanceDomainService.createNewEmpty(
      bestuurseenheid,
      persoonId,
    );
    return res.status(201).json({
      data: {
        type: "public-service",
        id: newInstance.uuid,
        uri: newInstance.id.value,
      },
    });
  }
}

async function getInstanceForm(req: Request, res: Response) {
  const instanceIdRequestParam = req.params.instanceId;
  const latestConceptSnapshotIdBody: string | undefined = req.query
    .latestConceptSnapshotId as string;
  const formId = req.params.formId as FormType;

  const instanceId = new Iri(instanceIdRequestParam);
  const latestConceptSnapshotId = latestConceptSnapshotIdBody
    ? new Iri(latestConceptSnapshotIdBody)
    : undefined;
  const session: Session = req["session"];
  const bestuurseenheid = await bestuurseenheidRepository.findById(
    session.bestuurseenheidId,
  );

  const bundle = await formApplicationService.loadInstanceForm(
    bestuurseenheid,
    instanceId,
    latestConceptSnapshotId,
    formId,
  );
  return res.status(200).json(bundle);
}

async function isPublished(req: Request, res: Response) {
  const instanceIdRequestParam = req.params.instanceId;

  const instanceId = new Iri(instanceIdRequestParam);
  const session: Session = req["session"];
  const bestuurseenheid = await bestuurseenheidRepository.findById(
    session.bestuurseenheidId,
  );

  const instance = await instanceRepository.findById(
    bestuurseenheid,
    instanceId,
  );
  const isPublished = await instanceRepository.isPublishedToIpdc(
    bestuurseenheid,
    instance,
  );
  return res.status(200).json({ isPublished });
}

async function removeInstance(req: Request, res: Response) {
  const instanceIdRequestParam = req.params.instanceId;

  const instanceId = new Iri(instanceIdRequestParam);
  const session: Session = req["session"];
  const bestuurseenheid: Bestuurseenheid =
    await bestuurseenheidRepository.findById(session.bestuurseenheidId);

  await deleteInstanceDomainService.delete(bestuurseenheid, instanceId);
  return res.sendStatus(204);
}

async function updateInstance(req: Request, res: Response) {
  const instanceIdRequestParam = req.params.instanceId;
  const delta = req.body;
  const instanceVersion: FormatPreservingDate | undefined =
    FormatPreservingDate.of(req.headers["instance-version"] as string);

  const instanceId = new Iri(instanceIdRequestParam);
  const session: Session = req["session"];
  const bestuurseenheid = await bestuurseenheidRepository.findById(
    session.bestuurseenheidId,
  );
  const persoonId = await persoonRepository.findByAccountId(
    session.accountId,
    session.bestuurseenheidId,
  );

  await updateInstanceApplicationService.update(
    bestuurseenheid,
    persoonId,
    instanceId,
    instanceVersion,
    delta.removals,
    delta.additions,
  );

  return res.sendStatus(200);
}

async function linkConceptToInstance(req: Request, res: Response) {
  const instanceIdRequestParam = req.params.instanceId;
  const conceptIdRequestParam = req.params.conceptId;
  const instanceVersion: FormatPreservingDate | undefined =
    FormatPreservingDate.of(req.headers["instance-version"] as string);

  const instanceId = new Iri(instanceIdRequestParam);
  const conceptId = new Iri(conceptIdRequestParam);
  const session: Session = req["session"];
  const bestuurseenheid: Bestuurseenheid =
    await bestuurseenheidRepository.findById(session.bestuurseenheidId);
  const instance = await instanceRepository.findById(
    bestuurseenheid,
    instanceId,
  );
  const concept = await conceptRepository.findById(conceptId);
  const persoonId = await persoonRepository.findByAccountId(
    session.accountId,
    session.bestuurseenheidId,
  );

  await linkConceptToInstanceDomainService.link(
    bestuurseenheid,
    persoonId,
    instance,
    instanceVersion,
    concept,
  );
  return res.sendStatus(200);
}

async function unlinkConceptFromInstance(req: Request, res: Response) {
  const instanceIdRequestParam = req.params.instanceId;
  const instanceVersion: FormatPreservingDate | undefined =
    FormatPreservingDate.of(req.headers["instance-version"] as string);

  const instanceId = new Iri(instanceIdRequestParam);
  const session: Session = req["session"];
  const bestuurseenheid: Bestuurseenheid =
    await bestuurseenheidRepository.findById(session.bestuurseenheidId);
  const instance = await instanceRepository.findById(
    bestuurseenheid,
    instanceId,
  );
  const persoonId = await persoonRepository.findByAccountId(
    session.accountId,
    session.bestuurseenheidId,
  );

  await linkConceptToInstanceDomainService.unlink(
    bestuurseenheid,
    persoonId,
    instance,
    instanceVersion,
  );
  return res.sendStatus(200);
}

async function reopenInstance(req: Request, res: Response) {
  const instanceIdRequestParam = req.params.instanceId;
  const instanceVersion: FormatPreservingDate | undefined =
    FormatPreservingDate.of(req.headers["instance-version"] as string);

  const instanceId = new Iri(instanceIdRequestParam);
  const session: Session = req["session"];
  const bestuurseenheid: Bestuurseenheid =
    await bestuurseenheidRepository.findById(session.bestuurseenheidId);

  const instance = await instanceRepository.findById(
    bestuurseenheid,
    instanceId,
  );
  const persoonId = await persoonRepository.findByAccountId(
    session.accountId,
    session.bestuurseenheidId,
  );

  await instanceRepository.update(
    bestuurseenheid,
    persoonId,
    instance.reopen(),
    instanceVersion,
  );

  return res.sendStatus(200);
}

async function confirmUpToDateTill(req: Request, res: Response) {
  const instanceIdRequestParam = req.params.instanceId;
  const conceptSnapshotIdData = req.body.upToDateTillConceptSnapshotId;
  const instanceVersion: FormatPreservingDate | undefined =
    FormatPreservingDate.of(req.headers["instance-version"] as string);

  const instanceId = new Iri(instanceIdRequestParam);
  const conceptSnapshotId = new Iri(conceptSnapshotIdData);
  const session: Session = req["session"];
  const bestuurseenheid: Bestuurseenheid =
    await bestuurseenheidRepository.findById(session.bestuurseenheidId);
  const instance = await instanceRepository.findById(
    bestuurseenheid,
    instanceId,
  );
  const conceptSnapshot = await conceptSnapshotRepository.findById(
    conceptSnapshotId,
  );
  const persoonId = await persoonRepository.findByAccountId(
    session.accountId,
    session.bestuurseenheidId,
  );

  await bringInstanceUpToDateWithConceptSnapshotVersionDomainService.confirmUpToDateTill(
    bestuurseenheid,
    persoonId,
    instance,
    instanceVersion,
    conceptSnapshot,
  );

  return res.sendStatus(200);
}

async function fullyTakeConceptSnapshotOver(req: Request, res: Response) {
  const instanceIdRequestParam = req.params.instanceId;
  const conceptSnapshotIdBody = req.body.conceptSnapshotId;
  const instanceVersion: FormatPreservingDate | undefined =
    FormatPreservingDate.of(req.headers["instance-version"] as string);

  const instanceId = new Iri(instanceIdRequestParam);
  const conceptSnapshotId = new Iri(conceptSnapshotIdBody);
  const session: Session = req["session"];
  const bestuurseenheid: Bestuurseenheid =
    await bestuurseenheidRepository.findById(session.bestuurseenheidId);
  const instance = await instanceRepository.findById(
    bestuurseenheid,
    instanceId,
  );
  const conceptSnapshot = await conceptSnapshotRepository.findById(
    conceptSnapshotId,
  );
  const persoonId = await persoonRepository.findByAccountId(
    session.accountId,
    session.bestuurseenheidId,
  );

  await bringInstanceUpToDateWithConceptSnapshotVersionDomainService.fullyTakeConceptSnapshotOver(
    bestuurseenheid,
    persoonId,
    instance,
    instanceVersion,
    conceptSnapshot,
  );

  return res.sendStatus(200);
}

async function confirmInstanceIsAlreadyInformal(req: Request, res: Response) {
  const instanceIdRequestParam = req.params.instanceId;
  const instanceVersion: FormatPreservingDate | undefined =
    FormatPreservingDate.of(req.headers["instance-version"] as string);

  const instanceId = new Iri(instanceIdRequestParam);
  const session: Session = req["session"];
  const bestuurseenheid: Bestuurseenheid =
    await bestuurseenheidRepository.findById(session.bestuurseenheidId);
  const instance = await instanceRepository.findById(
    bestuurseenheid,
    instanceId,
  );
  const persoonId = await persoonRepository.findByAccountId(
    session.accountId,
    session.bestuurseenheidId,
  );

  await convertInstanceToInformalDomainService.confirmInstanceIsAlreadyInformal(
    bestuurseenheid,
    persoonId,
    instance,
    instanceVersion,
  );
  return res.sendStatus(200);
}

async function convertInstanceToInformal(req: Request, res: Response) {
  const instanceIdRequestParam = req.params.instanceId;
  const instanceVersion: FormatPreservingDate | undefined =
    FormatPreservingDate.of(req.headers["instance-version"] as string);

  const instanceId = new Iri(instanceIdRequestParam);
  const session: Session = req["session"];
  const bestuurseenheid: Bestuurseenheid =
    await bestuurseenheidRepository.findById(session.bestuurseenheidId);
  const instance = await instanceRepository.findById(
    bestuurseenheid,
    instanceId,
  );
  const persoonId = await persoonRepository.findByAccountId(
    session.accountId,
    session.bestuurseenheidId,
  );
  await convertInstanceToInformalDomainService.convertInstanceToInformal(
    bestuurseenheid,
    persoonId,
    instance,
    instanceVersion,
  );
  return res.sendStatus(200);
}

async function validateForPublish(req: Request, res: Response) {
  const instanceIdRequestParam = req.params.instanceId;

  const instanceId = new Iri(instanceIdRequestParam);
  const session: Session = req["session"];
  const bestuurseenheid = await bestuurseenheidRepository.findById(
    session.bestuurseenheidId,
  );

  const errors =
    await validateInstanceForPublishApplicationService.validate(
      instanceId,
      bestuurseenheid,
    );

  return res.status(200).json(errors);
}

async function publishInstance(req: Request, res: Response) {
  const instanceIdRequestParam = req.params.instanceId;
  const instanceVersion: FormatPreservingDate | undefined =
    FormatPreservingDate.of(req.headers["instance-version"] as string);

  const instanceId = new Iri(instanceIdRequestParam);
  const session: Session = req["session"];
  const bestuurseenheid = await bestuurseenheidRepository.findById(
    session.bestuurseenheidId,
  );

  const errors = await validateInstanceForPublishApplicationService.validate(
    instanceId,
    bestuurseenheid,
  );
  if (errors.length > 0) {
    throw new InvariantError("Instantie niet geldig om te publiceren");
  }

  const instance = await instanceRepository.findById(
    bestuurseenheid,
    instanceId,
  );
  const persoonId = await persoonRepository.findByAccountId(
    session.accountId,
    session.bestuurseenheidId,
  );

  const publishedInstance = instance.publish();
  await instanceRepository.update(
    bestuurseenheid,
    persoonId,
    publishedInstance,
    instanceVersion,
  );
  return res.sendStatus(200);
}

async function copyInstance(req: Request, res: Response) {
  const instanceIdRequestParam = req.params.instanceId;
  const forMunicipalityMerger: boolean = req.body.forMunicipalityMerger;

  const instanceId = new Iri(instanceIdRequestParam);
  const session: Session = req["session"];
  const bestuurseenheid = await bestuurseenheidRepository.findById(
    session.bestuurseenheidId,
  );

  const instance = await instanceRepository.findById(
    bestuurseenheid,
    instanceId,
  );
  const persoonId = await persoonRepository.findByAccountId(
    session.accountId,
    session.bestuurseenheidId,
  );

  const newInstance = await newInstanceDomainService.copyFrom(
    bestuurseenheid,
    persoonId,
    instance,
    forMunicipalityMerger,
  );

  return res.status(201).json({
    data: {
      type: "public-service",
      id: newInstance.uuid,
      uri: newInstance.id.value,
    },
  });
}

async function getDutchLanguageVersionForConcept(req: Request, res: Response) {
  const conceptIdRequestParam = req.params.conceptId;

  const conceptId = new Iri(conceptIdRequestParam);
  const session: Session = req["session"];
  const bestuurseenheid = await bestuurseenheidRepository.findById(
    session.bestuurseenheidId,
  );
  const concept = await conceptRepository.findById(conceptId);
  const formalInformalChoice: FormalInformalChoice | undefined =
    await formalInformalChoiceRepository.findByBestuurseenheid(bestuurseenheid);

  const languageVersion =
    selectConceptLanguageDomainService.selectAvailableLanguageUsingFormalInformalChoice(
      concept,
      formalInformalChoice,
    );
  return res.json({ languageVersion: languageVersion });
}

async function getConceptForm(req: Request, res: Response) {
  const conceptIdRequestParam = req.params.conceptId;
  const formId = req.params["formId"] as FormType;

  const conceptId = new Iri(conceptIdRequestParam);
  const session: Session = req["session"];
  const bestuurseenheid = await bestuurseenheidRepository.findById(
    session.bestuurseenheidId,
  );
  const bundle = await formApplicationService.loadConceptForm(
    bestuurseenheid,
    conceptId,
    formId,
  );

  return res.status(200).json(bundle);
}

async function removeIsNewFlag(req: Request, res: Response) {
  const conceptDisplayConfigurationIdRequestParam =
    req.params.conceptDisplayConfigurationId;

  const conceptDisplayConfigurationId = new Iri(
    conceptDisplayConfigurationIdRequestParam,
  );
  const session: Session = req["session"];
  const bestuurseenheid = await bestuurseenheidRepository.findById(
    session.bestuurseenheidId,
  );

  await conceptDisplayConfigurationRepository.removeConceptIsNewFlag(
    bestuurseenheid,
    conceptDisplayConfigurationId,
  );
  return res.status(200).send();
}

async function createFormalInformalChoice(req: Request, res: Response) {
  const body = req.body;

  const session: Session = req["session"];
  const bestuurseenheid = await bestuurseenheidRepository.findById(
    session.bestuurseenheidId,
  );

  const chosenFormType: ChosenFormType = body?.data?.attributes["chosen-form"];

  const formalInformalChoice =
    await newFormalInformalChoiceAndSyncInstanceDomainService.saveFormalInformalChoiceAndSyncInstances(
      bestuurseenheid,
      chosenFormType,
    );

  return res.status(201).json({
    data: {
      type: "formal-informal-choices",
      id: formalInformalChoice.uuid,
      uri: formalInformalChoice.id,
    },
  });
}

async function getFormalInformalChoice(req: Request, res: Response) {
  const session: Session = req["session"];
  const bestuurseenheid = await bestuurseenheidRepository.findById(
    session.bestuurseenheidId,
  );

  const formalInformalChoice: FormalInformalChoice | undefined =
    await formalInformalChoiceRepository.findByBestuurseenheid(bestuurseenheid);
  if (formalInformalChoice) {
    return res.status(200).json({
      data: [
        {
          attributes: {
            "chosen-form": formalInformalChoice.chosenForm,
            "date-created": formalInformalChoice.dateCreated.value,
            uri: formalInformalChoice.id.value,
          },
          id: formalInformalChoice.uuid,
          type: "formal-informal-choices",
        },
      ],
    });
  } else {
    return res.status(200).json({
      data: [],
    });
  }
}

async function getContactPointOptions(req: Request, res: Response) {
  const session: Session = req["session"];
  const bestuurseenheid = await bestuurseenheidRepository.findById(
    session.bestuurseenheidId,
  );

  const result = await contactInfoOptionsRepository.contactPointOptions(
    bestuurseenheid,
    req.params.fieldName,
  );
  return res.json(result);
}

async function getCreatorOptions(req: Request, res: Response) {
  const session: Session = req["session"];
  const bestuurseenheid = await bestuurseenheidRepository.findById(
    session.bestuurseenheidId,
  );

  const result = await instanceRepository.creatorOptions(
    bestuurseenheid
  );
  return res.json(result);
}

async function getMunicipalities(req: Request, res: Response) {
  const municipalities = await addressFetcher.fetchMunicipalities(
    req.query.search as string,
  );
  return res.json(municipalities);
}

async function getStreets(req: Request, res: Response) {
  const streets = await addressFetcher.fetchStreets(
    req.query.municipality as string,
    req.query.search as string,
  );
  return res.json(streets);
}

async function validateAddress(req: Request, res: Response) {
  const address = await addressFetcher.findAddressMatch(
    req.query.municipality as string,
    req.query.street as string,
    req.query.houseNumber as string,
    req.query.busNumber as string,
  );
  return res.json(address);
}

async function compareSnapshots(req: Request, res: Response) {
  const currentSnapshotIdRequestParam = req.query.snapshot1 as string;
  const newSnapshotIdRequestParam = req.query.snapshot2 as string;

  if (currentSnapshotIdRequestParam && newSnapshotIdRequestParam) {
    const currentConceptSnapshot = await conceptSnapshotRepository.findById(
      new Iri(currentSnapshotIdRequestParam),
    );
    const newConceptSnapshot = await conceptSnapshotRepository.findById(
      new Iri(newSnapshotIdRequestParam),
    );
    return res.json(
      ConceptSnapshot.isFunctionallyChanged(
        currentConceptSnapshot,
        newConceptSnapshot,
      ),
    );
  } else {
    throw new InvariantError("Geef 2 snapshots op om te vergelijken");
  }
}

startProcessingTask(
  "instance-snapshot-processor",
  () => instanceSnapshotProcessorApplicationService.process(),
  INSTANCE_SNAPSHOT_PROCESSING_CRON_PATTERN,
);
startProcessingTask(
  "concept-snapshot-processor",
  () => conceptSnapshotProcessorApplicationService.process(),
  CONCEPT_SNAPSHOT_PROCESSING_CRON_PATTERN,
);

function startProcessingTask(
  description: string,
  task: () => Promise<void>,
  cronPattern: string,
) {
  let taskIsRunning = false;
  new CronJob(
    cronPattern, // cronTime
    () => {
      if (taskIsRunning) {
        console.log(`${description} already running - skipping`);
        return;
      }
      taskIsRunning = true;
      task()
        .catch((e) => console.error(`${description} failed`, e))
        .finally(() => (taskIsRunning = false));
    }, // onTick
    null, // onComplete
    true, // start
    "Europe/Brussels", // timeZone
  );
}
