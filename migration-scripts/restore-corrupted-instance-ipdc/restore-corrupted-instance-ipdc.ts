import {BestuurseenheidSparqlRepository} from "../../src/driven/persistence/bestuurseenheid-sparql-repository";
import {Iri} from "../../src/core/domain/shared/iri";
import {Instance, InstanceBuilder} from "../../src/core/domain/instance";
import {Language} from "../../src/core/domain/language";
import {SystemError} from "../../src/core/domain/shared/lpdc-error";
import {Bestuurseenheid} from "../../src/core/domain/bestuurseenheid";
import {
    DoubleQuadReporter,
    LoggingDoubleQuadReporter,
    QuadsToDomainMapper
} from "../../src/driven/shared/quads-to-domain-mapper";
import {graph, isBlankNode, isLiteral, Literal, NamedNode, parse, Statement} from "rdflib";
import {Logger} from "../../platform/logger";
import {InstanceStatusType} from "../../src/core/domain/types";
import {last, uniq} from "lodash";
import {ConceptSparqlRepository} from "../../src/driven/persistence/concept-sparql-repository";
import {DomainToQuadsMapper} from "../../src/driven/persistence/domain-to-quads-mapper";
import {NS} from "../../src/driven/persistence/namespaces";
import {uuid} from "../../mu-helper";
import fs from "fs";

const sparqlurl = process.env.SPARQL_URL;
const ipdcApiEndpoint = process.env.IPDC_API_ENDPOINT;
const ipdcApiKey = process.env.IPDC_API_KEY;

const bestuurseenheidId = new Iri('http://data.lblod.info/id/bestuurseenheden/23d04e951dabc6c108803eac7e8faf08c639ba6984d1cda170f09fbd8a511855');
const graphId = new Iri("http://mu.semte.ch/graphs/organizations/23d04e951dabc6c108803eac7e8faf08c639ba6984d1cda170f09fbd8a511855/LoketLB-LPDCGebruiker");
const choseForm = Language.INFORMAL;
const bestuurseenheidRepository = new BestuurseenheidSparqlRepository(sparqlurl);
const conceptRepository = new ConceptSparqlRepository(sparqlurl);
const domainToQuadsMapper = new DomainToQuadsMapper(graphId);

async function fetchIpdcInstance() {
    const bestuurseenheid = await bestuurseenheidRepository.findById(bestuurseenheidId);

    const jsonInstance = await fetchInstance(new Iri('http://data.lblod.info/id/public-service/1ba9cd8f-6592-4edd-805b-833dc63d2a94'), "1ba9cd8f-6592-4edd-805b-833dc63d2a94");
    jsonInstance['@context'] = await fetchContext(jsonInstance['@context']);
    const instance = await mapInstance(JSON.stringify(jsonInstance), bestuurseenheid, choseForm);
    const quads = domainToQuadsMapper.instanceToQuads(instance);
    fs.writeFileSync(`./migration-results/restore-corrupted-instance-ipdc.ttl`, quads.map(quad => quad.toCanonical()).join('\n'));
}

async function fetchInstance(id: Iri, uuid: string) {
    const response = await fetch(`${ipdcApiEndpoint}/doc/instantie/${uuid}`, {
        headers: {'Accept': 'application/ld+json', 'x-api-key': ipdcApiKey}
    });
    if (response.ok) {
        const instanceJson = await response.json();
        // ipdc generates a new iri-id for our id ; so we need to mimic in the read data that it is our id referenced ...
        instanceJson['@id'] = id.value;
        return instanceJson;
    }
    if (response.status === 401) {
        console.error(await response.text());
        throw new SystemError(`Niet geauthenticeerd bij ipdc`);
    } else if (response.status === 404) {
        console.error(await response.text());
        throw new SystemError(`Instantie ${uuid} niet gevonden bij ipdc`);
    } else {
        console.error(await response.text());
        throw new SystemError(`Er is een fout opgetreden bij het bevragen van Ipdc voor instantie ${uuid}; status=[${response.status}]`);
    }
}

async function fetchContext(context: string) {
    const response = await fetch(context, {
        headers: {'Accept': 'application/ld+json', 'x-api-key': ipdcApiKey}
    });
    if (response.ok) {
        const contextAsJson = await response.json();
        const expandedContext = contextAsJson['@context'];
        if (!expandedContext) {
            console.error(`Context ${context} is incorrect [${JSON.stringify(contextAsJson)}] `);
            throw new SystemError(`Er is een fout opgetreden bij het bevragen van de context ${context} bij Ipdc, context was incorrect`);
        }
        return expandedContext;
    } else if (response.status === 401) {
        console.error(await response.text());
        throw new SystemError(`Niet geauthenticeerd bij ipdc`);
    } else {
        console.error(await response.text());
        throw new SystemError(`Er is een fout opgetreden bij het bevragen van de context ${context} bij Ipdc; status=[${response.status}]`);
    }
}

