import {
    InstanceSnapshotProcessingAuthorizationSparqlRepository
} from "../../../src/driven/persistence/instance-snapshot-processing-authorization-sparql-repository";
import {DirectDatabaseAccess} from "./direct-database-access";
import {Iri} from "../../../src/core/domain/shared/iri";
import {Bestuurseenheid} from "../../../src/core/domain/bestuurseenheid";
import {INSTANCE_SNAPHOT_LDES_AUTHORIZATION_GRAPH} from "../../../config";
import {sparqlEscapeUri} from "../../../mu-helper";

export class InstanceSnapshotProcessingAuthorizationSparqlTestRepository extends InstanceSnapshotProcessingAuthorizationSparqlRepository {

    private readonly directDatabaseAccess: DirectDatabaseAccess;

    constructor(endpoint?: string) {
        super(endpoint);
        this.directDatabaseAccess = new DirectDatabaseAccess(endpoint);
    }

    async save(bestuurseenheid: Bestuurseenheid, instanceSnapshotGraph: Iri): Promise<void> {
        await this.directDatabaseAccess.insertData(
            INSTANCE_SNAPHOT_LDES_AUTHORIZATION_GRAPH,
            [
                `${sparqlEscapeUri(bestuurseenheid.id)} <http://data.lblod.info/vocabularies/lpdc/canPublishInstanceToGraph> ${sparqlEscapeUri(instanceSnapshotGraph)}`,
            ]);
    }

}