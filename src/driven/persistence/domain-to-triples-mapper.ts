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
import {Instance} from "../../core/domain/instance";

export class DomainToTriplesMapper {
    private readonly graphId;

    constructor(graphId: Iri) {
        this.graphId = namedNode(graphId.value);
    }

    public conceptToTriples(concept: Concept): Statement[] {
        return [
            this.rdfType(concept.id, NS.lpdcExt('ConceptualPublicService')),
            concept.uuid ? this.buildQuad(namedNode(concept.id.value), NS.mu('uuid'), literal(concept.uuid)) : undefined,
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
            conceptSnapshot.isVersionOfConcept ? this.buildQuad(namedNode(conceptSnapshot.id.value), NS.dct('isVersionOf'), namedNode(conceptSnapshot.isVersionOfConcept.value)) : undefined,
            conceptSnapshot.dateCreated ? this.buildQuad(namedNode(conceptSnapshot.id.value), NS.schema('dateCreated'), literal(conceptSnapshot.dateCreated.value, NS.xsd('dateTime'))) : undefined,
            conceptSnapshot.dateModified ? this.buildQuad(namedNode(conceptSnapshot.id.value), NS.schema('dateModified'), literal(conceptSnapshot.dateModified.value, NS.xsd('dateTime'))) : undefined,
            conceptSnapshot.generatedAtTime ? this.buildQuad(namedNode(conceptSnapshot.id.value), NS.prov('generatedAtTime'), literal(conceptSnapshot.generatedAtTime.value, NS.xsd('dateTime'))) : undefined,
            this.buildQuad(namedNode(conceptSnapshot.id.value), NS.schema('identifier'), literal(conceptSnapshot.identifier)),
            this.productId(conceptSnapshot.id, conceptSnapshot.productId),
            conceptSnapshot.snapshotType ? this.buildQuad(namedNode(conceptSnapshot.id.value), NS.lpdcExt('snapshotType'), namedNode(this.enumToIri(conceptSnapshot.snapshotType, NS.dvc.snapshotType).value)) : undefined,
            ...this.conceptTags(conceptSnapshot.id, conceptSnapshot.conceptTags),
            ...this.legalResources(conceptSnapshot.id, conceptSnapshot.legalResources),
        ].filter(t => t !== undefined);
    }

    public instanceToTriples(instance: Instance): Statement[] {
        return [
            this.rdfType(instance.id, NS.cpsv('PublicService')),
            instance.uuid ? this.buildQuad(namedNode(instance.id.value), NS.mu('uuid'), literal(instance.uuid)) : undefined,
            this.bestuurseenheidId(instance.id, instance.createdBy),
            ...this.title(instance.id, instance.title),
            ...this.description(instance.id, instance.description),
            ...this.additionalDescription(instance.id, instance.additionalDescription),
            ...this.exception(instance.id, instance.exception),
            ...this.regulation(instance.id, instance.regulation),
            this.startDate(instance.id, instance.startDate),
            this.endDate(instance.id, instance.endDate),
            this.type(instance.id, instance.type),
            ...this.targetAudiences(instance.id, instance.targetAudiences),
            ...this.themes(instance.id, instance.themes),
            ...this.competentAuthorityLevels(instance.id, instance.competentAuthorityLevels),
            ...this.competentAuthorities(instance.id, instance.competentAuthorities),
            ...this.executingAuthorityLevels(instance.id, instance.executingAuthorityLevels),
            ...this.executingAuthorities(instance.id, instance.executingAuthorities),
            ...this.publicationMedia(instance.id, instance.publicationMedia),
            ...this.yourEuropeCategories(instance.id, instance.yourEuropeCategories),
            ...this.keywords(instance.id, instance.keywords),
            instance.dateCreated ? this.buildQuad(namedNode(instance.id.value), NS.dct('created'), literal(instance.dateCreated.value, NS.xsd('dateTime'))) : undefined,
            instance.dateModified ? this.buildQuad(namedNode(instance.id.value), NS.dct('modified'), literal(instance.dateModified.value, NS.xsd('dateTime'))) : undefined,
            this.buildQuad(namedNode(instance.id.value), NS.adms('status'), namedNode(this.enumToIri(instance.status, NS.concepts.instanceStatus).value)),
            ...this.spatials(instance.id, instance.spatials),
        ].filter(t => t !== undefined);
    }

