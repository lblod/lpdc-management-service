import { app, errorHandler, uuid } from 'mu';
import bodyparser from 'body-parser';
import { createForm, createEmptyForm } from './lib/createForm';
import { retrieveForm } from './lib/retrieveForm';
import { updateForm } from './lib/updateForm';
import { deleteForm } from './lib/deleteForm';
import { validateService } from './lib/validateService';

app.use(bodyparser.json());

app.get('/', function(req, res) {
  const message = `Hey there, you have reached the lpdc-management-service! Seems like I'm doing just fine, have a nice day! :)`;
  res.send(message);
});

app.post('/semantic-forms/:publicServiceId/submit', async function(req, res) {
  const response = await validateService(req.params["publicServiceId"]);
  return res.status(201).json({
    data: response
  });
});

app.post('/public-services/', async function(req, res) {
  const body = req.body;
  const publicServiceId = body?.data?.relationships?.["concept"]?.data?.id;

  if (!publicServiceId){
    try {
      const { uuid, uri } = await createEmptyForm();

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
  else{
    try {
      const { uuid, uri } = await createForm(publicServiceId);

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

app.get('/semantic-forms/:publicServiceId/form/:formId', async function(req, res) {
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

app.put('/semantic-forms/:publicServiceId/form/:formId', async function(req, res) {
  const delta = req.body;

  try {
    await updateForm(delta);
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

app.delete('/public-services/:publicServiceId', async function(req, res) {
  const publicServiceId = req.params.publicServiceId;
  try {
    await deleteForm(publicServiceId);
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

app.use(errorHandler);
