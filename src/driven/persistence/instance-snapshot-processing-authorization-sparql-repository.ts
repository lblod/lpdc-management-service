import {Bestuurseenheid} from "../../core/domain/bestuurseenheid";
import {Iri} from "../../core/domain/shared/iri";
import {
    InstanceSnapshotProcessingAuthorizationRepository
} from "../../core/port/driven/persistence/instance-snapshot-processing-authorization-repository";
import {SparqlQuerying} from "./sparql-querying";
import {INSTANCE_SNAPHOT_LDES_AUTHORIZATION_GRAPH, PREFIX} from "../../../config";
import {sparqlEscapeUri} from "../../../mu-helper";

export class InstanceSnapshotProcessingAuthorizationSparqlRepository implements InstanceSnapshotProcessingAuthorizationRepository {

    protected readonly querying: SparqlQuerying;

    constructor(endpoint?: string) {
        this.querying = new SparqlQuerying(endpoint);
    }

    async canPublishInstanceToGraph(bestuurseenheid: Bestuurseenheid, instanceSnapshotGraph: Iri): Promise<boolean> {
        const query = `
            ${PREFIX.lpdc}
        
        ASK {
            GRAPH ${sparqlEscapeUri(INSTANCE_SNAPHOT_LDES_AUTHORIZATION_GRAPH)} {
                ${sparqlEscapeUri(bestuurseenheid.id)} lpdc:canPublishInstanceToGraph ${sparqlEscapeUri(instanceSnapshotGraph)}.
            }
        }`;
        return this.querying.ask(query);
    }

}