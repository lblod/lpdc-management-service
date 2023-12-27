import {ConceptVersieSparqlRepository} from "../../../src/driven/persistence/concept-versie-sparql-repository";
import {PREFIX} from "../../../config";
import {ConceptVersie} from "../../../src/core/domain/concept-versie";
import {DirectDatabaseAccess} from "./direct-database-access";
import {DomainToTriplesMapper} from "../../../src/driven/persistence/domain-to-triples-mapper";

export class ConceptVersieSparqlTestRepository extends ConceptVersieSparqlRepository {

    private readonly directDatabaseAccess: DirectDatabaseAccess;

    constructor(endpoint?: string) {
        super(endpoint);
        this.directDatabaseAccess = new DirectDatabaseAccess(endpoint);
    }

    async save(conceptVersie: ConceptVersie): Promise<void> {
        await this.directDatabaseAccess.insertData(
            'http://mu.semte.ch/graphs/lpdc/ldes-data',
            new DomainToTriplesMapper().conceptVersieToTriples(conceptVersie),
            [
                PREFIX.dct,
                PREFIX.lpdcExt,
                PREFIX.schema,
                PREFIX.m8g,
                PREFIX.dcat,
                PREFIX.ps,
                PREFIX.sh,
                PREFIX.cpsv,
                PREFIX.rdfs]);
    }

}