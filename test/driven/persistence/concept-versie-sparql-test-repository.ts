import {ConceptVersieSparqlRepository} from "../../../src/driven/persistence/concept-versie-sparql-repository";
import {PREFIX} from "../../../config";
import {sparqlEscapeDateTime, sparqlEscapeInt, sparqlEscapeUri} from "../../../mu-helper";
import {ConceptVersie} from "../../../src/core/domain/concept-versie";
import {DirectDatabaseAccess} from "./direct-database-access";
import {TaalString} from "../../../src/core/domain/taal-string";
import {Iri} from "../../../src/core/domain/shared/iri";
import {Evidence} from "../../../src/core/domain/evidence";
import {Website} from "../../../src/core/domain/website";

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
                ...this.valuesToTriples(conceptVersie.id, "lpdcExt:targetAudience", conceptVersie.targetAudiences),
                ...this.valuesToTriples(conceptVersie.id, "m8g:thematicArea", conceptVersie.themes),
                ...this.valuesToTriples(conceptVersie.id, "lpdcExt:competentAuthorityLevel", conceptVersie.competentAuthorityLevels),
                ...this.valuesToTriples(conceptVersie.id, "m8g:hasCompetentAuthority", conceptVersie.competentAuthorities),
                ...this.valuesToTriples(conceptVersie.id, "lpdcExt:executingAuthorityLevel", conceptVersie.executingAuthorityLevels),
                ...this.valuesToTriples(conceptVersie.id, "lpdcExt:hasExecutingAuthority", conceptVersie.executingAuthorities),
                ...this.valuesToTriples(conceptVersie.id, "lpdcExt:publicationMedium", conceptVersie.publicationMedia),
                ...this.valuesToTriples(conceptVersie.id, "lpdcExt:yourEuropeCategory", conceptVersie.yourEuropeCategories),
                ...conceptVersie.keywords.flatMap(keyword => this.taalStringToTriples(conceptVersie.id, "dcat:keyword", keyword)),
                ...this.requirementsToTriples(conceptVersie),
                ...this.proceduresToTriples(conceptVersie),
                ...this.websitesToTriples(conceptVersie.id, 'rdfs:seeAlso', conceptVersie.websites),
                ...this.costsToTriples(conceptVersie),
                ...this.financialAdvantagesToTriples(conceptVersie),
            ].filter(t => t != undefined),
            [
                PREFIX.dct,
                PREFIX.lpdcExt,
                PREFIX.schema,
                PREFIX.m8g,
                PREFIX.dcat,
                PREFIX.ps,
                PREFIX.sh,
                PREFIX.cpsv,
                PREFIX.rdfs]);
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
                .filter(tuple => tuple[1] !== undefined)
                .map(tuple => `${sparqlEscapeUri(subject)} ${predicate} """${tuple[1]}"""@${tuple[0]}`) : [];
    }

    private valuesToTriples(subject: Iri, predicate: string, enumValues: Set<any>): string[] {
        return Array.from(enumValues)
            .map(e => `${sparqlEscapeUri(subject)} ${predicate} ${sparqlEscapeUri(e)}`);
    }

    private requirementsToTriples(conceptVersie: ConceptVersie): string[] {
        return conceptVersie.requirements.flatMap((requirement, index) =>
            [
                `${sparqlEscapeUri(conceptVersie.id)} ps:hasRequirement ${sparqlEscapeUri(requirement.id)}`,
                `${sparqlEscapeUri(requirement.id)} a m8g:Requirement`,
                ...this.taalStringToTriples(requirement.id, `dct:title`, requirement.title),
                ...this.taalStringToTriples(requirement.id, `dct:description`, requirement.description),
                `${sparqlEscapeUri(requirement.id)} sh:order ${sparqlEscapeInt(index)}`,
                ...this.evidenceToTriples(requirement.id, requirement.evidence),
            ]
        );
    }

    private evidenceToTriples(requirementId: Iri, evidence: Evidence | undefined): string[] {
        return evidence ? [
            `${sparqlEscapeUri(requirementId)} m8g:hasSupportingEvidence ${sparqlEscapeUri(evidence.id)}`,
            `${sparqlEscapeUri(evidence.id)} a m8g:Evidence`,
            ...this.taalStringToTriples(evidence.id, `dct:title`, evidence.title),
            ...this.taalStringToTriples(evidence.id, `dct:description`, evidence.description),
        ] : [];
    }

    private proceduresToTriples(conceptVersie: ConceptVersie): string[] {
        return conceptVersie.procedures.flatMap((procedure, index) =>
            [
                `${sparqlEscapeUri(conceptVersie.id)} cpsv:follows ${sparqlEscapeUri(procedure.id)}`,
                `${sparqlEscapeUri(procedure.id)} a cpsv:Rule`,
                ...this.taalStringToTriples(procedure.id, `dct:title`, procedure.title),
                ...this.taalStringToTriples(procedure.id, `dct:description`, procedure.description),
                `${sparqlEscapeUri(procedure.id)} sh:order ${sparqlEscapeInt(index)}`,
                ...this.websitesToTriples(procedure.id, 'lpdcExt:hasWebsite', procedure.websites)
            ]
        );
    }

    private websitesToTriples(subjectId: Iri, predicate: string, websites: Website[]): string [] {
        return websites.flatMap((website, index) => {
                return [
                    `${sparqlEscapeUri(subjectId)} ${predicate} ${sparqlEscapeUri(website.id)}`,
                    `${sparqlEscapeUri(website.id)} a schema:WebSite`,
                    ...this.taalStringToTriples(website.id, 'dct:title', website.title),
                    ...this.taalStringToTriples(website.id, 'dct:description', website.description),
                    website.url ? `${sparqlEscapeUri(website.id)} schema:url """${website.url}"""` : undefined,
                    `${sparqlEscapeUri(website.id)} sh:order ${sparqlEscapeInt(index)}`,
                ];
            }
        ).filter(t => t != undefined);
    }

    private costsToTriples(conceptVersie: ConceptVersie): string[] {
        return conceptVersie.costs.flatMap((cost, index) => {
            return [
                `${sparqlEscapeUri(conceptVersie.id)} m8g:hasCost ${sparqlEscapeUri(cost.id)}`,
                `${sparqlEscapeUri(cost.id)} a m8g:Cost`,
                ...this.taalStringToTriples(cost.id, 'dct:title', cost.title),
                ...this.taalStringToTriples(cost.id, 'dct:description', cost.description),
                `${sparqlEscapeUri(cost.id)} sh:order ${sparqlEscapeInt(index)}`,
            ];
        });
    }

    private financialAdvantagesToTriples(conceptVersie: ConceptVersie): string[] {
        return conceptVersie.financialAdvantages
            .flatMap((financialAdvantage, index) => {
                return [
                    `${sparqlEscapeUri(conceptVersie.id)} cpsv:produces ${sparqlEscapeUri(financialAdvantage.id)}`,
                    `${sparqlEscapeUri(financialAdvantage.id)} a lpdcExt:FinancialAdvantage`,
                    ...this.taalStringToTriples(financialAdvantage.id, 'dct:title', financialAdvantage.title),
                    ...this.taalStringToTriples(financialAdvantage.id, 'dct:description', financialAdvantage.description),
                    `${sparqlEscapeUri(financialAdvantage.id)} sh:order ${sparqlEscapeInt(index)}`,
                ];
            });
    }

}