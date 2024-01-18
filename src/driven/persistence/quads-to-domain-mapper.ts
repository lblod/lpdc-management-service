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
    InstanceStatusType,
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

export class QuadsToDomainMapper {

    //TODO LPDC-917: add 'report double triples' (which logs)
    //TODO LPDC-917: add 'reject double triples' (which throws)

    private readonly store;
    private readonly graphId;

    constructor(quads: Quad[], graphId: Iri) {
        this.store = graph();
        this.store.addAll(quads);
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
            this.instanceDateCreated(id),
            this.instanceDateModified(id),
            this.instanceStatusType(id),
            this.spatials(id),
        );
    }

    private errorIfMissingOrIncorrectType(id: Iri, type: NamedNode) {
        const typeFoundForId: string = this.store.anyValue(namedNode(id.value), NS.rdf('type'), null, this.graphId);
        if (!typeFoundForId) {
            throw new Error(`Could not find <${id}> for type ${type} in graph ${this.graphId}`);
        }
        if (!type.equals(namedNode(typeFoundForId))) {
            throw new Error(`Could not find <${id}> for type ${type}, but found with type <${typeFoundForId}> in graph ${this.graphId}`);
        }
    }

    private startDate(id: Iri): FormatPreservingDate | undefined {
        return this.asFormatPreservingDate(this.store.anyValue(namedNode(id.value), NS.schema('startDate'), null, this.graphId));
    }

    private endDate(id: Iri): FormatPreservingDate | undefined {
        return this.asFormatPreservingDate(this.store.anyValue(namedNode(id.value), NS.schema('endDate'), null, this.graphId));
    }

    private productType(id: Iri): ProductType | undefined {
        return this.asEnum(ProductType, NS.dvc.type, this.store.anyValue(namedNode(id.value), NS.dct('type'), null, this.graphId), id.value);
    }

    private title(id: Iri): LanguageString | undefined {
        return this.asLanguageString(this.store.statementsMatching(namedNode(id.value), NS.dct('title'), null, this.graphId));
    }

    private description(id: Iri): LanguageString | undefined {
        return this.asLanguageString(this.store.statementsMatching(namedNode(id.value), NS.dct('description'), null, this.graphId));
    }

    private additionalDescription(id: Iri): LanguageString | undefined {
        return this.asLanguageString(this.store.statementsMatching(namedNode(id.value), NS.lpdcExt('additionalDescription'), null, this.graphId));
    }

    private exception(id: Iri): LanguageString | undefined {
        return this.asLanguageString(this.store.statementsMatching(namedNode(id.value), NS.lpdcExt('exception'), null, this.graphId));
    }

    private regulation(id: Iri): LanguageString | undefined {
        return this.asLanguageString(this.store.statementsMatching(namedNode(id.value), NS.lpdcExt('regulation'), null, this.graphId));
    }

    private uuid(id: Iri): string | undefined {
        return this.store.anyValue(namedNode(id.value), NS.mu('uuid'), null, this.graphId);
    }

    private createdBy(id: Iri): Iri | undefined {
        return this.asIri(this.store.anyStatementMatching(namedNode(id.value), NS.pav('createdBy'), null, this.graphId));
    }

    private targetAudiences(id: Iri): TargetAudienceType[] {
        return this.asEnums(TargetAudienceType, NS.dvc.doelgroep, this.store.statementsMatching(namedNode(id.value), NS.lpdcExt('targetAudience'), null, this.graphId), id.value);
    }

    private themes(id: Iri): ThemeType[] {
        return this.asEnums(ThemeType, NS.dvc.thema, this.store.statementsMatching(namedNode(id.value), NS.m8g('thematicArea'), null, this.graphId), id.value);
    }

    private competentAuthorityLevels(id: Iri): CompetentAuthorityLevelType[] {
        return this.asEnums(CompetentAuthorityLevelType, NS.dvc.bevoegdBestuursniveau, this.store.statementsMatching(namedNode(id.value), NS.lpdcExt('competentAuthorityLevel'), null, this.graphId), id.value);
    }

    private competentAuthorities(id: Iri): Iri[] {
        return this.asIris(this.store.statementsMatching(namedNode(id.value), NS.m8g('hasCompetentAuthority'), null, this.graphId));
    }

    private executingAuthorityLevels(id: Iri): ExecutingAuthorityLevelType[] {
        return this.asEnums(ExecutingAuthorityLevelType, NS.dvc.uitvoerendBestuursniveau, this.store.statementsMatching(namedNode(id.value), NS.lpdcExt('executingAuthorityLevel'), null, this.graphId), id.value);
    }

    private executingAuthorities(id: Iri): Iri[] {
        return this.asIris(this.store.statementsMatching(namedNode(id.value), NS.lpdcExt('hasExecutingAuthority'), null, this.graphId));
    }

    private publicationMedia(id: Iri): PublicationMediumType[] {
        return this.asEnums(PublicationMediumType, NS.dvc.publicatieKanaal, this.store.statementsMatching(namedNode(id.value), NS.lpdcExt('publicationMedium'), null, this.graphId), id.value);
    }

    private yourEuropeCategories(id: Iri): YourEuropeCategoryType[] {
        return this.asEnums(YourEuropeCategoryType, NS.dvc.yourEuropeCategorie, this.store.statementsMatching(namedNode(id.value), NS.lpdcExt('yourEuropeCategory'), null, this.graphId), id.value);
    }

    private keywords(id: Iri): LanguageString[] {
        return this.store.statementsMatching(namedNode(id.value), NS.dcat('keyword'), null, this.graphId)
            .map(s => [s])
            .flatMap(statements => this.asLanguageString(statements));
    }

    private url(id: Iri): string | undefined {
        return this.store.anyValue(namedNode(id.value), NS.schema('url'), null, this.graphId);
    }

    private isVersionOfConcept(id: Iri): Iri | undefined {
        return this.asIri(this.store.anyStatementMatching(namedNode(id.value), NS.dct('isVersionOf'), null, this.graphId));
    }

    private dateCreated(id: Iri): FormatPreservingDate | undefined {
        return this.asFormatPreservingDate(this.store.anyValue(namedNode(id.value), NS.schema('dateCreated'), null, this.graphId));
    }

    private dateModified(id: Iri): FormatPreservingDate | undefined {
        return this.asFormatPreservingDate(this.store.anyValue(namedNode(id.value), NS.schema('dateModified'), null, this.graphId));
    }

    private instanceDateCreated(id: Iri): FormatPreservingDate | undefined {
        return this.asFormatPreservingDate(this.store.anyValue(namedNode(id.value), NS.dct('created'), null, this.graphId));
    }

    private instanceDateModified(id: Iri): FormatPreservingDate | undefined {
        return this.asFormatPreservingDate(this.store.anyValue(namedNode(id.value), NS.dct('modified'), null, this.graphId));
    }

    private generatedAtTime(id: Iri): FormatPreservingDate | undefined {
        return this.asFormatPreservingDate(this.store.anyValue(namedNode(id.value), NS.prov('generatedAtTime'), null, this.graphId));
    }

    private productId(id: Iri): string | undefined {
        return this.store.anyValue(namedNode(id.value), NS.schema('productID'), null, this.graphId);
    }

    private latestConceptSnapshot(id: Iri): Iri {
        return this.asIri(this.store.anyStatementMatching(namedNode(id.value), NS.ext('hasVersionedSource'), null, this.graphId));
    }

    private previousConceptSnapshots(id: Iri): Iri[] {
        return this.asIris(this.store.statementsMatching(namedNode(id.value), NS.ext('previousVersionedSource'), null, this.graphId));
    }

    private latestFunctionallyChangedConceptSnapshot(id: Iri): Iri {
        return this.asIri(this.store.anyStatementMatching(namedNode(id.value), NS.lpdcExt('hasLatestFunctionalChange'), null, this.graphId));
    }

    private snapshotType(id: Iri): SnapshotType | undefined {
        return this.asEnum(SnapshotType, NS.dvc.snapshotType, this.store.anyValue(namedNode(id.value), NS.lpdcExt('snapshotType'), null, this.graphId), id.value);
    }

    private conceptTags(id: Iri): ConceptTagType[] {
        return this.asEnums(ConceptTagType, NS.dvc.conceptTag, this.store.statementsMatching(namedNode(id.value), NS.lpdcExt('conceptTag'), null, this.graphId), id.value);
    }

    private isConceptArchived(id: Iri): boolean {
        return !!this.store.anyStatementMatching(namedNode(id.value), NS.adms('status'), STATUS.concept.archived, this.graphId);
    }

    private legalResources(id: Iri): Iri[] {
        return this.asIris(this.store.statementsMatching(namedNode(id.value), NS.m8g('hasLegalResource'), null, this.graphId));
    }

    private instanceStatusType(id: Iri): InstanceStatusType | undefined {
        return this.asEnum(InstanceStatusType, NS.concepts.instanceStatus, this.store.anyValue(namedNode(id.value), NS.adms('status'), null, this.graphId), id.value);
    }

    private spatials(id: Iri): Iri[] {
        return this.asIris(this.store.statementsMatching(namedNode(id.value), NS.dct('spatial'), null, this.graphId));
    }

    private costs(id: Iri): Cost[] {
        const costIds =
            this.asIris(this.store.statementsMatching(namedNode(id.value), NS.m8g('hasCost'), null, this.graphId));
        costIds.forEach(costId => this.errorIfMissingOrIncorrectType(costId, NS.m8g('Cost')));

        const costs = costIds.map(costId => Cost.reconstitute(costId, this.uuid(costId), this.title(costId), this.description(costId)));

        return this.sort(costs);
    }

    private financialAdvantages(id: Iri): FinancialAdvantage[] {
        const financialAdvantageIds =
            this.asIris(this.store.statementsMatching(namedNode(id.value), NS.cpsv('produces'), null, this.graphId));
        financialAdvantageIds.forEach(financialAdvantageId =>
            this.errorIfMissingOrIncorrectType(financialAdvantageId, NS.lpdcExt('FinancialAdvantage')));

        const financialAdvantages =
            financialAdvantageIds.map(financialAdvantageId =>
                FinancialAdvantage.reconstitute(financialAdvantageId, this.uuid(financialAdvantageId), this.title(financialAdvantageId), this.description(financialAdvantageId)));

        return this.sort(financialAdvantages);
    }

    private websites(id: Iri, predicate: NamedNode = NS.rdfs('seeAlso')): Website[] {
        const websiteIds =
            this.asIris(this.store.statementsMatching(namedNode(id.value), predicate, null, this.graphId));

        websiteIds.forEach(websiteId =>
            this.errorIfMissingOrIncorrectType(websiteId, NS.schema('WebSite')));

        const websites =
            websiteIds.map(websiteId =>
                Website.reconstitute(websiteId, this.uuid(websiteId), this.title(websiteId), this.description(websiteId), this.url(websiteId)));

        return this.sort(websites);
    }

    private procedures(id: Iri): Procedure[] {
        const procedureIds =
            this.asIris(this.store.statementsMatching(namedNode(id.value), NS.cpsv('follows'), null, this.graphId));

        procedureIds.forEach(procedureId =>
            this.errorIfMissingOrIncorrectType(procedureId, NS.cpsv('Rule')));

        const procedures =
            procedureIds.map(procedureId =>
                Procedure.reconstitute(procedureId, this.uuid(procedureId), this.title(procedureId), this.description(procedureId), this.websites(procedureId, NS.lpdcExt('hasWebsite'))));

        return this.sort(procedures);
    }

    private requirements(id: Iri): Requirement[] {
        const requirementIds =
            this.asIris(this.store.statementsMatching(namedNode(id.value), NS.ps('hasRequirement'), null, this.graphId));

        requirementIds.forEach(requirementId =>
            this.errorIfMissingOrIncorrectType(requirementId, NS.m8g('Requirement')));

        const requirements =
            requirementIds.map(requirementId =>
                Requirement.reconstitute(requirementId, this.uuid(requirementId), this.title(requirementId), this.description(requirementId), this.evidence(requirementId)));

        return this.sort(requirements);
    }

    private evidence(id: Iri): Evidence | undefined {
        const evidenceIds =
            this.asIris(this.store.statementsMatching(namedNode(id.value), NS.m8g('hasSupportingEvidence'), null, this.graphId));

        evidenceIds.forEach(evidenceId =>
            this.errorIfMissingOrIncorrectType(evidenceId, NS.m8g('Evidence')));

        if (evidenceIds.length > 1) {
            throw new Error(`Did not expect more than one evidence for ${id}`);
        }
        if (evidenceIds.length === 0) {
            return undefined;
        }
        return Evidence.reconstitute(evidenceIds[0], this.uuid(evidenceIds[0]), this.title(evidenceIds[0]), this.description(evidenceIds[0]));
    }

    private asFormatPreservingDate(aValue: string | undefined): FormatPreservingDate | undefined {
        return FormatPreservingDate.of(aValue);
    }

    private asNumber(aValue: string | undefined): number | undefined {
        return aValue ? Number.parseInt(aValue) : undefined;
    }

    private asEnums<T>(enumObj: T, namespace: Namespace, statements: Statement[], id: string): T[keyof T][] {
        const namedNodes: NamedNode[] | undefined = this.asNamedNodes(statements);
        return namedNodes.map(namedNode => this.asEnum(enumObj, namespace, namedNode?.value, id));
    }

    private asEnum<T>(enumObj: T, namespace: Namespace, value: any, id: string): T[keyof T] | undefined {
        for (const key in enumObj) {
            if (namespace(enumObj[key] as string).value === value) {
                return enumObj[key];
            }
        }
        if (value) {
            throw new Error(`could not map <${value}> for iri: <${id}>`);
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
                const order: number | undefined = this.asNumber(this.store.anyValue(namedNode(id), NS.sh('order'), null, this.graphId));
                return [id, order];
            });

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