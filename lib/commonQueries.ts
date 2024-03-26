import {query, sparqlEscapeUri} from '../mu-helper';
import {querySudo} from '@lblod/mu-auth-sudo';
import {APPLICATION_GRAPH, PREFIXES} from '../config';
import {sortBy} from "lodash";

export async function loadContactPointsAddresses(service: string, {
    graph,
    type,
    includeUuid,
    sudo,
    connectionOptions
}: QueryOptions = {}): Promise<any[]> {
    graph = graph || APPLICATION_GRAPH;
    type = type || 'lpdcExt:ConceptualPublicService';
    includeUuid = includeUuid || false;
    const queryClient = sudo ? querySudo : query;
    connectionOptions = connectionOptions || {};

    const queryStr = `
    ${PREFIXES}
    SELECT DISTINCT ?s ?p ?o
      WHERE  {
        VALUES ?p {
          rdf:type
          ${includeUuid ? 'mu:uuid' : ''}
          adres:Straatnaam
          <https://data.vlaanderen.be/ns/adres#Adresvoorstelling.huisnummer>
          <https://data.vlaanderen.be/ns/adres#Adresvoorstelling.busnummer>
          adres:postcode
          adres:gemeentenaam
          adres:land
          dct:source
          sh:order
          adres:verwijstNaar
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
    return (await queryClient(queryStr, {}, connectionOptions)).results.bindings;
}

//TODO LPDC-1014: move to domain
export async function loadContactPointOption(option: string): Promise<any> {
    const unsortedContactPointOptions = (await query(`
        SELECT DISTINCT ?option
        WHERE {
          ?s a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService> .
          ?s <http://data.europa.eu/m8g/hasContactPoint> ?o .
          ?o <http://schema.org/${option}> ?option .
          }
    `)).results.bindings.map((object) => object.option.value);
    return sortBy(unsortedContactPointOptions, (option) => option.toUpperCase());
}

type QueryOptions = {
    graph?: string,
    type?: string,
    validTypes?: boolean,
    includeUuid?: boolean,
    sudo?: boolean,
    connectionOptions?: object,
}