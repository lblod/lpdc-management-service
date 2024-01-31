import {NamedNode, Quad} from 'rdflib/lib/tf-types';
import {Iri} from '../../core/domain/shared/iri';
import {graph, isLiteral, isNamedNode, Literal, namedNode, Statement} from 'rdflib';
import {ConceptSnapshot} from '../../core/domain/concept-snapshot';
import {LanguageString} from '../../core/domain/language-string';
import {Cost} from '../../core/domain/cost';
import {asSortedArray} from '../../core/domain/shared/collections-helper';
import {FinancialAdvantage} from '../../core/domain/financial-advantage';
import {Website} from '../../core/domain/website';
import {Procedure} from '../../core/domain/procedure';
import {Requirement} from '../../core/domain/requirement';
import {Evidence} from '../../core/domain/evidence';
import {NS} from './namespaces';
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
    SnapshotType,
    TargetAudienceType,
    ThemeType,
    YourEuropeCategoryType
} from '../../core/domain/types';
import {Concept} from '../../core/domain/concept';
import {Namespace} from "rdflib/lib/factories/factory-types";
import {STATUS} from "./status";
import {Instance} from "../../core/domain/instance";
import {ContactPoint} from "../../core/domain/contact-point";
import {Address} from "../../core/domain/address";
import {Logger} from "../../../platform/logger";

class StoreAccess {

    private readonly store;
    private readonly graphId;
    private readonly logger: Logger;

    constructor(quads: Quad[], graphId: Iri, logger: Logger) {
        this.store = graph();
        this.store.addAll(quads);
        this.graphId = namedNode(graphId.value);
        this.logger = logger;
    }

    public statements(s: NamedNode,
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
                this.logger.log(`Cardinality error: ${s} ${p} ${options?.o} : expecting 1, got ${maxLanguageIncidenceOfAnyLanguage}`);
            }
        }

        return result;
    }

    public uniqueValue(s: NamedNode,
                       p: NamedNode): string | void {
        return this.uniqueStatement(s, p)?.object?.value;
    }

    public uniqueStatement(s: NamedNode,
                           p: NamedNode,
                           o: NamedNode = null): Statement | undefined {
        const allStatementsMatching = this.statements(s, p, {o: o});
        if (!allStatementsMatching || allStatementsMatching.length === 0) {
            return undefined;
        }

        if (allStatementsMatching.length > 1) {
            this.logger.log(`Cardinality error: ${s} ${p} ${o} : expecting 1, got ${allStatementsMatching.length}`);
        }

        return allStatementsMatching[0];
    }

}

export class QuadsToDomainMapper {
    private readonly storeAccess;
    private readonly graphId;

    constructor(quads: Quad[], graphId: Iri, logger: Logger) {
        this.storeAccess = new StoreAccess(quads, graphId, logger);
        this.graphId = namedNode(graphId.value);
    }

    conceptSnapshot(id: Iri): ConceptSnapshot {

        this.errorIfMissingOrIncorrectType(id, NS.lpdcExt('ConceptualPublicService'));

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
            this.requirements(id),
            this.procedures(id),
            this.websites(id),
            this.costs(id),
            this.financialAdvantages(id),
            this.isVersionOfConcept(id),
            this.dateCreated(id),
            this.dateModified(id),
            this.generatedAtTime(id),
            this.productId(id),
            this.snapshotType(id),
            this.conceptTags(id),
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

    instance(id: Iri): Instance {

        this.errorIfMissingOrIncorrectType(id, NS.cpsv('PublicService'));

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
            this.instanceDateCreated(id),
            this.instanceDateModified(id),
            this.instanceStatusType(id),
            this.instanceReviewStatusType(id),
            this.instancePublicationStatusType(id),
            this.spatials(id),
            this.legalResources(id)
        );
    }

