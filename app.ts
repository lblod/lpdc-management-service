import {createApp, errorHandler, uuid} from './mu-helper';
import bodyparser from 'body-parser';
import {FEATURE_FLAG_ATOMIC_UPDATE, LOG_INCOMING_DELTA} from './config';
import {createEmptyForm, createForm} from './lib/createForm';
import {retrieveForm} from './lib/retrieveForm';
import {updateForm, updateFormAtomic} from './lib/updateForm';
import {deleteForm} from './lib/deleteForm';
import {validateService} from './lib/validateService';
import {ProcessingQueue} from './lib/processing-queue';
import {processLdesDelta} from './lib/postProcessLdesConceptualService';
import {bestuurseenheidForSession} from './utils/session-utils';
import {getLanguageVersionOfConcept} from "./lib/getConceptLanguageVersion";
import {getContactPointOptions} from "./lib/getContactPointOptions";
import {fetchMunicipalities, fetchStreets, findAddressMatch} from "./lib/address";
import {isConceptFunctionallyChanged} from "./lib/compareSnapshot";
import {linkConcept, unlinkConcept} from "./lib/linkUnlinkConcept";
import {getLanguageVersionOfInstance} from "./lib/getInstanceLanguageVersion";
import {confirmBijgewerktTot} from "./lib/confirm-bijgewerkt-tot";
import LPDCError from "./utils/lpdc-error";

const LdesPostProcessingQueue = new ProcessingQueue('LdesPostProcessingQueue');

//TODO: The original bodyparser is configured to only accept 'application/vnd.api+json'
//      The current endpoint(s) don't work with json:api. Also we need both types, as e.g. deltanotifier doesn't
//      send its data as such.
const app = createApp();
const bodySizeLimit = process.env.MAX_BODY_SIZE || '5Mb';
app.use(bodyparser.json({limit: bodySizeLimit}));

app.get('/', function (req, res): void {
    const message = `Hey there, you have reached the lpdc-management-service! Seems like I'm doing just fine, have a nice day! :)`;
    res.send(message);
});

app.post('/delta', async function (req, res): Promise<void> {
    try {
        const body = req.body;

        if (LOG_INCOMING_DELTA)
            console.log(`Receiving delta ${JSON.stringify(body)}`);

        LdesPostProcessingQueue
            .addJob(async () => {
                return await processLdesDelta(body);
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
    const publicServiceId = body?.data?.relationships?.["concept"]?.data?.id;
    const sessionUri = req.headers['mu-session-id'] as string;
    if (!publicServiceId) {
        try {
            const bestuurseenheidData = await bestuurseenheidForSession(sessionUri);
            const {uuid, uri} = await createEmptyForm(bestuurseenheidData.bestuurseenheid);

            return res.status(201).json({
                data: {
                    "type": "public-service",
                    "id": uuid,
                    "uri": uri
                }
            });
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
    } else {
        try {
            const bestuurseenheidData = await bestuurseenheidForSession(sessionUri);
            const {uuid, uri} = await createForm(publicServiceId, bestuurseenheidData.bestuurseenheid);

            return res.status(201).json({
                data: {
                    "type": "public-service",
                    "id": uuid,
                    "uri": uri
                }
            });
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
        FEATURE_FLAG_ATOMIC_UPDATE ? await updateFormAtomic(delta, header) : await updateForm(delta, header);
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
        await deleteForm(publicServiceId, header);
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
        const languageVersion = await getLanguageVersionOfConcept(req.params.conceptualPublicServiceId);
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
        const isChanged = await isConceptFunctionallyChanged(req.query.newSnapshotUri as string, req.query.currentSnapshotUri as string);
        return res.json({isChanged});
    } catch (e) {
        console.error(e);
        return res.status(500).set('content-type', 'application/json').send('Something unexpected went wrong');
    }
});

app.use(errorHandler);
