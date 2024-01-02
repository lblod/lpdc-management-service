import {ConceptSnapshot} from "../../core/domain/concept-snapshot";
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

    public conceptSnapshotToTriples(conceptSnapshot: ConceptSnapshot): Statement[] {
        return [
            this.rdfType(conceptSnapshot.id, namedNode(NS.lpdcExt('ConceptualPublicService').value)),
            this.startDate(conceptSnapshot.id, conceptSnapshot.startDate),
            this.endDate(conceptSnapshot.id, conceptSnapshot.endDate),
            this.type(conceptSnapshot.id, conceptSnapshot.type),
            ...this.title(conceptSnapshot.id, conceptSnapshot.title),
            ...this.description(conceptSnapshot.id, conceptSnapshot.description),
            ...this.additionalDescription(conceptSnapshot.id, conceptSnapshot.additionalDescription),
            ...this.exception(conceptSnapshot.id, conceptSnapshot.exception),
            ...this.regulation(conceptSnapshot.id, conceptSnapshot.regulation),
            ...this.targetAudiences(conceptSnapshot.id, conceptSnapshot.targetAudiences),
            ...this.themes(conceptSnapshot.id, conceptSnapshot.themes),
            ...this.competentAuthorityLevels(conceptSnapshot.id, conceptSnapshot.competentAuthorityLevels),
            ...this.competentAuthorities(conceptSnapshot.id, conceptSnapshot.competentAuthorities),
            ...this.executingAuthorityLevels(conceptSnapshot.id, conceptSnapshot.executingAuthorityLevels),
            ...this.executingAuthorities(conceptSnapshot.id, conceptSnapshot.executingAuthorities),
            ...this.publicationMedia(conceptSnapshot.id, conceptSnapshot.publicationMedia),
            ...this.yourEuropeCategories(conceptSnapshot.id, conceptSnapshot.yourEuropeCategories),
            ...this.keywords(conceptSnapshot.id, conceptSnapshot.keywords),
            ...this.requirements(conceptSnapshot.id, conceptSnapshot.requirements),
            ...this.procedures(conceptSnapshot.id, conceptSnapshot.procedures),
            ...this.websites(conceptSnapshot.id, namedNode(NS.rdfs('seeAlso').value), conceptSnapshot.websites),
            ...this.costs(conceptSnapshot.id, conceptSnapshot.costs),
            ...this.financialAdvantages(conceptSnapshot.id, conceptSnapshot.financialAdvantages),
            conceptSnapshot.isVersionOfConcept ? quad(namedNode(conceptSnapshot.id), NS.dct('isVersionOf'), namedNode(conceptSnapshot.isVersionOfConcept)) : undefined,
            conceptSnapshot.dateCreated ? quad(namedNode(conceptSnapshot.id), NS.schema('dateCreated'), literal(conceptSnapshot.dateCreated.value, NS.xsd('dateTime'))) : undefined,
            conceptSnapshot.dateModified ? quad(namedNode(conceptSnapshot.id), NS.schema('dateModified'), literal(conceptSnapshot.dateModified.value, NS.xsd('dateTime'))) : undefined,
            conceptSnapshot.generatedAtTime ? quad(namedNode(conceptSnapshot.id), NS.prov('generatedAtTime'), literal(conceptSnapshot.generatedAtTime.value, NS.xsd('dateTime'))) : undefined,
            quad(namedNode(conceptSnapshot.id), NS.schema('identifier'), literal(conceptSnapshot.identifier)),
            this.productId(conceptSnapshot.id, conceptSnapshot.productId),
            conceptSnapshot.snapshotType ? quad(namedNode(conceptSnapshot.id), NS.lpdcExt('snapshotType'), namedNode(conceptSnapshot.snapshotType)) : undefined,
            ...this.irisToTriples(namedNode(conceptSnapshot.id), namedNode(NS.lpdcExt('conceptTag').value), conceptSnapshot.conceptTags),
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