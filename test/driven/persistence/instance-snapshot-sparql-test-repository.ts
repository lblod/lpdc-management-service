import {InstanceSnapshotSparqlRepository} from "../../../src/driven/persistence/instance-snapshot-sparql-repository";
import {DirectDatabaseAccess} from "./direct-database-access";
import {InstanceSnapshot} from "../../../src/core/domain/instance-snapshot";
import {DomainToQuadsMapper} from "../../../src/driven/persistence/domain-to-quads-mapper";
import {Iri} from "../../../src/core/domain/shared/iri";
import {INSTANCE_SNAPHOT_LDES_GRAPH} from "../../../config";

export class InstanceSnapshotSparqlTestRepository extends InstanceSnapshotSparqlRepository {

    private readonly directDatabaseAccess: DirectDatabaseAccess;

    constructor(endpoint?: string) {
        super(endpoint);
        this.directDatabaseAccess = new DirectDatabaseAccess(endpoint);
    }

    async save(instanceSnapshotGraph: Iri, instanceSnapshot: InstanceSnapshot): Promise<void> {
        await this.directDatabaseAccess.insertData(
            instanceSnapshotGraph.value,
            [
                ...new DomainToQuadsMapper(instanceSnapshotGraph).instanceSnapshotToQuads(instanceSnapshot).map(s => s.toNT())
            ]);
    }

    async clearAllInstanceSnapshotGraphs(): Promise<void> {
        const query = `
        SELECT DISTINCT ?graph WHERE {
            GRAPH ?graph {
                ?s ?p ?o
            } 
            FILTER(STRSTARTS(STR(?graph), "${INSTANCE_SNAPHOT_LDES_GRAPH()}"))
        }`;
        const queryResult = await this.directDatabaseAccess.list(query);
        const graphs: string[] = queryResult.map(it => it['graph'].value);
        for (const graph of graphs) {
            await this.directDatabaseAccess.clearGraph(graph);
        }
    }

}