    private errorIfMissingOrIncorrectType(id: Iri, type: NamedNode) {
        const typeFoundForId: string = this.storeAccess.uniqueValue(namedNode(id.value), NS.rdf('type'));
        if (!typeFoundForId) {
            throw new Error(`Could not find <${id}> for type ${type} in graph ${this.graphId}`);
        }
        if (type.value !== typeFoundForId) {
            throw new Error(`Could not find <${id}> for type ${type}, but found with type <${typeFoundForId}> in graph ${this.graphId}`);
        }
    }

    private startDate(id: Iri): FormatPreservingDate | undefined {
        return this.asFormatPreservingDate(this.storeAccess.uniqueValue(namedNode(id.value), NS.schema('startDate')));
    }

    private endDate(id: Iri): FormatPreservingDate | undefined {
        return this.asFormatPreservingDate(this.storeAccess.uniqueValue(namedNode(id.value), NS.schema('endDate')));
    }

    private productType(id: Iri): ProductType | undefined {
        return this.asEnum(ProductType, NS.dvc.type, this.storeAccess.uniqueStatement(namedNode(id.value), NS.dct('type')));
    }

    private title(id: Iri): LanguageString | undefined {
        return this.asLanguageString(this.storeAccess.statements(namedNode(id.value), NS.dct('title')));
    }

    private description(id: Iri): LanguageString | undefined {
        return this.asLanguageString(this.storeAccess.statements(namedNode(id.value), NS.dct('description')));
    }

    private additionalDescription(id: Iri): LanguageString | undefined {
        return this.asLanguageString(this.storeAccess.statements(namedNode(id.value), NS.lpdcExt('additionalDescription')));
    }

    private exception(id: Iri): LanguageString | undefined {
        return this.asLanguageString(this.storeAccess.statements(namedNode(id.value), NS.lpdcExt('exception')));
    }

    private regulation(id: Iri): LanguageString | undefined {
        return this.asLanguageString(this.storeAccess.statements(namedNode(id.value), NS.lpdcExt('regulation')));
    }

    private uuid(id: Iri): string | undefined {
        return this.storeAccess.uniqueValue(namedNode(id.value), NS.mu('uuid'));
    }

    private createdBy(id: Iri): Iri | undefined {
        return this.asIri(this.storeAccess.uniqueStatement(namedNode(id.value), NS.pav('createdBy')));
    }

    private targetAudiences(id: Iri): TargetAudienceType[] {
        return this.asEnums(TargetAudienceType, NS.dvc.doelgroep, this.storeAccess.statements(namedNode(id.value), NS.lpdcExt('targetAudience')));
    }

    private themes(id: Iri): ThemeType[] {
        return this.asEnums(ThemeType, NS.dvc.thema, this.storeAccess.statements(namedNode(id.value), NS.m8g('thematicArea')));
    }

    private competentAuthorityLevels(id: Iri): CompetentAuthorityLevelType[] {
        return this.asEnums(CompetentAuthorityLevelType, NS.dvc.bevoegdBestuursniveau, this.storeAccess.statements(namedNode(id.value), NS.lpdcExt('competentAuthorityLevel')));
    }

    private competentAuthorities(id: Iri): Iri[] {
        return this.asIris(this.storeAccess.statements(namedNode(id.value), NS.m8g('hasCompetentAuthority')));
    }

    private executingAuthorityLevels(id: Iri): ExecutingAuthorityLevelType[] {
        return this.asEnums(ExecutingAuthorityLevelType, NS.dvc.uitvoerendBestuursniveau, this.storeAccess.statements(namedNode(id.value), NS.lpdcExt('executingAuthorityLevel')));
    }

    private executingAuthorities(id: Iri): Iri[] {
        return this.asIris(this.storeAccess.statements(namedNode(id.value), NS.lpdcExt('hasExecutingAuthority')));
    }

