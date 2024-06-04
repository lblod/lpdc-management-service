import {BlankNode, NamedNode, Quad} from 'rdflib/lib/tf-types';
import {Iri} from '../../core/domain/shared/iri';
import {blankNode, graph, isBlankNode, isLiteral, isNamedNode, Literal, namedNode, Statement} from 'rdflib';
import {ConceptSnapshot} from '../../core/domain/concept-snapshot';
import {LanguageString} from '../../core/domain/language-string';
import {Cost} from '../../core/domain/cost';
import {asSortedArray} from '../../core/domain/shared/collections-helper';
import {FinancialAdvantage} from '../../core/domain/financial-advantage';
import {Website} from '../../core/domain/website';
import {Procedure, ProcedureBuilder} from '../../core/domain/procedure';
import {Requirement, RequirementBuilder} from '../../core/domain/requirement';
import {Evidence} from '../../core/domain/evidence';
import {NS} from '../persistence/namespaces';
import {FormatPreservingDate} from '../../core/domain/format-preserving-date';
import {
    CompetentAuthorityLevelType,
    ConceptTagType,
    ExecutingAuthorityLevelType,
    InstancePublicationStatusType,
    InstanceReviewStatusType,
    InstanceStatusType,
    LanguageType,
    ProductType,
    PublicationMediumType,
    TargetAudienceType,
    ThemeType,
    YourEuropeCategoryType
} from '../../core/domain/types';
import {Concept} from '../../core/domain/concept';
import {Namespace} from "rdflib/lib/factories/factory-types";
import {STATUS} from "../persistence/status";
import {Instance} from "../../core/domain/instance";
import {ContactPoint} from "../../core/domain/contact-point";
import {Address} from "../../core/domain/address";
import {Logger} from "../../../platform/logger";
import {InstanceSnapshot} from "../../core/domain/instance-snapshot";
import {LegalResource} from "../../core/domain/legal-resource";
import {NotFoundError, SystemError} from "../../core/domain/shared/lpdc-error";
import {Language} from "../../core/domain/language";


export interface DoubleQuadReporter {

    report(graph: string, subject: string, predicate: string, object: string | undefined, expectedCount: number, actualCount: number, triples: string[]): void;

}

export class LoggingDoubleQuadReporter implements DoubleQuadReporter {
    private _logger: Logger;

    constructor(logger: Logger) {
        this._logger = logger;
    }

    report(graph: string, subject: string, predicate: string, object: string, expectedCount: number, actualCount: number, triples: string[]): void {
        this._logger.log(`DoubleQuad|${graph}|${subject}|${predicate}|${object}|${expectedCount}|${actualCount}|${triples.join('|')}`);
    }

}

class StoreAccess {

    private readonly store;
    private readonly graphId;
    private readonly doubleQuadReporter: DoubleQuadReporter;

    constructor(quads: Quad[], graphId: Iri, doubleQuadReporter: DoubleQuadReporter) {
        this.store = graph();
        this.store.addAll(quads);
        this.graphId = namedNode(graphId.value);
        this.doubleQuadReporter = doubleQuadReporter;
    }

    public statements(s: NamedNode | BlankNode,
                      p: NamedNode,
                      options: {
                          validateUniqueLanguages?: boolean;
                          o?: any;
                      } = {validateUniqueLanguages: true, o: null}): Statement[] {

        const result = this.store.statementsMatching(s, p, options?.o, this.graphId);

        if (options?.validateUniqueLanguages) {
            const languageIncidences: { [l: string]: number; } = result
                .filter(s => s.object !== undefined && isLiteral(s.object))
                .map(s => s.object as Literal)
                .filter(lit => lit.language !== null && lit.language !== undefined && lit.language !== '')
                .map(lit => lit.language)
                .reduce((languages: { [l: string]: number; }, language: string) => {
                    languages[language] = (languages[language] || 0) + 1;
                    return languages;
                }, {});
            const maxLanguageIncidenceOfAnyLanguage = Math.max(...Object.values(languageIncidences));
            if (maxLanguageIncidenceOfAnyLanguage > 1) {
                this.doubleQuadReporter.report(this.graphId.value, s.value, p.value, options?.o?.value, 1, maxLanguageIncidenceOfAnyLanguage, result.map(r => r?.object?.toNT()));
            }
        }

        return result;
    }

