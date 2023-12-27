import {Quad} from "rdflib/lib/tf-types";
import {Iri} from "../../core/domain/shared/iri";
import {graph, Literal, NamedNode, namedNode, Namespace, Statement} from "rdflib";
import {
    CompetentAuthorityLevelType,
    ExecutingAuthorityLevelType,
    ProductType,
    PublicationMediumType,
    TargetAudienceType,
    ThemeType,
    YourEuropeCategoryType
} from "../../core/domain/concept-versie";
import {TaalString} from "../../core/domain/taal-string";


export const NAMESPACE = {
    schema: Namespace('http://schema.org/'),
    dct: Namespace('http://purl.org/dc/terms/'),
    rdf: Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#'),
    lpdcExt: Namespace('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#'),
    m8g: Namespace('http://data.europa.eu/m8g/'),
};

export class QuadsToDomainMapper {

    private readonly store;
    private readonly graphId;

    constructor(quads: Quad[], graphId: Iri) {
        this.store = graph();
        this.store.addAll(quads);
        this.graphId = namedNode(graphId);
    }

    errorIfMissingOrIncorrectType(id: Iri, type: NamedNode) {
        const typeFoundForId: string = this.store.anyValue(namedNode(id), NAMESPACE.rdf("type"), null, this.graphId);
        if (!typeFoundForId) {
            throw new Error(`Could not find <${id}> for type ${type}`);
        }
        if (!type.equals(namedNode(typeFoundForId))) {
            throw new Error(`Could not find <${id}> for type ${type}, but found with type <${typeFoundForId}>`);
        }
    }

    startDate(id: Iri): Date | undefined {
        return this.asDate(this.store.anyValue(namedNode(id), NAMESPACE.schema("startDate"), null, this.graphId));
    }

    endDate(id: Iri): Date | undefined {
        return this.asDate(this.store.anyValue(namedNode(id), NAMESPACE.schema("endDate"), null, this.graphId));
    }

    productType(id: Iri): ProductType | undefined {
        return this.asEnum(ProductType, this.store.anyValue(namedNode(id), NAMESPACE.dct("type"), null, this.graphId), id);
    }

    title(id: Iri): TaalString | undefined {
        return this.asTaalString(this.store.statementsMatching(namedNode(id), NAMESPACE.dct('title'), null, this.graphId));
    }

    description(id: Iri): TaalString | undefined {
        return this.asTaalString(this.store.statementsMatching(namedNode(id), NAMESPACE.dct('description'), null, this.graphId));
    }

    additionalDescription(id: Iri): TaalString | undefined {
        return this.asTaalString(this.store.statementsMatching(namedNode(id), NAMESPACE.lpdcExt('additionalDescription'), null, this.graphId));
    }

    exception(id: Iri): TaalString | undefined {
        return this.asTaalString(this.store.statementsMatching(namedNode(id), NAMESPACE.lpdcExt('exception'), null, this.graphId));
    }

    regulation(id: Iri): TaalString | undefined {
        return this.asTaalString(this.store.statementsMatching(namedNode(id), NAMESPACE.lpdcExt('regulation'), null, this.graphId));
    }

    targetAudiences(id: Iri): Set<TargetAudienceType> {
        return this.asEnums(TargetAudienceType, this.store.statementsMatching(namedNode(id), NAMESPACE.lpdcExt("targetAudience"), null, this.graphId), id);
    }

    themes(id: Iri): Set<ThemeType> {
        return this.asEnums(ThemeType, this.store.statementsMatching(namedNode(id), NAMESPACE.m8g("thematicArea"), null, this.graphId), id);
    }

    competentAuthorityLevels(id: Iri): Set<CompetentAuthorityLevelType> {
        return this.asEnums(CompetentAuthorityLevelType, this.store.statementsMatching(namedNode(id), NAMESPACE.lpdcExt("competentAuthorityLevel"), null, this.graphId), id);
    }

    competentAuthorities(id: Iri): Set<Iri> {
        return this.asIris(this.store.statementsMatching(namedNode(id), NAMESPACE.m8g("hasCompetentAuthority"), null, this.graphId));
    }

    executingAuthorityLevels(id: Iri): Set<ExecutingAuthorityLevelType> {
        return this.asEnums(ExecutingAuthorityLevelType, this.store.statementsMatching(namedNode(id), NAMESPACE.lpdcExt("executingAuthorityLevel"), null, this.graphId), id);
    }

    executingAuthorities(id: Iri): Set<Iri> {
        return this.asIris(this.store.statementsMatching(namedNode(id), NAMESPACE.lpdcExt("hasExecutingAuthority"), null, this.graphId));
    }

    publicationMedia(id: Iri): Set<PublicationMediumType> {
        return this.asEnums(PublicationMediumType, this.store.statementsMatching(namedNode(id), NAMESPACE.lpdcExt("publicationMedium"), null, this.graphId), id);
    }

    yourEuropeCategories(id: Iri): Set<YourEuropeCategoryType> {
        return this.asEnums(YourEuropeCategoryType, this.store.statementsMatching(namedNode(id), NAMESPACE.lpdcExt("yourEuropeCategory"), null, this.graphId), id);
    }

    private asDate(aValue: string | undefined): Date | undefined {
        return aValue ? new Date(aValue) : undefined;
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
        return statements?.map(s => s.object as Literal);
    }
}