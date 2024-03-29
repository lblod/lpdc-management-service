import {createApp} from './mu-helper';
import bodyparser from 'body-parser';
import {
    CONCEPT_SNAPSHOT_LDES_GRAPH,
    INSTANCE_SNAPSHOT_PROCESSING_CRON_PATTERN,
    LOG_INCOMING_DELTA
} from './config';
import {ProcessingQueue} from './lib/processing-queue';
import {contactPointOptions} from "./lib/contactPointOptions";
import {fetchMunicipalities, fetchStreets, findAddressMatch} from "./lib/address";
import {SessionSparqlRepository} from "./src/driven/persistence/session-sparql-repository";
import {BestuurseenheidSparqlRepository} from "./src/driven/persistence/bestuurseenheid-sparql-repository";
import {ConceptSnapshotSparqlRepository} from "./src/driven/persistence/concept-snapshot-sparql-repository";
import {ConceptSnapshot} from "./src/core/domain/concept-snapshot";
import {ConceptSparqlRepository} from "./src/driven/persistence/concept-sparql-repository";
import {Iri} from "./src/core/domain/shared/iri";
import {flatten} from "lodash";
import {
    ConceptSnapshotToConceptMergerDomainService
} from "./src/core/domain/concept-snapshot-to-concept-merger-domain-service";
import {
    ConceptDisplayConfigurationSparqlRepository
} from "./src/driven/persistence/concept-display-configuration-sparql-repository";
import {
    BestuurseenheidRegistrationCodeThroughSubjectPageOrApiFetcher
} from "./src/driven/external/bestuurseenheid-registration-code-through-subject-page-or-api-fetcher";
import {CodeSparqlRepository} from "./src/driven/persistence/code-sparql-repository";
import {InstanceSparqlRepository} from "./src/driven/persistence/instance-sparql-repository";
import {NewInstanceDomainService} from "./src/core/domain/new-instance-domain-service";
import {Session} from "./src/core/domain/session";
import {authenticateAndAuthorizeRequest} from "./src/driving/sessions";
import {FormDefinitionFileRepository} from "./src/driven/persistence/form-definition-file-repository";
import {SelectFormLanguageDomainService} from "./src/core/domain/select-form-language-domain-service";
import {FormalInformalChoiceSparqlRepository} from "./src/driven/persistence/formal-informal-choice-sparql-repository";
import {FormApplicationService} from "./src/core/application/form-application-service";
import {Bestuurseenheid} from "./src/core/domain/bestuurseenheid";
import {DeleteInstanceDomainService} from "./src/core/domain/delete-instance-domain-service";
import {LinkConceptToInstanceDomainService} from "./src/core/domain/link-concept-to-instance-domain-service";
import {ConfirmBijgewerktTotDomainService} from "./src/core/domain/confirm-bijgewerkt-tot-domain-service";
import {UpdateInstanceApplicationService} from "./src/core/application/update-instance-application-service";
import {SemanticFormsMapperImpl} from "./src/driven/persistence/semantic-forms-mapper-impl";
import {
    InstanceSnapshotProcessorApplicationService
} from "./src/core/application/instance-snapshot-processor-application-service";
import {InstanceSnapshotSparqlRepository} from "./src/driven/persistence/instance-snapshot-sparql-repository";
import {
    InstanceSnapshotToInstanceMergerDomainService
} from "./src/core/domain/instance-snapshot-to-instance-merger-domain-service";
import {CronJob} from 'cron';
import {
    EnsureLinkedAuthoritiesExistAsCodeListDomainService
} from "./src/core/domain/ensure-linked-authorities-exist-as-code-list-domain-service";
import {Application, Request, Response} from "express";
import errorHandler from './src/driving/error-handler';
import {NotFound} from './src/driving/http-error';
import {InvariantError} from "./src/core/domain/shared/lpdc-error";
import {
    ValidateInstanceForPublishApplicationService
} from "./src/core/application/validate-instance-for-publish-application-service";
import {FormType} from "./src/core/domain/types";

const LdesPostProcessingQueue = new ProcessingQueue('LdesPostProcessingQueue');

//TODO: The original bodyparser is configured to only accept 'application/vnd.api+json'
//      The current endpoint(s) don't work with json:api. Also we need both types, as e.g. deltanotifier doesn't
//      send its data as such.
const app: Application = createApp();

const bodySizeLimit = process.env.MAX_BODY_SIZE || '5Mb';
app.use(bodyparser.json({limit: bodySizeLimit}));

