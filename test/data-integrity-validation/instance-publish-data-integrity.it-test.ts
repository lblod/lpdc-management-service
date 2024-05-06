import {END2END_TEST_SPARQL_ENDPOINT, TEST_SPARQL_ENDPOINT} from "../test.config";
import {DirectDatabaseAccess} from "../driven/persistence/direct-database-access";
import {PREFIX, PUBLIC_GRAPH} from "../../config";
import {sparqlEscapeUri} from "../../mu-helper";
import {BestuurseenheidSparqlTestRepository} from "../driven/persistence/bestuurseenheid-sparql-test-repository";
import {Iri} from "../../src/core/domain/shared/iri";
import {Bestuurseenheid} from "../../src/core/domain/bestuurseenheid";
import fs from "fs";
import {InstanceSparqlRepository} from "../../src/driven/persistence/instance-sparql-repository";
import {sortedUniq} from "lodash";
import {
    ValidateInstanceForPublishApplicationService
} from "../../src/core/application/validate-instance-for-publish-application-service";
import {FormApplicationService} from "../../src/core/application/form-application-service";
import {ConceptSparqlRepository} from "../../src/driven/persistence/concept-sparql-repository";
import {
    FormalInformalChoiceSparqlRepository
} from "../../src/driven/persistence/formal-informal-choice-sparql-repository";
import {SelectFormLanguageDomainService} from "../../src/core/domain/select-form-language-domain-service";
import {SemanticFormsMapperImpl} from "../../src/driven/persistence/semantic-forms-mapper-impl";
import {FormDefinitionFileRepository} from "../../src/driven/persistence/form-definition-file-repository";
import {CodeSparqlRepository} from "../../src/driven/persistence/code-sparql-repository";

const endPoint = END2END_TEST_SPARQL_ENDPOINT;
const directDatabaseAccess = new DirectDatabaseAccess(endPoint);
const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(endPoint);
const conceptRepository = new ConceptSparqlRepository(TEST_SPARQL_ENDPOINT);
const instanceRepository = new InstanceSparqlRepository(endPoint);
const formDefinitionRepository = new FormDefinitionFileRepository();
const codeRepository = new CodeSparqlRepository(endPoint);
const formalInformalChoiceRepository = new FormalInformalChoiceSparqlRepository(TEST_SPARQL_ENDPOINT);
const selectFormLanguageDomainService = new SelectFormLanguageDomainService(formalInformalChoiceRepository);
const semanticFormsMapper = new SemanticFormsMapperImpl();
const formApplicationService = new FormApplicationService(conceptRepository, instanceRepository, formDefinitionRepository, codeRepository, selectFormLanguageDomainService, semanticFormsMapper);
const validateInstanceForPublishApplicationService = new ValidateInstanceForPublishApplicationService(formApplicationService, instanceRepository);

describe('Instance publish validation', () => {
    test('Load all published instances; and verify validations', async () => {
        const bestuurseenhedenIds: string[] = await getBestuurseenhedenIds();
        let errors: string[] = [];
        let totalInstances = 0;

        console.log(`Total amount of bestuurseenheden: ${bestuurseenhedenIds.length} `);

        if (!fs.existsSync(`/tmp/failing-published`)) {
            fs.mkdirSync(`/tmp/failing-published`);
        }
        
        for (const bestuurseenheidId of bestuurseenhedenIds) {
            const bestuurseenheid: Bestuurseenheid = await bestuurseenheidRepository.findById(new Iri(bestuurseenheidId));
            const instanceIds: string[] = await getPublishedInstancesForBestuurseenheid(bestuurseenheid);
            console.log(`Verifying bestuurseenheid ${bestuurseenheidId} with ${instanceIds.length} published instances`);

            const instanceErrors = [];
            for (const instanceId of instanceIds) {
                try {

                    const errorList = await validateInstanceForPublishApplicationService.validate(new Iri(instanceId), bestuurseenheid);
                    expect(errorList).toEqual([]);

                } catch (e) {
                    errors = [...errors, `Bestuurseenheid: ${bestuurseenheid.id.value} and instance ${instanceId}`];
                    console.error(e);
                    instanceErrors.push(`${e} for instance ${instanceId}`);
                }
            }
            if (instanceErrors.length != 0) {
                fs.writeFileSync(`/tmp/failing-published/${bestuurseenheid.uuid}.txt`, sortedUniq(instanceErrors).join('\n'));
            }
            totalInstances += instanceIds.length;
            console.log(`Verified ${totalInstances} instances`);

        }
        expect(errors.length).toEqual(0);
    }, 60000 * 15 * 100);
});

async function getBestuurseenhedenIds(): Promise<string[]> {
    const query = `
            ${PREFIX.besluit}
            SELECT ?id WHERE {
                GRAPH ${sparqlEscapeUri(PUBLIC_GRAPH)} {
                    ?id a besluit:Bestuurseenheid .
                }
            }
        `;

    const ids = await directDatabaseAccess.list(query);
    return ids.map(id => id['id'].value);

}

async function getPublishedInstancesForBestuurseenheid(bestuurseenheid: Bestuurseenheid): Promise<string[]> {
    const query = `
            ${PREFIX.lpdcExt}
            SELECT ?id WHERE {
                GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                    ?id a lpdcExt:InstancePublicService .
                    ?id <http://schema.org/publication> ?status.
                    FILTER (?status IN (<http://lblod.data.gift/concepts/publication-status/gepubliceerd>, <http://lblod.data.gift/concepts/publication-status/te-herpubliceren>))
                }
            }
            `;
    const ids = await directDatabaseAccess.list(query);
    return ids.map(id => id['id'].value);
}