    public uniqueValue(s: NamedNode | BlankNode,
                       p: NamedNode): string | void {
        return this.uniqueStatement(s, p)?.object?.value;
    }

    public uniqueStatement(s: NamedNode | BlankNode,
                           p: NamedNode,
                           o: NamedNode | BlankNode = null): Statement | undefined {
        const allStatementsMatching = this.statements(s, p, {o: o});
        if (!allStatementsMatching || allStatementsMatching.length === 0) {
            return undefined;
        }

        if (allStatementsMatching.length > 1) {
            this.doubleQuadReporter.report(this.graphId.value, s.value, p.value, o?.value, 1, allStatementsMatching.length, allStatementsMatching.map(r => r?.object?.toNT()));
        }

        return allStatementsMatching[0];
    }

}

export class QuadsToDomainMapper {
    private readonly storeAccess;
    private readonly graphId;

    constructor(quads: Quad[], graphId: Iri, doubleQuadReporter: DoubleQuadReporter) {
        this.storeAccess = new StoreAccess(quads, graphId, doubleQuadReporter);
        this.graphId = namedNode(graphId.value);
    }

    conceptSnapshot(id: Iri): ConceptSnapshot {

        this.errorIfMissingOrIncorrectType(id, NS.lpdcExt('ConceptualPublicServiceSnapshot'));

        return new ConceptSnapshot(
            id,
            this.title(id),
            this.description(id),
            this.additionalDescription(id),
            this.exception(id),
            this.regulation(id),
            this.startDate(id),
            this.endDate(id),
            this.productType(id),
            this.targetAudiences(id),
            this.themes(id),
            this.competentAuthorityLevels(id),
            this.competentAuthorities(id),
            this.executingAuthorityLevels(id),
            this.executingAuthorities(id),
            this.publicationMedia(id),
            this.yourEuropeCategories(id),
            this.keywords(id),
            this.requirements(id)
                .filter(req => req.title !== undefined && req.description != undefined)
                .map(req =>
                    RequirementBuilder.from(req)
                        .withEvidence((req.evidence?.title !== undefined && req.evidence?.description !== undefined) ? req.evidence : undefined)
                        .build()),
            this.procedures(id)
                .filter(proc => proc.title !== undefined && proc.description != undefined)
                .map(proc =>
                    ProcedureBuilder.from(proc)
                        .withWebsites(proc.websites.filter(ws => ws.title !== undefined))
                        .build()),
            this.websites(id).filter(ws => ws.title !== undefined),
            this.costs(id)
                .filter(c => c.title !== undefined && c.description !== undefined),
            this.financialAdvantages(id)
                .filter(fa => fa.title !== undefined && fa.description !== undefined),
            this.isVersionOf(id),
            this.dateCreated(id),
            this.dateModified(id),
            this.generatedAtTime(id),
            this.productId(id),
            this.conceptTags(id),
            this.isArchived(id),
            this.legalResources(id),
        );
    }

    concept(id: Iri): Concept {

        this.errorIfMissingOrIncorrectType(id, NS.lpdcExt('ConceptualPublicService'));

        return new Concept(
            id,
            this.uuid(id),
            this.title(id),
            this.description(id),
            this.additionalDescription(id),
            this.exception(id),
            this.regulation(id),
            this.startDate(id),
            this.endDate(id),
            this.productType(id),
            this.targetAudiences(id),
            this.themes(id),
            this.competentAuthorityLevels(id),
            this.competentAuthorities(id),
            this.executingAuthorityLevels(id),
            this.executingAuthorities(id),
            this.publicationMedia(id),
            this.yourEuropeCategories(id),
            this.keywords(id),
            this.requirements(id),
            this.procedures(id),
            this.websites(id),
            this.costs(id),
            this.financialAdvantages(id),
            this.productId(id),
            this.latestConceptSnapshot(id),
            this.previousConceptSnapshots(id),
            this.latestFunctionallyChangedConceptSnapshot(id),
            this.conceptTags(id),
            this.isConceptArchived(id),
            this.legalResources(id),
        );
    }