const sessionRepository = new SessionSparqlRepository();
const bestuurseenheidRepository = new BestuurseenheidSparqlRepository();
const conceptSnapshotRepository = new ConceptSnapshotSparqlRepository();
const conceptRepository = new ConceptSparqlRepository();
const conceptDisplayConfigurationRepository = new ConceptDisplayConfigurationSparqlRepository();
const bestuurseenheidRegistrationCodeFetcher = new BestuurseenheidRegistrationCodeThroughSubjectPageOrApiFetcher();
const codeRepository = new CodeSparqlRepository();
const instanceRepository = new InstanceSparqlRepository();
const formDefinitionRepository = new FormDefinitionFileRepository();
const formalInformalChoiceRepository = new FormalInformalChoiceSparqlRepository();
const semanticFormsMapper = new SemanticFormsMapperImpl();
const instanceSnapshotRepository = new InstanceSnapshotSparqlRepository();

const linkedAuthorityCodeListDomainService = new EnsureLinkedAuthoritiesExistAsCodeListDomainService(
    bestuurseenheidRegistrationCodeFetcher,
    codeRepository
);

const conceptSnapshotToConceptMergerDomainService =
    new ConceptSnapshotToConceptMergerDomainService(
        conceptSnapshotRepository,
        conceptRepository,
        conceptDisplayConfigurationRepository,
        linkedAuthorityCodeListDomainService,
        instanceRepository,
    );

const newInstanceDomainService =
    new NewInstanceDomainService(
        instanceRepository,
        formalInformalChoiceRepository,
        conceptDisplayConfigurationRepository
    );

const selectFormLanguageDomainService = new SelectFormLanguageDomainService(
    formalInformalChoiceRepository,
);

const deleteInstanceDomainService = new DeleteInstanceDomainService(
    instanceRepository,
    conceptDisplayConfigurationRepository
);

const formApplicationService = new FormApplicationService(
    conceptRepository,
    instanceRepository,
    formDefinitionRepository,
    codeRepository,
    selectFormLanguageDomainService,
    semanticFormsMapper,
);

const validateInstanceForPublishApplicationService = new ValidateInstanceForPublishApplicationService(
    formApplicationService,
    instanceRepository
);

const linkConceptToInstanceDomainService = new LinkConceptToInstanceDomainService(
    instanceRepository,
    conceptRepository,
    conceptDisplayConfigurationRepository
);

const confirmBijgewerktTotDomainService = new ConfirmBijgewerktTotDomainService(
    instanceRepository,
    conceptRepository,
    conceptSnapshotRepository
);

const updateInstanceApplicationService = new UpdateInstanceApplicationService(
    instanceRepository,
    semanticFormsMapper
);

const instanceSnapshotToInstanceMergerDomainService = new InstanceSnapshotToInstanceMergerDomainService(
    instanceSnapshotRepository,
    instanceRepository,
    conceptRepository,
    conceptDisplayConfigurationRepository,
    deleteInstanceDomainService,
    linkedAuthorityCodeListDomainService,
);

const instanceSnapshotProcessorApplicationService = new InstanceSnapshotProcessorApplicationService(
    instanceSnapshotRepository,
    instanceSnapshotToInstanceMergerDomainService,
    bestuurseenheidRepository,
);

app.get('/', function (_req, res): void {
    const message = `Hey there, you have reached the lpdc-management-service! Seems like I'm doing just fine, have a nice day! :)`;
    res.send(message);
});

app.post('/delta', async function (req, res): Promise<void> {
    try {
        const delta = req.body;

        if (LOG_INCOMING_DELTA)
            console.log(`Receiving delta ${JSON.stringify(delta)}`);

        LdesPostProcessingQueue
            .addJob(async () => {
                const newConceptSnapshotIds: Iri[] = flatten(delta.map(changeSet => changeSet.inserts))
                    .filter((t: any) => t?.graph.value === CONCEPT_SNAPSHOT_LDES_GRAPH && t?.subject?.value && t?.predicate.value == 'http://purl.org/dc/terms/isVersionOf')
                    .map((delta: any) => new Iri(delta.subject.value));
                for (const newConceptSnapshotId of newConceptSnapshotIds) {
                    await conceptSnapshotToConceptMergerDomainService.merge(newConceptSnapshotId);
                }
            });

        res.status(202).send();

    } catch (error) {
        console.error(error);
        res.status(500).send();
    }
});