async function mapInstance(jsonLdData: string, bestuurseenheid: Bestuurseenheid, chosenLanguage: Language): Promise<Instance> {
    const quadsToDomainMapper = await new Promise<QuadsToDomainMapper>((resolve, reject) => {

        const store = graph();
        parse(jsonLdData, store, bestuurseenheid.userGraph().value, 'application/ld+json', (error: any, kb: any) => {
            if (error) {
                reject(error);
                return;
            }

            const doubleQuadReporter: DoubleQuadReporter = new LoggingDoubleQuadReporter(new Logger('Instance-QuadsToDomainLogger'));
            const quads: Statement[] = kb.statementsMatching().filter(quad => {
                if (isLiteral(quad.object) && (quad.object as Literal).language) {
                    return (quad.object as Literal).language == 'nl';
                }
                return true;
            });
            const uuids = uniq(quads
                .filter(quad => isBlankNode(quad.subject))
                .map(quad => quad.subject))
                .map(blankNode => new Statement(blankNode, new NamedNode(NS.mu('uuid').value), new Literal(uuid()), new NamedNode(graphId.value)));
            const mapper: QuadsToDomainMapper = new QuadsToDomainMapper([...quads, ...uuids], bestuurseenheid.userGraph(), doubleQuadReporter);

            resolve(mapper);
        });
    });
    return toInstance(quadsToDomainMapper, chosenLanguage, bestuurseenheid);
}


async function toInstance(mapper: QuadsToDomainMapper, chosenLanguage: Language, bestuurseenheid: Bestuurseenheid): Promise<Instance> {
    const id = new Iri('http://data.lblod.info/id/public-service/1ba9cd8f-6592-4edd-805b-833dc63d2a94');
    const uuid = last(id.value.split('/'));
    const concept = await conceptRepository.findById(mapper.conceptId(id));
    return new InstanceBuilder()
        .withId(id)
        .withUuid(uuid)
        .withCreatedBy(bestuurseenheid.id)
        .withTitle(mapper.title(id)?.transformLanguage(Language.NL, chosenLanguage))
        .withDescription(mapper.description(id)?.transformLanguage(Language.NL, chosenLanguage))
        .withAdditionalDescription(mapper.additionalDescription(id)?.transformLanguage(Language.NL, chosenLanguage))
        .withException(mapper.exception(id)?.transformLanguage(Language.NL, chosenLanguage))
        .withRegulation(mapper.regulation(id)?.transformLanguage(Language.NL, chosenLanguage))
        .withStartDate(mapper.startDate(id))
        .withEndDate(mapper.endDate(id))
        .withType(mapper.productType(id))
        .withTargetAudiences(mapper.targetAudiences(id))
        .withThemes(mapper.themes(id))
        .withCompetentAuthorityLevels(mapper.competentAuthorityLevels(id))
        .withCompetentAuthorities([bestuurseenheidId])
        .withExecutingAuthorityLevels(mapper.executingAuthorityLevels(id))
        .withExecutingAuthorities([bestuurseenheidId])
        .withPublicationMedia(mapper.publicationMedia(id))
        .withYourEuropeCategories(mapper.yourEuropeCategories(id))
        .withKeywords(mapper.keywords(id))
        .withRequirements(mapper.requirements(id).map(req => req.transformLanguage(Language.NL, chosenLanguage).transformWithNewId()))
        .withProcedures(mapper.procedures(id).map(pr => pr.transformLanguage(Language.NL, chosenLanguage).transformWithNewId()))
        .withWebsites(mapper.websites(id).map(w => w.transformLanguage(Language.NL, chosenLanguage).transformWithNewId()))
        .withCosts(mapper.costs(id).map(co => co.transformLanguage(Language.NL, chosenLanguage).transformWithNewId()))
        .withFinancialAdvantages(mapper.financialAdvantages(id).map(fa => fa.transformLanguage(Language.NL, chosenLanguage).transformWithNewId()))
        .withContactPoints(mapper.contactPoints(id))
        .withConceptId(concept.id)
        .withConceptSnapshotId(concept.latestConceptSnapshot)
        .withProductId(mapper.productId(id))
        .withLanguages(mapper.languages(id))
        .withDutchLanguageVariant(chosenLanguage)
        .withNeedsConversionFromFormalToInformal(false)
        .withDateCreated(mapper.dateCreated(id))
        .withDateModified(mapper.dateModified(id))
        .withDateSent(undefined)
        .withDatePublished(undefined)
        .withStatus(InstanceStatusType.ONTWERP)
        .withReviewStatus(undefined)
        .withPublicationStatus(undefined)
        .withSpatials(mapper.spatials(id))
        .withLegalResources(mapper.legalResources(id))
        .withDutchLanguageVariant(Language.INFORMAL)
        .build();
}

fetchIpdcInstance();
