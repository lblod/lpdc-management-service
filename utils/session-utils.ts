import {querySudo} from '@lblod/mu-auth-sudo';
import {sparqlEscapeUri} from '../mu-helper';
import {PREFIXES} from '../config';

export async function bestuurseenheidForSession(sessionUri: string): Promise<{ bestuurseenheid: string, uuid: string }> {
    const queryStr = `
     ${PREFIXES}
     SELECT DISTINCT ?bestuurseenheid ?uuid
     WHERE {
       ${sparqlEscapeUri(sessionUri)} ext:sessionGroup ?bestuurseenheid.
       ?bestuurseenheid a besluit:Bestuurseenheid;
         mu:uuid ?uuid.
     }
     LIMIT 1
  `;

    const result = await querySudo(queryStr);

    if (result.results.bindings.length == 1) {
        return {
            bestuurseenheid: result.results.bindings[0].bestuurseenheid.value,
            uuid: result.results.bindings[0].uuid.value
        };
    } else {
        throw `Unexpected result fetching bestuurseenheid from session ${sessionUri}`;
    }
}

export async function isAllowedForLPDC(sessionUri: string): Promise<boolean> {
    const queryStr = `
    ${PREFIXES}
    ASK {
      ${sparqlEscapeUri(sessionUri)} <http://mu.semte.ch/vocabularies/ext/sessionRole> "LoketLB-LPDCGebruiker".
    }
  `;
    return (await querySudo(queryStr)).boolean;
}