    private buildQuad(subject: any,
                      predicate: any,
                      object: any) {
        return quad(subject, predicate, object, this.graphId);
    }

    private rdfType(id: Iri, type: NamedNode): Statement {
        return this.buildQuad(namedNode(id.value), NS.rdf('type'), type);
    }

    private startDate(id: Iri, value: FormatPreservingDate | undefined): Statement | undefined {
        return value ? this.buildQuad(namedNode(id.value), NS.schema('startDate'), literal(value.value, NS.xsd('dateTime'))) : undefined;
    }

    private endDate(id: Iri, value: FormatPreservingDate | undefined): Statement | undefined {
        return value ? this.buildQuad(namedNode(id.value), NS.schema('endDate'), literal(value.value, NS.xsd('dateTime'))) : undefined;
    }

    private type(id: Iri, value: ProductType): Statement | undefined {
        return value ? this.buildQuad(namedNode(id.value), NS.dct('type'), namedNode(this.enumToIri(value, NS.dvc.type).value)) : undefined;
    }

    private bestuurseenheidId(id: Iri, value: Iri): Statement {
        return this.buildQuad(namedNode(id.value), NS.pav('createdBy'), namedNode(value.value));

    }

    private title(id: Iri, value: LanguageString): Statement [] {
        return this.languageStringToTriples(namedNode(id.value), NS.dct('title'), value);
    }

    private description(id: Iri, value: LanguageString): Statement [] {
        return this.languageStringToTriples(namedNode(id.value), NS.dct('description'), value);
    }

    private additionalDescription(id: Iri, value: LanguageString): Statement [] {
        return this.languageStringToTriples(namedNode(id.value), NS.lpdcExt('additionalDescription'), value);
    }

    private exception(id: Iri, value: LanguageString): Statement [] {
        return this.languageStringToTriples(namedNode(id.value), NS.lpdcExt('exception'), value);
    }

    private regulation(id: Iri, value: LanguageString): Statement[] {
        return this.languageStringToTriples(namedNode(id.value), NS.lpdcExt('regulation'), value);
    }

    private targetAudiences(id: Iri, values: TargetAudienceType[]): Statement[] {
        return this.irisToTriples(namedNode(id.value), NS.lpdcExt('targetAudience'), this.enumsToIris(values, NS.dvc.doelgroep));
    }

    private themes(id: Iri, values: ThemeType[]): Statement[] {
        return this.irisToTriples(namedNode(id.value), NS.m8g('thematicArea'), this.enumsToIris(values, NS.dvc.thema));
    }

    private competentAuthorityLevels(id: Iri, values: CompetentAuthorityLevelType[]): Statement[] {
        return this.irisToTriples(namedNode(id.value), NS.lpdcExt('competentAuthorityLevel'), this.enumsToIris(values, NS.dvc.bevoegdBestuursniveau));
    }

    private competentAuthorities(id: Iri, values: Iri[]): Statement [] {
        return this.irisToTriples(namedNode(id.value), NS.m8g('hasCompetentAuthority'), values);
    }

    private executingAuthorityLevels(id: Iri, values: ExecutingAuthorityLevelType[]): Statement[] {
        return this.irisToTriples(namedNode(id.value), NS.lpdcExt('executingAuthorityLevel'), this.enumsToIris(values, NS.dvc.uitvoerendBestuursniveau));
    }

    private executingAuthorities(id: Iri, values: Iri[]): Statement[] {
        return this.irisToTriples(namedNode(id.value), NS.lpdcExt('hasExecutingAuthority'), values);
    }

    private publicationMedia(id: Iri, values: PublicationMediumType[]): Statement[] {
        return this.irisToTriples(namedNode(id.value), NS.lpdcExt('publicationMedium'), this.enumsToIris(values, NS.dvc.publicatieKanaal));
    }

