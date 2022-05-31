import { sparqlEscapeString, sparqlEscapeUri } from 'mu';

export function bindingsToNT(bindings) {
  return bindings.map(b => _bindingToNT(b['s'], b['p'], b['o']));
}

function _bindingToNT(s, p, o) {
  const subject = sparqlEscapeUri(s.value);
  const predicate = sparqlEscapeUri(p.value);
  let obj;
  if (o.type === 'uri') {
    obj = sparqlEscapeUri(o.value);
  } else {
    obj = `${sparqlEscapeString(o.value)}`;
    if (o.datatype)
      obj += `^^${sparqlEscapeUri(o.datatype)}`;
  }
  return `${subject} ${predicate} ${obj} .`;
}