import {createApp, errorHandler, uuid} from './mu-helper';
import bodyparser from 'body-parser';
import {CONCEPT_SNAPSHOT_LDES_GRAPH, FEATURE_FLAG_ATOMIC_UPDATE, LOG_INCOMING_DELTA} from './config';
import {createForm} from './lib/createForm';
import {retrieveForm} from './lib/retrieveForm';
import {updateForm, updateFormAtomic} from './lib/updateForm';
import {deleteForm} from './lib/deleteForm';
import {validateService} from './lib/validateService';
import {ProcessingQueue} from './lib/processing-queue';
import {getLanguageVersionOfConcept} from "./lib/getConceptLanguageVersion";
import {getContactPointOptions} from "./lib/getContactPointOptions";
import {fetchMunicipalities, fetchStreets, findAddressMatch} from "./lib/address";
import {linkConcept, unlinkConcept} from "./lib/linkUnlinkConcept";
import {getLanguageVersionOfInstance} from "./lib/getInstanceLanguageVersion";
import {confirmBijgewerktTot} from "./lib/confirm-bijgewerkt-tot";
import LPDCError from "./utils/lpdc-error";
import {SessionSparqlRepository} from "./src/driven/persistence/session-sparql-repository";
import {BestuurseenheidSparqlRepository} from "./src/driven/persistence/bestuurseenheid-sparql-repository";
import {ConceptSnapshotSparqlRepository} from "./src/driven/persistence/concept-snapshot-sparql-repository";
import {ConceptSnapshot} from "./src/core/domain/concept-snapshot";
import {ConceptSparqlRepository} from "./src/driven/persistence/concept-sparql-repository";
import {Iri} from "./src/core/domain/shared/iri";
import {flatten} from "lodash";
import {
    NewConceptSnapshotToConceptMergerDomainService
} from "./src/core/domain/new-concept-snapshot-to-concept-merger-domain-service";
import {
    ConceptDisplayConfigurationSparqlRepository
} from "./src/driven/persistence/concept-display-configuration-sparql-repository";
import {
    BestuurseenheidRegistrationCodeThroughSubjectPageOrApiFetcher
} from "./src/driven/external/bestuurseenheid-registration-code-through-subject-page-or-api-fetcher";
import {CodeSparqlRepository} from "./src/driven/persistence/code-sparql-repository";
import {InstanceSparqlRepository} from "./src/driven/persistence/instance-sparql-repository";
import {NewInstanceDomainService} from "./src/core/domain/new-instance-domain-service";

const LdesPostProcessingQueue = new ProcessingQueue('LdesPostProcessingQueue');

//TODO: The original bodyparser is configured to only accept 'application/vnd.api+json'
//      The current endpoint(s) don't work with json:api. Also we need both types, as e.g. deltanotifier doesn't
//      send its data as such.
const app = createApp();
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

const newConceptSnapshotToConceptMergerDomainService =
    new NewConceptSnapshotToConceptMergerDomainService(
        conceptSnapshotRepository,
        conceptRepository,
        conceptDisplayConfigurationRepository,
        bestuurseenheidRegistrationCodeFetcher,
        codeRepository,
        instanceRepository);

const newInstanceDomainService =
    new NewInstanceDomainService(
        instanceRepository
    );

app.get('/', function (req, res): void {
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
                    await newConceptSnapshotToConceptMergerDomainService.merge(newConceptSnapshotId);
                }
            });

        res.status(202).send();

    } catch (error) {
        console.error(error);
        res.status(500).send();
    }
});

app.post('/semantic-forms/:publicServiceId/submit', async function (req, res): Promise<any> {

    const publicServiceId = req.params["publicServiceId"];

    try {
        const response = await validateService(publicServiceId);

        if (response.errors.length) {
            return res.status(400).json({
                data: response,
            });
        } else {
            return res.status(200).json({
                data: response,
            });
        }

    } catch (e) {
        console.error(e);
        const response = {
            status: 500,
            message: `Unexpected error during validation  of service "${publicServiceId}".`
        };
        return res.status(response.status).set('content-type', 'application/json').send(response.message);
    }

});

