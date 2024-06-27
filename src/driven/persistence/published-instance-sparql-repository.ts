import {SparqlQuerying} from "./sparql-querying";
import {PublishedInstanceRepository} from "../../core/port/driven/persistence/published-instance-repository";
import {Bestuurseenheid} from "../../core/domain/bestuurseenheid";
import {DomainToQuadsMapper} from "./domain-to-quads-mapper";
import {sparqlEscapeUri} from "../../../mu-helper";
import {PublishedInstance} from "../../core/domain/published-instance";

export class PublishedInstanceSparqlRepository implements PublishedInstanceRepository {

    protected readonly querying: SparqlQuerying;

    constructor(endpoint?: string) {
        this.querying = new SparqlQuerying(endpoint);
    }

    async save(bestuurseenheid: Bestuurseenheid, publishedInstance: PublishedInstance): Promise<void> {
        const quads = new DomainToQuadsMapper(bestuurseenheid.userGraph()).publishedInstanceToQuads(publishedInstance).map(s => s.toNT());

        const query = `
            INSERT DATA { 
                GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                    ${quads.join("\n")}
                }
            }
        `;
        await this.querying.insert(query);
    }



}