    instanceSnapshot(id: Iri): InstanceSnapshot {

        this.errorIfMissingOrIncorrectType(id, NS.lpdcExt('InstancePublicServiceSnapshot'));

        return new InstanceSnapshot(
            id,
            this.createdBy(id),
            this.title(id),
            this.description(id),
            this.additionalDescription(id),
            this.exception(id),
            this.regulation(id),
            this.startDate(id),
            this.endDate(id),
            this.productType(id),
            this.targetAudiences(id),
            this.themes(id),
            this.competentAuthorityLevels(id),
            this.competentAuthorities(id),
            this.executingAuthorityLevels(id),
            this.executingAuthorities(id),
            this.publicationMedia(id),
            this.yourEuropeCategories(id),
            this.keywords(id),
            this.requirements(id),
            this.procedures(id),
            this.websites(id),
            this.costs(id),
            this.financialAdvantages(id),
            this.contactPoints(id),
            this.conceptId(id),
            this.languages(id),
            this.isVersionOf(id),
            this.dateCreated(id),
            this.dateModified(id),
            this.generatedAtTime(id),
            this.isArchived(id),
            this.spatials(id),
            this.legalResources(id),
        );
    }

    instance(id: Iri): Instance {

        this.errorIfMissingOrIncorrectType(id, NS.lpdcExt('InstancePublicService'));

        return new Instance(
            id,
            this.uuid(id),
            this.createdBy(id),
            this.title(id),
            this.description(id),
            this.additionalDescription(id),
            this.exception(id),
            this.regulation(id),
            this.startDate(id),
            this.endDate(id),
            this.productType(id),
            this.targetAudiences(id),
            this.themes(id),
            this.competentAuthorityLevels(id),
            this.competentAuthorities(id),
            this.executingAuthorityLevels(id),
            this.executingAuthorities(id),
            this.publicationMedia(id),
            this.yourEuropeCategories(id),
            this.keywords(id),
            this.requirements(id),
            this.procedures(id),
            this.websites(id),
            this.costs(id),
            this.financialAdvantages(id),
            this.contactPoints(id),
            this.conceptId(id),
            this.conceptSnapshotId(id),
            this.productId(id),
            this.languages(id),
            this.dutchLanguageVariant(id),
            this.needsConversionFromFormalToInformal(id),
            this.dateCreated(id),
            this.dateModified(id),
            this.dateSent(id),
            this.datePublished(id),
            this.instanceStatusType(id),
            this.instanceReviewStatusType(id),
            this.instancePublicationStatusType(id),
            this.spatials(id),
            this.legalResources(id)
        );
    }

    errorIfMissingOrIncorrectType(id: Iri, type: NamedNode) {
        const typeFoundForId: string = this.storeAccess.uniqueValue(this.asNamedOrBlankNode(id), NS.rdf('type'));
        if (!typeFoundForId) {
            throw new NotFoundError(`Kan <${id}> niet vinden voor type ${type} in graph ${this.graphId}`);
        }
        if (type.value !== typeFoundForId) {
            throw new NotFoundError(`Kan <${id}> niet vinden voor type ${type}, maar wel gevonden met type <${typeFoundForId}> in graph ${this.graphId}`);
        }
    }

    startDate(id: Iri): FormatPreservingDate | undefined {
        return this.asFormatPreservingDate(this.storeAccess.uniqueValue(this.asNamedOrBlankNode(id), NS.schema('startDate')));
    }

    endDate(id: Iri): FormatPreservingDate | undefined {
        return this.asFormatPreservingDate(this.storeAccess.uniqueValue(this.asNamedOrBlankNode(id), NS.schema('endDate')));
    }

    productType(id: Iri): ProductType | undefined {
        return this.asEnum(ProductType, NS.dvc.type, this.storeAccess.uniqueStatement(this.asNamedOrBlankNode(id), NS.dct('type')));
    }

    title(id: Iri): LanguageString | undefined {
        return this.asLanguageString(this.storeAccess.statements(this.asNamedOrBlankNode(id), NS.dct('title')));
    }

    description(id: Iri): LanguageString | undefined {
        return this.asLanguageString(this.storeAccess.statements(this.asNamedOrBlankNode(id), NS.dct('description')));
    }

    additionalDescription(id: Iri): LanguageString | undefined {
        return this.asLanguageString(this.storeAccess.statements(this.asNamedOrBlankNode(id), NS.lpdcExt('additionalDescription')));
    }

