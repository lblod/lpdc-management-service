import {
    BestuurseenheidSparqlTestRepository
} from "../../test/driven/persistence/bestuurseenheid-sparql-test-repository";
import {DirectDatabaseAccess} from "../../test/driven/persistence/direct-database-access";
import {PREFIX, PUBLIC_GRAPH} from "../../config";
import {sparqlEscapeUri} from "mu";
import {Bestuurseenheid} from "../../src/core/domain/bestuurseenheid";
import {Iri} from "../../src/core/domain/shared/iri";
import {Instance} from "../../src/core/domain/instance";
import {ChosenFormType} from "../../src/core/domain/types";
import {Language} from "../../src/core/domain/language";
import fs from "fs";
import {
    FormalInformalChoiceSparqlRepository
} from "../../src/driven/persistence/formal-informal-choice-sparql-repository";
import {InstanceSparqlRepository} from "../../src/driven/persistence/instance-sparql-repository";

const endPoint = process.env.SPARQL_URL;

const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(endPoint);
const directDatabaseAccess = new DirectDatabaseAccess(endPoint);
const instanceRepository = new InstanceSparqlRepository(endPoint);
const formalInformalChoiceRepository = new FormalInformalChoiceSparqlRepository(endPoint);


async function main() {
    const insertQuads = [];

    const bestuurseenhedenIds: Iri[] = await getAllBestuurseenheden();

    console.log("total bestuurseenheden " + bestuurseenhedenIds.length);

    for (const bestuurseenheidId of bestuurseenhedenIds) {
        const bestuurseenheid = await bestuurseenheidRepository.findById(bestuurseenheidId);
        const formalInformalChoice = await formalInformalChoiceRepository.findByBestuurseenheid(bestuurseenheid);
        const instanceIds = await getAllInstanceIdsForBestuurseenheid(bestuurseenheid);

        for (const instanceId of instanceIds) {
            const instance = await instanceRepository.findById(bestuurseenheid, instanceId);
            if (formalInformalChoice?.chosenForm === ChosenFormType.INFORMAL) {
                const needsConversionFromFormalToInformal = instance.dutchLanguageVariant !== Language.INFORMAL;
                const quad = toQuad(instance, needsConversionFromFormalToInformal, bestuurseenheid);
                insertQuads.push(quad);
            } else {
                const quad = toQuad(instance, false, bestuurseenheid);
                insertQuads.push(quad);
            }
        }
        console.log("instances done " + insertQuads.length);
    }

    fs.writeFileSync(`./migration-results/needsConversionFromFormalToInformal.ttl`, insertQuads.join('\n'));
}

function toQuad(instance: Instance, needsConversionFromFormalToInformal: boolean, bestuurseenheid: Bestuurseenheid): string {
    return `<${instance.id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#needsConversionFromFormalToInformal> """${needsConversionFromFormalToInformal.toString()}"""^^<http://www.w3.org/2001/XMLSchema#boolean> <${bestuurseenheid.userGraph()}> .`;
}

async function getAllBestuurseenheden(): Promise<Iri[]> {
    const query = `
            ${PREFIX.besluit}
            SELECT ?id WHERE {
                GRAPH ${sparqlEscapeUri(PUBLIC_GRAPH)} {
                    ?id a besluit:Bestuurseenheid .
                }
            }
        `;
    const bestuurseenheden = await directDatabaseAccess.list(query);
    return bestuurseenheden.map(bestuurseenheid => new Iri(bestuurseenheid['id'].value));
}

async function getAllInstanceIdsForBestuurseenheid(bestuurseenheid: Bestuurseenheid): Promise<Iri[]> {
    const query = `
            ${PREFIX.lpdcExt}
            SELECT ?id WHERE {
                GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                    ?id a lpdcExt:InstancePublicService .
                }
            }
            `;
    const instanceIds = await directDatabaseAccess.list(query);
    return instanceIds.map(instanceId => new Iri(instanceId['id'].value));
}

main();
