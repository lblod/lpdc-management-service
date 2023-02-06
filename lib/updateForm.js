import { uuid, update, sparqlEscapeUri } from 'mu';
import { querySudo, updateSudo } from '@lblod/mu-auth-sudo';
import { APPLICATION_GRAPH, PREFIXES } from '../config';
import { Graph, RDFNode, parse } from '../utils/rdflib';


export async function updateForm(data, sessionUri) {
  if(data.removals) await mutate('DELETE', data.removals, sessionUri);
  if(data.additions) await mutate('INSERT', data.additions);
}

async function mutate(mutationType, statements, sessionUri = null) {
  const store = new Graph();
  const graph = `http://mutate-graph/${uuid()}`;
  parse(statements, store, {graph});
  const parsedStatements = store.match(undefined, undefined, undefined, RDFNode(graph));

  if (parsedStatements.length > 0) {
    if(mutationType == 'DELETE') {
      // This is one hell of a workaround for a bug in virtuoso.
      // the bug: https://github.com/openlink/virtuoso-opensource/issues/1055
      // Due to this bug, deleting can't be delegated to mu-auth in the following case:
      //  A session DELETING a triple with a langString, that has a type occuring
      //  in multiple mu-allowed-groups AND the session having matching mu-allowed-groups
      // (In short: when a langTyped triple needs to be removed from multiple graphs).
      // Hence, we'll have to do the hard work ourselves, and check wether the triple may be deleted based
      // on session information.
      // If allowed, we revert to a sudo query executing the query according to a SPARQL expression we KNOW works for virtuoso
      // We do a best effort check, but it is NOT bullet proof.
      // Where it won't work: if a triple that may be edited according to our check, also IS availible in another graph,
      // the session is not allowed on. The sudo query will delete that one too. We expect these to be a mega-edge case, but warn here.
      // Note: this could be avoided by limiting the graphs that could be edited by the session (reconstructing them),
      // HOWEVER, this exhaustive knowledge can only be deduced from mu-auth-config. We don't want to parse that here.
      const subjects = [ ...new Set(parsedStatements.map(statement => statement.subject.value)) ];
      for(const subject of subjects) {
        if(!(await canDeleteSubject(subject, sessionUri))) {
          throw `Session ${sessionUri} is not allowed editing ${subject}`;
        }
      }
      const source = parsedStatements.map(t => t.toNT());
      for(const statement of source ) {
        await updateSudo(`
          DELETE {
            GRAPH ?g {
              ${statement}
            }
          }
          WHERE {
            GRAPH ?g {
              ${statement}
            }
          }`);
      }
    }
    else {
      await update(`
        ${mutationType} DATA {
          GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
            ${parsedStatements.join('\n')}
          }
        }`);
    }
  }
}

async function canDeleteSubject( subject, sessionUri ) {
  const existsQuery = `
    ASK {
       ${sparqlEscapeUri(subject)} ?p ?o.
    }
  `;
  
  const tripleExists = (await querySudo(existsQuery)).boolean;

  if(!tripleExists) {
    return true; // That's ok it's not existing.
  }
  else {
    const queryStr = `
        ${PREFIXES}
        SELECT DISTINCT ?subject WHERE {
           ${sparqlEscapeUri(sessionUri)} <http://mu.semte.ch/vocabularies/ext/sessionRole> "LoketLB-LPDCGebruiker";
             <http://mu.semte.ch/vocabularies/ext/sessionGroup> ?bestuurseenheid.

          {
             BIND(${sparqlEscapeUri(subject)} as ?subject)
             ?subject a cpsv:PublicService;
               ?predicate ?object;
               <http://purl.org/pav/createdBy> ?bestuurseenheid.
          }
          UNION {
             BIND(${sparqlEscapeUri(subject)} as ?subject)
             ?publicService a cpsv:PublicService;
               <http://purl.org/pav/createdBy> ?bestuurseenheid.

             VALUES ( ?relationPredicate ?subjectType) {
               ( belgif:hasRequirement m8g:Requirement )
               ( cpsv:follows cpsv:Rule )
               ( m8g:hasCost m8g:Cost )
               ( cpsv:produces lpdcExt:FinancialAdvantage )
               ( m8g:hasLegalResource eli:LegalResource )
               ( m8g:hasContactPoint schema:ContactPoint )
               ( lpdcExt:hasAttachment foaf:Document )
               ( rdfs:seeAlso schema:WebSite )
             }

              ?publicService ?relationPredicate ?subject.
              ?subject a ?subjectType;
                 ?predicate ?object.
          }
          UNION {
             BIND(${sparqlEscapeUri(subject)} as ?subject)
             ?publicService a cpsv:PublicService;
               <http://purl.org/pav/createdBy> ?bestuurseenheid.

             VALUES ( ?hopPredicate ?hopType ?relationPredicate ?subjectType ) {
               ( belgif:hasRequirement m8g:Requirement m8g:hasSupportingEvidence m8g:Evidence )
               ( cpsv:follows cpsv:Rule lpdcExt:hasWebsite schema:WebSite )
               ( m8g:hasContactPoint schema:ContactPoint lpdcExt:address locn:Address )
             }

              ?publicService ?hopPredicate ?hobObject.
              ?hobObject a ?hopType;
                   ?relationPredicate ?subject.
              ?subject a ?subjectType;
                 ?predicate ?object.
           }
        }
    `;
    const result = await querySudo(queryStr);
    return result?.results?.bindings?.length == 1 ? true: false;
  }
}
