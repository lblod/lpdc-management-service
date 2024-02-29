import {InstanceSnapshotRepository} from "../port/driven/persistence/instance-snapshot-repository";
import {Iri} from "./shared/iri";
import {InstanceRepository} from "../port/driven/persistence/instance-repository";
import {InstanceSnapshot} from "./instance-snapshot";
import {Instance} from "./instance";
import {uuid} from "../../../mu-helper";
import {Bestuurseenheid} from "./bestuurseenheid";
import {InstancePublicationStatusType, InstanceStatusType} from "./types";
import {Requirement, RequirementBuilder} from "./requirement";
import {Evidence, EvidenceBuilder} from "./evidence";
import {Procedure, ProcedureBuilder} from "./procedure";
import {Website, WebsiteBuilder} from "./website";
import {Cost, CostBuilder} from "./cost";
import {FinancialAdvantage, FinancialAdvantageBuilder} from "./financial-advantage";
import {ContactPoint, ContactPointBuilder} from "./contact-point";
import {Address, AddressBuilder} from "./address";
import {FormatPreservingDate} from "./format-preserving-date";
import {ConceptRepository} from "../port/driven/persistence/concept-repository";
import {Concept} from "./concept";
import {Logger} from "../../../platform/logger";
import {
    ConceptDisplayConfigurationRepository
} from "../port/driven/persistence/concept-display-configuration-repository";
import {
    EnsureLinkedAuthoritiesExistAsCodeListDomainService
} from "./ensure-linked-authorities-exist-as-code-list-domain-service";
import {DeleteInstanceDomainService} from "./delete-instance-domain-service";
import {LegalResource, LegalResourceBuilder} from "./legal-resource";

export class InstanceSnapshotToInstanceMergerDomainService {
    private readonly _instanceSnapshotRepository: InstanceSnapshotRepository;
    private readonly _instanceRepository: InstanceRepository;
    private readonly _conceptRepository: ConceptRepository;
    private readonly _conceptDisplayConfigurationRepository: ConceptDisplayConfigurationRepository;
    private readonly _deleteInstanceDomainService: DeleteInstanceDomainService;
    private readonly _ensureLinkedAuthoritiesExistAsCodeListDomainService: EnsureLinkedAuthoritiesExistAsCodeListDomainService;
    private readonly _logger: Logger = new Logger('InstanceSnapshotToInstanceMergerDomainService');

    constructor(
        instanceSnapshotRepository: InstanceSnapshotRepository,
        instanceRepository: InstanceRepository,
        conceptRepository: ConceptRepository,
        conceptDisplayConfigurationRepository: ConceptDisplayConfigurationRepository,
        deleteInstanceDomainService: DeleteInstanceDomainService,
        ensureLinkedAuthoritiesExistAsCodeListDomainService: EnsureLinkedAuthoritiesExistAsCodeListDomainService,
        logger?: Logger) {
        this._instanceSnapshotRepository = instanceSnapshotRepository;
        this._instanceRepository = instanceRepository;
        this._conceptRepository = conceptRepository;
        this._conceptDisplayConfigurationRepository = conceptDisplayConfigurationRepository;
        this._deleteInstanceDomainService = deleteInstanceDomainService;
        this._ensureLinkedAuthoritiesExistAsCodeListDomainService = ensureLinkedAuthoritiesExistAsCodeListDomainService;
        this._logger = logger ?? this._logger;
    }

    async merge(bestuurseenheid: Bestuurseenheid, instanceSnapshotId: Iri) {
        const instanceSnapshot = await this._instanceSnapshotRepository.findById(bestuurseenheid, instanceSnapshotId);

        const hasNewerProcessedInstanceSnapshot = await this._instanceSnapshotRepository.hasNewerProcessedInstanceSnapshot(bestuurseenheid, instanceSnapshot);

        if (hasNewerProcessedInstanceSnapshot) {
            this._logger.log(`The versioned resource <${instanceSnapshotId}> is an older version, or already processed, of service <${instanceSnapshot.isVersionOfInstance}>`);
        } else {
            const instanceId = instanceSnapshot.isVersionOfInstance;
            const isExistingInstance = await this._instanceRepository.exists(bestuurseenheid, instanceId);
            const concept = await this.getConceptIfExists(instanceSnapshot.conceptId);

            this._logger.log(`New versioned resource found: ${instanceSnapshotId} of service ${instanceSnapshot.isVersionOfInstance}`);

            if (!isExistingInstance && !instanceSnapshot.isArchived) {
                await this.createNewInstance(bestuurseenheid, instanceSnapshot, concept);
            } else if (isExistingInstance && !instanceSnapshot.isArchived) {
                const oldInstance = await this._instanceRepository.findById(bestuurseenheid, instanceSnapshot.isVersionOfInstance);
                await this.updateInstance(bestuurseenheid, instanceSnapshot, oldInstance, concept);

            } else if (isExistingInstance && instanceSnapshot.isArchived) {
                await this._deleteInstanceDomainService.delete(bestuurseenheid, instanceSnapshot.isVersionOfInstance);
            }
        }
        await this._ensureLinkedAuthoritiesExistAsCodeListDomainService.ensureLinkedAuthoritiesExistAsCodeList([...instanceSnapshot.competentAuthorities, ...instanceSnapshot.executingAuthorities]);
    }

