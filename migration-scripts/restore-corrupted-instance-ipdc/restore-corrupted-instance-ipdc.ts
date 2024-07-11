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
import {uniq} from "lodash";
import {ConceptSparqlRepository} from "../../src/driven/persistence/concept-sparql-repository";
import {DomainToQuadsMapper} from "../../src/driven/persistence/domain-to-quads-mapper";
import {NS} from "../../src/driven/persistence/namespaces";
import {sparqlEscapeUri, uuid} from "../../mu-helper";
import fs from "fs";
import {FormatPreservingDate} from "../../src/core/domain/format-preserving-date";
import {PublishedInstanceSnapshotBuilder} from "../../src/core/domain/published-instance-snapshot";
import {AdressenRegisterFetcher} from "../../src/driven/external/adressen-register-fetcher";
import {Address, AddressBuilder} from "../../src/core/domain/address";
import {ContactPoint, ContactPointBuilder} from "../../src/core/domain/contact-point";
import {
    DatastoreToQuadsRecursiveSparqlFetcher
} from "../../src/driven/persistence/datastore-to-quads-recursive-sparql-fetcher";

const sparqlurl = process.env.SPARQL_URL;
const ipdcApiEndpoint = process.env.IPDC_API_ENDPOINT;
const ipdcApiKey = process.env.IPDC_API_KEY;

// VARIABLES TO SET
const instanceUuid = '7bfbb658-acdc-400b-addb-616d051f2ac6';
const instanceIri = InstanceBuilder.buildIri(instanceUuid);
const bestuurseenheidId = new Iri('http://data.lblod.info/id/bestuurseenheden/f4a187c72e551b9d7745e3b8602b11f12ce0fd5399c7f8aebbd4f8f42dc9c028');
const graphId = new Iri("http://mu.semte.ch/graphs/organizations/f4a187c72e551b9d7745e3b8602b11f12ce0fd5399c7f8aebbd4f8f42dc9c028/LoketLB-LPDCGebruiker");
const choseForm = Language.FORMAL;

const bestuurseenheidRepository = new BestuurseenheidSparqlRepository(sparqlurl);
const conceptRepository = new ConceptSparqlRepository(sparqlurl);
const fetcher = new DatastoreToQuadsRecursiveSparqlFetcher(sparqlurl);
const domainToQuadsMapper = new DomainToQuadsMapper(graphId);
const addressFetcher = new AdressenRegisterFetcher();

