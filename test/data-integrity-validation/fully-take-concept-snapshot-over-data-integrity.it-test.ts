import {END2END_TEST_SPARQL_ENDPOINT} from "../test.config";
import {DirectDatabaseAccess} from "../driven/persistence/direct-database-access";
import {PREFIX, PUBLIC_GRAPH} from "../../config";
import {sparqlEscapeUri} from "../../mu-helper";
import {BestuurseenheidSparqlTestRepository} from "../driven/persistence/bestuurseenheid-sparql-test-repository";
import {Iri} from "../../src/core/domain/shared/iri";
import {Bestuurseenheid} from "../../src/core/domain/bestuurseenheid";
import fs from "fs";
import {sortedUniq} from "lodash";
import {ConceptSparqlRepository} from "../../src/driven/persistence/concept-sparql-repository";
import {ConceptSnapshotSparqlRepository} from "../../src/driven/persistence/concept-snapshot-sparql-repository";
import {
    BringInstanceUpToDateWithConceptSnapshotVersionDomainService
} from "../../src/core/domain/bring-instance-up-to-date-with-concept-snapshot-version-domain-service";
import {SelectConceptLanguageDomainService} from "../../src/core/domain/select-concept-language-domain-service";
import {InstanceSparqlRepository} from "../../src/driven/persistence/instance-sparql-repository";

const endPoint = END2END_TEST_SPARQL_ENDPOINT;
const directDatabaseAccess = new DirectDatabaseAccess(endPoint);
const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(endPoint);
const conceptRepository = new ConceptSparqlRepository(endPoint);
const conceptSnapshotRepository = new ConceptSnapshotSparqlRepository(endPoint);
const instanceRepository = new InstanceSparqlRepository(endPoint);
const selectConceptLanguageDomainService = new SelectConceptLanguageDomainService();
const bringInstanceUpToDateWithConceptSnapshotVersionDomainService = new BringInstanceUpToDateWithConceptSnapshotVersionDomainService(instanceRepository, conceptRepository, conceptSnapshotRepository, selectConceptLanguageDomainService);

describe('fully take concept snapshot over', () => {

    test.skip('Load all published instances; and verify ', async () => {
        const bestuurseenhedenIds: string[] = await getBestuurseenhedenIds();
        let errors: string[] = [];
        let totalInstances = 0;

        console.log(`Total amount of bestuurseenheden: ${bestuurseenhedenIds.length} `);

        if (!fs.existsSync(`/tmp/failing-fully-take-concept-snapshot-over`)) {
            fs.mkdirSync(`/tmp/failing-fully-take-concept-snapshot-over`);
        }

        for (const bestuurseenheidId of bestuurseenhedenIds) {
            const bestuurseenheid: Bestuurseenheid = await bestuurseenheidRepository.findById(new Iri(bestuurseenheidId));
            const instanceIds: string[] = await getInstancesWithHerzieningNodigForBestuurseenheid(bestuurseenheid);
            console.log(`Verifying bestuurseenheid ${bestuurseenheidId} with ${instanceIds.length} herziening nodig instances`);

            const instanceErrors = [];
            for (const instanceId of instanceIds) {
                console.log(`${(new Date()).toISOString()} - ${instanceId}`);
                try {

                    const instance = await instanceRepository.findById(bestuurseenheid, new Iri(instanceId));
                    const concept = await conceptRepository.findById(instance.conceptId);
                    const conceptSnapshot = await conceptSnapshotRepository.findById(concept.latestConceptSnapshot);

                    await bringInstanceUpToDateWithConceptSnapshotVersionDomainService.fullyTakeConceptSnapshotOver(bestuurseenheid, instance, instance.dateModified, conceptSnapshot);
                } catch (e) {
                    errors = [...errors, `Bestuurseenheid: ${bestuurseenheid.id.value} and instance ${instanceId}`];
                    console.error(e);
                    instanceErrors.push(`${e} for instance ${instanceId}`);
                }
            }
            if (instanceErrors.length != 0) {
                fs.writeFileSync(`/tmp/failing-fully-take-concept-snapshot-over/${bestuurseenheid.uuid}.txt`, sortedUniq(instanceErrors).join('\n'));
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

async function getInstancesWithHerzieningNodigForBestuurseenheid(bestuurseenheid: Bestuurseenheid): Promise<string[]> {
    const query = `
            ${PREFIX.lpdcExt}
            ${PREFIX.ext}
           
            SELECT ?id WHERE {
                GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                    ?id a lpdcExt:InstancePublicService .
                    ?id ext:reviewStatus ?reviewStatus.
                    FILTER (?reviewStatus IN (<http://lblod.data.gift/concepts/review-status/concept-gewijzigd>, <http://lblod.data.gift/concepts/review-status/concept-gearchiveerd>))
                }
            }
            `;
    const ids = await directDatabaseAccess.list(query);
    return ids.map(id => id['id'].value);
}



