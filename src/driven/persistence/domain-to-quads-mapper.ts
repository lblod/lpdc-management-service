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
    LanguageType,
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
import {ContactPoint} from "../../core/domain/contact-point";
import {Address} from "../../core/domain/address";
import {InstanceSnapshot} from "../../core/domain/instance-snapshot";

export class DomainToQuadsMapper {
    private readonly graphId;

    constructor(graphId: Iri) {
        this.graphId = namedNode(graphId.value);
    }

    public conceptToQuads(concept: Concept): Statement[] {
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

    public conceptSnapshotToQuads(conceptSnapshot: ConceptSnapshot): Statement[] {
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
            this.isVersionOf(conceptSnapshot.id, conceptSnapshot.isVersionOfConcept),
            conceptSnapshot.dateCreated ? this.buildQuad(namedNode(conceptSnapshot.id.value), NS.schema('dateCreated'), literal(conceptSnapshot.dateCreated.value, NS.xsd('dateTime'))) : undefined,
            conceptSnapshot.dateModified ? this.buildQuad(namedNode(conceptSnapshot.id.value), NS.schema('dateModified'), literal(conceptSnapshot.dateModified.value, NS.xsd('dateTime'))) : undefined,
            this.generatedAtTime(conceptSnapshot.id, conceptSnapshot.generatedAtTime),
            this.buildQuad(namedNode(conceptSnapshot.id.value), NS.schema('identifier'), literal(conceptSnapshot.identifier)),
            this.productId(conceptSnapshot.id, conceptSnapshot.productId),
            conceptSnapshot.snapshotType ? this.buildQuad(namedNode(conceptSnapshot.id.value), NS.lpdcExt('snapshotType'), namedNode(this.enumToIri(conceptSnapshot.snapshotType, NS.dvc.snapshotType).value)) : undefined,
            ...this.conceptTags(conceptSnapshot.id, conceptSnapshot.conceptTags),
            ...this.legalResources(conceptSnapshot.id, conceptSnapshot.legalResources),
        ].filter(t => t !== undefined);
    }

