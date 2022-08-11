import { FORM_MAPPING } from '../config';
import ForkingStore from "forking-store";
import * as rdflib  from 'rdflib';
import { retrieveForm } from './retrieveForm';
import { validateForm } from '@lblod/submission-form-helpers';

export async function validateService(publicServiceId){
  const formIds = Object.keys(FORM_MAPPING);
  const forms=[];
  for (const id of formIds) {
    try {
      const form = await retrieveForm(publicServiceId, id);
      forms.push({type: FORM_MAPPING[id], form: form, id: id});
    }
    catch(error){
      throw error;
    }
  }

  const FORM_GRAPHS = {
    formGraph: new rdflib.NamedNode('http://data.lblod.info/form'),
    metaGraph: new rdflib.NamedNode('http://data.lblod.info/metagraph'),
    sourceGraph: new rdflib.NamedNode(`http://data.lblod.info/sourcegraph`),
  };

  const FORM = new rdflib.Namespace('http://lblod.data.gift/vocabularies/forms/');
  const RDF = new rdflib.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
  const MU = new rdflib.Namespace('http://mu.semte.ch/vocabularies/core/');
  const response = {errors: []};
  for (const form of forms) {

    const formStore = new ForkingStore();

    formStore.parse(form.form.form, FORM_GRAPHS.formGraph, 'text/turtle');
    formStore.parse(form.form.meta, FORM_GRAPHS.metaGraph, 'text/turtle');
    formStore.parse(form.form.source, FORM_GRAPHS.sourceGraph, 'text/turtle');

    const submittedResource = new rdflib.NamedNode("http://data.lblod.info/id/public-service/"+publicServiceId);

    const options = {
      ...FORM_GRAPHS,
      store: formStore,
      sourceNode: submittedResource
    };

    const formUri = formStore.any(
      undefined,
      RDF('type'),
      FORM('Form'),
      FORM_GRAPHS.formGraph
    );

    const formUuid = formStore.any(
      formUri,
      MU('uuid'),
      undefined,
      FORM_GRAPHS.formGraph
    );

    form.validation = validateForm(formUri, options);
    if(!form.validation){
      response.errors.push(
            {
            "form": {
              // should really be this but the ttl is out of date
              // TODO: uncomment this once ttl is updated
              // "id": formUuid.value,
              // "uri": formUri.value
              "id": form.id,
              "uri": "http://lblod.data.gift/vocabularies/forms/"+form.id
            }
          },
      );
    }
  }
  return response;
}