    exception(id: Iri): LanguageString | undefined {
        return this.asLanguageString(this.storeAccess.statements(this.asNamedOrBlankNode(id), NS.lpdcExt('exception')));
    }

    regulation(id: Iri): LanguageString | undefined {
        return this.asLanguageString(this.storeAccess.statements(this.asNamedOrBlankNode(id), NS.lpdcExt('regulation')));
    }

    private uuid(id: Iri): string | undefined {
        return this.storeAccess.uniqueValue(this.asNamedOrBlankNode(id), NS.mu('uuid'));
    }

    private createdBy(id: Iri): Iri | undefined {
        return this.asIri(this.storeAccess.uniqueStatement(this.asNamedOrBlankNode(id), NS.pav('createdBy')));
    }

    targetAudiences(id: Iri): TargetAudienceType[] {
        return this.asEnums(TargetAudienceType, NS.dvc.doelgroep, this.storeAccess.statements(this.asNamedOrBlankNode(id), NS.lpdcExt('targetAudience')));
    }

    themes(id: Iri): ThemeType[] {
        return this.asEnums(ThemeType, NS.dvc.thema, this.storeAccess.statements(this.asNamedOrBlankNode(id), NS.m8g('thematicArea')));
    }

    competentAuthorityLevels(id: Iri): CompetentAuthorityLevelType[] {
        return this.asEnums(CompetentAuthorityLevelType, NS.dvc.bevoegdBestuursniveau, this.storeAccess.statements(this.asNamedOrBlankNode(id), NS.lpdcExt('competentAuthorityLevel')));
    }

    private competentAuthorities(id: Iri): Iri[] {
        return this.asIris(this.storeAccess.statements(this.asNamedOrBlankNode(id), NS.m8g('hasCompetentAuthority')));
    }

    executingAuthorityLevels(id: Iri): ExecutingAuthorityLevelType[] {
        return this.asEnums(ExecutingAuthorityLevelType, NS.dvc.uitvoerendBestuursniveau, this.storeAccess.statements(this.asNamedOrBlankNode(id), NS.lpdcExt('executingAuthorityLevel')));
    }

    private executingAuthorities(id: Iri): Iri[] {
        return this.asIris(this.storeAccess.statements(this.asNamedOrBlankNode(id), NS.lpdcExt('hasExecutingAuthority')));
    }

    publicationMedia(id: Iri): PublicationMediumType[] {
        return this.asEnums(PublicationMediumType, NS.dvc.publicatieKanaal, this.storeAccess.statements(this.asNamedOrBlankNode(id), NS.lpdcExt('publicationMedium')));
    }

    yourEuropeCategories(id: Iri): YourEuropeCategoryType[] {
        return this.asEnums(YourEuropeCategoryType, NS.dvc.yourEuropeCategorie, this.storeAccess.statements(this.asNamedOrBlankNode(id), NS.lpdcExt('yourEuropeCategory')));
    }

    private email(id: Iri): string | undefined {
        return this.storeAccess.uniqueValue(this.asNamedOrBlankNode(id), NS.schema('email'));
    }

    private telephone(id: Iri): string | undefined {
        return this.storeAccess.uniqueValue(this.asNamedOrBlankNode(id), NS.schema('telephone'));
    }

    private openingHours(id: Iri): string | undefined {
        return this.storeAccess.uniqueValue(this.asNamedOrBlankNode(id), NS.schema('openingHours'));
    }

    private gemeentenaam(id: Iri): LanguageString | undefined {
        return this.asLanguageString(this.storeAccess.statements(this.asNamedOrBlankNode(id), NS.adres('gemeentenaam')));
    }

    private land(id: Iri): LanguageString | undefined {
        return this.asLanguageString(this.storeAccess.statements(this.asNamedOrBlankNode(id), NS.adres('land')));
    }

    private huisnummer(id: Iri): string | undefined {
        return this.storeAccess.uniqueValue(this.asNamedOrBlankNode(id), NS.adres('Adresvoorstelling.huisnummer'));
    }

    private busnummer(id: Iri): string | undefined {
        return this.storeAccess.uniqueValue(this.asNamedOrBlankNode(id), NS.adres('Adresvoorstelling.busnummer'));
    }

