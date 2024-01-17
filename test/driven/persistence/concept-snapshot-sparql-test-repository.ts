import {ConceptSnapshotSparqlRepository} from "../../../src/driven/persistence/concept-snapshot-sparql-repository";
import {ConceptSnapshot} from "../../../src/core/domain/concept-snapshot";
import {DirectDatabaseAccess} from "./direct-database-access";
import {DomainToTriplesMapper} from "../../../src/driven/persistence/domain-to-triples-mapper";
import {Iri} from "../../../src/core/domain/shared/iri";
import {CONCEPT_SNAPSHOT_LDES_GRAPH} from "../../../config";

export class ConceptSnapshotSparqlTestRepository extends ConceptSnapshotSparqlRepository {

    private readonly directDatabaseAccess: DirectDatabaseAccess;

    constructor(endpoint?: string) {
        super(endpoint);
        this.directDatabaseAccess = new DirectDatabaseAccess(endpoint);
    }

    async save(conceptSnapshot: ConceptSnapshot): Promise<void> {
        const graph = CONCEPT_SNAPSHOT_LDES_GRAPH;
        await this.directDatabaseAccess.insertData(
            graph,
            [
                ...new DomainToTriplesMapper(new Iri(graph)).conceptSnapshotToTriples(conceptSnapshot).map(s => s.toNT())
            ]);
    }

}