import { app, errorHandler, uuid } from 'mu';
import { createForm } from './lib/createForm';
import { getForm } from './lib/getForm';
import { updateForm } from './lib/updateForm';

app.get('/', function(req, res) {
  const message = `Hey there, you have reached the lpdc-management-service! Seems like I\'m doing just fine, have a nice day! :)`;
  res.send(message);
});

app.post('/semantic-forms/', async function(req, res) {
  const body = req.body;
  const publicServiceId = body?.data?.relationships?.["concept"]?.data?.id;

  if (!publicServiceId) return res.status(400).json({
    "errors": [
      {
        "status": "400",
        "detail": "body seems to be invalid. Could not find the conceptual-public-service uri"
      }
    ]
  });
  
  try {
    const { uuid, uri } = await createForm(publicServiceId);
    return res.status(201).json({
      data: {
        "type": "public-service",
        "id": uuid,
        "uri": uri
      }
    })
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

app.get('/semantic-forms/:publicServiceId/form/:formId', async function(req, res) {

  const publicServiceId = req.params["publicServiceId"];
  const formId = req.params["formId"];
  
  try {
    const bundle = await getForm(publicServiceId, formId);

    return res.status(201).json(bundle)
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

app.put('/semantic-forms/:formId', async function(req, res) {

  const formId = req.params.formId;
  const delta = req.body;
  try {
    await updateForm(formId, delta);
    return res.status(201).json("")
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

app.delete('/semantic-forms/:formId', async function(req, res) {
  const formId = req.params.formId;
  try {
    await deleteForm(formId);
    return res.status(204).send();
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

app.use(errorHandler);