    private postcode(id: Iri): string | undefined {
        return this.storeAccess.uniqueValue(this.asNamedOrBlankNode(id), NS.adres('postcode'));
    }

    private straatnaam(id: Iri): LanguageString | undefined {
        return this.asLanguageString(this.storeAccess.statements(this.asNamedOrBlankNode(id), NS.adres('Straatnaam')));
    }

    private verwijstNaar(id: Iri): Iri | undefined {
        return this.asIri(this.storeAccess.uniqueStatement(this.asNamedOrBlankNode(id), NS.adres('verwijstNaar')));
    }

    keywords(id: Iri): LanguageString[] {
        return this.storeAccess.statements(this.asNamedOrBlankNode(id), NS.dcat('keyword'), {validateUniqueLanguages: false})
            .map(s => [s])
            .flatMap(statements => this.asLanguageString(statements))
            .filter(languageString => languageString != undefined);
    }

    private url(id: Iri): string | undefined {
        return this.storeAccess.uniqueValue(this.asNamedOrBlankNode(id), NS.schema('url'));
    }

    private isVersionOf(id: Iri): Iri | undefined {
        return this.asIri(this.storeAccess.uniqueStatement(this.asNamedOrBlankNode(id), NS.dct('isVersionOf')));
    }

    dateCreated(id: Iri): FormatPreservingDate | undefined {
        return this.asFormatPreservingDate(this.storeAccess.uniqueValue(this.asNamedOrBlankNode(id), NS.schema('dateCreated')));
    }

    dateModified(id: Iri): FormatPreservingDate | undefined {
        return this.asFormatPreservingDate(this.storeAccess.uniqueValue(this.asNamedOrBlankNode(id), NS.schema('dateModified')));
    }

    private dateSent(id: Iri): FormatPreservingDate | undefined {
        return this.asFormatPreservingDate(this.storeAccess.uniqueValue(this.asNamedOrBlankNode(id), NS.schema('dateSent')));
    }

    private datePublished(id: Iri): FormatPreservingDate | undefined {
        return this.asFormatPreservingDate(this.storeAccess.uniqueValue(this.asNamedOrBlankNode(id), NS.schema('datePublished')));
    }

    private generatedAtTime(id: Iri): FormatPreservingDate | undefined {
        return this.asFormatPreservingDate(this.storeAccess.uniqueValue(this.asNamedOrBlankNode(id), NS.prov('generatedAtTime')));
    }

    productId(id: Iri): string | undefined {
        return this.storeAccess.uniqueValue(this.asNamedOrBlankNode(id), NS.schema('productID'));
    }

    private latestConceptSnapshot(id: Iri): Iri {
        return this.asIri(this.storeAccess.uniqueStatement(this.asNamedOrBlankNode(id), NS.ext('hasVersionedSource')));
    }

    private previousConceptSnapshots(id: Iri): Iri[] {
        return this.asIris(this.storeAccess.statements(this.asNamedOrBlankNode(id), NS.ext('previousVersionedSource')));
    }

    private latestFunctionallyChangedConceptSnapshot(id: Iri): Iri {
        return this.asIri(this.storeAccess.uniqueStatement(this.asNamedOrBlankNode(id), NS.lpdc('hasLatestFunctionalChange')));
    }

    private conceptTags(id: Iri): ConceptTagType[] {
        return this.asEnums(ConceptTagType, NS.dvc.conceptTag, this.storeAccess.statements(this.asNamedOrBlankNode(id), NS.lpdcExt('conceptTag')));
    }

    private isConceptArchived(id: Iri): boolean {
        return !!this.storeAccess.uniqueStatement(this.asNamedOrBlankNode(id), NS.adms('status'), STATUS.concept.archived);
    }

    instanceStatusType(id: Iri): InstanceStatusType | undefined {
        return this.asEnum(InstanceStatusType, NS.concepts.instanceStatus, this.storeAccess.uniqueStatement(this.asNamedOrBlankNode(id), NS.adms('status')));
    }

    private isArchived(id: Iri): boolean {
        return this.parseBoolean(this.storeAccess.uniqueStatement(this.asNamedOrBlankNode(id), NS.lpdcExt('isArchived'))?.object as Literal);
    }

