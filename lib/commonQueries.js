import { query, sparqlEscapeUri, sparqlEscapeString} from 'mu';
import { querySudo } from '@lblod/mu-auth-sudo';
import { APPLICATION_GRAPH, PREFIXES } from '../config';

export async function loadEvidences(serviceUri, { graph, type, includeUuid, sudo } = {}) {
  graph = graph || APPLICATION_GRAPH;
  type = type || 'lpdcExt:ConceptualPublicService';
  includeUuid = includeUuid || false;
  const queryClient = sudo ? querySudo : query;

  const queryStr = `
    ${PREFIXES}
    SELECT DISTINCT ?s ?p ?o
      WHERE  {

        BIND(${sparqlEscapeUri(serviceUri)} as ?publicService)
        VALUES ?p {
          rdf:type
          ${includeUuid ? 'mu:uuid': '' }
          dct:description
          dct:title
          dct:source
        }

        GRAPH ${sparqlEscapeUri(graph)} {
          ?publicService a ${type};
            belgif:hasRequirement ?requirement.

          ?requirement a m8g:Requirement;
            m8g:hasSupportingEvidence ?s.

          ?s ?p ?o.
        }
      }
  `;
  return (await queryClient(queryStr)).results.bindings;
}

export async function loadRequirements(service, { graph, type, includeUuid, sudo } = {}) {
  graph = graph || APPLICATION_GRAPH;
  type = type || 'lpdcExt:ConceptualPublicService';
  includeUuid = includeUuid || false;
  const queryClient = sudo ? querySudo : query;

  const queryStr = `
    ${PREFIXES}
    SELECT DISTINCT ?s ?p ?o
      WHERE  {

        BIND(${sparqlEscapeUri(service)} as ?publicService)
        VALUES ?p {
          rdf:type
          ${includeUuid ? 'mu:uuid': '' }
          dct:description
          dct:title
          m8g:hasSupportingEvidence
          dct:source
        }

        GRAPH ${sparqlEscapeUri(graph)} {
          ?publicService a ${type};
            belgif:hasRequirement ?s.

          ?s a m8g:Requirement;
            ?p ?o.
        }
      }
  `;
  return (await queryClient(queryStr)).results.bindings;
}

export async function loadOnlineProcedureRules(service, { graph, type, includeUuid, sudo } = {}) {
  graph = graph || APPLICATION_GRAPH;
  type = type || 'lpdcExt:ConceptualPublicService';
  includeUuid = includeUuid || false;
  const queryClient = sudo ? querySudo : query;

  const queryStr = `
    ${PREFIXES}
    SELECT DISTINCT ?s ?p ?o
      WHERE  {

        BIND(${sparqlEscapeUri(service)} as ?publicService)
        VALUES ?p {
          rdf:type
          ${includeUuid ? 'mu:uuid': '' }
          dct:description
          dct:title
          schema:url
          dct:source
        }

        GRAPH ${sparqlEscapeUri(graph)} {
          ?publicService a ${type};
            cpsv:follows ?rule.

          ?rule a cpsv:Rule;
            lpdcExt:hasWebsite ?s.

          ?s ?p ?o.
         }
      }
  `;
  return (await queryClient(queryStr)).results.bindings;
}

export async function loadRules(service, { graph, type, includeUuid, sudo } = {}) {
  graph = graph || APPLICATION_GRAPH;
  type = type || 'lpdcExt:ConceptualPublicService';
  includeUuid = includeUuid || false;
  const queryClient = sudo ? querySudo : query;

  const queryStr = `
    ${PREFIXES}
    SELECT DISTINCT ?s ?p ?o
      WHERE  {
        VALUES ?p {
          rdf:type
          ${includeUuid ? 'mu:uuid': '' }
          dct:description
          dct:title
          lpdcExt:hasWebsite
          dct:source
        }

        GRAPH ${sparqlEscapeUri(graph)} {
          ${sparqlEscapeUri(service)} a ${type};
            cpsv:follows ?s.

          ?s a cpsv:Rule;
             ?p ?o.
        }
      }
  `;

  return (await queryClient(queryStr)).results.bindings;
}

export async function loadCosts(service, { graph, type, includeUuid, sudo } = {}) {
  graph = graph || APPLICATION_GRAPH;
  type = type || 'lpdcExt:ConceptualPublicService';
  includeUuid = includeUuid || false;
  const queryClient = sudo ? querySudo : query;

  const queryStr = `
    ${PREFIXES}
    SELECT DISTINCT ?s ?p ?o
      WHERE  {

        BIND(${sparqlEscapeUri(service)} as ?publicService)
        VALUES ?p {
          rdf:type
          ${includeUuid ? 'mu:uuid': '' }
          dct:description
          dct:title
          dct:source
        }

        GRAPH ${sparqlEscapeUri(graph)} {
          ?publicService a ${type};
            m8g:hasCost ?s.

           ?s a m8g:Cost;
             ?p ?o.
        }
      }
  `;

  return (await queryClient(queryStr)).results.bindings;
}

