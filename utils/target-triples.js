import { v4 as uuid } from 'uuid';

export function targetTriples(triples, predicates) {

  predicates.forEach(predicate => {
    const triplesByPredicate = triples.filter((item) => {
      return item.p.value == predicate;
    });

    triplesByPredicate.forEach(triple => {
      const oldUri = triple.o.value;
      const oldId = oldUri.split('/').pop();

      const newId = uuid();
      const newUri = generateNewUri(oldUri, newId);

      searchAndReplaceUri(triples, oldUri, newUri);
      searchAndReplaceId(triples, oldId, newId);
    });
  });
  return triples;
}

function generateNewUri(oldUri, newId) {
  const prefix = oldUri.split('/').slice(0, -1).join('/');
  return prefix + '/' + newId;
}

function searchAndReplaceUri(triples, oldUri, newUri) {
  triples.forEach((item) => {
    if(item.s.value == oldUri) {
      item.s.value = newUri;
    }

    if(item.o.value == oldUri) {
      item.o.value = newUri;
    }
  });
}

function searchAndReplaceId(triples, oldUri, newUri) {
  triples.forEach((item) => {
    if(item.o.value == oldUri) {
      item.o.value = newUri;
    }
  });
}