    private yourEuropeCategories(id: Iri, values: YourEuropeCategoryType[]): Statement [] {
        return this.irisToTriples(namedNode(id.value), NS.lpdcExt('yourEuropeCategory'), this.enumsToIris(values, NS.dvc.yourEuropeCategorie));
    }

    private keywords(id: Iri, values: LanguageString[]): Statement[] {
        return values
            .flatMap(keyword => this.languageStringToTriples(namedNode(id.value), namedNode(NS.dcat('keyword').value), keyword));
    }

    private conceptTags(id: Iri, values: ConceptTagType[]): Statement[] {
        return this.irisToTriples(namedNode(id.value), NS.lpdcExt('conceptTag'), this.enumsToIris(values, NS.dvc.conceptTag));
    }

    private isArchived(id: Iri, isArchived: boolean): Statement | undefined {
        return isArchived ? this.buildQuad(namedNode(id.value), NS.adms('status'), STATUS.concept.archived) : undefined;
    }

    private legalResources(id: Iri, values: Iri[]): Statement[] {
        return this.irisToTriples(namedNode(id.value), NS.m8g('hasLegalResource'), values);
    }

    private spatials(id: Iri, values: Iri[]): Statement[] {
        return this.irisToTriples(namedNode(id.value), NS.dct('spatial'), values);
    }

    private latestConceptSnapshot(id: Iri, value: Iri): Statement {
        return this.buildQuad(namedNode(id.value), NS.ext('hasVersionedSource'), namedNode(value.value));
    }

    private latestFunctionallyChangedConceptSnapshot(id: Iri, value: Iri): Statement {
        return this.buildQuad(namedNode(id.value), NS.lpdcExt('hasLatestFunctionalChange'), namedNode(value.value));
    }

    private previousConceptSnapshots(id: Iri, values: Iri[]): Statement[] {
        return values.map(v => this.buildQuad(namedNode(id.value), NS.ext('previousVersionedSource'), namedNode(v.value)));
    }

    private requirements(id: Iri, values: Requirement[]): Statement[] {
        return values.flatMap((requirement, index) =>
            [
                this.buildQuad(namedNode(id.value), NS.ps('hasRequirement'), namedNode(requirement.id.value)),
                requirement.uuid ? this.buildQuad(namedNode(requirement.id.value), NS.mu('uuid'), literal(requirement.uuid)) : undefined,
                this.buildQuad(namedNode(requirement.id.value), NS.rdf('type'), NS.m8g('Requirement')),
                ...this.languageStringToTriples(namedNode(requirement.id.value), NS.dct(`title`), requirement.title),
                ...this.languageStringToTriples(namedNode(requirement.id.value), NS.dct(`description`), requirement.description),
                this.buildQuad(namedNode(requirement.id.value), NS.sh('order'), literal(`${index}`, NS.xsd('integer'))),
                ...this.evidenceToTriples(requirement.id, requirement.evidence),
            ]
        );
    }

    private evidenceToTriples(requirementId: Iri, evidence: Evidence | undefined): Statement[] {
        return evidence ? [
            this.buildQuad(namedNode(requirementId.value), NS.m8g('hasSupportingEvidence'), namedNode(evidence.id.value)),
            evidence.uuid ? this.buildQuad(namedNode(evidence.id.value), NS.mu('uuid'), literal(evidence.uuid)) : undefined,
            this.buildQuad(namedNode(evidence.id.value), NS.rdf('type'), NS.m8g('Evidence')),
            ...this.languageStringToTriples(namedNode(evidence.id.value), NS.dct(`title`), evidence.title),
            ...this.languageStringToTriples(namedNode(evidence.id.value), NS.dct(`description`), evidence.description),
        ] : [];
    }

    private procedures(id: Iri, values: Procedure[]): Statement[] {
        return values.flatMap((procedure, index) =>
            [
                this.buildQuad(namedNode(id.value), NS.cpsv('follows'), namedNode(procedure.id.value)),
                procedure.uuid ? this.buildQuad(namedNode(procedure.id.value), NS.mu('uuid'), literal(procedure.uuid)) : undefined,
                this.buildQuad(namedNode(procedure.id.value), NS.rdf('type'), NS.cpsv('Rule')),
                ...this.languageStringToTriples(namedNode(procedure.id.value), NS.dct(`title`), procedure.title),
                ...this.languageStringToTriples(namedNode(procedure.id.value), NS.dct(`description`), procedure.description),
                this.buildQuad(namedNode(procedure.id.value), NS.sh('order'), literal(`${index}`, NS.xsd('integer'))),
                ...this.websites(procedure.id, NS.lpdcExt('hasWebsite'), procedure.websites)
            ]
        );
    }

