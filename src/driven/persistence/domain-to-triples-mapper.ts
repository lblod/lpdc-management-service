import {ConceptSnapshot} from "../../core/domain/concept-snapshot";
import {Iri} from "../../core/domain/shared/iri";
import {LanguageString} from "../../core/domain/language-string";
import {Evidence} from "../../core/domain/evidence";
import {Website} from "../../core/domain/website";
import {literal, namedNode, quad, Statement} from "rdflib";
import {NamedNode} from 'rdflib/lib/tf-types';
import {NS} from "./namespaces";
import {Concept} from "../../core/domain/concept";
import {FormatPreservingDate} from "../../core/domain/format-preserving-date";
import {
    CompetentAuthorityLevelType,
    ConceptTagType,
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
import {STATUS} from "./status";

export class DomainToTriplesMapper {

    public conceptToTriples(concept: Concept): Statement[] {
        return [
            this.rdfType(concept.id, NS.lpdcExt('ConceptualPublicService')),
            concept.uuid ? quad(namedNode(concept.id), NS.mu('uuid'), literal(concept.uuid)) : undefined,
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
            ...this.websites(concept.id, NS.rdfs('seeAlso'), concept.websites),
            ...this.costs(concept.id, concept.costs),
            ...this.financialAdvantages(concept.id, concept.financialAdvantages),
            this.productId(concept.id, concept.productId),
            this.latestConceptSnapshot(concept.id, concept.latestConceptSnapshot),
            ...this.previousConceptSnapshots(concept.id, concept.previousConceptSnapshots),
            this.latestFunctionallyChangedConceptSnapshot(concept.id, concept.latestFunctionallyChangedConceptSnapshot),
            ...this.conceptTags(concept.id, concept.conceptTags),
            this.isArchived(concept.id, concept.isArchived),
            ...this.legalResources(concept.id, concept.legalResources),
        ].filter(t => t !== undefined);
    }

    public conceptSnapshotToTriples(conceptSnapshot: ConceptSnapshot): Statement[] {
        return [
            this.rdfType(conceptSnapshot.id, NS.lpdcExt('ConceptualPublicService')),
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
            ...this.websites(conceptSnapshot.id, NS.rdfs('seeAlso'), conceptSnapshot.websites),
            ...this.costs(conceptSnapshot.id, conceptSnapshot.costs),
            ...this.financialAdvantages(conceptSnapshot.id, conceptSnapshot.financialAdvantages),
            conceptSnapshot.isVersionOfConcept ? quad(namedNode(conceptSnapshot.id), NS.dct('isVersionOf'), namedNode(conceptSnapshot.isVersionOfConcept)) : undefined,
            conceptSnapshot.dateCreated ? quad(namedNode(conceptSnapshot.id), NS.schema('dateCreated'), literal(conceptSnapshot.dateCreated.value, NS.xsd('dateTime'))) : undefined,
            conceptSnapshot.dateModified ? quad(namedNode(conceptSnapshot.id), NS.schema('dateModified'), literal(conceptSnapshot.dateModified.value, NS.xsd('dateTime'))) : undefined,
            conceptSnapshot.generatedAtTime ? quad(namedNode(conceptSnapshot.id), NS.prov('generatedAtTime'), literal(conceptSnapshot.generatedAtTime.value, NS.xsd('dateTime'))) : undefined,
            quad(namedNode(conceptSnapshot.id), NS.schema('identifier'), literal(conceptSnapshot.identifier)),
            this.productId(conceptSnapshot.id, conceptSnapshot.productId),
            conceptSnapshot.snapshotType ? quad(namedNode(conceptSnapshot.id), NS.lpdcExt('snapshotType'), namedNode(this.enumToIri(conceptSnapshot.snapshotType, NS.concept.snapshotType))) : undefined,
            ...this.conceptTags(conceptSnapshot.id, conceptSnapshot.conceptTags),
            ...this.legalResources(conceptSnapshot.id, conceptSnapshot.legalResources),
        ].filter(t => t !== undefined);
    }

    private rdfType(id: Iri, type: NamedNode): Statement {
        return quad(namedNode(id), NS.rdf('type'), type);
    }

    private startDate(id: Iri, value: FormatPreservingDate | undefined): Statement | undefined {
        return value ? quad(namedNode(id), NS.schema('startDate'), literal(value.value, NS.xsd('dateTime'))) : undefined;
    }

    private endDate(id: Iri, value: FormatPreservingDate | undefined): Statement | undefined {
        return value ? quad(namedNode(id), NS.schema('endDate'), literal(value.value, NS.xsd('dateTime'))) : undefined;
    }

    private type(id: Iri, value: ProductType): Statement | undefined {
        return value ? quad(namedNode(id), NS.dct('type'), namedNode(this.enumToIri(value, NS.concept.type))) : undefined;
    }

    private title(id: Iri, value: LanguageString): Statement [] {
        return this.languageStringToTriples(namedNode(id), NS.dct('title'), value);
    }

    private description(id: Iri, value: LanguageString): Statement [] {
        return this.languageStringToTriples(namedNode(id), NS.dct('description'), value);
    }

    private additionalDescription(id: Iri, value: LanguageString): Statement [] {
        return this.languageStringToTriples(namedNode(id), NS.lpdcExt('additionalDescription'), value);
    }

    private exception(id: Iri, value: LanguageString): Statement [] {
        return this.languageStringToTriples(namedNode(id), NS.lpdcExt('exception'), value);
    }

    private regulation(id: Iri, value: LanguageString): Statement [] {
        return this.languageStringToTriples(namedNode(id), NS.lpdcExt('regulation'), value);
    }

    private targetAudiences(id: Iri, values: Set<TargetAudienceType>): Statement [] {
        return this.irisToTriples(namedNode(id), NS.lpdcExt('targetAudience'), this.enumsToIris(values, NS.concept.doelgroep));
    }

    private themes(id: Iri, values: Set<ThemeType>): Statement [] {
        return this.irisToTriples(namedNode(id), NS.m8g('thematicArea'), this.enumsToIris(values, NS.concept.thema));
    }

    private competentAuthorityLevels(id: Iri, values: Set<CompetentAuthorityLevelType>): Statement [] {
        return this.irisToTriples(namedNode(id), NS.lpdcExt('competentAuthorityLevel'), this.enumsToIris(values, NS.concept.bevoegdBestuursniveau));
    }

    private competentAuthorities(id: Iri, values: Set<Iri>): Statement [] {
        return this.irisToTriples(namedNode(id), NS.m8g('hasCompetentAuthority'), values);
    }

    private executingAuthorityLevels(id: Iri, values: Set<ExecutingAuthorityLevelType>): Statement [] {
        return this.irisToTriples(namedNode(id), NS.lpdcExt('executingAuthorityLevel'), this.enumsToIris(values, NS.concept.uitvoerendBestuursniveau));
    }

    private executingAuthorities(id: Iri, values: Set<Iri>): Statement [] {
        return this.irisToTriples(namedNode(id), NS.lpdcExt('hasExecutingAuthority'), values);
    }

    private publicationMedia(id: Iri, values: Set<PublicationMediumType>): Statement [] {
        return this.irisToTriples(namedNode(id), NS.lpdcExt('publicationMedium'), this.enumsToIris(values, NS.concept.publicatieKanaal));
    }

    private yourEuropeCategories(id: Iri, values: Set<YourEuropeCategoryType>): Statement [] {
        return this.irisToTriples(namedNode(id), NS.lpdcExt('yourEuropeCategory'), this.enumsToIris(values, NS.concept.yourEuropeCategorie));
    }

    private keywords(id: Iri, values: Set<LanguageString>): Statement[] {
        return Array.from(values)
            .flatMap(keyword => this.languageStringToTriples(namedNode(id), namedNode(NS.dcat('keyword').value), keyword));
    }

    private conceptTags(id: Iri, values: Set<ConceptTagType>): Statement[] {
        return this.irisToTriples(namedNode(id), NS.lpdcExt('conceptTag'), this.enumsToIris(values, NS.concept.conceptTag));
    }

    private isArchived(id: Iri, isArchived: boolean): Statement | undefined {
        return isArchived ? quad(namedNode(id), NS.adms('status'), STATUS.concept.archived) : undefined;
    }

    private legalResources(id: Iri, values: Set<Iri>): Statement[] {
        return this.irisToTriples(namedNode(id), NS.m8g('hasLegalResource'), values);
    }

    private latestConceptSnapshot(id: Iri, value: Iri): Statement {
        return quad(namedNode(id), NS.ext('hasVersionedSource'), namedNode(value));
    }

    private latestFunctionallyChangedConceptSnapshot(id: Iri, value: Iri): Statement {
        return quad(namedNode(id), NS.lpdcExt('hasLatestFunctionalChange'), namedNode(value));
    }

    private previousConceptSnapshots(id: Iri, values: Set<Iri>): Statement[] {
        return Array.from(values).map(v => quad(namedNode(id), NS.ext('previousVersionedSource'), namedNode(v)));
    }

    private requirements(id: Iri, values: Requirement[]): Statement[] {
        return values.flatMap((requirement, index) =>
            [
                quad(namedNode(id), NS.ps('hasRequirement'), namedNode(requirement.id)),
                requirement.uuid ? quad(namedNode(requirement.id), NS.mu('uuid'), literal(requirement.uuid)) : undefined,
                quad(namedNode(requirement.id), NS.rdf('type'), NS.m8g('Requirement')),
                ...this.languageStringToTriples(namedNode(requirement.id), NS.dct(`title`), requirement.title),
                ...this.languageStringToTriples(namedNode(requirement.id), NS.dct(`description`), requirement.description),
                quad(namedNode(requirement.id), NS.sh('order'), literal(`${index}`, NS.xsd('integer'))),
                ...this.evidenceToTriples(requirement.id, requirement.evidence),
            ]
        );
    }

    private evidenceToTriples(requirementId: Iri, evidence: Evidence | undefined): Statement[] {
        return evidence ? [
            quad(namedNode(requirementId), NS.m8g('hasSupportingEvidence'), namedNode(evidence.id)),
            evidence.uuid ? quad(namedNode(evidence.id), NS.mu('uuid'), literal(evidence.uuid)) : undefined,
            quad(namedNode(evidence.id), NS.rdf('type'), NS.m8g('Evidence')),
            ...this.languageStringToTriples(namedNode(evidence.id), NS.dct(`title`), evidence.title),
            ...this.languageStringToTriples(namedNode(evidence.id), NS.dct(`description`), evidence.description),
        ] : [];
    }

    private procedures(id: Iri, values: Procedure[]): Statement[] {
        return values.flatMap((procedure, index) =>
            [
                quad(namedNode(id), NS.cpsv('follows'), namedNode(procedure.id)),
                procedure.uuid ? quad(namedNode(procedure.id), NS.mu('uuid'), literal(procedure.uuid)) : undefined,
                quad(namedNode(procedure.id), NS.rdf('type'), NS.cpsv('Rule')),
                ...this.languageStringToTriples(namedNode(procedure.id), NS.dct(`title`), procedure.title),
                ...this.languageStringToTriples(namedNode(procedure.id), NS.dct(`description`), procedure.description),
                quad(namedNode(procedure.id), NS.sh('order'), literal(`${index}`, NS.xsd('integer'))),
                ...this.websites(procedure.id, NS.lpdcExt('hasWebsite'), procedure.websites)
            ]
        );
    }

    private websites(id: Iri, predicate: NamedNode, websites: Website[]): Statement [] {
        return websites.flatMap((website, index) => {
                return [
                    quad(namedNode(id), predicate, namedNode(website.id)),
                    website.uuid ? quad(namedNode(website.id), NS.mu('uuid'), literal(website.uuid)) : undefined,
                    quad(namedNode(website.id), NS.rdf('type'), NS.schema('WebSite')),
                    ...this.languageStringToTriples(namedNode(website.id), NS.dct(`title`), website.title),
                    ...this.languageStringToTriples(namedNode(website.id), NS.dct(`description`), website.description),
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
                cost.uuid ? quad(namedNode(cost.id), NS.mu('uuid'), literal(cost.uuid)) : undefined,
                quad(namedNode(cost.id), NS.rdf('type'), NS.m8g('Cost')),
                ...this.languageStringToTriples(namedNode(cost.id), NS.dct(`title`), cost.title),
                ...this.languageStringToTriples(namedNode(cost.id), NS.dct(`description`), cost.description),
                quad(namedNode(cost.id), NS.sh('order'), literal(`${index}`, NS.xsd('integer'))),
            ];
        });
    }

    private financialAdvantages(id: Iri, values: FinancialAdvantage[]): Statement[] {
        return values
            .flatMap((financialAdvantage, index) => {
                return [
                    quad(namedNode(id), NS.cpsv('produces'), namedNode(financialAdvantage.id)),
                    financialAdvantage.uuid ? quad(namedNode(financialAdvantage.id), NS.mu('uuid'), literal(financialAdvantage.uuid)) : undefined,
                    quad(namedNode(financialAdvantage.id), NS.rdf('type'), NS.lpdcExt('FinancialAdvantage')),
                    ...this.languageStringToTriples(namedNode(financialAdvantage.id), NS.dct(`title`), financialAdvantage.title),
                    ...this.languageStringToTriples(namedNode(financialAdvantage.id), NS.dct(`description`), financialAdvantage.description),
                    quad(namedNode(financialAdvantage.id), NS.sh('order'), literal(`${index}`, NS.xsd('integer'))),
                ];
            });
    }

    private productId(id: Iri, productId: Iri | undefined): Statement | undefined {
        return productId ? quad(namedNode(id), NS.schema('productID'), literal(productId)) : undefined;
    }

    private languageStringToTriples(subject: NamedNode, predicate: NamedNode, object: LanguageString | undefined): Statement[] {
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

    private enumsToIris(values: Set<any>, namespace: (ln: string) => NamedNode): Set<Iri> {
        return new Set(Array.from(values).map(v => this.enumToIri(v, namespace)));
    }

    private enumToIri(value: any, namespace: (ln: string) => NamedNode): Iri {
        return namespace(value).value;
    }
}