export async function loadFinancialAdvantages(service, { graph, type, includeUuid, sudo } = {}) {
  graph = graph || APPLICATION_GRAPH;
  type = type || 'lpdcExt:ConceptualPublicService';
  includeUuid = includeUuid || false;
  const queryClient = sudo ? querySudo : query;

  const queryStr = `
    ${PREFIXES}
    SELECT DISTINCT ?s ?p ?o
      WHERE  {

        BIND(${sparqlEscapeUri(service)} as ?publicService)
        VALUES ?p {
          rdf:type
          ${includeUuid ? 'mu:uuid': '' }
          dct:description
          dct:title
          dct:source
        }

        GRAPH ${sparqlEscapeUri(graph)} {
          ?publicService a ${type};
            cpsv:produces ?s.

           ?s a lpdcExt:FinancialAdvantage;
            ?p ?o.
        }
      }
  `;

  return (await queryClient(queryStr)).results.bindings;
}

export async function loadLegalResources(service, { graph, type, includeUuid, sudo } = {}) {
  graph = graph || APPLICATION_GRAPH;
  type = type || 'lpdcExt:ConceptualPublicService';
  includeUuid = includeUuid || false;
  const queryClient = sudo ? querySudo : query;

  //TODO: we comment this bit out, as here we will need a refined flow because eli:LegalResource are URI's from
  //      VlaamseCodex. So copying them over is not really what we want.
  // const legalResoureQuery = `
  //   ${PREFIXES}
  //   CONSTRUCT {
  //      ?legal a eli:LegalResource;
  //        dct:description ?description;
  //        dct:title ?title.
  //   }
  //   FROM ${sparqlEscapeUri(APPLICATION_GRAPH)}
  //     WHERE  {
  //       BIND(${sparqlEscapeUri(conceptUri)} as ?publicService)
  //       ?publicService a lblodIpdcLpdc:ConceptualPublicService;
  //         m8g:hasLegalResource ?legal.

  //        ?legal a eli:LegalResource;
  //          dct:description ?description;
  //          dct:title ?title.
  //     }
  // `;
  return null;
}

export async function loadContactPointsAddresses(service, { graph, type, includeUuid, sudo } = {}) {
  graph = graph || APPLICATION_GRAPH;
  type = type || 'lpdcExt:ConceptualPublicService';
  includeUuid = includeUuid || false;
  const queryClient = sudo ? querySudo : query;

  const queryStr = `
    ${PREFIXES}
    SELECT DISTINCT ?s ?p ?o
      WHERE  {
        VALUES ?p {
          rdf:type
          ${includeUuid ? 'mu:uuid': '' }
          adres:Straatnaam
          <https://data.vlaanderen.be/ns/adres#Adresvoorstelling.huisnummer>
          <https://data.vlaanderen.be/ns/adres#Adresvoorstelling.busnummer>
          adres:postcode
          adres:gemeentenaam
          adres:land
          dct:source
        }

        GRAPH ${sparqlEscapeUri(graph)} {
          ${sparqlEscapeUri(service)} a ${type};
            m8g:hasContactPoint ?contact.

          ?contact a schema:ContactPoint;
                lpdcExt:address ?s.

          ?s ?p ?o.
         }
      }
  `;
  return (await queryClient(queryStr)).results.bindings;
}

export async function loadContactPoints(service, { graph, type, includeUuid, sudo } = {}) {
  graph = graph || APPLICATION_GRAPH;
  type = type || 'lpdcExt:ConceptualPublicService';
  includeUuid = includeUuid || false;
  const queryClient = sudo ? querySudo : query;

  const queryStr = `
    ${PREFIXES}
    SELECT DISTINCT ?s ?p ?o
      WHERE  {

        VALUES ?p {
         rdf:type
         ${includeUuid ? 'mu:uuid': '' }
         lpdcExt:address
         schema:email
         schema:telephone
         schema:openingHours
         schema:url
         dct:source
        }

        GRAPH ${sparqlEscapeUri(graph)} {
          ${sparqlEscapeUri(service)} a ${type};
            m8g:hasContactPoint ?s.

           ?s a schema:ContactPoint;
              ?p ?o
        }
     }
  `;

  return (await queryClient(queryStr)).results.bindings;
}

