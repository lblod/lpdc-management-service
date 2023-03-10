import { querySudo } from '@lblod/mu-auth-sudo';
import { sparqlEscapeUri } from 'mu';
import { PREFIXES } from '../config';

export async function bestuurseenheidForSession(req) {
  const muSessionId = req.headers['mu-session-id'];
  const queryStr = `
     ${PREFIXES}
     SELECT DISTINCT ?bestuurseenheid
     WHERE {
       ${sparqlEscapeUri(muSessionId)} ext:sessionGroup ?bestuurseenheid.
       ?bestuurseenheid a besluit:Bestuurseenheid.
     }
     LIMIT 1
  `;

  let result = await querySudo(queryStr);

  if(result.results.bindings.length == 1) {
    return result.results.bindings[0].bestuurseenheid.value;
  }
  else {
    throw `Unexpected result fetching bestuurseenheid from session ${muSessionId}`;
  }
}
export async function isAllowdForLPDC( sessionUri ) {
  const queryStr = `
    ${PREFIXES}
    ASK {
      ${sparqlEscapeUri(sessionUri)} <http://mu.semte.ch/vocabularies/ext/sessionRole> "LoketLB-LPDCGebruiker".
    }
  `;
  return (await querySudo(queryStr)).boolean;
}
