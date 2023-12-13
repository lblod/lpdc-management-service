import {querySudo} from '@lblod/mu-auth-sudo';
import {sparqlEscapeUri} from '../mu-helper';

export async function isAllowedForLPDC(sessionUri: string): Promise<boolean> {
    const queryStr = `
    ASK {
      ${sparqlEscapeUri(sessionUri)} <http://mu.semte.ch/vocabularies/ext/sessionRole> "LoketLB-LPDCGebruiker".
    }
  `;
    return (await querySudo(queryStr)).boolean;
}