    private async updateInstance(bestuurseenheid: Bestuurseenheid, instanceSnapshot: InstanceSnapshot, oldInstance: Instance, concept: Concept) {
        const newInstance = this.asMergedInstance(bestuurseenheid, instanceSnapshot, oldInstance, concept);
        await this._instanceRepository.update(bestuurseenheid, newInstance, oldInstance);

        if (oldInstance.conceptId) {
            await this._conceptDisplayConfigurationRepository.syncInstantiatedFlag(bestuurseenheid, oldInstance.conceptId);
        }
        if (instanceSnapshot.conceptId) {
            await this._conceptDisplayConfigurationRepository.syncInstantiatedFlag(bestuurseenheid, instanceSnapshot.conceptId);
        }
    }

    private async createNewInstance(bestuurseenheid: Bestuurseenheid, instanceSnapshot: InstanceSnapshot, concept: Concept) {
        const instance = this.asNewInstance(bestuurseenheid, instanceSnapshot, concept);
        const isDeleted = await this._instanceRepository.isDeleted(bestuurseenheid, instance.id);

        isDeleted ? await this._instanceRepository.recreate(bestuurseenheid, instance) : await this._instanceRepository.save(bestuurseenheid, instance);

        if (instanceSnapshot.conceptId) {
            await this._conceptDisplayConfigurationRepository.syncInstantiatedFlag(bestuurseenheid, instanceSnapshot.conceptId);
        }
    }

    private asNewInstance(bestuurseenheid: Bestuurseenheid, instanceSnapshot: InstanceSnapshot, concept: Concept | undefined) {
        return new Instance(
            instanceSnapshot.isVersionOfInstance,
            uuid(),
            bestuurseenheid.id,
            instanceSnapshot.title,
            instanceSnapshot.description,
            instanceSnapshot.additionalDescription,
            instanceSnapshot.exception,
            instanceSnapshot.regulation,
            instanceSnapshot.startDate,
            instanceSnapshot.endDate,
            instanceSnapshot.type,
            instanceSnapshot.targetAudiences,
            instanceSnapshot.themes,
            instanceSnapshot.competentAuthorityLevels,
            instanceSnapshot.competentAuthorities,
            instanceSnapshot.executingAuthorityLevels,
            instanceSnapshot.executingAuthorities,
            instanceSnapshot.publicationMedia,
            instanceSnapshot.yourEuropeCategories,
            instanceSnapshot.keywords,
            this.copyRequirements(instanceSnapshot.requirements),
            this.copyProcedures(instanceSnapshot.procedures),
            this.copyWebsites(instanceSnapshot.websites),
            this.copyCosts(instanceSnapshot.costs),
            this.copyFinancialAdvantage(instanceSnapshot.financialAdvantages),
            this.copyContactPoints(instanceSnapshot.contactPoints),
            concept ? concept.id : undefined,
            concept ? concept.latestConceptSnapshot : undefined,
            concept ? concept.productId : undefined,
            instanceSnapshot.languages,
            instanceSnapshot.dateCreated,
            instanceSnapshot.dateModified,
            FormatPreservingDate.now(),
            undefined,
            InstanceStatusType.VERSTUURD,
            undefined,
            undefined,
            instanceSnapshot.spatials,
            this.copyLegalResources(instanceSnapshot.legalResources)
        );
    }

