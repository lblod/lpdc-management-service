import {ConceptVersie} from "../../core/domain/concept-versie";
import {Iri} from "../../core/domain/shared/iri";
import {TaalString} from "../../core/domain/taal-string";
import {Evidence} from "../../core/domain/evidence";
import {Website} from "../../core/domain/website";
import {literal, NamedNode, namedNode, quad, Statement} from "rdflib";
import {NS} from "./namespaces";
import {Concept} from "../../core/domain/concept";
import {FormatPreservingDate} from "../../core/domain/format-preserving-date";
import {
    CompetentAuthorityLevelType,
    ExecutingAuthorityLevelType,
    ProductType,
    PublicationMediumType,
    TargetAudienceType,
    ThemeType,
    YourEuropeCategoryType
} from "../../core/domain/types";
import {Requirement} from "../../core/domain/requirement";
import {Procedure} from "../../core/domain/procedure";
import {Cost} from "../../core/domain/cost";
import {FinancialAdvantage} from "../../core/domain/financial-advantage";

export class DomainToTriplesMapper {

    public conceptToTriples(concept: Concept): Statement[] {
        return [
            this.rdfType(concept.id, namedNode(NS.lpdcExt('ConceptualPublicService').value)),
            this.startDate(concept.id, concept.startDate),
            this.endDate(concept.id, concept.endDate),
            this.type(concept.id, concept.type),
            ...this.title(concept.id, concept.title),
            ...this.description(concept.id, concept.description),
            ...this.additionalDescription(concept.id, concept.additionalDescription),
            ...this.exception(concept.id, concept.exception),
            ...this.regulation(concept.id, concept.regulation),
            ...this.targetAudiences(concept.id, concept.targetAudiences),
            ...this.themes(concept.id, concept.themes),
            ...this.competentAuthorityLevels(concept.id, concept.competentAuthorityLevels),
            ...this.competentAuthorities(concept.id, concept.competentAuthorities),
            ...this.executingAuthorityLevels(concept.id, concept.executingAuthorityLevels),
            ...this.executingAuthorities(concept.id, concept.executingAuthorities),
            ...this.publicationMedia(concept.id, concept.publicationMedia),
            ...this.yourEuropeCategories(concept.id, concept.yourEuropeCategories),
            ...this.keywords(concept.id, concept.keywords),
            ...this.requirements(concept.id, concept.requirements),
            ...this.procedures(concept.id, concept.procedures),
            ...this.websites(concept.id, namedNode(NS.rdfs('seeAlso').value), concept.websites),
            ...this.costs(concept.id, concept.costs),
            ...this.financialAdvantages(concept.id, concept.financialAdvantages),
            this.productId(concept.id, concept.productId),
        ].filter(t => t !== undefined);
    }

    public conceptVersieToTriples(conceptVersie: ConceptVersie): Statement[] {
        return [
            this.rdfType(conceptVersie.id, namedNode(NS.lpdcExt('ConceptualPublicService').value)),
            this.startDate(conceptVersie.id, conceptVersie.startDate),
            this.endDate(conceptVersie.id, conceptVersie.endDate),
            this.type(conceptVersie.id, conceptVersie.type),
            ...this.title(conceptVersie.id, conceptVersie.title),
            ...this.description(conceptVersie.id, conceptVersie.description),
            ...this.additionalDescription(conceptVersie.id, conceptVersie.additionalDescription),
            ...this.exception(conceptVersie.id, conceptVersie.exception),
            ...this.regulation(conceptVersie.id, conceptVersie.regulation),
            ...this.targetAudiences(conceptVersie.id, conceptVersie.targetAudiences),
            ...this.themes(conceptVersie.id, conceptVersie.themes),
            ...this.competentAuthorityLevels(conceptVersie.id, conceptVersie.competentAuthorityLevels),
            ...this.competentAuthorities(conceptVersie.id, conceptVersie.competentAuthorities),
            ...this.executingAuthorityLevels(conceptVersie.id, conceptVersie.executingAuthorityLevels),
            ...this.executingAuthorities(conceptVersie.id, conceptVersie.executingAuthorities),
            ...this.publicationMedia(conceptVersie.id, conceptVersie.publicationMedia),
            ...this.yourEuropeCategories(conceptVersie.id, conceptVersie.yourEuropeCategories),
            ...this.keywords(conceptVersie.id, conceptVersie.keywords),
            ...this.requirements(conceptVersie.id, conceptVersie.requirements),
            ...this.procedures(conceptVersie.id, conceptVersie.procedures),
            ...this.websites(conceptVersie.id, namedNode(NS.rdfs('seeAlso').value), conceptVersie.websites),
            ...this.costs(conceptVersie.id, conceptVersie.costs),
            ...this.financialAdvantages(conceptVersie.id, conceptVersie.financialAdvantages),
            conceptVersie.isVersionOfConcept ? quad(namedNode(conceptVersie.id), NS.dct('isVersionOf'), namedNode(conceptVersie.isVersionOfConcept)) : undefined,
            conceptVersie.dateCreated ? quad(namedNode(conceptVersie.id), NS.schema('dateCreated'), literal(conceptVersie.dateCreated.value, NS.xsd('dateTime'))) : undefined,
            conceptVersie.dateModified ? quad(namedNode(conceptVersie.id), NS.schema('dateModified'), literal(conceptVersie.dateModified.value, NS.xsd('dateTime'))) : undefined,
            conceptVersie.generatedAtTime ? quad(namedNode(conceptVersie.id), NS.prov('generatedAtTime'), literal(conceptVersie.generatedAtTime.value, NS.xsd('dateTime'))) : undefined,
            quad(namedNode(conceptVersie.id), NS.schema('identifier'), literal(conceptVersie.identifier)),
            this.productId(conceptVersie.id, conceptVersie.productId),
            conceptVersie.snapshotType ? quad(namedNode(conceptVersie.id), NS.lpdcExt('snapshotType'), namedNode(conceptVersie.snapshotType)) : undefined,
            ...this.irisToTriples(namedNode(conceptVersie.id), namedNode(NS.lpdcExt('conceptTag').value), conceptVersie.conceptTags),
        ].filter(t => t !== undefined);
    }