app.post('/public-services/', async function (req, res): Promise<any> {
    const body = req.body;
    const conceptId = body?.data?.relationships?.["concept"]?.data?.id;
    const sessionUri = req.headers['mu-session-id'] as string;

    //TODO LPDC-917: verify access rights. only logged in users that have access to lpdc can execute this command ...

    try {
        if(conceptId) {
            const {uuid, uri} = await createForm(conceptId, sessionUri, sessionRepository, bestuurseenheidRepository);
            return res.status(201).json({
                data: {
                    "type": "public-service",
                    "id": uuid,
                    "uri": uri
                }
            });
        } else {
            const session = await sessionRepository.findById(new Iri(sessionUri));
            const bestuurseenheid = await bestuurseenheidRepository.findById(session.bestuurseenheidId);

            const newInstance = await newInstanceDomainService.createNewEmpty(bestuurseenheid);
            return res.status(201).json({
                data: {
                    "type": "public-service",
                    "id": newInstance.uuid,
                    "uri": newInstance.id.value
                }
            });
        }
    } catch (e) {
        console.error(e);
        if (e.status) {
            return res.status(e.status).set('content-type', 'application/json').send(e);
        }
        const response = {
            status: 500,
            message: `Something unexpected went wrong while submitting semantic-form for "${uuid}".`
        };
        return res.status(response.status).set('content-type', 'application/json').send(response.message);
    }
});

app.get('/semantic-forms/:publicServiceId/form/:formId', async function (req, res): Promise<any> {
    const publicServiceId = req.params["publicServiceId"];
    const formId = req.params["formId"];

    try {
        const bundle = await retrieveForm(publicServiceId, formId);

        return res.status(200).json(bundle);
    } catch (e) {
        console.error(e);
        if (e.status) {
            return res.status(e.status).set('content-type', 'application/json').send(e);
        }
        const response = {
            status: 500,
            message: `Something unexpected went wrong while submitting semantic-form for "${publicServiceId}".`
        };
        return res.status(response.status).set('content-type', 'application/json').send(response.message);
    }
});

app.put('/semantic-forms/:publicServiceId/form/:formId', async function (req, res): Promise<any> {
    const delta = req.body;
    const header = req.headers['mu-session-id'] as string;

    try {
        FEATURE_FLAG_ATOMIC_UPDATE ? await updateFormAtomic(delta, header, sessionRepository, bestuurseenheidRepository) : await updateForm(delta, header, sessionRepository, bestuurseenheidRepository);
        return res.sendStatus(200);
    } catch (e) {
        console.error(e);
        if (e instanceof LPDCError) {
            return res.status(e.status).set('content-type', 'application/json').json(e);
        } else {
            return res
                .status(500)
                .set('content-type', 'application/json')
                .json(new LPDCError(
                    500,
                    `Er is een serverfout opgetreden. Probeer het later opnieuw of neem contact op indien het probleem aanhoudt. Onze excuses voor het ongemak.`
                ));
        }
    }
});

app.delete('/public-services/:publicServiceId', async function (req, res): Promise<any> {
    const publicServiceId = req.params.publicServiceId;
    const header = req.headers['mu-session-id'] as string;
    try {
        await deleteForm(publicServiceId, header, sessionRepository, bestuurseenheidRepository);
        return res.sendStatus(204);
    } catch (e) {
        console.error(e);
        if (e.status) {
            return res.status(e.status).set('content-type', 'application/json').send(e);
        }
        const response = {
            status: 500,
            message: `Something unexpected went wrong while deleting the semantic-form for "${publicServiceId}".`
        };
        return res.status(response.status).set('content-type', 'application/json').send(response.message);
    }

});

app.put('/public-services/:publicServiceId/ontkoppelen', async function (req, res): Promise<any> {
    const instanceUUID = req.params.publicServiceId;
    try {
        await unlinkConcept(instanceUUID);
        return res.sendStatus(200);
    } catch (e) {
        console.error(e);
        if (e.status) {
            return res.status(e.status).set('content-type', 'application/json').send(e);
        }
        const response = {
            status: 500,
            message: `Something unexpected went wrong while ontkoppelen concept from  "${instanceUUID}".`
        };
        return res.status(response.status).set('content-type', 'application/json').send(response.message);
    }
});

app.get('/public-services/:publicServiceId/language-version', async function (req, res): Promise<any> {
    const instanceUUID = req.params.publicServiceId;
    try {
        const languageVersion = await getLanguageVersionOfInstance(instanceUUID);
        return res.json({languageVersion: languageVersion});
    } catch (e) {
        console.error(e);
        const response = {
            status: 500,
            message: `Something unexpected went wrong while getting language version for concept with uuid "${instanceUUID}".`
        };
        return res.status(response.status).set('content-type', 'application/json').send(response.message);
    }
});