    private websites(id: Iri, predicate: NamedNode, websites: Website[]): Statement [] {
        return websites.flatMap((website, index) => {
                return [
                    this.buildQuad(namedNode(id.value), predicate, namedNode(website.id.value)),
                    website.uuid ? this.buildQuad(namedNode(website.id.value), NS.mu('uuid'), literal(website.uuid)) : undefined,
                    this.buildQuad(namedNode(website.id.value), NS.rdf('type'), NS.schema('WebSite')),
                    ...this.languageStringToTriples(namedNode(website.id.value), NS.dct(`title`), website.title),
                    ...this.languageStringToTriples(namedNode(website.id.value), NS.dct(`description`), website.description),
                    website.url ? this.buildQuad(namedNode(website.id.value), NS.schema('url'), literal(website.url)) : undefined,
                    this.buildQuad(namedNode(website.id.value), NS.sh('order'), literal(`${index}`, NS.xsd('integer'))),
                ];
            }
        ).filter(t => t != undefined);
    }

    private costs(id: Iri, values: Cost[]): Statement[] {
        return values.flatMap((cost, index) => {
            return [
                this.buildQuad(namedNode(id.value), NS.m8g('hasCost'), namedNode(cost.id.value)),
                cost.uuid ? this.buildQuad(namedNode(cost.id.value), NS.mu('uuid'), literal(cost.uuid)) : undefined,
                this.buildQuad(namedNode(cost.id.value), NS.rdf('type'), NS.m8g('Cost')),
                ...this.languageStringToTriples(namedNode(cost.id.value), NS.dct(`title`), cost.title),
                ...this.languageStringToTriples(namedNode(cost.id.value), NS.dct(`description`), cost.description),
                this.buildQuad(namedNode(cost.id.value), NS.sh('order'), literal(`${index}`, NS.xsd('integer'))),
            ];
        });
    }

    private financialAdvantages(id: Iri, values: FinancialAdvantage[]): Statement[] {
        return values
            .flatMap((financialAdvantage, index) => {
                return [
                    this.buildQuad(namedNode(id.value), NS.cpsv('produces'), namedNode(financialAdvantage.id.value)),
                    financialAdvantage.uuid ? this.buildQuad(namedNode(financialAdvantage.id.value), NS.mu('uuid'), literal(financialAdvantage.uuid)) : undefined,
                    this.buildQuad(namedNode(financialAdvantage.id.value), NS.rdf('type'), NS.lpdcExt('FinancialAdvantage')),
                    ...this.languageStringToTriples(namedNode(financialAdvantage.id.value), NS.dct(`title`), financialAdvantage.title),
                    ...this.languageStringToTriples(namedNode(financialAdvantage.id.value), NS.dct(`description`), financialAdvantage.description),
                    this.buildQuad(namedNode(financialAdvantage.id.value), NS.sh('order'), literal(`${index}`, NS.xsd('integer'))),
                ];
            });
    }

    private productId(id: Iri, productId: string | undefined): Statement | undefined {
        return productId ? this.buildQuad(namedNode(id.value), NS.schema('productID'), literal(productId)) : undefined;
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
                .map(tuple => this.buildQuad(subject, predicate, literal(tuple[1], tuple[0]))) : [];
    }

    private irisToTriples(subject: NamedNode, predicate: NamedNode, values: any[]): Statement[] {
        return values.map(e => this.buildQuad(subject, predicate, namedNode(e)));
    }

    private enumsToIris(values: any[], namespace: (ln: string) => NamedNode): Iri[] {
        return values.map(v => this.enumToIri(v, namespace));
    }

    private enumToIri(value: any, namespace: (ln: string) => NamedNode): Iri {
        return new Iri(namespace(value).value);
    }
}