    private rdfType(id: Iri, type: NamedNode): Statement {
        return quad(namedNode(id), NS.rdf('type'), type);
    }

    private startDate(id: Iri, value: FormatPreservingDate | undefined) : Statement | undefined {
        return value ? quad(namedNode(id), NS.schema('startDate'), literal(value.value, NS.xsd('dateTime'))) : undefined;
    }

    private endDate(id: Iri, value: FormatPreservingDate | undefined) : Statement | undefined {
        return value ? quad(namedNode(id), NS.schema('endDate'), literal(value.value, NS.xsd('dateTime'))) : undefined;
    }

    private type(id: Iri, value: ProductType): Statement | undefined {
        return value ? quad(namedNode(id), NS.dct('type'), namedNode(value)) : undefined;
    }

    private title(id: Iri, value: TaalString): Statement [] {
        return this.taalStringToTriples(namedNode(id), namedNode(NS.dct('title').value), value);
    }

    private description(id: Iri, value: TaalString): Statement [] {
        return this.taalStringToTriples(namedNode(id), namedNode(NS.dct('description').value), value);
    }

    private additionalDescription(id: Iri, value: TaalString): Statement [] {
        return this.taalStringToTriples(namedNode(id), namedNode(NS.lpdcExt('additionalDescription').value), value);
    }

    private exception(id: Iri, value: TaalString): Statement [] {
        return this.taalStringToTriples(namedNode(id), namedNode(NS.lpdcExt('exception').value), value);
    }

    private regulation(id: Iri, value: TaalString): Statement [] {
        return this.taalStringToTriples(namedNode(id), namedNode(NS.lpdcExt('regulation').value), value);
    }

    private targetAudiences(id: Iri, values: Set<TargetAudienceType>): Statement [] {
        return this.irisToTriples(namedNode(id), namedNode(NS.lpdcExt('targetAudience').value), values);
    }
    private themes(id: Iri, values: Set<ThemeType>): Statement [] {
        return this.irisToTriples(namedNode(id), namedNode(NS.m8g('thematicArea').value), values);
    }

    private competentAuthorityLevels(id: Iri, values: Set<CompetentAuthorityLevelType>): Statement [] {
        return this.irisToTriples(namedNode(id), namedNode(NS.lpdcExt('competentAuthorityLevel').value), values);
    }

    private competentAuthorities(id: Iri, values: Set<Iri>): Statement [] {
        return this.irisToTriples(namedNode(id), namedNode(NS.m8g('hasCompetentAuthority').value), values);
    }

    private executingAuthorityLevels(id: Iri, values: Set<ExecutingAuthorityLevelType>): Statement [] {
        return this.irisToTriples(namedNode(id), namedNode(NS.lpdcExt('executingAuthorityLevel').value), values);
    }

    private executingAuthorities(id: Iri, values: Set<Iri>): Statement [] {
        return this.irisToTriples(namedNode(id), namedNode(NS.lpdcExt('hasExecutingAuthority').value), values);
    }

    private publicationMedia(id: Iri, values: Set<PublicationMediumType>): Statement [] {
        return this.irisToTriples(namedNode(id), namedNode(NS.lpdcExt('publicationMedium').value), values);
    }

    private yourEuropeCategories(id: Iri, values: Set<YourEuropeCategoryType>): Statement [] {
        return this.irisToTriples(namedNode(id), namedNode(NS.lpdcExt('yourEuropeCategory').value), values);
    }

    private keywords(id: Iri, values: TaalString []): Statement [] {
        return values.flatMap(keyword => this.taalStringToTriples(namedNode(id), namedNode(NS.dcat('keyword').value), keyword));
    }

    private requirements(id: Iri, values: Requirement[]): Statement[] {
        return values.flatMap((requirement, index) =>
            [
                quad(namedNode(id), NS.ps('hasRequirement'), namedNode(requirement.id)),
                quad(namedNode(requirement.id), NS.rdf('type'), NS.m8g('Requirement')),
                ...this.taalStringToTriples(namedNode(requirement.id), namedNode(NS.dct(`title`).value), requirement.title),
                ...this.taalStringToTriples(namedNode(requirement.id), namedNode(NS.dct(`description`).value), requirement.description),
                quad(namedNode(requirement.id), NS.sh('order'), literal(`${index}`, NS.xsd('integer'))),
                ...this.evidenceToTriples(requirement.id, requirement.evidence),
            ]
        );
    }

