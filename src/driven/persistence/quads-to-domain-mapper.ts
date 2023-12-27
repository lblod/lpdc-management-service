import {Quad} from "rdflib/lib/tf-types";
import {Iri} from "../../core/domain/shared/iri";
import {graph, Literal, NamedNode, namedNode, Namespace, Statement} from "rdflib";
import {ProductType} from "../../core/domain/concept-versie";
import {TaalString} from "../../core/domain/taal-string";


export const NAMESPACE = {
    schema: Namespace('http://schema.org/'),
    dct: Namespace('http://purl.org/dc/terms/'),
    rdf: Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#'),
    lpdcExt: Namespace('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#'),
};

export class QuadsToDomainMapper {

    //TODO LPDC-916: remove?
    private readonly quads;
    private readonly store;
    private readonly graphId;

    constructor(quads: Quad[], graphId: Iri) {
        this.quads = quads;
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

    private asDate(aValue: string | undefined): Date | undefined {
        return aValue ? new Date(aValue) : undefined;
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

    private asTaalString(statements: Statement[] | undefined): TaalString | undefined {
        const literals: Literal[] = statements.map(s => s.object as Literal);

        return TaalString.of(
            literals.find(l => l.language === 'en')?.value,
            literals.find(l => l.language === 'nl')?.value,
            literals.find(l => l.language === 'nl-be-x-formal')?.value,
            literals.find(l => l.language === 'nl-be-x-informal')?.value,
            literals.find(l => l.language === 'nl-be-x-generated-formal')?.value,
            literals.find(l => l.language === 'nl-be-x-generated-informal')?.value,
        );
    }

}