    private parseBoolean(literal: Literal | undefined): boolean {
        return literal !== undefined
            && literal.datatype.equals(NS.xsd('boolean'))
            && (literal.value === "1" || literal.value === "true");
    }

    private instanceReviewStatusType(id: Iri): InstanceReviewStatusType | undefined {
        return this.asEnum(InstanceReviewStatusType, NS.concepts.reviewStatus, this.storeAccess.uniqueStatement(this.asNamedOrBlankNode(id), NS.ext('reviewStatus')));
    }

    instancePublicationStatusType(id: Iri): InstancePublicationStatusType | undefined {
        return this.asEnum(InstancePublicationStatusType, NS.concepts.publicationStatus, this.storeAccess.uniqueStatement(this.asNamedOrBlankNode(id), NS.schema('publication')));
    }

    spatials(id: Iri): Iri[] {
        return this.asIris(this.storeAccess.statements(this.asNamedOrBlankNode(id), NS.dct('spatial')));
    }

    private asNamedOrBlankNode(id: Iri): NamedNode | BlankNode {
        if (id.value.startsWith('_:')) {
            return blankNode(id.value.substring(2));
        }
        return namedNode(id.value);
    }

    costs(id: Iri): Cost[] {
        const costIds =
            this.asIris(this.storeAccess.statements(this.asNamedOrBlankNode(id), NS.m8g('hasCost')));
        costIds.forEach(costId => this.errorIfMissingOrIncorrectType(costId, NS.m8g('Cost')));

        const costs = costIds.map(costId => Cost.reconstitute(costId, this.uuid(costId), this.title(costId), this.description(costId), this.order(costId)));

        return this.sort(costs);
    }

    financialAdvantages(id: Iri): FinancialAdvantage[] {
        const financialAdvantageIds =
            this.asIris(this.storeAccess.statements(this.asNamedOrBlankNode(id), NS.cpsv('produces')));
        financialAdvantageIds.forEach(financialAdvantageId =>
            this.errorIfMissingOrIncorrectType(financialAdvantageId, NS.lpdcExt('FinancialAdvantage')));

        const financialAdvantages =
            financialAdvantageIds.map(financialAdvantageId =>
                FinancialAdvantage.reconstitute(financialAdvantageId, this.uuid(financialAdvantageId), this.title(financialAdvantageId), this.description(financialAdvantageId), this.order(financialAdvantageId)));

        return this.sort(financialAdvantages);
    }

    contactPoints(id: Iri): ContactPoint[] {
        const contactPointIds =
            this.asIris(this.storeAccess.statements(this.asNamedOrBlankNode(id), NS.m8g('hasContactPoint')));

        contactPointIds.forEach(contactPointId =>
            this.errorIfMissingOrIncorrectType(contactPointId, NS.schema('ContactPoint')));

        const contactPoints: ContactPoint[] =
            contactPointIds.map(contactPointId => {
                return ContactPoint.reconstitute(contactPointId, this.uuid(contactPointId), this.url(contactPointId), this.email(contactPointId), this.telephone(contactPointId), this.openingHours(contactPointId), this.order(contactPointId), this.address(contactPointId));
            });
        return this.sort(contactPoints);
    }

    private address(id: Iri): Address | undefined {
        const addressIds =
            this.asIris(this.storeAccess.statements(this.asNamedOrBlankNode(id), NS.lpdcExt('address')));

        addressIds.forEach(evidenceId =>
            this.errorIfMissingOrIncorrectType(evidenceId, NS.locn('Address')));

        if (addressIds.length > 1) {
            throw new SystemError(`Verwachtte niet meer dan een adres voor ${id}`);
        }
        if (addressIds.length === 0) {
            return undefined;
        }
        const addressId = addressIds[0];
        return Address.reconstitute(
            addressId,
            this.uuid(addressId),
            this.gemeentenaam(addressId),
            this.land(addressId),
            this.huisnummer(addressId),
            this.busnummer(addressId),
            this.postcode(addressId),
            this.straatnaam(addressId),
            this.verwijstNaar(addressId)
        );
    }