app.use('/public-services/', async (req, res, next) => {
    await authenticateAndAuthorizeRequest(req, next, sessionRepository).catch(next);
});

app.post('/public-services/', async (req, res, next) => {
    await createInstance(req, res).catch(next);
});

app.get('/public-services/:instanceId/form/:formId', async function (req, res, next): Promise<any> {
    return await getInstanceForm(req, res).catch(next);
});

app.get('/public-services/:instanceId/dutch-language-version', async function (req, res, next): Promise<any> {
    return await getDutchLanguageVersionForInstance(req, res).catch(next);
});

app.delete('/public-services/:instanceId', async function (req, res, next): Promise<any> {
    return await removeInstance(req, res).catch(next);
});

app.put('/public-services/:instanceId', async function (req, res, next): Promise<any> {
    return await updateInstance(req, res).catch(next);
});

app.put('/public-services/:instanceId/koppelen/:conceptId', async function (req, res, next): Promise<any> {
    return await linkConceptToInstance(req, res).catch(next);
});

app.put('/public-services/:instanceId/ontkoppelen', async function (req, res, next): Promise<any> {
    return await unlinkConceptFromInstance(req, res).catch(next);
});

app.put('/public-services/:instanceId/reopen', async function (req, res, next): Promise<any> {
    return await reopenInstance(req, res).catch(next);
});

app.post('/public-services/:instanceId/confirm-bijgewerkt-tot', async function (req, res, next): Promise<any> {
    return await confirmBijgewerktTot(req, res).catch(next);
});

app.put('/public-services/:instanceId/validate-for-publish', async function (req, res, next): Promise<any> {
    return await validateForPublish(req, res).catch(next);
});

app.put('/public-services/:instanceId/publish', async function (req, res, next): Promise<any> {
    return await publishInstance(req, res).catch(next);
});

app.use('/conceptual-public-services/', async (req, res, next) => {
    await authenticateAndAuthorizeRequest(req, next, sessionRepository).catch(next);
});

app.get('/conceptual-public-services/:conceptId/dutch-language-version', async (req, res, next): Promise<any> => {
    return await getDutchLanguageVersionForConcept(req, res).catch(next);
});

app.get('/conceptual-public-services/:conceptId/form/:formId', async function (req, res, next): Promise<any> {
    return await getConceptForm(req, res).catch(next);
});

app.use('/concept-display-configuration/', async (req, res, next) => {
    await authenticateAndAuthorizeRequest(req, next, sessionRepository).catch(next);
});

app.put('/concept-display-configuration/:conceptDisplayConfigurationId/remove-is-new-flag', async function (req, res, next): Promise<any> {
    return await removeIsNewFlag(req, res).catch(next);
});

app.use('/contact-info-options/', async (req, res, next) => {
    await authenticateAndAuthorizeRequest(req, next, sessionRepository).catch(next);

});

app.get('/contact-info-options/:fieldName', async (req, res, next): Promise<any> => {
    return await getContactPointOptions(req, res).catch(next);
});

app.use('/address', async (req, res, next) => {
    await authenticateAndAuthorizeRequest(req, next, sessionRepository).catch(next);

});

app.get('/address/municipalities', async (req, res, next): Promise<any> => {
    return await getMunicipalities(req, res).catch(next);
});

app.get('/address/streets', async (req, res, next): Promise<any> => {
    return await getStreets(req, res).catch(next);
});

app.get('/address/validate', async (req, res, next): Promise<any> => {
    return await validateAddress(req, res).catch(next);
});