    private publicationMedia(id: Iri): PublicationMediumType[] {
        return this.asEnums(PublicationMediumType, NS.dvc.publicatieKanaal, this.storeAccess.statements(namedNode(id.value), NS.lpdcExt('publicationMedium')));
    }

    private yourEuropeCategories(id: Iri): YourEuropeCategoryType[] {
        return this.asEnums(YourEuropeCategoryType, NS.dvc.yourEuropeCategorie, this.storeAccess.statements(namedNode(id.value), NS.lpdcExt('yourEuropeCategory')));
    }

    private email(id: Iri): string | undefined {
        return this.storeAccess.uniqueValue(namedNode(id.value), NS.schema('email'));
    }

    private telephone(id: Iri): string | undefined {
        return this.storeAccess.uniqueValue(namedNode(id.value), NS.schema('telephone'));
    }

    private openingHours(id: Iri): string | undefined {
        return this.storeAccess.uniqueValue(namedNode(id.value), NS.schema('openingHours'));
    }

    private gemeentenaam(id: Iri): LanguageString | undefined {
        return this.asLanguageString(this.storeAccess.statements(namedNode(id.value), NS.adres('gemeentenaam')));
    }

    private land(id: Iri): LanguageString | undefined {
        return this.asLanguageString(this.storeAccess.statements(namedNode(id.value), NS.adres('land')));
    }

    private huisnummer(id: Iri): string | undefined {
        return this.storeAccess.uniqueValue(namedNode(id.value), NS.adres('Adresvoorstelling.huisnummer'));
    }

    private busnummer(id: Iri): string | undefined {
        return this.storeAccess.uniqueValue(namedNode(id.value), NS.adres('Adresvoorstelling.busnummer'));
    }

    private postcode(id: Iri): string | undefined {
        return this.storeAccess.uniqueValue(namedNode(id.value), NS.adres('postcode'));
    }

    private straatnaam(id: Iri): LanguageString | undefined {
        return this.asLanguageString(this.storeAccess.statements(namedNode(id.value), NS.adres('Straatnaam')));
    }

    private verwijstNaar(id: Iri): Iri | undefined {
        return this.asIri(this.storeAccess.uniqueStatement(namedNode(id.value), NS.adres('verwijstNaar')));
    }

    private keywords(id: Iri): LanguageString[] {
        return this.storeAccess.statements(namedNode(id.value), NS.dcat('keyword'), {validateUniqueLanguages: false})
            .map(s => [s])
            .flatMap(statements => this.asLanguageString(statements));
    }

    private url(id: Iri): string | undefined {
        return this.storeAccess.uniqueValue(namedNode(id.value), NS.schema('url'));
    }

    private isVersionOfConcept(id: Iri): Iri | undefined {
        return this.asIri(this.storeAccess.uniqueStatement(namedNode(id.value), NS.dct('isVersionOf')));
    }

    private dateCreated(id: Iri): FormatPreservingDate | undefined {
        return this.asFormatPreservingDate(this.storeAccess.uniqueValue(namedNode(id.value), NS.schema('dateCreated')));
    }

    private dateModified(id: Iri): FormatPreservingDate | undefined {
        return this.asFormatPreservingDate(this.storeAccess.uniqueValue(namedNode(id.value), NS.schema('dateModified')));
    }

    private instanceDateCreated(id: Iri): FormatPreservingDate | undefined {
        return this.asFormatPreservingDate(this.storeAccess.uniqueValue(namedNode(id.value), NS.dct('created')));
    }

    private instanceDateModified(id: Iri): FormatPreservingDate | undefined {
        return this.asFormatPreservingDate(this.storeAccess.uniqueValue(namedNode(id.value), NS.dct('modified')));
    }

    private generatedAtTime(id: Iri): FormatPreservingDate | undefined {
        return this.asFormatPreservingDate(this.storeAccess.uniqueValue(namedNode(id.value), NS.prov('generatedAtTime')));
    }