async function fetchIpdcInstance() {
    const bestuurseenheid = await bestuurseenheidRepository.findById(bestuurseenheidId);

    const oldInstancequads = await fetchExistingTriples(bestuurseenheid, instanceIri);


    fs.writeFileSync(`./migration-results/delete-corrupted-instance-${instanceUuid}.sparql`,
        `DELETE DATA {
                    GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                        ${oldInstancequads.map(quad => (quad as Statement).toNT()).join('\n')}
                    }
               }`);

    const jsonInstance = await fetchInstance(instanceIri, instanceUuid);
    jsonInstance['@context'] = await fetchContext(jsonInstance['@context']);
    const instance = await mapInstance(JSON.stringify(jsonInstance), bestuurseenheid, choseForm);
    const publishedInstanceSnapshot = PublishedInstanceSnapshotBuilder.from(instance);
    const instanceQuads = domainToQuadsMapper.instanceToQuads(instance);
    const publishedInstanceQuads = domainToQuadsMapper.publishedInstanceSnapshotToQuads(publishedInstanceSnapshot);
    const quads = [...instanceQuads, ...publishedInstanceQuads];
    fs.writeFileSync(`./migration-results/restore-corrupted-instance-ipdc-${instanceUuid}.ttl`, quads.map(quad => quad.toCanonical()).join('\n'));
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
            // filter out other language versions and keep only nl version, nl contains the original language.
            const quads: Statement[] = kb.statementsMatching().filter(quad => {
                if (isLiteral(quad.object) && (quad.object as Literal).language) {
                    return (quad.object as Literal).language == 'nl';
                }
                return true;
            });

            // add uuid triples
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
    const concept = await conceptRepository.findById(mapper.conceptId(instanceIri));
    if (!mapper.createdBy(instanceIri).equals(bestuurseenheid.id)) {
        throw new Error(`createdby (${mapper.createdBy(instanceIri)}) from ipdc does not match bestuurseenheid ${bestuurseenheid.id}`);
    }

    const contactPoints = await mapContactpoints(mapper.contactPoints(instanceIri));


    return new InstanceBuilder()
        .withId(instanceIri)
        .withUuid(instanceUuid)
        .withCreatedBy(bestuurseenheid.id)
        .withTitle(mapper.title(instanceIri)?.transformLanguage(Language.NL, chosenLanguage))
        .withDescription(mapper.description(instanceIri)?.transformLanguage(Language.NL, chosenLanguage))
        .withAdditionalDescription(mapper.additionalDescription(instanceIri)?.transformLanguage(Language.NL, chosenLanguage))
        .withException(mapper.exception(instanceIri)?.transformLanguage(Language.NL, chosenLanguage))
        .withRegulation(mapper.regulation(instanceIri)?.transformLanguage(Language.NL, chosenLanguage))
        .withStartDate(mapper.startDate(instanceIri))
        .withEndDate(mapper.endDate(instanceIri))
        .withType(mapper.productType(instanceIri))
        .withTargetAudiences(mapper.targetAudiences(instanceIri))
        .withThemes(mapper.themes(instanceIri))
        .withCompetentAuthorityLevels(mapper.competentAuthorityLevels(instanceIri))
        .withCompetentAuthorities([bestuurseenheidId]) //TODO Watch out IPDC translates to wegwijs iri, manually check this
        .withExecutingAuthorityLevels(mapper.executingAuthorityLevels(instanceIri))
        .withExecutingAuthorities([bestuurseenheidId]) //TODO IWatch out IPDC translates to wegwijs iri, manually check this
        .withPublicationMedia(mapper.publicationMedia(instanceIri))
        .withYourEuropeCategories(mapper.yourEuropeCategories(instanceIri))
        .withKeywords(mapper.keywords(instanceIri))
        .withRequirements(mapper.requirements(instanceIri).map(req => req.transformLanguage(Language.NL, chosenLanguage).transformWithNewId()))
        .withProcedures(mapper.procedures(instanceIri).map(pr => pr.transformLanguage(Language.NL, chosenLanguage).transformWithNewId()))
        .withWebsites(mapper.websites(instanceIri).map(w => w.transformLanguage(Language.NL, chosenLanguage).transformWithNewId()))
        .withCosts(mapper.costs(instanceIri).map(co => co.transformLanguage(Language.NL, chosenLanguage).transformWithNewId()))
        .withFinancialAdvantages(mapper.financialAdvantages(instanceIri).map(fa => fa.transformLanguage(Language.NL, chosenLanguage).transformWithNewId()))
        .withContactPoints(contactPoints)
        .withConceptId(concept.id)
        .withConceptSnapshotId(concept.latestConceptSnapshot)
        .withProductId(concept.productId)
        .withLanguages(mapper.languages(instanceIri))
        .withDutchLanguageVariant(chosenLanguage)
        .withNeedsConversionFromFormalToInformal(false)
        .withDateCreated(mapper.dateCreated(instanceIri))
        .withDateModified(mapper.dateModified(instanceIri))
        .withDateSent(FormatPreservingDate.now())
        .withStatus(InstanceStatusType.VERZONDEN)
        .withReviewStatus(undefined)
        .withSpatials(mapper.spatials(instanceIri))
        .withLegalResources(mapper.legalResources(instanceIri).map(lr => lr.transformLanguage(Language.FORMAL, chosenLanguage).transformWithNewId()))
        .withForMunicipalityMerger(false)
        .build();
}

async function mapContactpoints(contactPoints: ContactPoint[]): Promise<ContactPoint[]> {
    const result = [];
    for (const cp of contactPoints) {
        const address = await addAdressId(cp.address);
        result.push(ContactPointBuilder.from(cp).withAddress(address).build().transformWithNewId());
    }
    return result;
}

async function addAdressId(address: Address): Promise<Address> {
    const match = await addressFetcher.findAddressMatch(
        address.gemeentenaam?.nl,
        address.straatnaam?.nl,
        address.huisnummer,
        address.busnummer
    );

    if (match) {
        return AddressBuilder.from(address).withVerwijstNaar(new Iri(match['adressenRegisterId'])).build();
    }
    return address;
}

async function fetchExistingTriples(bestuurseenheid: Bestuurseenheid, instanceId: Iri) {
    return fetcher.fetch(
        bestuurseenheid.userGraph(),
        instanceId,
        [],
        [
            NS.lpdcExt('yourEuropeCategory').value,
            NS.lpdcExt('targetAudience').value,
            NS.m8g('thematicArea').value,
            NS.lpdcExt('competentAuthorityLevel').value,
            NS.m8g('hasCompetentAuthority').value,
            NS.lpdcExt('executingAuthorityLevel').value,
            NS.lpdcExt('hasExecutingAuthority').value,
            NS.lpdcExt('publicationMedium').value,
            NS.dct("type").value,
            NS.lpdcExt("conceptTag").value,
            NS.adms('status').value,
            NS.ext('hasVersionedSource').value,
            NS.dct('source').value,
            NS.dct('spatial').value,
            NS.pav('createdBy').value,
        ],
        [
            NS.skos('Concept').value,
            NS.lpdcExt('ConceptDisplayConfiguration').value,
            NS.besluit('Bestuurseenheid').value,
            NS.m8g('PublicOrganisation').value,
            NS.lpdcExt('InstancePublicServiceSnapshot').value,
            NS.lpdcExt('ConceptualPublicService').value,
            NS.lpdcExt('ConceptualPublicServiceSnapshot').value,
        ]);
}

fetchIpdcInstance();