    private evidenceToTriples(requirementId: Iri, evidence: Evidence | undefined): Statement[] {
        return evidence ? [
            quad(namedNode(requirementId), NS.m8g('hasSupportingEvidence'), namedNode(evidence.id)),
            quad(namedNode(evidence.id), NS.rdf('type'), NS.m8g('Evidence')),
            ...this.taalStringToTriples(namedNode(evidence.id), namedNode(NS.dct(`title`).value), evidence.title),
            ...this.taalStringToTriples(namedNode(evidence.id), namedNode(NS.dct(`description`).value), evidence.description),
        ] : [];
    }

    private procedures(id: Iri, values: Procedure[]): Statement[] {
        return values.flatMap((procedure, index) =>
            [
                quad(namedNode(id), NS.cpsv('follows'), namedNode(procedure.id)),
                quad(namedNode(procedure.id), NS.rdf('type'), NS.cpsv('Rule')),
                ...this.taalStringToTriples(namedNode(procedure.id), namedNode(NS.dct(`title`).value), procedure.title),
                ...this.taalStringToTriples(namedNode(procedure.id), namedNode(NS.dct(`description`).value), procedure.description),
                quad(namedNode(procedure.id), NS.sh('order'), literal(`${index}`, NS.xsd('integer'))),
                ...this.websites(procedure.id, namedNode(NS.lpdcExt('hasWebsite').value), procedure.websites)
            ]
        );
    }

    private websites(id: Iri, predicate: NamedNode, websites: Website[]): Statement [] {
        return websites.flatMap((website, index) => {
                return [
                    quad(namedNode(id), predicate, namedNode(website.id)),
                    quad(namedNode(website.id), NS.rdf('type'), NS.schema('WebSite')),
                    ...this.taalStringToTriples(namedNode(website.id), namedNode(NS.dct(`title`).value), website.title),
                    ...this.taalStringToTriples(namedNode(website.id), namedNode(NS.dct(`description`).value), website.description),
                    website.url ? quad(namedNode(website.id), NS.schema('url'), literal(website.url)) : undefined,
                    quad(namedNode(website.id), NS.sh('order'), literal(`${index}`, NS.xsd('integer'))),
                ];
            }
        ).filter(t => t != undefined);
    }

    private costs(id: Iri, values: Cost[]): Statement[] {
        return values.flatMap((cost, index) => {
            return [
                quad(namedNode(id), NS.m8g('hasCost'), namedNode(cost.id)),
                quad(namedNode(cost.id), NS.rdf('type'), NS.m8g('Cost')),
                ...this.taalStringToTriples(namedNode(cost.id), namedNode(NS.dct(`title`).value), cost.title),
                ...this.taalStringToTriples(namedNode(cost.id), namedNode(NS.dct(`description`).value), cost.description),
                quad(namedNode(cost.id), NS.sh('order'), literal(`${index}`, NS.xsd('integer'))),
            ];
        });
    }

    private financialAdvantages(id: Iri, values: FinancialAdvantage[]): Statement[] {
        return values
            .flatMap((financialAdvantage, index) => {
                return [
                    quad(namedNode(id), NS.cpsv('produces'), namedNode(financialAdvantage.id)),
                    quad(namedNode(financialAdvantage.id), NS.rdf('type'), NS.lpdcExt('FinancialAdvantage')),
                    ...this.taalStringToTriples(namedNode(financialAdvantage.id), namedNode(NS.dct(`title`).value), financialAdvantage.title),
                    ...this.taalStringToTriples(namedNode(financialAdvantage.id), namedNode(NS.dct(`description`).value), financialAdvantage.description),
                    quad(namedNode(financialAdvantage.id), NS.sh('order'), literal(`${index}`, NS.xsd('integer'))),
                ];
            });
    }

    private productId(id: Iri, productId: Iri | undefined): Statement | undefined {
        return productId ? quad(namedNode(id), NS.schema('productID'), literal(productId)) : undefined;
    }


    private taalStringToTriples(subject: NamedNode, predicate: NamedNode, object: TaalString | undefined): Statement[] {
        return object ?
            [
                ["en", object.en],
                ["nl", object.nl],
                ["nl-be-x-formal", object.nlFormal],
                ["nl-be-x-informal", object.nlInformal],
                ["nl-be-x-generated-formal", object.nlGeneratedFormal],
                ["nl-be-x-generated-informal", object.nlGeneratedInformal]]
                .filter(tuple => tuple[1] !== undefined)
                .map(tuple => quad(subject, predicate, literal(tuple[1], tuple[0]))) : [];
    }

    private irisToTriples(subject: NamedNode, predicate: NamedNode, values: Set<any>): Statement[] {
        return Array.from(values)
            .map(e => quad(subject, predicate, namedNode(e)));
    }

}