    websites(id: Iri, predicate: NamedNode = NS.rdfs('seeAlso')): Website[] {
        const websiteIds =
            this.asIris(this.storeAccess.statements(this.asNamedOrBlankNode(id), predicate));

        websiteIds.forEach(websiteId =>
            this.errorIfMissingOrIncorrectType(websiteId, NS.schema('WebSite')));

        const websites =
            websiteIds.map(websiteId =>
                Website.reconstitute(websiteId, this.uuid(websiteId), this.title(websiteId), this.description(websiteId), this.order(websiteId), this.url(websiteId)));

        return this.sort(websites);
    }

    procedures(id: Iri): Procedure[] {
        const procedureIds =
            this.asIris(this.storeAccess.statements(this.asNamedOrBlankNode(id), NS.cpsv('follows')));

        procedureIds.forEach(procedureId =>
            this.errorIfMissingOrIncorrectType(procedureId, NS.cpsv('Rule')));

        const procedures =
            procedureIds.map(procedureId =>
                Procedure.reconstitute(procedureId, this.uuid(procedureId), this.title(procedureId), this.description(procedureId), this.order(procedureId), this.websites(procedureId, NS.lpdcExt('hasWebsite'))));

        return this.sort(procedures);
    }

    requirements(id: Iri): Requirement[] {
        const requirementIds =
            this.asIris(this.storeAccess.statements(this.asNamedOrBlankNode(id), NS.ps('hasRequirement')));

        requirementIds.forEach(requirementId =>
            this.errorIfMissingOrIncorrectType(requirementId, NS.m8g('Requirement')));

        const requirements =
            requirementIds.map(requirementId =>
                Requirement.reconstitute(
                    requirementId,
                    this.uuid(requirementId),
                    this.title(requirementId),
                    this.description(requirementId),
                    this.order(requirementId),
                    this.evidence(requirementId),
                ));

        return this.sort(requirements);
    }

    private evidence(id: Iri): Evidence | undefined {
        const evidenceIds =
            this.asIris(this.storeAccess.statements(this.asNamedOrBlankNode(id), NS.m8g('hasSupportingEvidence')));

        evidenceIds.forEach(evidenceId =>
            this.errorIfMissingOrIncorrectType(evidenceId, NS.m8g('Evidence')));

        if (evidenceIds.length > 1) {
            throw new SystemError(`Did not expect more than one evidence for ${id}`);
        }
        if (evidenceIds.length === 0) {
            return undefined;
        }
        return Evidence.reconstitute(evidenceIds[0], this.uuid(evidenceIds[0]), this.title(evidenceIds[0]), this.description(evidenceIds[0]));
    }

    legalResources(id: Iri): LegalResource[] {
        const legalResourceIds =
            this.asIris(this.storeAccess.statements(this.asNamedOrBlankNode(id), NS.m8g('hasLegalResource')));

        legalResourceIds.forEach(legalResourceId =>
            this.errorIfMissingOrIncorrectType(legalResourceId, NS.eli('LegalResource')));

        const legalResources =
            legalResourceIds.map(legalResourceId =>
                LegalResource.reconstitute(
                    legalResourceId,
                    this.uuid(legalResourceId),
                    this.title(legalResourceId),
                    this.description(legalResourceId),
                    this.url(legalResourceId),
                    this.order(legalResourceId),
                ));

        return this.sort(legalResources);
    }

    conceptId(id: Iri): Iri | undefined {
        return this.asIri(this.storeAccess.uniqueStatement(this.asNamedOrBlankNode(id), NS.dct('source')));
    }

    private order(id: Iri): number | undefined {
        return this.asNumber(this.storeAccess.uniqueValue(this.asNamedOrBlankNode(id), NS.sh('order')));
    }

    private conceptSnapshotId(id: Iri): Iri | undefined {
        return this.asIri(this.storeAccess.uniqueStatement(this.asNamedOrBlankNode(id), NS.ext('hasVersionedSource')));
    }

    languages(id: Iri): LanguageType[] {
        return this.asEnums(LanguageType, NS.pera.languageType, this.storeAccess.statements(this.asNamedOrBlankNode(id), NS.dct('language')));
    }

    dutchLanguageVariant(id: Iri): Language | undefined {
        return this.asEnum(Language, 'no-namespace', this.storeAccess.uniqueStatement(this.asNamedOrBlankNode(id), NS.lpdcExt('dutchLanguageVariant')));
    }

