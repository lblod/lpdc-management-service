import {InstanceSnapshotSparqlRepository} from "../../../src/driven/persistence/instance-snapshot-sparql-repository";
import {DirectDatabaseAccess} from "./direct-database-access";
import {InstanceSnapshot} from "../../../src/core/domain/instance-snapshot";
import {Bestuurseenheid} from "../../../src/core/domain/bestuurseenheid";
import {DomainToQuadsMapper} from "../../../src/driven/persistence/domain-to-quads-mapper";
import {Iri} from "../../../src/core/domain/shared/iri";

export class InstanceSnapshotSparqlTestRepository extends InstanceSnapshotSparqlRepository {

    private readonly directDatabaseAccess: DirectDatabaseAccess;

    constructor(endpoint?: string) {
        super(endpoint);
        this.directDatabaseAccess = new DirectDatabaseAccess(endpoint);
    }

    async save(bestuurseenheid: Bestuurseenheid, instanceSnapshot: InstanceSnapshot): Promise<void> {
        const graph = bestuurseenheid.instanceSnapshotsLdesDataGraph().value;
        await this.directDatabaseAccess.insertData(
            graph,
            [
                ...new DomainToQuadsMapper(new Iri(graph)).instanceSnapshotToQuads(instanceSnapshot).map(s => s.toNT())
            ]);
    }

    async clearAllInstanceSnapshotGraphs(): Promise<void> {
        const query = `
        SELECT DISTINCT ?graph WHERE {
            GRAPH ?graph {
                ?s ?p ?o
            } 
            FILTER(STRSTARTS(STR(?graph), "http://mu.semte.ch/graphs/lpdc/instancesnapshots-ldes-data"))
        }`;
        const queryResult = await this.directDatabaseAccess.list(query);
        const graphs: string[] = queryResult.map(it => it['graph'].value);
        for (const graph of graphs) {
            await this.directDatabaseAccess.clearGraph(graph);
        }
    }

}