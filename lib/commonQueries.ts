import {query} from '../mu-helper';
import {sortBy} from "lodash";

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