    private productId(id: Iri): string | undefined {
        return this.storeAccess.uniqueValue(namedNode(id.value), NS.schema('productID'));
    }

    private latestConceptSnapshot(id: Iri): Iri {
        return this.asIri(this.storeAccess.uniqueStatement(namedNode(id.value), NS.ext('hasVersionedSource')));
    }

    private previousConceptSnapshots(id: Iri): Iri[] {
        return this.asIris(this.storeAccess.statements(namedNode(id.value), NS.ext('previousVersionedSource')));
    }

    private latestFunctionallyChangedConceptSnapshot(id: Iri): Iri {
        return this.asIri(this.storeAccess.uniqueStatement(namedNode(id.value), NS.lpdcExt('hasLatestFunctionalChange')));
    }

    private snapshotType(id: Iri): SnapshotType | undefined {
        return this.asEnum(SnapshotType, NS.dvc.snapshotType, this.storeAccess.uniqueStatement(namedNode(id.value), NS.lpdcExt('snapshotType')));
    }

    private conceptTags(id: Iri): ConceptTagType[] {
        return this.asEnums(ConceptTagType, NS.dvc.conceptTag, this.storeAccess.statements(namedNode(id.value), NS.lpdcExt('conceptTag')));
    }

    private isConceptArchived(id: Iri): boolean {
        return !!this.storeAccess.uniqueStatement(namedNode(id.value), NS.adms('status'), STATUS.concept.archived);
    }

    private legalResources(id: Iri): Iri[] {
        return this.asIris(this.storeAccess.statements(namedNode(id.value), NS.m8g('hasLegalResource')));
    }

    private instanceStatusType(id: Iri): InstanceStatusType | undefined {
        return this.asEnum(InstanceStatusType, NS.concepts.instanceStatus, this.storeAccess.uniqueStatement(namedNode(id.value), NS.adms('status')));
    }

    private instanceReviewStatusType(id: Iri): InstanceReviewStatusType | undefined {
        return this.asEnum(InstanceReviewStatusType, NS.concepts.reviewStatus, this.storeAccess.uniqueStatement(namedNode(id.value), NS.ext('reviewStatus')));
    }

    private instancePublicationStatusType(id: Iri): InstancePublicationStatusType | undefined {
        return this.asEnum(InstancePublicationStatusType, NS.concepts.publicationStatus, this.storeAccess.uniqueStatement(namedNode(id.value), NS.schema('publication')));
    }

    private spatials(id: Iri): Iri[] {
        return this.asIris(this.storeAccess.statements(namedNode(id.value), NS.dct('spatial')));
    }

    private costs(id: Iri): Cost[] {
        const costIds =
            this.asIris(this.storeAccess.statements(namedNode(id.value), NS.m8g('hasCost')));
        costIds.forEach(costId => this.errorIfMissingOrIncorrectType(costId, NS.m8g('Cost')));

        const costs = costIds.map(costId => Cost.reconstitute(costId, this.uuid(costId), this.title(costId), this.description(costId), this.conceptId(costId)));

        return this.sort(costs);
    }

    private financialAdvantages(id: Iri): FinancialAdvantage[] {
        const financialAdvantageIds =
            this.asIris(this.storeAccess.statements(namedNode(id.value), NS.cpsv('produces')));
        financialAdvantageIds.forEach(financialAdvantageId =>
            this.errorIfMissingOrIncorrectType(financialAdvantageId, NS.lpdcExt('FinancialAdvantage')));

        const financialAdvantages =
            financialAdvantageIds.map(financialAdvantageId =>
                FinancialAdvantage.reconstitute(financialAdvantageId, this.uuid(financialAdvantageId), this.title(financialAdvantageId), this.description(financialAdvantageId), this.conceptId(financialAdvantageId)));

        return this.sort(financialAdvantages);
    }

