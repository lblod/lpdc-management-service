import { sparqlEscapeString, sparqlEscapeUri } from '../mu-helper';

export function bindingsToNT(bindings): string[] {
    return bindings.map(b => _bindingToNT(b['s'], b['p'], b['o']));
}

function _bindingToNT(s, p, o): string {
    const subject = sparqlEscapeUri(s.value);
    const predicate = sparqlEscapeUri(p.value);
    let obj;
    if (o.type === 'uri') {
        obj = sparqlEscapeUri(o.value);
    } else {
        obj = `${sparqlEscapeString(o.value)}`;
        if (o.datatype) {
            if (o.datatype !== "http://www.w3.org/2001/XMLSchema#string") {
                obj += `^^${sparqlEscapeUri(o.datatype)}`;
            }
        } else if (o.lang) {
            obj += `@${o.lang}`;
        } else if (o['xml:lang']) {
            obj += `@${o['xml:lang']}`;
        }
    }
    return `${subject} ${predicate} ${obj} .`;
}