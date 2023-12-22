import {ConceptVersieSparqlRepository} from "../../../src/driven/persistence/concept-versie-sparql-repository";
import {PREFIX} from "../../../config";
import {sparqlEscapeDateTime, sparqlEscapeUri} from "../../../mu-helper";
import {ConceptVersie} from "../../../src/core/domain/concept-versie";
import {DirectDatabaseAccess} from "./direct-database-access";
import {TaalString} from "../../../src/core/domain/taal-string";
import {Iri} from "../../../src/core/domain/shared/iri";

export class ConceptVersieSparqlTestRepository extends ConceptVersieSparqlRepository {

    private readonly directDatabaseAccess: DirectDatabaseAccess;

    constructor(endpoint?: string) {
        super(endpoint);
        this.directDatabaseAccess = new DirectDatabaseAccess(endpoint);
    }

    async save(conceptVersie: ConceptVersie): Promise<void> {
        await this.directDatabaseAccess.insertData(
            'http://mu.semte.ch/graphs/lpdc/ldes-data',
            [
                `${sparqlEscapeUri(conceptVersie.id)} a lpdcExt:ConceptualPublicService`,
                ...this.taalStringToTriples(conceptVersie.id, "dct:title", conceptVersie.title),
                ...this.taalStringToTriples(conceptVersie.id, "dct:description", conceptVersie.description),
                ...this.taalStringToTriples(conceptVersie.id, "lpdcExt:additionalDescription", conceptVersie.additionalDescription),
                ...this.taalStringToTriples(conceptVersie.id, "lpdcExt:exception", conceptVersie.exception),
                ...this.taalStringToTriples(conceptVersie.id, "lpdcExt:regulation", conceptVersie.regulation),
                conceptVersie.startDate ? `${sparqlEscapeUri(conceptVersie.id)} schema:startDate ${sparqlEscapeDateTime(conceptVersie.startDate.toISOString())}` : undefined,
                conceptVersie.endDate ? `${sparqlEscapeUri(conceptVersie.id)} schema:endDate ${sparqlEscapeDateTime(conceptVersie.endDate.toISOString())}` : undefined,
                conceptVersie.type ? `${sparqlEscapeUri(conceptVersie.id)} dct:type ${sparqlEscapeUri(conceptVersie.type)}` : undefined,
                ...this.enumsToTriples(conceptVersie.id, "lpdcExt:targetAudience", conceptVersie.targetAudiences),
            ].filter(t => t != undefined),
            [
                PREFIX.dct,
                PREFIX.lpdcExt,
                PREFIX.schema]);
    }

    private taalStringToTriples(subject: Iri, predicate: string, object: TaalString | undefined): string[] {
        return object ?
            [
                ["en", object.en],
                ["nl", object.nl],
                ["nl-be-x-formal", object.nlFormal],
                ["nl-be-x-informal", object.nlInformal],
                ["nl-be-x-generated-formal", object.nlGeneratedFormal],
                ["nl-be-x-generated-informal", object.nlGeneratedInformal]]
                .filter(tuple => tuple[1] != undefined)
                .map(tuple => `${sparqlEscapeUri(subject)} ${predicate} """${tuple[1]}"""@${tuple[0]}`) : [];
    }

    private enumsToTriples(subject: Iri, predicate: string, enumValues: Set<any>): string[] {
        return Array.from(enumValues)
            .map(e => `${sparqlEscapeUri(subject)} ${predicate} ${sparqlEscapeUri(e)}`);
    }

}