    needsConversionFromFormalToInformal(id: Iri): boolean {
        return this.parseBoolean(this.storeAccess.uniqueStatement(this.asNamedOrBlankNode(id), NS.lpdcExt('needsConversionFromFormalToInformal'))?.object as Literal);
    }

    private asFormatPreservingDate(aValue: string | undefined): FormatPreservingDate | undefined {
        return FormatPreservingDate.of(aValue);
    }

    private asNumber(aValue: string | undefined): number | undefined {
        return aValue ? Number.parseInt(aValue) : undefined;
    }

    private asEnums<T>(enumObj: T, namespace: Namespace | 'no-namespace', statements: Statement[]): T[keyof T][] {
        return statements.map(statement => this.asEnum(enumObj, namespace, statement));
    }

    private asEnum<T>(enumObj: T, namespace: Namespace | 'no-namespace', statement: Statement | undefined): T[keyof T] | undefined {
        for (const key in enumObj) {
            if ((namespace instanceof Object) && (namespace as Namespace)(enumObj[key] as string).value === statement?.object?.value) {
                return enumObj[key];
            } else if ((enumObj[key] as string) === statement?.object?.value) {
                return enumObj[key];
            }
        }
        if (statement?.object?.value) {
            throw new SystemError(`Kan '${statement?.toString()}' niet mappen.`);
        }
        return undefined;
    }

    //TODO LPDC-968: handle differently when invariant check is added to languageString that checks if atLeastOneValue present is
    private asLanguageString(statements: Statement[]): LanguageString | undefined {
        const literals: Literal[] | undefined = this.asLiterals(statements);
        const languageString = LanguageString.of(
            literals?.find(l => l.language?.toLowerCase() === Language.NL)?.value,
            literals?.find(l => l.language?.toLowerCase() === Language.FORMAL)?.value,
            literals?.find(l => l.language?.toLowerCase() === Language.INFORMAL)?.value,
            literals?.find(l => l.language?.toLowerCase() === Language.GENERATED_FORMAL)?.value,
            literals?.find(l => l.language?.toLowerCase() === Language.GENERATED_INFORMAL)?.value,
        );
        return languageString.definedLanguages.length ? languageString : undefined;
    }

    private asIris(statements: Statement[]): Iri[] {
        return statements.map(st => this.asIri(st));
    }

    private asIri(statement: Statement | undefined): Iri | undefined {
        if (!statement) {
            return undefined;
        }
        const obj = this.objectAsNamedNodeOrBlankNode(statement);
        return new Iri(isBlankNode(obj) ? obj.toString() : obj.value);
    }

    private asLiterals(statements: Statement[]): Literal[] {
        return statements?.map(this.asLiteral);
    }

    private asLiteral(statement: Statement): Literal {
        if (!isLiteral(statement.object)) {
            throw new SystemError(`Expecting (${statement}) to have an object that is a literal.`);
        }
        return statement.object as Literal;
    }

    private objectAsNamedNodeOrBlankNode(statement: Statement | undefined): NamedNode | BlankNode {
        if (!statement) {
            return undefined;
        }
        if (!isNamedNode(statement.object)
            && !isBlankNode(statement.object)) {
            throw new SystemError(`Expecting (${statement}) to have an object that is a named node or a blank node.`);
        }
        if (isNamedNode(statement.object)) {
            return statement.object as NamedNode;
        }
        return statement.object as BlankNode;
    }

    private sort(anArray: any) {
        const uniqueOrders = new Set();
        const orders = anArray
            .map((obj: { id: any; }) => {
                const id = obj.id;
                const order: number | undefined = this.asNumber(this.storeAccess.uniqueValue(this.asNamedOrBlankNode(id), NS.sh('order')));
                uniqueOrders.add(order);
                return [id, order];
            });

        if (uniqueOrders.size != orders.length) {
            throw new SystemError('Not all orders are unique');
        }

        return asSortedArray(anArray, (a: any, b: any) => {
            const orderA = orders.find((idAndOrder: any) => idAndOrder[0] === a.id);
            const orderB = orders.find((idAndOrder: any) => idAndOrder[0] === b.id);

            if (orderA[1] === undefined) {
                throw new SystemError(`No order found for ${a.id}`);
            }
            if (orderB[1] === undefined) {
                throw new SystemError(`No order found for ${b.id}`);
            }
            return orderA[1] - orderB[1];
        });
    }
}
