import {
    BestuurseenheidSparqlTestRepository
} from "../../test/driven/persistence/bestuurseenheid-sparql-test-repository";
import {DirectDatabaseAccess} from "../../test/driven/persistence/direct-database-access";
import {PREFIX, PUBLIC_GRAPH} from "../../config";
import {sparqlEscapeUri} from "mu";
import {Bestuurseenheid} from "../../src/core/domain/bestuurseenheid";
import {Iri} from "../../src/core/domain/shared/iri";
import {Instance} from "../../src/core/domain/instance";
import {FormalInformalChoice} from "../../src/core/domain/formal-informal-choice";
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
    let totalInstances = 0;
    const insertQuads = [];

    const bestuurseenhedenIds: Iri[] = await getAllBestuurseenheden();

    console.log("total bestuurseenheden " + bestuurseenhedenIds.length);

    for (const bestuurseenheidId of bestuurseenhedenIds) {
        const bestuurseenheid = await bestuurseenheidRepository.findById(bestuurseenheidId);

        const instanceIds = await getAllInstanceIdsForBestuurseenheid(bestuurseenheid);
        totalInstances += instanceIds.length;

        for (const instanceId of instanceIds) {
            const instance = await instanceRepository.findById(bestuurseenheid, instanceId);
            const dutchLanguageVersion = await calculateDutchLanguageVariant(bestuurseenheid, instance);
            const dutchLanguageVersionQuads = dutchLanguageVariantToQuad(instance, bestuurseenheid, dutchLanguageVersion);

            insertQuads.push(dutchLanguageVersionQuads);
        }
        console.log("instances done " + totalInstances);
    }

    fs.writeFileSync(`./migration-results/insertDutchLanguageVariant.ttl`, insertQuads.join('\n'));
    console.log('totalInstances ' + totalInstances);
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


async function calculateDutchLanguageVariant(bestuurseenheid: Bestuurseenheid, instance: Instance): Promise<Language> {
    const dutchLanguageVariantFromFields = instance.calculatedInstanceLanguages();
    if (dutchLanguageVariantFromFields.length != 0) {
        if (dutchLanguageVariantFromFields.length > 1) {
            throw new Error('Meer dan 1 dutchLanguageVariant berekend');
        }
        return dutchLanguageVariantFromFields[0];
    }

    const formalInformalChoice: FormalInformalChoice | undefined = await formalInformalChoiceRepository.findByBestuurseenheid(bestuurseenheid);
    return formalInformalChoice?.chosenForm === ChosenFormType.INFORMAL ? Language.INFORMAL : Language.FORMAL;
}

function dutchLanguageVariantToQuad(instance: Instance, bestuurseenheid: Bestuurseenheid, dutchLanguageVariant: string): string {
    return `<${instance.id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#dutchLanguageVariant> """${dutchLanguageVariant}""" <${bestuurseenheid.userGraph()}> .`;
}


main();
