import {v4 as uuid} from 'uuid';
import {querySudo} from '@lblod/mu-auth-sudo';

export function addUuidForSubject(bindings, newUuid = uuid()): any[] {
    if (bindings.length) {
        const subject = bindings[0].s.value;

        bindings.push(
            {
                s: {value: subject, type: 'uri'},
                p: {value: 'http://mu.semte.ch/vocabularies/core/uuid', type: 'uri'},
                o: {value: newUuid}
            }
        );
    }
    return bindings;
}

export function addTypeForSubject(bindings, newType): any[] {
    if (bindings.length) {
        const subject = bindings[0].s.value;

        bindings.push(
            {
                s: {value: subject, type: 'uri'},
                p: {value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', type: 'uri'},
                o: {value: newType, type: 'uri'}
            }
        );
    }
    return bindings;
}

export function groupBySubject(bindings): any[] {
    const groupedBySubject = bindings.reduce((acc, triple) => {
        if (!acc[triple.s.value]) {
            acc[triple.s.value] = [triple];
        } else {
            acc[triple.s.value].push(triple);
        }
        return acc;
    }, {});
    return groupedBySubject;
}

export function replaceType(bindings, oldType, newType): any[] {
    for (const binding of bindings) {
        const predicate = binding.p.value;
        const object = binding.o.value;

        if (predicate == 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' && object == oldType) {
            binding.o.value = newType;
        }
    }
    return bindings;
}

export async function getScopedGraphsForStatement(statement, targetGraphPattern): Promise<any[]> {
    const queryStr = `
    SELECT DISTINCT ?g {
      GRAPH ?g {
        ${statement}
      }
      FILTER(REGEX(STR(?g), "^${targetGraphPattern}", "i"))
   }
  `;
    const result = await querySudo(queryStr);
    return result?.results?.bindings.map(b => b.g.value) || [];
}