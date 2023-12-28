import {Quad} from "rdflib/lib/tf-types";
import {Iri} from "../../core/domain/shared/iri";
import {graph, Literal, NamedNode, namedNode, Statement} from "rdflib";
import {ConceptVersie} from "../../core/domain/concept-versie";
import {TaalString} from "../../core/domain/taal-string";
import {Cost} from "../../core/domain/cost";
import {asSortedArray} from "../../core/domain/shared/collections-helper";
import {FinancialAdvantage} from "../../core/domain/financial-advantage";
import {Website} from "../../core/domain/website";
import {Procedure} from "../../core/domain/procedure";
import {Requirement} from "../../core/domain/requirement";
import {Evidence} from "../../core/domain/evidence";
import {NS} from "./namespaces";
import {FormatPreservingDate} from "../../core/domain/format-preserving-date";
import {
    CompetentAuthorityLevelType,
    ConceptTagType,
    ExecutingAuthorityLevelType,
    ProductType,
    PublicationMediumType,
    SnapshotType,
    TargetAudienceType,
    ThemeType,
    YourEuropeCategoryType
} from "../../core/domain/types";
import {Concept} from "../../core/domain/concept";

export class QuadsToDomainMapper {

    private readonly store;
    private readonly graphId;

    constructor(quads: Quad[], graphId: Iri) {
        this.store = graph();
        this.store.addAll(quads);
        this.graphId = namedNode(graphId);
    }

    conceptVersie(id: Iri): ConceptVersie {

        this.errorIfMissingOrIncorrectType(id, namedNode(NS.lpdcExt('ConceptualPublicService').value));

        return new ConceptVersie(
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
        );
    }

    concept(id: Iri): Concept {
        this.errorIfMissingOrIncorrectType(id, namedNode(NS.lpdcExt('ConceptualPublicService').value));

        return new Concept(
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
            this.productId(id),
        );
    }

    private errorIfMissingOrIncorrectType(id: Iri, type: NamedNode) {
        const typeFoundForId: string = this.store.anyValue(namedNode(id), NS.rdf("type"), null, this.graphId);
        if (!typeFoundForId) {
            throw new Error(`Could not find <${id}> for type ${type}`);
        }
        if (!type.equals(namedNode(typeFoundForId))) {
            throw new Error(`Could not find <${id}> for type ${type}, but found with type <${typeFoundForId}>`);
        }
    }

    private startDate(id: Iri): FormatPreservingDate | undefined {
        return this.asFormatPreservingDate(this.store.anyValue(namedNode(id), NS.schema("startDate"), null, this.graphId));
    }

    private endDate(id: Iri): FormatPreservingDate | undefined {
        return this.asFormatPreservingDate(this.store.anyValue(namedNode(id), NS.schema("endDate"), null, this.graphId));
    }

    private productType(id: Iri): ProductType | undefined {
        return this.asEnum(ProductType, this.store.anyValue(namedNode(id), NS.dct("type"), null, this.graphId), id);
    }

    private title(id: Iri): TaalString | undefined {
        return this.asTaalString(this.store.statementsMatching(namedNode(id), NS.dct('title'), null, this.graphId));
    }

    private description(id: Iri): TaalString | undefined {
        return this.asTaalString(this.store.statementsMatching(namedNode(id), NS.dct('description'), null, this.graphId));
    }

    private additionalDescription(id: Iri): TaalString | undefined {
        return this.asTaalString(this.store.statementsMatching(namedNode(id), NS.lpdcExt('additionalDescription'), null, this.graphId));
    }

    private exception(id: Iri): TaalString | undefined {
        return this.asTaalString(this.store.statementsMatching(namedNode(id), NS.lpdcExt('exception'), null, this.graphId));
    }

    private regulation(id: Iri): TaalString | undefined {
        return this.asTaalString(this.store.statementsMatching(namedNode(id), NS.lpdcExt('regulation'), null, this.graphId));
    }

    private targetAudiences(id: Iri): Set<TargetAudienceType> {
        return this.asEnums(TargetAudienceType, this.store.statementsMatching(namedNode(id), NS.lpdcExt("targetAudience"), null, this.graphId), id);
    }

    private themes(id: Iri): Set<ThemeType> {
        return this.asEnums(ThemeType, this.store.statementsMatching(namedNode(id), NS.m8g("thematicArea"), null, this.graphId), id);
    }

