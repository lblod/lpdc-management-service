import {DirectDatabaseAccess} from "./direct-database-access";
import {DomainToTriplesMapper} from "../../../src/driven/persistence/domain-to-triples-mapper";
import {ConceptSparqlRepository} from "../../../src/driven/persistence/concept-sparql-repository";
import {CONCEPT_GRAPH} from "../../../config";
import {Concept} from "../../../src/core/domain/concept";

export class ConceptSparqlTestRepository extends ConceptSparqlRepository {

    private readonly directDatabaseAccess: DirectDatabaseAccess;

    constructor(endpoint?: string) {
        super(endpoint);
        this.directDatabaseAccess = new DirectDatabaseAccess(endpoint);
    }

    async save(concept: Concept): Promise<void> {
        await this.directDatabaseAccess.insertData(
            CONCEPT_GRAPH,
            [
                ...new DomainToTriplesMapper().conceptToTriples(concept).map(s => s.toNT())
            ]);
    }

}