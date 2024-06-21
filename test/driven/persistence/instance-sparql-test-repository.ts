import {InstanceSparqlRepository} from "../../../src/driven/persistence/instance-sparql-repository";
import {DirectDatabaseAccess} from "./direct-database-access";
import {Bestuurseenheid} from "../../../src/core/domain/bestuurseenheid";
import {Instance} from "../../../src/core/domain/instance";
import {sparqlEscapeUri} from "../../../mu-helper";
import {DoubleQuadReporter} from "../../../src/driven/shared/quads-to-domain-mapper";

export class InstanceSparqlTestRepository extends InstanceSparqlRepository {

    private readonly directDatabaseAccess: DirectDatabaseAccess;

    constructor(endpoint?: string, doubleQuadReporter?: DoubleQuadReporter) {
        super(endpoint, doubleQuadReporter);
        this.directDatabaseAccess = new DirectDatabaseAccess(endpoint);
    }

    async save(bestuurseenheid: Bestuurseenheid, instance: Instance): Promise<void> {
        await super.save(bestuurseenheid, instance);

        if(instance.datePublished) {
            const query = `
            INSERT DATA { 
                GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                    <${instance.id}> <http://schema.org/datePublished> """${instance.datePublished.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime> .
                }
            }
        `;
            await this.querying.insert(query);
        }
    }

}