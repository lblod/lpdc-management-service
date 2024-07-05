import {sparqlEscapeDateTime, sparqlEscapeUri} from "../../mu-helper";
import {Iri} from "../../src/core/domain/shared/iri";
import {InstanceSparqlRepository} from "../../src/driven/persistence/instance-sparql-repository";
import fs from "fs";
import {BestuurseenheidSparqlRepository} from "../../src/driven/persistence/bestuurseenheid-sparql-repository";
import {DomainToQuadsMapper} from "../../src/driven/persistence/domain-to-quads-mapper";
import {BestuurseenheidTestBuilder} from "../../test/core/domain/bestuurseenheid-test-builder";
import {NS} from "../../src/driven/persistence/namespaces";
import {InstancePublicationStatusType} from "../../src/core/domain/types";
import {Bestuurseenheid} from "../../src/core/domain/bestuurseenheid";

const endPoint = process.env.SPARQL_URL;
const bestuurseenheidRepository = new BestuurseenheidSparqlRepository(endPoint);
const instanceRepository = new InstanceSparqlRepository(endPoint);


async function main(bestuurseenheidId: Iri) {
    const insertQuads = [];
    const deleteQuads = [];
    const bestuurseeheid = await bestuurseenheidRepository.findById(bestuurseenheidId);

    const domainToQuadsMerger = new DomainToQuadsMapper(bestuurseeheid.userGraph());

    const instanceIds: string[] = fs.readFileSync(`migration-results/initial-instances.ttl`, 'utf8').split('\n');


    console.log(`Instances to archive: ${instanceIds.length}`);
    for (const instanceId of instanceIds) {
        const instance = await instanceRepository.findById(bestuurseeheid, new Iri(instanceId));

        if (instance.publicationStatus) {
            const quads = tombstoneQuads(instance.id.value);
            insertQuads.push(quads);
        }

        const quads = domainToQuadsMerger.instanceToQuads(instance).map(quad => quad.toNT()).join('\n');
        deleteQuads.push(quads);
    }
    createSparql(bestuurseeheid, insertQuads, deleteQuads);
}

function tombstoneQuads(instanceId: string) {
    const tombstoneQuads = [];
    const now = new Date();
    tombstoneQuads.push(`${sparqlEscapeUri(instanceId)} a <https://www.w3.org/ns/activitystreams#Tombstone> .`);
    tombstoneQuads.push(`${sparqlEscapeUri(instanceId)} <https://www.w3.org/ns/activitystreams#formerType> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService> .`);
    tombstoneQuads.push(`${sparqlEscapeUri(instanceId)} <https://www.w3.org/ns/activitystreams#deleted> ${sparqlEscapeDateTime(now)} .`);
    tombstoneQuads.push(`${sparqlEscapeUri(instanceId)} <http://schema.org/publication> ${NS.concepts.publicationStatus(InstancePublicationStatusType.TE_HERPUBLICEREN)} .`);

    return tombstoneQuads.join(`\n`);
}

function createSparql(bestuurseenheid: Bestuurseenheid, insertQuads, deleteQuads) {
    const query = `
        
        WITH ${sparqlEscapeUri(bestuurseenheid.userGraph())}
        DELETE {
            ${deleteQuads.join("\n")}                        
        }            
        INSERT { 
            ${insertQuads.join("\n")}        
        }     
        WHERE {
            
        }
           
        `;

    fs.writeFileSync(`./migration-results/archive-instances.sparql`, query);
}


const pepingen = BestuurseenheidTestBuilder.PEPINGEN_IRI;

const bestuurseenheid = new Iri(pepingen.value);

main(bestuurseenheid);