    private competentAuthorityLevels(id: Iri): Set<CompetentAuthorityLevelType> {
        return this.asEnums(CompetentAuthorityLevelType, this.store.statementsMatching(namedNode(id), NS.lpdcExt("competentAuthorityLevel"), null, this.graphId), id);
    }

    private competentAuthorities(id: Iri): Set<Iri> {
        return this.asIris(this.store.statementsMatching(namedNode(id), NS.m8g("hasCompetentAuthority"), null, this.graphId));
    }

    private executingAuthorityLevels(id: Iri): Set<ExecutingAuthorityLevelType> {
        return this.asEnums(ExecutingAuthorityLevelType, this.store.statementsMatching(namedNode(id), NS.lpdcExt("executingAuthorityLevel"), null, this.graphId), id);
    }

    private executingAuthorities(id: Iri): Set<Iri> {
        return this.asIris(this.store.statementsMatching(namedNode(id), NS.lpdcExt("hasExecutingAuthority"), null, this.graphId));
    }

    private publicationMedia(id: Iri): Set<PublicationMediumType> {
        return this.asEnums(PublicationMediumType, this.store.statementsMatching(namedNode(id), NS.lpdcExt("publicationMedium"), null, this.graphId), id);
    }

    private yourEuropeCategories(id: Iri): Set<YourEuropeCategoryType> {
        return this.asEnums(YourEuropeCategoryType, this.store.statementsMatching(namedNode(id), NS.lpdcExt("yourEuropeCategory"), null, this.graphId), id);
    }

    private keywords(id: Iri): TaalString[] {
        return this.store.statementsMatching(namedNode(id), NS.dcat("keyword"), null, this.graphId)
            .map(s => [s])
            .flatMap(statements => this.asTaalString(statements));
    }

    private url(id: Iri): string | undefined {
        return this.store.anyValue(namedNode(id), NS.schema("url"), null, this.graphId);
    }

    private isVersionOfConcept(id: Iri): string | undefined {
        return this.store.anyValue(namedNode(id), NS.dct("isVersionOf"), null, this.graphId);
    }

    private dateCreated(id: Iri): FormatPreservingDate | undefined {
        return this.asFormatPreservingDate(this.store.anyValue(namedNode(id), NS.schema("dateCreated"), null, this.graphId));
    }

    private dateModified(id: Iri): FormatPreservingDate | undefined {
        return this.asFormatPreservingDate(this.store.anyValue(namedNode(id), NS.schema("dateModified"), null, this.graphId));
    }

    private generatedAtTime(id: Iri): FormatPreservingDate | undefined {
        return this.asFormatPreservingDate(this.store.anyValue(namedNode(id), NS.prov("generatedAtTime"), null, this.graphId));
    }

    private productId(id: Iri): string | undefined {
        return this.store.anyValue(namedNode(id), NS.schema("productID"), null, this.graphId);
    }

    private snapshotType(id: Iri): SnapshotType | undefined {
        return this.asEnum(SnapshotType, this.store.anyValue(namedNode(id), NS.lpdcExt("snapshotType"), null, this.graphId), id);
    }

    private conceptTags(id: Iri): Set<ConceptTagType> {
        return this.asEnums(ConceptTagType, this.store.statementsMatching(namedNode(id), NS.lpdcExt("conceptTag"), null, this.graphId), id);
    }

    private costs(id: Iri): Cost[] {
        const costIds =
            Array.from(this.asIris(this.store.statementsMatching(namedNode(id), NS.m8g('hasCost'), null, this.graphId)));
        costIds.forEach(costId => this.errorIfMissingOrIncorrectType(costId, namedNode(NS.m8g('Cost').value)));

        const costs = costIds.map(costId => new Cost(costId, this.title(costId), this.description(costId)));

        return this.sort(costs);
    }

    private financialAdvantages(id: Iri): FinancialAdvantage[] {
        const financialAdvantageIds =
            Array.from(this.asIris(this.store.statementsMatching(namedNode(id), NS.cpsv('produces'), null, this.graphId)));
        financialAdvantageIds.forEach(financialAdvantageId =>
            this.errorIfMissingOrIncorrectType(financialAdvantageId, namedNode(NS.lpdcExt('FinancialAdvantage').value)));

        const financialAdvantages =
            financialAdvantageIds.map(financialAdvantageId =>
                new FinancialAdvantage(financialAdvantageId, this.title(financialAdvantageId), this.description(financialAdvantageId)));

        return this.sort(financialAdvantages);
    }

