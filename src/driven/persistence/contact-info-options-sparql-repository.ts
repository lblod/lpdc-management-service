import {ContactInfoOptionsRepository} from "../../core/port/driven/persistence/contact-info-options-repository";
import {sortBy} from "lodash";
import {InvariantError} from "../../core/domain/shared/lpdc-error";
import {SparqlQuerying} from "./sparql-querying";
import {Bestuurseenheid} from "../../core/domain/bestuurseenheid";
import {sparqlEscapeUri} from "../../../mu-helper";
import {requiredValue} from "../../core/domain/shared/invariant";

export class ContactInfoOptionsSparqlRepository implements ContactInfoOptionsRepository {

    protected readonly querying: SparqlQuerying;

    constructor(endpoint?: string) {
        this.querying = new SparqlQuerying(endpoint);
    }

    async contactPointOptions(bestuurseenheid: Bestuurseenheid, fieldName: string): Promise<any> {
        if (!['telephone', 'email', 'url', 'openingHours'].includes(fieldName)) {
            throw new InvariantError('Geen geldige veldnaam');
        }

        return this.loadContactPointOption(bestuurseenheid, fieldName);
    }

    private async loadContactPointOption(bestuurseenheid: Bestuurseenheid, option: string): Promise<any> {
        requiredValue(bestuurseenheid, 'bestuurseenheid');

        const query = `
            SELECT DISTINCT ?option
            WHERE {
                GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                      ?s a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService> .
                      ?s <http://data.europa.eu/m8g/hasContactPoint> ?o .
                      ?o <http://schema.org/${option}> ?option .
                }
              }
        `;

        const result = await this.querying.list(query);

        return sortBy(result.map((object) => object['option'].value), (option: string) => option.toUpperCase());
    }


}