app.post('/public-services/:publicServiceId/confirm-bijgewerkt-tot', async function (req, res): Promise<any> {
    const instanceUUID = req.params.publicServiceId;
    try {
        await confirmBijgewerktTot(instanceUUID, req.body.bijgewerktTot);
        return res.sendStatus(200);
    } catch (e) {
        console.error(e);
        const response = {
            status: 500,
            message: `Something unexpected went wrong while confirming bijgewerkt tot with uuid "${instanceUUID}".`
        };
        return res.status(response.status).set('content-type', 'application/json').send(response.message);
    }
});

app.put('/public-services/:publicServiceId/koppelen/:conceptId', async function (req, res): Promise<any> {
    const instanceUUID = req.params.publicServiceId;
    try {
        const conceptId = req.params.conceptId;
        await linkConcept(instanceUUID, conceptId);
        return res.sendStatus(200);
    } catch (e) {
        console.error(e);
        const response = {
            status: 500,
            message: `Something unexpected went wrong while koppelen of uuid "${instanceUUID}".`
        };
        return res.status(response.status).set('content-type', 'application/json').send(response.message);
    }
});

app.get('/conceptual-public-services/:conceptualPublicServiceId/language-version', async (req, res): Promise<any> => {
    try {
        const languageVersion = await getLanguageVersionOfConcept(req.params.conceptualPublicServiceId, conceptRepository);
        return res.json({languageVersion: languageVersion});
    } catch (e) {
        console.error(e);
        if (e.status) {
            return res.status(e.status).set('content-type', 'application/json').send(e);
        }
        const response = {
            status: 500,
            message: `Something unexpected went wrong while getting language version for concept with uuid "${uuid}".`
        };
        return res.status(response.status).set('content-type', 'application/json').send(response.message);
    }
});

app.get('/contact-info-options/:fieldName', async (req, res): Promise<any> => {
    try {
        const result = await getContactPointOptions(req.params.fieldName);
        return res.json(result);
    } catch (e) {
        console.error(e);
        if (e.message === 'Invalid request: not a valid field name') {
            return res.status(400).set('content-type', 'application/json').send('Invalid request: not a valid field name');
        } else {
            console.error(e);
            const response = {
                status: 500,
                message: `Something unexpected went wrong while getting contactInfo options".`
            };
            return res.status(response.status).set('content-type', 'application/json').send(response.message);
        }
    }
});

app.get('/address/municipalities', async (req, res): Promise<any> => {
    try {
        const municipalities = await fetchMunicipalities(req.query.search as string);
        return res.json(municipalities);
    } catch (e) {
        console.error(e);
        const response = {
            status: 500,
            message: `Something unexpected went wrong while getting municipalities.`
        };
        return res.status(response.status).set('content-type', 'application/json').send(response.message);
    }
});

app.get('/address/streets', async (req, res): Promise<any> => {
    try {
        const streets = await fetchStreets(req.query.municipality as string, req.query.search as string);
        return res.json(streets);
    } catch (e) {
        console.error(e);
        const response = {
            status: 500,
            message: `Something unexpected went wrong while getting streets.`
        };
        return res.status(response.status).set('content-type', 'application/json').send(response.message);
    }
});

app.get('/address/validate', async (req, res): Promise<any> => {
    try {
        const address = await findAddressMatch(
            req.query.municipality as string,
            req.query.street as string,
            req.query.houseNumber as string,
            req.query.busNumber as string
        );
        return res.json(address);
    } catch (e) {
        console.error(e);
        if (e.message === 'Invalid request: municipality, street and houseNumber are required') {
            return res.status(400).set('content-type', 'application/json').send({message: 'Invalid request: municipality, street and houseNumber are required'});
        }
        const response = {
            status: 500,
            message: `Something unexpected went wrong while getting streets.`
        };
        return res.status(response.status).set('content-type', 'application/json').send(response.message);
    }
});

app.get('/concept-snapshot-compare', async (req, res): Promise<any> => {
    try {
        const currentConceptSnapshot = await conceptSnapshotRepository.findById(new Iri(req.query.currentSnapshotUri as string));
        const newConceptSnapshot = await conceptSnapshotRepository.findById(new Iri(req.query.newSnapshotUri as string));

        const isChanged = ConceptSnapshot.isFunctionallyChanged(currentConceptSnapshot, newConceptSnapshot);

        return res.json({isChanged});
    } catch (e) {
        console.error(e);
        return res.status(500).set('content-type', 'application/json').send('Something unexpected went wrong');
    }
});

app.use(errorHandler);