    public instanceToQuads(instance: Instance): Statement[] {
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
            ...this.requirements(instance.id, instance.requirements),
            ...this.procedures(instance.id, instance.procedures),
            ...this.websites(instance.id, NS.rdfs('seeAlso'), instance.websites),
            ...this.costs(instance.id, instance.costs),
            ...this.financialAdvantages(instance.id, instance.financialAdvantages),
            ...this.contactPoints(instance.id, instance.contactPoints),
            this.conceptId(instance.id, instance.conceptId),
            this.conceptSnapshotId(instance.id, instance.conceptSnapshotId),
            this.productId(instance.id, instance.productId),
            ...this.languages(instance.id, instance.languages),
            this.instanceDateCreated(instance.id, instance.dateCreated),
            this.instanceDateModified(instance.id, instance.dateModified),
            instance.dateSent ? this.buildQuad(namedNode(instance.id.value), NS.schema('dateSent'), literal(instance.dateSent.value, NS.xsd('dateTime'))) : undefined,
            instance.datePublished ? this.buildQuad(namedNode(instance.id.value), NS.schema('datePublished'), literal(instance.datePublished.value, NS.xsd('dateTime'))) : undefined,
            this.buildQuad(namedNode(instance.id.value), NS.adms('status'), namedNode(this.enumToIri(instance.status, NS.concepts.instanceStatus).value)),
            instance.reviewStatus ? this.buildQuad(namedNode(instance.id.value), NS.ext('reviewStatus'), namedNode(this.enumToIri(instance.reviewStatus, NS.concepts.reviewStatus).value)) : undefined,
            instance.publicationStatus ? this.buildQuad(namedNode(instance.id.value), NS.schema('publication'), namedNode(this.enumToIri(instance.publicationStatus, NS.concepts.publicationStatus).value)) : undefined,
            ...this.spatials(instance.id, instance.spatials),
            ...this.legalResources(instance.id, instance.legalResources)
        ].filter(t => t !== undefined);
    }

    public instanceSnapshotToQuads(instanceSnapshot: InstanceSnapshot): Statement[] {
        return [
            this.rdfType(instanceSnapshot.id, NS.cpsv('PublicService')),
            this.bestuurseenheidId(instanceSnapshot.id, instanceSnapshot.createdBy),
            this.isVersionOf(instanceSnapshot.id, instanceSnapshot.isVersionOfInstance),
            this.conceptId(instanceSnapshot.id, instanceSnapshot.conceptId),
            ...this.title(instanceSnapshot.id, instanceSnapshot.title),
            ...this.description(instanceSnapshot.id, instanceSnapshot.description),
            ...this.additionalDescription(instanceSnapshot.id, instanceSnapshot.additionalDescription),
            ...this.exception(instanceSnapshot.id, instanceSnapshot.exception),
            ...this.regulation(instanceSnapshot.id, instanceSnapshot.regulation),
            this.startDate(instanceSnapshot.id, instanceSnapshot.startDate),
            this.endDate(instanceSnapshot.id, instanceSnapshot.endDate),
            this.type(instanceSnapshot.id, instanceSnapshot.type),
            ...this.targetAudiences(instanceSnapshot.id, instanceSnapshot.targetAudiences),
            ...this.themes(instanceSnapshot.id, instanceSnapshot.themes),
            ...this.competentAuthorityLevels(instanceSnapshot.id, instanceSnapshot.competentAuthorityLevels),
            ...this.competentAuthorities(instanceSnapshot.id, instanceSnapshot.competentAuthorities),
            ...this.executingAuthorityLevels(instanceSnapshot.id, instanceSnapshot.executingAuthorityLevels),
            ...this.executingAuthorities(instanceSnapshot.id, instanceSnapshot.executingAuthorities),
            ...this.publicationMedia(instanceSnapshot.id, instanceSnapshot.publicationMedia),
            ...this.yourEuropeCategories(instanceSnapshot.id, instanceSnapshot.yourEuropeCategories),
            ...this.keywords(instanceSnapshot.id, instanceSnapshot.keywords),
            ...this.languages(instanceSnapshot.id, instanceSnapshot.languages),
            ...this.spatials(instanceSnapshot.id, instanceSnapshot.spatials),
            ...this.legalResources(instanceSnapshot.id, instanceSnapshot.legalResources),
            this.instanceDateCreated(instanceSnapshot.id, instanceSnapshot.dateCreated),
            this.instanceDateModified(instanceSnapshot.id, instanceSnapshot.dateModified),
            this.generatedAtTime(instanceSnapshot.id, instanceSnapshot.generatedAtTime),
            this.buildQuad(namedNode(instanceSnapshot.id.value), NS.lpdcExt('isArchived'), literal(instanceSnapshot.isArchived.toString(), 'boolean')),
            ...this.requirements(instanceSnapshot.id, instanceSnapshot.requirements),
            ...this.websites(instanceSnapshot.id, NS.rdfs('seeAlso'), instanceSnapshot.websites),
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

    private instanceDateCreated(id: Iri, value: FormatPreservingDate | undefined) {
        return value ? this.buildQuad(namedNode(id.value), NS.dct('created'), literal(value.value, NS.xsd('dateTime'))) : undefined;
    }

    private instanceDateModified(id: Iri, value: FormatPreservingDate | undefined) {
        return value ? this.buildQuad(namedNode(id.value), NS.dct('modified'), literal(value.value, NS.xsd('dateTime'))) : undefined;
    }

    private generatedAtTime(id: Iri, value: FormatPreservingDate | undefined): Statement | undefined {
        return value ? this.buildQuad(namedNode(id.value), NS.prov('generatedAtTime'), literal(value.value, NS.xsd('dateTime'))) : undefined;
    }

    private type(id: Iri, value: ProductType): Statement | undefined {
        return value ? this.buildQuad(namedNode(id.value), NS.dct('type'), namedNode(this.enumToIri(value, NS.dvc.type).value)) : undefined;
    }

    private bestuurseenheidId(id: Iri, value: Iri): Statement {
        return this.buildQuad(namedNode(id.value), NS.pav('createdBy'), namedNode(value.value));

    }

    private title(id: Iri, value: LanguageString): Statement [] {
        return this.languageStringToQuads(namedNode(id.value), NS.dct('title'), value);
    }

    private description(id: Iri, value: LanguageString): Statement [] {
        return this.languageStringToQuads(namedNode(id.value), NS.dct('description'), value);
    }

    private additionalDescription(id: Iri, value: LanguageString): Statement [] {
        return this.languageStringToQuads(namedNode(id.value), NS.lpdcExt('additionalDescription'), value);
    }

    private exception(id: Iri, value: LanguageString): Statement [] {
        return this.languageStringToQuads(namedNode(id.value), NS.lpdcExt('exception'), value);
    }

    private regulation(id: Iri, value: LanguageString): Statement[] {
        return this.languageStringToQuads(namedNode(id.value), NS.lpdcExt('regulation'), value);
    }

    private targetAudiences(id: Iri, values: TargetAudienceType[]): Statement[] {
        return this.irisToQuads(namedNode(id.value), NS.lpdcExt('targetAudience'), this.enumsToIris(values, NS.dvc.doelgroep));
    }

    private themes(id: Iri, values: ThemeType[]): Statement[] {
        return this.irisToQuads(namedNode(id.value), NS.m8g('thematicArea'), this.enumsToIris(values, NS.dvc.thema));
    }

    private competentAuthorityLevels(id: Iri, values: CompetentAuthorityLevelType[]): Statement[] {
        return this.irisToQuads(namedNode(id.value), NS.lpdcExt('competentAuthorityLevel'), this.enumsToIris(values, NS.dvc.bevoegdBestuursniveau));
    }

    private competentAuthorities(id: Iri, values: Iri[]): Statement [] {
        return this.irisToQuads(namedNode(id.value), NS.m8g('hasCompetentAuthority'), values);
    }

    private executingAuthorityLevels(id: Iri, values: ExecutingAuthorityLevelType[]): Statement[] {
        return this.irisToQuads(namedNode(id.value), NS.lpdcExt('executingAuthorityLevel'), this.enumsToIris(values, NS.dvc.uitvoerendBestuursniveau));
    }

    private executingAuthorities(id: Iri, values: Iri[]): Statement[] {
        return this.irisToQuads(namedNode(id.value), NS.lpdcExt('hasExecutingAuthority'), values);
    }

    private publicationMedia(id: Iri, values: PublicationMediumType[]): Statement[] {
        return this.irisToQuads(namedNode(id.value), NS.lpdcExt('publicationMedium'), this.enumsToIris(values, NS.dvc.publicatieKanaal));
    }

    private yourEuropeCategories(id: Iri, values: YourEuropeCategoryType[]): Statement [] {
        return this.irisToQuads(namedNode(id.value), NS.lpdcExt('yourEuropeCategory'), this.enumsToIris(values, NS.dvc.yourEuropeCategorie));
    }

    private keywords(id: Iri, values: LanguageString[]): Statement[] {
        return values
            .flatMap(keyword => this.languageStringToQuads(namedNode(id.value), namedNode(NS.dcat('keyword').value), keyword));
    }

    private conceptTags(id: Iri, values: ConceptTagType[]): Statement[] {
        return this.irisToQuads(namedNode(id.value), NS.lpdcExt('conceptTag'), this.enumsToIris(values, NS.dvc.conceptTag));
    }

    private isArchived(id: Iri, isArchived: boolean): Statement | undefined {
        return isArchived ? this.buildQuad(namedNode(id.value), NS.adms('status'), STATUS.concept.archived) : undefined;
    }

    private legalResources(id: Iri, values: Iri[]): Statement[] {
        return this.irisToQuads(namedNode(id.value), NS.m8g('hasLegalResource'), values);
    }

    private spatials(id: Iri, values: Iri[]): Statement[] {
        return this.irisToQuads(namedNode(id.value), NS.dct('spatial'), values);
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
        return values.flatMap((requirement) =>
            [
                this.buildQuad(namedNode(id.value), NS.ps('hasRequirement'), namedNode(requirement.id.value)),
                requirement.uuid ? this.buildQuad(namedNode(requirement.id.value), NS.mu('uuid'), literal(requirement.uuid)) : undefined,
                this.buildQuad(namedNode(requirement.id.value), NS.rdf('type'), NS.m8g('Requirement')),
                ...this.languageStringToQuads(namedNode(requirement.id.value), NS.dct(`title`), requirement.title),
                ...this.languageStringToQuads(namedNode(requirement.id.value), NS.dct(`description`), requirement.description),
                this.buildQuad(namedNode(requirement.id.value), NS.sh('order'), literal(requirement.order.toString(), NS.xsd('integer'))),
                ...this.evidenceToQuads(requirement.id, requirement.evidence),
                requirement.conceptRequirementId ? this.conceptId(requirement.id, requirement.conceptRequirementId) : undefined,
            ]
        );
    }

    private evidenceToQuads(requirementId: Iri, evidence: Evidence | undefined): Statement[] {
        return evidence ? [
            this.buildQuad(namedNode(requirementId.value), NS.m8g('hasSupportingEvidence'), namedNode(evidence.id.value)),
            evidence.uuid ? this.buildQuad(namedNode(evidence.id.value), NS.mu('uuid'), literal(evidence.uuid)) : undefined,
            this.buildQuad(namedNode(evidence.id.value), NS.rdf('type'), NS.m8g('Evidence')),
            ...this.languageStringToQuads(namedNode(evidence.id.value), NS.dct(`title`), evidence.title),
            ...this.languageStringToQuads(namedNode(evidence.id.value), NS.dct(`description`), evidence.description),
            evidence.conceptEvidenceId ? this.conceptId(evidence.id, evidence.conceptEvidenceId) : undefined,
            this.buildQuad(namedNode(evidence.id.value), NS.sh('order'), literal(`1`, NS.xsd('integer'))),
        ] : [];
    }

    private procedures(id: Iri, values: Procedure[]): Statement[] {
        return values.flatMap((procedure) =>
            [
                this.buildQuad(namedNode(id.value), NS.cpsv('follows'), namedNode(procedure.id.value)),
                procedure.uuid ? this.buildQuad(namedNode(procedure.id.value), NS.mu('uuid'), literal(procedure.uuid)) : undefined,
                this.buildQuad(namedNode(procedure.id.value), NS.rdf('type'), NS.cpsv('Rule')),
                ...this.languageStringToQuads(namedNode(procedure.id.value), NS.dct(`title`), procedure.title),
                ...this.languageStringToQuads(namedNode(procedure.id.value), NS.dct(`description`), procedure.description),
                this.buildQuad(namedNode(procedure.id.value), NS.sh('order'), literal(procedure.order.toString(), NS.xsd('integer'))),
                ...this.websites(procedure.id, NS.lpdcExt('hasWebsite'), procedure.websites),
                procedure.conceptProcedureId ? this.conceptId(procedure.id, procedure.conceptProcedureId) : undefined,
            ]
        );
    }

    private websites(id: Iri, predicate: NamedNode, websites: Website[]): Statement[] {
        return websites.flatMap((website) => {
                return [
                    this.buildQuad(namedNode(id.value), predicate, namedNode(website.id.value)),
                    website.uuid ? this.buildQuad(namedNode(website.id.value), NS.mu('uuid'), literal(website.uuid)) : undefined,
                    this.buildQuad(namedNode(website.id.value), NS.rdf('type'), NS.schema('WebSite')),
                    ...this.languageStringToQuads(namedNode(website.id.value), NS.dct(`title`), website.title),
                    ...this.languageStringToQuads(namedNode(website.id.value), NS.dct(`description`), website.description),
                    website.url ? this.buildQuad(namedNode(website.id.value), NS.schema('url'), literal(website.url)) : undefined,
                    this.buildQuad(namedNode(website.id.value), NS.sh('order'), literal(website.order.toString(), NS.xsd('integer'))),
                    website.conceptWebsiteId ? this.conceptId(website.id, website.conceptWebsiteId) : undefined,
                ];
            }
        ).filter(t => t != undefined);
    }

    private costs(id: Iri, values: Cost[]): Statement[] {
        return values.flatMap((cost) => {
            return [
                this.buildQuad(namedNode(id.value), NS.m8g('hasCost'), namedNode(cost.id.value)),
                cost.uuid ? this.buildQuad(namedNode(cost.id.value), NS.mu('uuid'), literal(cost.uuid)) : undefined,
                this.buildQuad(namedNode(cost.id.value), NS.rdf('type'), NS.m8g('Cost')),
                ...this.languageStringToQuads(namedNode(cost.id.value), NS.dct(`title`), cost.title),
                ...this.languageStringToQuads(namedNode(cost.id.value), NS.dct(`description`), cost.description),
                this.buildQuad(namedNode(cost.id.value), NS.sh('order'), literal(cost.order.toString(), NS.xsd('integer'))),
                cost.conceptCostId ? this.conceptId(cost.id, cost.conceptCostId) : undefined,
            ];
        });
    }

    private financialAdvantages(id: Iri, values: FinancialAdvantage[]): Statement[] {
        return values.flatMap((financialAdvantage) => {
            return [
                this.buildQuad(namedNode(id.value), NS.cpsv('produces'), namedNode(financialAdvantage.id.value)),
                financialAdvantage.uuid ? this.buildQuad(namedNode(financialAdvantage.id.value), NS.mu('uuid'), literal(financialAdvantage.uuid)) : undefined,
                this.buildQuad(namedNode(financialAdvantage.id.value), NS.rdf('type'), NS.lpdcExt('FinancialAdvantage')),
                ...this.languageStringToQuads(namedNode(financialAdvantage.id.value), NS.dct(`title`), financialAdvantage.title),
                ...this.languageStringToQuads(namedNode(financialAdvantage.id.value), NS.dct(`description`), financialAdvantage.description),
                this.buildQuad(namedNode(financialAdvantage.id.value), NS.sh('order'), literal(financialAdvantage.order.toString(), NS.xsd('integer'))),
                financialAdvantage.conceptFinancialAdvantageId ? this.conceptId(financialAdvantage.id, financialAdvantage.conceptFinancialAdvantageId) : undefined,
            ];
        });
    }

    private contactPoints(id: Iri, values: ContactPoint[]): Statement[] {
        return values.flatMap((contactPoint) => {
            return [
                this.buildQuad(namedNode(id.value), NS.m8g('hasContactPoint'), namedNode(contactPoint.id.value)),
                contactPoint.uuid ? this.buildQuad(namedNode(contactPoint.id.value), NS.mu('uuid'), literal(contactPoint.uuid)) : undefined,
                this.buildQuad(namedNode(contactPoint.id.value), NS.rdf('type'), NS.schema('ContactPoint')),
                contactPoint.url ? this.buildQuad(namedNode(contactPoint.id.value), NS.schema('url'), contactPoint.url) : undefined,
                contactPoint.email ? this.buildQuad(namedNode(contactPoint.id.value), NS.schema('email'), contactPoint.email) : undefined,
                contactPoint.telephone ? this.buildQuad(namedNode(contactPoint.id.value), NS.schema('telephone'), contactPoint.telephone) : undefined,
                contactPoint.openingHours ? this.buildQuad(namedNode(contactPoint.id.value), NS.schema('openingHours'), contactPoint.openingHours) : undefined,
                this.buildQuad(namedNode(contactPoint.id.value), NS.sh('order'), literal(contactPoint.order.toString(), NS.xsd('integer'))),
                ...this.addressToQuads(contactPoint.id, contactPoint.address),
            ];
        });
    }

    private addressToQuads(contactPointId: Iri, address: Address | undefined): Statement[] {
        return address ? [
            this.buildQuad(namedNode(contactPointId.value), NS.lpdcExt('address'), namedNode(address.id.value)),
            address.uuid ? this.buildQuad(namedNode(address.id.value), NS.mu('uuid'), literal(address.uuid)) : undefined,
            this.buildQuad(namedNode(address.id.value), NS.rdf('type'), NS.locn('Address')),
            ...this.languageStringToQuads(namedNode(address.id.value), NS.adres(`gemeentenaam`), address.gemeentenaam),
            ...this.languageStringToQuads(namedNode(address.id.value), NS.adres(`land`), address.land),
            address.huisnummer ? this.buildQuad(namedNode(address.id.value), NS.adres('Adresvoorstelling.huisnummer'), address.huisnummer) : undefined,
            address.busnummer ? this.buildQuad(namedNode(address.id.value), NS.adres('Adresvoorstelling.busnummer'), address.busnummer) : undefined,
            address.postcode ? this.buildQuad(namedNode(address.id.value), NS.adres('postcode'), address.postcode) : undefined,
            ...this.languageStringToQuads(namedNode(address.id.value), NS.adres(`Straatnaam`), address.straatnaam),
            this.verwijstNaar(address.id, address.verwijstNaar),
            this.buildQuad(namedNode(address.id.value), NS.sh('order'), literal(`1`, NS.xsd('integer'))),
        ] : [];
    }

    private productId(id: Iri, productId: string | undefined): Statement | undefined {
        return productId ? this.buildQuad(namedNode(id.value), NS.schema('productID'), literal(productId)) : undefined;
    }

    private conceptId(id: Iri, conceptId: Iri | undefined): Statement | undefined {
        return conceptId ? this.buildQuad(namedNode(id.value), NS.dct('source'), namedNode(conceptId.value)) : undefined;
    }

    private isVersionOf(id: Iri, anIri: Iri | undefined): Statement | undefined {
        return anIri ? this.buildQuad(namedNode(id.value), NS.dct('isVersionOf'), namedNode(anIri.value)) : undefined;
    }

    private conceptSnapshotId(id: Iri, versionedSource: Iri | undefined): Statement | undefined {
        return versionedSource ? this.buildQuad(namedNode(id.value), NS.ext('hasVersionedSource'), namedNode(versionedSource.value)) : undefined;
    }

    private languages(id: Iri, values: LanguageType[]): Statement[] {
        return this.irisToQuads(namedNode(id.value), NS.pera.language(''), this.enumsToIris(values, NS.pera.languageType));
    }

    private verwijstNaar(id: Iri, verwijstNaar: Iri | undefined): Statement | undefined {
        return verwijstNaar ? this.buildQuad(namedNode(id.value), NS.adres('verwijstNaar'), namedNode(verwijstNaar.value)) : undefined;
    }

    private languageStringToQuads(subject: NamedNode, predicate: NamedNode, object: LanguageString | undefined): Statement[] {
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

    private irisToQuads(subject: NamedNode, predicate: NamedNode, values: any[]): Statement[] {
        return values.map(e => this.buildQuad(subject, predicate, namedNode(e)));
    }

    private enumsToIris(values: any[], namespace: (ln: string) => NamedNode): Iri[] {
        return values.map(v => this.enumToIri(v, namespace));
    }

    private enumToIri(value: any, namespace: (ln: string) => NamedNode): Iri {
        return new Iri(namespace(value).value);
    }
}