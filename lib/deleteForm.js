import { sparqlEscapeString, sparqlEscapeUri, update } from 'mu';
import { APPLICATION_GRAPH, PREFIXES } from '../config';

export async function deleteForm(serviceId) {

  const deleteQuery = `
    ${PREFIXES}

    DELETE {
       GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
         ?s ?p ?o.
       }
    }
    WHERE {
      BIND( ${sparqlEscapeString(serviceId)} as ?uuid)
      {
        ?s a cpsv:PublicService;
          mu:uuid ?uuid ;
          ?p ?o.
      }
      UNION {
        ?service a cpsv:PublicService;
          mu:uuid ?uuid;
          belgif:hasRequirement ?requirement.

        ?requirement a m8g:Requirement;
          m8g:hasSupportingEvidence ?s.

        ?s a m8g:Evidence;
          ?p ?o.
      }
      UNION {
        ?service a cpsv:PublicService;
          mu:uuid ?uuid;
          belgif:hasRequirement ?s.

        ?s a m8g:Requirement;
          ?p ?o.
      }
      UNION {
        ?service a cpsv:PublicService;
          mu:uuid ?uuid;
          cpsv:follows ?rule.

        ?rule a cpsv:Rule;
          lpdcExt:hasOnlineProcedure ?s.

        ?s a schema:Website;
          ?p ?o.
      }
      UNION {
        ?service a cpsv:PublicService;
          mu:uuid ?uuid;
          cpsv:follows ?s.

        ?s a cpsv:Rule;
          ?p ?o.
      }
      UNION {
        ?service a cpsv:PublicService;
          mu:uuid ?uuid;
          m8g:hasCost ?s.

         ?s a m8g:Cost;
          ?p ?o.
      }
      UNION {
        ?service a cpsv:PublicService;
          mu:uuid ?uuid;
          cpsv:produces ?s.

         ?s a lpdcExt:FinancialAdvantage;
          ?p ?o.
      }
      UNION {
        ?service a cpsv:PublicService;
          mu:uuid ?uuid;
          m8g:hasContactPoint ?s.

         ?s a schema:ContactPoint;
          ?p ?o.
      }
      UNION {
        ?service a cpsv:PublicService;
          mu:uuid ?uuid;
          lpdcExt:attachment ?s.

         ?s a foaf:Document;
          ?p ?o.
      }
      UNION {
        ?service a cpsv:PublicService;
          mu:uuid ?uuid;
          rdfs:seeAlso ?s.

        ?s a schema:Website;
          ?p ?o.
      }
    }
    `;

  await update(deleteQuery);
}