    private contactPoints(id: Iri): ContactPoint[] {
        const contactPointIds =
            this.asIris(this.storeAccess.statements(namedNode(id.value), NS.m8g('hasContactPoint')));

        contactPointIds.forEach(contactPointId =>
            this.errorIfMissingOrIncorrectType(contactPointId, NS.schema('ContactPoint')));

        const contactPoints: ContactPoint[] =
            contactPointIds.map(contactPointId => {
                return new ContactPoint(contactPointId, this.uuid(contactPointId), this.url(contactPointId), this.email(contactPointId), this.telephone(contactPointId), this.openingHours(contactPointId), this.address(contactPointId));
            });
        return this.sort(contactPoints);
    }

    private address(id: Iri): Address | undefined {
        const addressIds =
            this.asIris(this.storeAccess.statements(namedNode(id.value), NS.lpdcExt('address')));

        addressIds.forEach(evidenceId =>
            this.errorIfMissingOrIncorrectType(evidenceId, NS.locn('Address')));

        if (addressIds.length > 1) {
            throw new Error(`Did not expect more than one address for ${id}`);
        }
        if (addressIds.length === 0) {
            return undefined;
        }
        const addressId = addressIds[0];
        return new Address(
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

    private websites(id: Iri, predicate: NamedNode = NS.rdfs('seeAlso')): Website[] {
        const websiteIds =
            this.asIris(this.storeAccess.statements(namedNode(id.value), predicate));

        websiteIds.forEach(websiteId =>
            this.errorIfMissingOrIncorrectType(websiteId, NS.schema('WebSite')));

        const websites =
            websiteIds.map(websiteId =>
                Website.reconstitute(websiteId, this.uuid(websiteId), this.title(websiteId), this.description(websiteId), this.url(websiteId), this.conceptId(websiteId)));

        return this.sort(websites);
    }

    private procedures(id: Iri): Procedure[] {
        const procedureIds =
            this.asIris(this.storeAccess.statements(namedNode(id.value), NS.cpsv('follows')));

        procedureIds.forEach(procedureId =>
            this.errorIfMissingOrIncorrectType(procedureId, NS.cpsv('Rule')));

        const procedures =
            procedureIds.map(procedureId =>
                Procedure.reconstitute(procedureId, this.uuid(procedureId), this.title(procedureId), this.description(procedureId), this.websites(procedureId, NS.lpdcExt('hasWebsite')), this.conceptId(procedureId)));

        return this.sort(procedures);
    }

    private requirements(id: Iri): Requirement[] {
        const requirementIds =
            this.asIris(this.storeAccess.statements(namedNode(id.value), NS.ps('hasRequirement')));

        requirementIds.forEach(requirementId =>
            this.errorIfMissingOrIncorrectType(requirementId, NS.m8g('Requirement')));

        const requirements =
            requirementIds.map(requirementId =>
                Requirement.reconstitute(
                    requirementId,
                    this.uuid(requirementId),
                    this.title(requirementId),
                    this.description(requirementId),
                    this.evidence(requirementId),
                    this.conceptId(requirementId)
                ));

        return this.sort(requirements);
    }

    private evidence(id: Iri): Evidence | undefined {
        const evidenceIds =
            this.asIris(this.storeAccess.statements(namedNode(id.value), NS.m8g('hasSupportingEvidence')));

        evidenceIds.forEach(evidenceId =>
            this.errorIfMissingOrIncorrectType(evidenceId, NS.m8g('Evidence')));

        if (evidenceIds.length > 1) {
            throw new Error(`Did not expect more than one evidence for ${id}`);
        }
        if (evidenceIds.length === 0) {
            return undefined;
        }
        return Evidence.reconstitute(evidenceIds[0], this.uuid(evidenceIds[0]), this.title(evidenceIds[0]), this.description(evidenceIds[0]), this.conceptId(evidenceIds[0]));
    }

    private conceptId(id: Iri): Iri | undefined {
        return this.asIri(this.storeAccess.uniqueStatement(namedNode(id.value), NS.dct('source')));
    }

    private conceptSnapshotId(id: Iri): Iri | undefined {
        return this.asIri(this.storeAccess.uniqueStatement(namedNode(id.value), NS.ext('hasVersionedSource')));
    }

    private languages(id: Iri): LanguageType[] {
        return this.asEnums(LanguageType, NS.pera.languageType, this.storeAccess.statements(namedNode(id.value), NS.pera.language('')));
    }

    private asFormatPreservingDate(aValue: string | undefined): FormatPreservingDate | undefined {
        return FormatPreservingDate.of(aValue);
    }

    private asNumber(aValue: string | undefined): number | undefined {
        return aValue ? Number.parseInt(aValue) : undefined;
    }

    private asEnums<T>(enumObj: T, namespace: Namespace, statements: Statement[]): T[keyof T][] {
        return statements.map(statement => this.asEnum(enumObj, namespace, statement));
    }

    private asEnum<T>(enumObj: T, namespace: Namespace, statement: Statement | undefined): T[keyof T] | undefined {
        for (const key in enumObj) {
            if (namespace(enumObj[key] as string).value === statement?.object?.value) {
                return enumObj[key];
            }
        }
        if (statement?.object?.value) {
            throw new Error(`could not map <${statement?.object?.value}> for iri: <${statement?.subject?.value}>`);
        }
        return undefined;
    }

    private asLanguageString(statements: Statement[]): LanguageString | undefined {
        const literals: Literal[] | undefined = this.asLiterals(statements);
        if (literals === undefined || (literals as []).length === 0) {
            return undefined;
        }

        return LanguageString.of(
            literals?.find(l => l.language === 'en')?.value,
            literals?.find(l => l.language === 'nl')?.value,
            literals?.find(l => l.language === 'nl-be-x-formal')?.value,
            literals?.find(l => l.language === 'nl-be-x-informal')?.value,
            literals?.find(l => l.language === 'nl-be-x-generated-formal')?.value,
            literals?.find(l => l.language === 'nl-be-x-generated-informal')?.value,
        );
    }

    private asIris(statements: Statement[]): Iri[] {
        return this.asNamedNodes(statements).map(value => new Iri(value.value));
    }

    private asIri(statement: Statement | undefined): Iri | undefined {
        return statement ? new Iri(this.asNamedNode(statement).value) : undefined;
    }

    private asLiterals(statements: Statement[]): Literal[] {
        return statements?.map(this.asLiteral);
    }

    private asNamedNodes(statements: Statement[]): NamedNode[] {
        return statements?.map(this.asNamedNode);
    }

    private asLiteral(statement: Statement): Literal {
        if (!isLiteral(statement.object)) {
            throw Error(`Expecting (${statement}) to have an object that is a literal.`);
        }
        return statement.object as Literal;
    }

    private asNamedNode(statement: Statement): NamedNode {
        if (!isNamedNode(statement.object)) {
            throw Error(`Expecting (${statement}) to have an object that is a named node.`);
        }
        return statement.object as NamedNode;
    }

    private sort(anArray: any) {
        const orders = anArray
            .map((obj: { id: any; }) => {
                const id = obj.id;
                const order: number | undefined = this.asNumber(this.storeAccess.uniqueValue(namedNode(id), NS.sh('order')));
                return [id, order];
            });

        //TODO LPDC-917: verify that all orders are unique ...
        return asSortedArray(anArray, (a: any, b: any) => {
            const orderA = orders.find((idAndOrder: any) => idAndOrder[0] === a.id);
            const orderB = orders.find((idAndOrder: any) => idAndOrder[0] === b.id);

            if (!orderA) {
                throw new Error(`No order found for ${a.id}`);
            }
            if (!orderB) {
                throw new Error(`No order found for ${b.id}`);
            }
            return orderA[1] - orderB[1];
        });
    }
}