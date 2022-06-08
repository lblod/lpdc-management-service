import { updateSudo } from '@lblod/mu-auth-sudo';
import { uuid, sparqlEscapeString, sparqlEscapeDateTime, sparqlEscapeUri, sparqlEscape } from 'mu';

export async function deleteForm(formId) {
const deleteQuery = `
  PREFIX mu:	<http://mu.semte.ch/vocabularies/core/> 
  
  DELETE  {  
      ?s ?p ?o

    }
  WHERE  { 
      ?s mu:uuid ${sparqEscapeString(formId)}
    }
  ` 

  await updateSudo(deleteQuery);
}