    private websites(id: Iri, predicate: NamedNode = namedNode(NS.rdfs('seeAlso').value)): Website[] {
        const websiteIds =
            Array.from(this.asIris(this.store.statementsMatching(namedNode(id), predicate, null, this.graphId)));

        websiteIds.forEach(websiteId =>
            this.errorIfMissingOrIncorrectType(websiteId, namedNode(NS.schema('WebSite').value)));

        const websites =
            websiteIds.map(websiteId =>
                new Website(websiteId, this.title(websiteId), this.description(websiteId), this.url(websiteId)));

        return this.sort(websites);
    }

    private procedures(id: Iri): Procedure[] {
        const procedureIds =
            Array.from(this.asIris(this.store.statementsMatching(namedNode(id), NS.cpsv('follows'), null, this.graphId)));

        procedureIds.forEach(procedureId =>
            this.errorIfMissingOrIncorrectType(procedureId, namedNode(NS.cpsv('Rule').value)));

        const procedures =
            procedureIds.map(procedureId =>
                new Procedure(procedureId, this.title(procedureId), this.description(procedureId), this.websites(procedureId, namedNode(NS.lpdcExt('hasWebsite').value))));

        return this.sort(procedures);
    }

    private requirements(id: Iri): Requirement[] {
        const requirementIds =
            Array.from(this.asIris(this.store.statementsMatching(namedNode(id), NS.ps('hasRequirement'), null, this.graphId)));

        requirementIds.forEach(requirementId =>
            this.errorIfMissingOrIncorrectType(requirementId, namedNode(NS.m8g('Requirement').value)));

        const requirements =
            requirementIds.map(requirementId =>
                new Requirement(requirementId, this.title(requirementId), this.description(requirementId), this.evidence(requirementId)));

        return this.sort(requirements);
    }

    private evidence(id: Iri): Evidence | undefined {
        const evidenceIds =
            Array.from(this.asIris(this.store.statementsMatching(namedNode(id), NS.m8g('hasSupportingEvidence'), null, this.graphId)));

        evidenceIds.forEach(evidenceId =>
            this.errorIfMissingOrIncorrectType(evidenceId, namedNode(NS.m8g('Evidence').value)));

        if (evidenceIds.length > 1) {
            throw new Error(`Did not expect more than one evidence for ${id}`);
        }
        if (evidenceIds.length === 0) {
            return undefined;
        }
        return new Evidence(evidenceIds[0], this.title(evidenceIds[0]), this.description(evidenceIds[0]));
    }

    private asFormatPreservingDate(aValue: string | undefined): FormatPreservingDate | undefined {
        return FormatPreservingDate.of(aValue);
    }

    private asNumber(aValue: string | undefined): number | undefined {
        return aValue ? Number.parseInt(aValue) : undefined;
    }

    private asEnums<T>(enumObj: T, statements: Statement[], id: string): Set<T[keyof T]> {
        const literals: Literal[] | undefined = this.asLiterals(statements);
        return new Set(literals.map(literal => this.asEnum(enumObj, literal?.value, id)));
    }

    private asEnum<T>(enumObj: T, value: any, id: string): T[keyof T] | undefined {
        for (const key in enumObj) {
            if (enumObj[key] === value) {
                return value;
            }
        }
        if (value) {
            throw new Error(`could not map <${value}> for iri: <${id}>`);
        }
        return undefined;
    }

    private asTaalString(statements: Statement[]): TaalString | undefined {
        const literals: Literal[] | undefined = this.asLiterals(statements);

        return TaalString.of(
            literals?.find(l => l.language === 'en')?.value,
            literals?.find(l => l.language === 'nl')?.value,
            literals?.find(l => l.language === 'nl-be-x-formal')?.value,
            literals?.find(l => l.language === 'nl-be-x-informal')?.value,
            literals?.find(l => l.language === 'nl-be-x-generated-formal')?.value,
            literals?.find(l => l.language === 'nl-be-x-generated-informal')?.value,
        );
    }

    private asIris(statements: Statement[]): Set<Iri> {
        return new Set(this.asLiterals(statements).map(value => value.value));
    }

    private asLiterals(statements: Statement[]) {
        return statements?.map(this.asLiteral);
    }

    private asLiteral(statement: Statement) {
        return statement.object as Literal;
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