export async function loadAttachments(service, { graph, type, includeUuid, sudo } = {}) {
  graph = graph || APPLICATION_GRAPH;
  type = type || 'lpdcExt:ConceptualPublicService';
  includeUuid = includeUuid || false;
  const queryClient = sudo ? querySudo : query;

  const queryStr = `
    ${PREFIXES}
    SELECT DISTINCT ?s ?p ?o
      WHERE  {
        BIND(${sparqlEscapeUri(service)} as ?publicService)

        VALUES ?p {
         rdf:type
         ${includeUuid ? 'mu:uuid': '' }
         dct:description
         dct:title
         schema:url
         dct:source
        }

        GRAPH ${sparqlEscapeUri(graph)} {
          ?publicService a ${type};
            lpdcExt:hasAttachment ?s.

           ?s a foaf:Document;
             ?p ?o.
        }
      }
  `;

  return (await queryClient(queryStr)).results.bindings;
}

export async function loadWebsites(service, { graph, type, includeUuid, sudo } = {}) {
  graph = graph || APPLICATION_GRAPH;
  type = type || 'lpdcExt:ConceptualPublicService';
  includeUuid = includeUuid || false;
  const queryClient = sudo ? querySudo : query;

  const queryStr = `
    ${PREFIXES}
    SELECT DISTINCT ?s ?p ?o
      WHERE  {
        BIND(${sparqlEscapeUri(service)} as ?publicService)

        VALUES ?p {
         rdf:type
         ${includeUuid ? 'mu:uuid': '' }
         dct:description
         dct:title
         schema:url
         dct:source
        }

        GRAPH ${sparqlEscapeUri(graph)} {
          ?publicService a ${type};
            rdfs:seeAlso ?s.

          ?s a schema:WebSite;
            ?p ?o.
        }
      }
  `;
  return (await queryClient(queryStr)).results.bindings;
}

export async function loadPublicService(service, { graph, type, validTypes, includeUuid, sudo } = {}) {
  graph = graph || APPLICATION_GRAPH;
  type = type || 'lpdcExt:ConceptualPublicService';
  validTypes = validTypes || false;
  includeUuid = includeUuid || false;
  const queryClient = sudo ? querySudo : query;

  const queryStr = `
    ${PREFIXES}
    SELECT DISTINCT ?s ?p ?o
      WHERE  {
        BIND(${sparqlEscapeUri(service)} as ?s)
          {
            VALUES ?p {
              rdf:type
              ${includeUuid ? 'mu:uuid': '' }
              dct:description
              lpdcExt:exception
              dcat:keyword
              dct:title
              lpdcExt:regulation
              cpsv:follows
              lpdcExt:hasAttachment
              m8g:hasContactPoint
              m8g:hasCost
              m8g:hasLegalResource
              rdfs:seeAlso
              belgif:hasRequirement
              cpsv:produces
              adms:status
              dct:created
              dct:modified
              pav:createdBy
              dct:source
            }

            GRAPH ${sparqlEscapeUri(graph)} {
              ?s a ${type};
                ?p ?o.
            }
        }
        UNION {
            VALUES (?p ?conceptScheme) {
              ( lpdcExt:yourEuropeCategory dvcs:YourEuropeCategorie )
              ( lpdcExt:publicationMedium dvcs:PublicatieKanaal )
              ( lpdcExt:hasExecutingAuthority dvcs:IPDCOrganisaties )
              ( lpdcExt:executingAuthorityLevel dvcs:UitvoerendBestuursniveau )
              ( lpdcExt:competentAuthorityLevel dvcs:BevoegdBestuursniveau )
              ( m8g:hasCompetentAuthority dvcs:IPDCOrganisaties )
              ( dct:language dvcs:Taal )
              ( dct:spatial <http://lblod.data.gift/vocabularies/lpdc-ipdc/IPDCLocaties> )
              ( lpdcExt:targetAudience dvcs:Doelgroep )
              ( m8g:thematicArea dvcs:Thema )
              ( dct:type dvcs:Type )
              ( lpdcExt:conceptTag  dvcs:ConceptTag )
            }

           GRAPH ${sparqlEscapeUri(graph)} {
             ?s a ${type};
               ?p ?o.
            }
            ?o skos:inScheme ?conceptScheme.
        }
        UNION {
            VALUES ?p {
              schema:endDate
              schema:startDate
            }

            GRAPH ${sparqlEscapeUri(graph)} {
              ?s a ${type};
                ?p ?o.
              ${ validTypes ? `FILTER(DATATYPE(?o) = xsd:dateTime)` : ''}
            }
        }
    }
  `;
  return (await queryClient(queryStr)).results.bindings;
}

export async function serviceUriForId(publicServiceId, type = 'cpsv:PublicService' ) {
  return (await query(`
      ${PREFIXES}

      SELECT DISTINCT ?service
      WHERE {
        BIND( ${sparqlEscapeString(publicServiceId)} as ?uuid)
        ?service a ${type};
          mu:uuid ?uuid.
      }
      LIMIT 1
    `)).results.bindings[0]?.service?.value;
}