import {DirectDatabaseAccess} from "./direct-database-access";
import {DomainToTriplesMapper} from "../../../src/driven/persistence/domain-to-triples-mapper";
import {InstanceSparqlRepository} from "../../../src/driven/persistence/instance-sparql-repository";
import {Instance} from "../../../src/core/domain/instance";
import {Bestuurseenheid} from "../../../src/core/domain/bestuurseenheid";

export class InstanceSparqlTestRepository extends InstanceSparqlRepository {

    private readonly directDatabaseAccess: DirectDatabaseAccess;

    constructor(endpoint?: string) {
        super(endpoint);
        this.directDatabaseAccess = new DirectDatabaseAccess(endpoint);
    }

    async save(bestuurseenheid: Bestuurseenheid, instance: Instance): Promise<void> {
        await this.directDatabaseAccess.insertData(
            bestuurseenheid.userGraph().value,
            [
                ...new DomainToTriplesMapper(bestuurseenheid.userGraph()).instanceToTriples(instance).map(s => s.toNT())
            ]);
    }

}