    private asMergedInstance(bestuurseenheid: Bestuurseenheid, instanceSnapshot: InstanceSnapshot, instance: Instance, concept: Concept | undefined) {
        return new Instance(
            instanceSnapshot.isVersionOfInstance,
            instance.uuid,
            bestuurseenheid.id,
            instanceSnapshot.title,
            instanceSnapshot.description,
            instanceSnapshot.additionalDescription,
            instanceSnapshot.exception,
            instanceSnapshot.regulation,
            instanceSnapshot.startDate,
            instanceSnapshot.endDate,
            instanceSnapshot.type,
            instanceSnapshot.targetAudiences,
            instanceSnapshot.themes,
            instanceSnapshot.competentAuthorityLevels,
            instanceSnapshot.competentAuthorities,
            instanceSnapshot.executingAuthorityLevels,
            instanceSnapshot.executingAuthorities,
            instanceSnapshot.publicationMedia,
            instanceSnapshot.yourEuropeCategories,
            instanceSnapshot.keywords,
            this.copyRequirements(instanceSnapshot.requirements),
            this.copyProcedures(instanceSnapshot.procedures),
            this.copyWebsites(instanceSnapshot.websites),
            this.copyCosts(instanceSnapshot.costs),
            this.copyFinancialAdvantage(instanceSnapshot.financialAdvantages),
            this.copyContactPoints(instanceSnapshot.contactPoints),
            concept ? concept.id : undefined,
            concept ? concept.latestConceptSnapshot : undefined,
            concept ? concept.productId : undefined,
            instanceSnapshot.languages,
            instanceSnapshot.dateCreated,
            instanceSnapshot.dateModified,
            FormatPreservingDate.now(),
            instance.datePublished,
            InstanceStatusType.VERSTUURD,
            undefined,
            instance.datePublished ? InstancePublicationStatusType.TE_HERPUBLICEREN : undefined,
            instanceSnapshot.spatials,
            this.copyLegalResources(instanceSnapshot.legalResources),
        );
    }

    private copyRequirements(requirements: Requirement[]) {
        return requirements.map(r => {
                const newUuid = uuid();
                return Requirement.reconstitute(
                    RequirementBuilder.buildIri(newUuid),
                    newUuid,
                    r.title,
                    r.description,
                    r.order,
                    r.evidence ? this.copyEvidence(r.evidence) : undefined,
                    undefined
                );
            }
        );
    }

    private copyEvidence(evidence: Evidence): Evidence {
        const newUuid = uuid();
        return Evidence.reconstitute(
            EvidenceBuilder.buildIri(newUuid),
            newUuid,
            evidence.title,
            evidence.description,
            undefined
        );
    }

    private copyProcedures(procedures: Procedure[]) {
        return procedures.map(p => {
                const newUuid = uuid();
                return Procedure.reconstitute(
                    ProcedureBuilder.buildIri(newUuid),
                    newUuid,
                    p.title,
                    p.description,
                    p.order,
                    this.copyWebsites(p.websites),
                    undefined);
            }
        );
    }

    private copyWebsites(websites: Website[]) {
        return websites.map(w => {
                const newUuid = uuid();
                return Website.reconstitute(
                    WebsiteBuilder.buildIri(newUuid),
                    newUuid,
                    w.title,
                    w.description,
                    w.order,
                    w.url,
                    undefined);
            }
        );
    }

    private copyCosts(costs: Cost[]) {
        return costs.map(c => {
            const newUuid = uuid();
            return Cost.reconstitute(
                CostBuilder.buildIri(newUuid),
                newUuid,
                c.title,
                c.description,
                c.order,
                undefined);
        });
    }

    private copyFinancialAdvantage(financialAdvantages: FinancialAdvantage[]) {
        return financialAdvantages.map(fa => {
                const newUuid = uuid();
                return FinancialAdvantage.reconstitute(
                    FinancialAdvantageBuilder.buildIri(newUuid),
                    newUuid,
                    fa.title,
                    fa.description,
                    fa.order,
                    undefined);
            }
        );
    }

    private copyContactPoints(contactPoints: ContactPoint[]) {
        return contactPoints.map(cp => {
                const newUuid = uuid();
                return ContactPoint.reconstitute(
                    ContactPointBuilder.buildIri(newUuid),
                    newUuid,
                    cp.url,
                    cp.email,
                    cp.telephone,
                    cp.openingHours,
                    cp.order,
                    this.copyAddress(cp.address));
            }
        );
    }

    private copyAddress(address: Address): Address {
        const newUuid = uuid();
        return Address.reconstitute(
            AddressBuilder.buildIri(newUuid),
            newUuid, address.gemeentenaam,
            address.land,
            address.huisnummer,
            address.busnummer,
            address.postcode,
            address.straatnaam,
            address.verwijstNaar);
    }

    private copyLegalResources(legalResources: LegalResource[]): LegalResource[] {
        return legalResources.map(cp => {
                const newUuid = uuid();
                return LegalResource.reconstitute(
                    LegalResourceBuilder.buildIri(newUuid),
                    newUuid,
                    cp.url,
                    cp.order
                );
            }
        );
    }

    private async getConceptIfExists(conceptId: Iri | undefined): Promise<Concept | undefined> {
        if (conceptId) {
            const existingConcept = await this._conceptRepository.exists(conceptId);
            if (existingConcept) {
                return await this._conceptRepository.findById(conceptId);
            }

        }
        return undefined;
    }
}
