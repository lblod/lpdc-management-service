import { v4 as uuid } from 'uuid';

export function addUuid(bindingsForSubject, newUuid = uuid()) {
  if(bindingsForSubject.length) {
    const subject  = bindingsForSubject[0].s.value;

    bindingsForSubject.push(
      {
        s: { value: subject, type: 'uri' },
        p: { value: 'http://mu.semte.ch/vocabularies/core/uuid', type: 'uri'},
        o: { value: newUuid  }
      }
    );
  }
  return bindingsForSubject;
}

export function replaceType(result, oldType, newType) {
  for(const binding of result.results.bindings) {
    const predicate = binding.p.value;
    const object = binding.o.value;

    if(predicate == 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' && object == oldType){
      binding.o.value = newType;
    }
  }
  return result;
}
