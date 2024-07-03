import {DirectDatabaseAccess} from "../../test/driven/persistence/direct-database-access";
import {PREFIX} from "../../config";
import {sparqlEscapeUri, uuid} from "../../mu-helper";
import {Bestuurseenheid} from "../../src/core/domain/bestuurseenheid";
import {Iri} from "../../src/core/domain/shared/iri";
import {InstanceSparqlRepository} from "../../src/driven/persistence/instance-sparql-repository";
import fs from "fs";
import {BestuurseenheidSparqlRepository} from "../../src/driven/persistence/bestuurseenheid-sparql-repository";
import {DomainToQuadsMapper} from "../../src/driven/persistence/domain-to-quads-mapper";
import {BestuurseenheidTestBuilder} from "../../test/core/domain/bestuurseenheid-test-builder";
import {Instance, InstanceBuilder} from "../../src/core/domain/instance";
import {ChosenFormType, CompetentAuthorityLevelType, InstanceStatusType} from "../../src/core/domain/types";
import {FormatPreservingDate} from "../../src/core/domain/format-preserving-date";
import {
    FormalInformalChoiceSparqlRepository
} from "../../src/driven/persistence/formal-informal-choice-sparql-repository";
import {InvariantError} from "../../src/core/domain/shared/lpdc-error";
import {Language} from "../../src/core/domain/language";

const endPoint = process.env.SPARQL_URL;
const directDatabaseAccess = new DirectDatabaseAccess(endPoint);
const bestuurseenheidRepository = new BestuurseenheidSparqlRepository(endPoint);
const instanceRepository = new InstanceSparqlRepository(endPoint);
const formalInformalChoiceRepository = new FormalInformalChoiceSparqlRepository(endPoint);

async function main(fromAuthorityId: string, toAuthorityId: string, onlyForMunicipalityMergerInstances: boolean) {
    const insertQuads = [];

    const fromAuthority = await bestuurseenheidRepository.findById(new Iri(fromAuthorityId));
    const toAuthority = await bestuurseenheidRepository.findById(new Iri(toAuthorityId));

    const fromAuthorityChoice = (await formalInformalChoiceRepository.findByBestuurseenheid(fromAuthority))?.chosenForm;
    const toAuthorityChoice = (await formalInformalChoiceRepository.findByBestuurseenheid(toAuthority))?.chosenForm;

    const domainToQuadsMerger = new DomainToQuadsMapper(toAuthority.userGraph());
    const instanceIds: Iri[] = onlyForMunicipalityMergerInstances ? await getAllInstanceIdsWithMunicipalityMergerForBestuurseenheid(fromAuthority) : await getAllInstanceIdsForBestuurseenheid(fromAuthority);

    console.log(`Instances to transfer: ${instanceIds.length}`);
    for (const instanceId of instanceIds) {
        const instance: Instance = await instanceRepository.findById(fromAuthority, instanceId);
        const newInstance: Instance = copyInstance(toAuthority.id, toAuthorityChoice, instance);

        if (toAuthorityChoice === ChosenFormType.FORMAL && fromAuthorityChoice === ChosenFormType.INFORMAL) {
            throw new InvariantError("transforming instance to formal not possible when initialy informal");
        }

        const quads = domainToQuadsMerger.instanceToQuads(newInstance).map(quad => quad.toCanonical()).join('\n');
        insertQuads.push(quads);
    }
    fs.writeFileSync(`./migration-results/transfer-instances.ttl`, insertQuads.join('\n'));
    console.log("instances done " + insertQuads.length);
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

async function getAllInstanceIdsWithMunicipalityMergerForBestuurseenheid(bestuurseenheid: Bestuurseenheid): Promise<Iri[]> {
    const query = `
            ${PREFIX.lpdcExt}
            SELECT ?id WHERE {
                GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                    ?id a lpdcExt:InstancePublicService .
                    ?id lpdcExt:forMunicipalityMerger """true"""^^<http://www.w3.org/2001/XMLSchema#boolean>
                }
            }
            `;
    const instanceIds = await directDatabaseAccess.list(query);
    return instanceIds.map(instanceId => new Iri(instanceId['id'].value));
}


function copyInstance(toAuthorityId: Iri, toAuthorityChoice: ChosenFormType, instanceToCopy: Instance) {
    const instanceUuid = uuid();
    const instanceId = InstanceBuilder.buildIri(instanceUuid);

    const hasCompetentAuthorityLevelLokaal = instanceToCopy.competentAuthorityLevels.includes(CompetentAuthorityLevelType.LOKAAL);
    const needsConversionFromFormalToInformal = (toAuthorityChoice === ChosenFormType.INFORMAL && instanceToCopy.dutchLanguageVariant !== Language.INFORMAL);

    return InstanceBuilder.from(instanceToCopy)
        .withId(instanceId)
        .withUuid(instanceUuid)
        .withCreatedBy(toAuthorityId)
        .withDateCreated(FormatPreservingDate.now())
        .withDateModified(FormatPreservingDate.now())
        .withRequirements(instanceToCopy.requirements.map(req => req.transformWithNewId()))
        .withProcedures(instanceToCopy.procedures.map(proc => proc.transformWithNewId()))
        .withWebsites(instanceToCopy.websites.map(ws => ws.transformWithNewId()))
        .withCosts(instanceToCopy.costs.map(c => c.transformWithNewId()))
        .withFinancialAdvantages(instanceToCopy.financialAdvantages.map(fa => fa.transformWithNewId()))
        .withContactPoints(instanceToCopy.contactPoints.map(fa => fa.transformWithNewId()))
        .withStatus(InstanceStatusType.ONTWERP)
        .withDateSent(undefined)
        .withPublicationStatus(undefined)
        .withDatePublished(undefined)
        .withNeedsConversionFromFormalToInformal(needsConversionFromFormalToInformal)
        .withLegalResources(instanceToCopy.legalResources.map(lr => lr.transformWithNewId()))
        .withSpatials(instanceToCopy.forMunicipalityMerger ? [] : instanceToCopy.spatials)
        .withExecutingAuthorities(instanceToCopy.forMunicipalityMerger ? [] : instanceToCopy.executingAuthorities)
        .withCompetentAuthorities(instanceToCopy.forMunicipalityMerger && hasCompetentAuthorityLevelLokaal ? [] : instanceToCopy.competentAuthorities)
        .withForMunicipalityMerger(false)
        .withCopyOf(instanceToCopy.id)
        .build();
}

const pepingen = BestuurseenheidTestBuilder.PEPINGEN_IRI;
const borgloon = BestuurseenheidTestBuilder.BORGLOON_IRI;


const fromAuthority = pepingen.value;
const toAuthority = borgloon.value;


main(fromAuthority, toAuthority, true);