app.get('/concept-snapshot-compare', async (req, res, next): Promise<any> => {
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

    const session: Session = req['session'];

    const bestuurseenheid = await bestuurseenheidRepository.findById(session.bestuurseenheidId);
    if (conceptIdRequestParam) {
        const conceptId = new Iri(conceptIdRequestParam);
        const concept = await conceptRepository.findById(conceptId);
        const newInstance = await newInstanceDomainService.createNewFromConcept(bestuurseenheid, concept);
        return res.status(201).json({
            data: {
                "type": "public-service",
                "id": newInstance.uuid,
                "uri": newInstance.id.value
            }
        });
    } else {
        const newInstance = await newInstanceDomainService.createNewEmpty(bestuurseenheid);
        return res.status(201).json({
            data: {
                "type": "public-service",
                "id": newInstance.uuid,
                "uri": newInstance.id.value
            }
        });
    }
}

async function getInstanceForm(req: Request, res: Response) {
    const instanceIdRequestParam = req.params.instanceId;
    const formId = req.params.formId as FormType;

    const instanceId = new Iri(instanceIdRequestParam);
    const session: Session = req['session'];
    const bestuurseenheid = await bestuurseenheidRepository.findById(session.bestuurseenheidId);

    const bundle = await formApplicationService.loadInstanceForm(bestuurseenheid, instanceId, formId);
    return res.status(200).json(bundle);
}

async function getDutchLanguageVersionForInstance(req: Request, res: Response) {
    const instanceIdRequestParam = req.params.instanceId;
    const instanceId = new Iri(instanceIdRequestParam);
    const session: Session = req['session'];
    const bestuurseenheid = await bestuurseenheidRepository.findById(session.bestuurseenheidId);
    const instance = await instanceRepository.findById(bestuurseenheid, instanceId);

    const languageVersion = await selectFormLanguageDomainService.selectForInstance(instance, bestuurseenheid);
    return res.json({languageVersion: languageVersion});
}

async function removeInstance(req: Request, res: Response) {
    const instanceIdRequestParam = req.params.instanceId;

    const instanceId = new Iri(instanceIdRequestParam);
    const session: Session = req['session'];
    const bestuurseenheid: Bestuurseenheid = await bestuurseenheidRepository.findById(session.bestuurseenheidId);

    await deleteInstanceDomainService.delete(bestuurseenheid, instanceId);
    return res.sendStatus(204);
}

async function updateInstance(req: Request, res: Response) {
    const instanceIdRequestParam = req.params.instanceId;
    const delta = req.body;

    const instanceId = new Iri(instanceIdRequestParam);
    const session: Session = req['session'];
    const bestuurseenheid = await bestuurseenheidRepository.findById(session.bestuurseenheidId);
    const instanceData = delta.graph;

    await updateInstanceApplicationService.update(bestuurseenheid, instanceId, instanceData, delta.removals, delta.additions);

    return res.sendStatus(200);
}

async function linkConceptToInstance(req: Request, res: Response) {
    const instanceIdRequestParam = req.params.instanceId;
    const conceptIdRequestParam = req.params.conceptId;

    const instanceId = new Iri(instanceIdRequestParam);
    const conceptId = new Iri(conceptIdRequestParam);
    const session: Session = req['session'];
    const bestuurseenheid: Bestuurseenheid = await bestuurseenheidRepository.findById(session.bestuurseenheidId);
    const instance = await instanceRepository.findById(bestuurseenheid, instanceId);
    const concept = await conceptRepository.findById(conceptId);

    await linkConceptToInstanceDomainService.link(bestuurseenheid, instance, concept);
    return res.sendStatus(200);
}

async function unlinkConceptFromInstance(req: Request, res: Response) {
    const instanceIdRequestParam = req.params.instanceId;

    const instanceId = new Iri(instanceIdRequestParam);
    const session: Session = req['session'];
    const bestuurseenheid: Bestuurseenheid = await bestuurseenheidRepository.findById(session.bestuurseenheidId);
    const instance = await instanceRepository.findById(bestuurseenheid, instanceId);

    await linkConceptToInstanceDomainService.unlink(bestuurseenheid, instance);
    return res.sendStatus(200);
}

async function reopenInstance(req: Request, res: Response) {
    const instanceIdRequestParam = req.params.instanceId;
    const instanceId = new Iri(instanceIdRequestParam);
    const session: Session = req['session'];
    const bestuurseenheid: Bestuurseenheid = await bestuurseenheidRepository.findById(session.bestuurseenheidId);

    const instance = await instanceRepository.findById(bestuurseenheid, instanceId);
    const updatedInstance = instance.reopen();
    await instanceRepository.update(bestuurseenheid, updatedInstance, instance);

    return res.sendStatus(200);
}

async function confirmBijgewerktTot(req: Request, res: Response) {
    const instanceIdRequestParam = req.params.instanceId;
    const conceptSnapshotIdRequestParam = req.body.bijgewerktTot;

    const instanceId = new Iri(instanceIdRequestParam);
    const conceptSnapshotId = new Iri(conceptSnapshotIdRequestParam);
    const session: Session = req['session'];
    const bestuurseenheid: Bestuurseenheid = await bestuurseenheidRepository.findById(session.bestuurseenheidId);
    const instance = await instanceRepository.findById(bestuurseenheid, instanceId);
    const conceptSnapshot = await conceptSnapshotRepository.findById(conceptSnapshotId);
    await confirmBijgewerktTotDomainService.confirmBijgewerktTot(bestuurseenheid, instance, conceptSnapshot);
    return res.sendStatus(200);
}


async function validateForPublish(req: Request, res: Response) {
    const instanceIdRequestParam = req.params.instanceId;

    const instanceId = new Iri(instanceIdRequestParam);
    const session: Session = req['session'];
    const bestuurseenheid = await bestuurseenheidRepository.findById(session.bestuurseenheidId);

    const errors = await validateInstanceForPublishApplicationService.validate(instanceId, bestuurseenheid);

    return res.status(200).json(errors);
}

async function publishInstance(req: Request, res: Response) {
    const instanceIdRequestParam = req.params.instanceId;

    const instanceId = new Iri(instanceIdRequestParam);
    const session: Session = req['session'];
    const bestuurseenheid = await bestuurseenheidRepository.findById(session.bestuurseenheidId);

    const errors = await validateInstanceForPublishApplicationService.validate(instanceId, bestuurseenheid);
    if(errors.length > 0) {
        throw new InvariantError('Instantie niet geldig om te publiceren');
    }

    const instance = await instanceRepository.findById(bestuurseenheid, instanceId);
    const updatedInstance = instance.publish();
    await instanceRepository.update(bestuurseenheid, updatedInstance, instance);
    return res.sendStatus(200);
}

async function getDutchLanguageVersionForConcept(req: Request, res: Response) {
    const conceptIdRequestParam = req.params.conceptId;

    const conceptId = new Iri(conceptIdRequestParam);
    const session: Session = req['session'];
    const bestuurseenheid = await bestuurseenheidRepository.findById(session.bestuurseenheidId);
    const concept = await conceptRepository.findById(conceptId);

    const languageVersion = await selectFormLanguageDomainService.selectForConcept(concept, bestuurseenheid);
    return res.json({languageVersion: languageVersion});
}

async function getConceptForm(req: Request, res: Response) {
    const conceptIdRequestParam = req.params.conceptId;
    const formId = req.params["formId"] as FormType;

    const conceptId = new Iri(conceptIdRequestParam);
    const session: Session = req['session'];
    const bestuurseenheid = await bestuurseenheidRepository.findById(session.bestuurseenheidId);
    const bundle = await formApplicationService.loadConceptForm(bestuurseenheid, conceptId, formId);

    return res.status(200).json(bundle);

}

async function removeIsNewFlag(req: Request, res: Response) {
    const conceptDisplayConfigurationIdRequestParam = req.params.conceptDisplayConfigurationId;

    const conceptDisplayConfigurationId = new Iri(conceptDisplayConfigurationIdRequestParam);
    const session: Session = req['session'];
    const bestuurseenheid = await bestuurseenheidRepository.findById(session.bestuurseenheidId);

    await conceptDisplayConfigurationRepository.removeConceptIsNewFlag(bestuurseenheid, conceptDisplayConfigurationId);
    return res.status(200).send();
}

async function getContactPointOptions(req: Request, res: Response) {
    const result = await contactPointOptions(req.params.fieldName);
    return res.json(result);
}

async function getMunicipalities(req: Request, res: Response) {
    const municipalities = await fetchMunicipalities(req.query.search as string);
    return res.json(municipalities);
}

async function getStreets(req: Request, res: Response) {
    const streets = await fetchStreets(req.query.municipality as string, req.query.search as string);
    return res.json(streets);
}

async function validateAddress(req: Request, res: Response) {

    const address = await findAddressMatch(
        req.query.municipality as string,
        req.query.street as string,
        req.query.houseNumber as string,
        req.query.busNumber as string
    );
    return res.json(address);
}

async function compareSnapshots(req: Request, res: Response) {
    const currentConceptSnapshot = await conceptSnapshotRepository.findById(new Iri(req.query.currentSnapshotUri as string));
    const newConceptSnapshot = await conceptSnapshotRepository.findById(new Iri(req.query.newSnapshotUri as string));

    const isChanged = ConceptSnapshot.isFunctionallyChanged(currentConceptSnapshot, newConceptSnapshot);

    return res.json({isChanged});

}

new CronJob(
    INSTANCE_SNAPSHOT_PROCESSING_CRON_PATTERN, // cronTime
    () => {
        instanceSnapshotProcessorApplicationService.process()
            .catch((reason) => console.error(`instance-snapshot-processing failed ${reason}`));
    }, // onTick
    null, // onComplete
    true, // start
    'Europe/Brussels' // timeZone
);
