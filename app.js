import { app, errorHandler, uuid } from 'mu';
import { createForm } from './lib/createForm';
import { getForm } from './lib/getForm';

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

app.get('/semantic-forms/', async function(req, res) {

  const publicServiceId = req.params["public-service-id"];
  const formId = req.params["form-id"];
  
  try {
    const bundle = await getForm(publicServiceId, formId)

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

app.use(errorHandler);