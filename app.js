import {app, errorHandler, uuid} from 'mu';
import bodyparser from 'body-parser';
import {LOG_INCOMING_DELTA} from './config';
import {createEmptyForm, createForm} from './lib/createForm';
import {retrieveForm} from './lib/retrieveForm';
import {updateForm} from './lib/updateForm';
import {deleteForm} from './lib/deleteForm';
import {validateService} from './lib/validateService';
import {ProcessingQueue} from './lib/processing-queue';
import {processLdesDelta} from './lib/postProcessLdesConceptualService';
import {bestuurseenheidForSession} from './utils/session-utils';
import {getLanguageVersionOfConcept} from "./lib/getConceptLanguageVersion";
import {getContactPointOptions} from "./lib/getContactPointOptions";
import {fetchMunicipalities, fetchStreets, findAddressMatch} from "./lib/address";
import {isConceptFunctionallyChanged} from "./lib/compareSnapshot";
import {unlinkConcept} from "./lib/linkUnlinkConcept";

const LdesPostProcessingQueue = new ProcessingQueue('LdesPostProcessingQueue');

//TODO: The original bodyparser is configured to only accept 'application/vnd.api+json'
//      The current endpoint(s) don't work with json:api. Also we need both types, as e.g. deltanotifier doesn't
//      send its data as such.
const bodySizeLimit = process.env.MAX_BODY_SIZE || '5Mb';
app.use(bodyparser.json({limit: bodySizeLimit}));

app.get('/', function (req, res) {
    const message = `Hey there, you have reached the lpdc-management-service! Seems like I'm doing just fine, have a nice day! :)`;
    res.send(message);
});

app.post('/delta', async function (req, res) {
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

app.post('/semantic-forms/:publicServiceId/submit', async function (req, res) {

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

app.post('/public-services/', async function (req, res) {
    const body = req.body;
    const publicServiceId = body?.data?.relationships?.["concept"]?.data?.id;
    const sessionUri = req.headers['mu-session-id'];
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

app.get('/semantic-forms/:publicServiceId/form/:formId', async function (req, res) {
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
            message: `Something unexpected went wrong while submitting semantic-form for "${uuid}".`
        };
        return res.status(response.status).set('content-type', 'application/json').send(response.message);
    }
});

app.put('/semantic-forms/:publicServiceId/form/:formId', async function (req, res) {
    const delta = req.body;
    try {
        await updateForm(delta, req.headers['mu-session-id']);
        return res.sendStatus(200);
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

app.delete('/public-services/:publicServiceId', async function (req, res) {
    const publicServiceId = req.params.publicServiceId;
    try {
        await deleteForm(publicServiceId, req.headers['mu-session-id']);
        return res.sendStatus(204);
    } catch (e) {
        console.error(e);
        if (e.status) {
            return res.status(e.status).set('content-type', 'application/json').send(e);
        }
        const response = {
            status: 500,
            message: `Something unexpected went wrong while deleting the semantic-form for "${uuid}".`
        };
        return res.status(response.status).set('content-type', 'application/json').send(response.message);
    }

});

app.put('/public-services/:publicServiceId/ontkoppelen', async function (req, res) {
    const publicServiceId = req.params.publicServiceId;
    await unlinkConcept(publicServiceId);
    return res.sendStatus(200);
});

app.get('/conceptual-public-services/:conceptualPublicServiceId/language-version', async (req, res) => {
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

app.get('/contact-info-options/:fieldName', async (req, res) => {
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

app.get('/address/municipalities', async (req, res) => {
    try {
        const municipalities = await fetchMunicipalities(req.query.search);
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

app.get('/address/streets', async (req, res) => {
    try {
        const streets = await fetchStreets(req.query.municipality, req.query.search);
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

app.get('/address/validate', async (req, res) => {
    try {
        const address = await findAddressMatch(
            req.query.municipality,
            req.query.street,
            req.query.houseNumber,
            req.query.busNumber
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

app.get('/concept-snapshot-compare', async (req, res) => {
    try {
        const isChanged = await isConceptFunctionallyChanged(req.query.newSnapshotUri, req.query.currentSnapshotUri);
        return res.json({isChanged});
    } catch (e) {
        console.error(e);
        return res.status(500).set('content-type', 'application/json').send('Something unexpected went wrong');
    }
});

app.use(errorHandler);
