import {InstanceSnapshotRepository} from "../port/driven/persistence/instance-snapshot-repository";
import {Iri} from "./shared/iri";
import {InstanceRepository} from "../port/driven/persistence/instance-repository";
import {BestuurseenheidRepository} from "../port/driven/persistence/bestuurseenheid-repository";
import {InstanceSnapshot} from "./instance-snapshot";
import {Instance} from "./instance";
import {uuid} from "../../../mu-helper";
import {Bestuurseenheid} from "./bestuurseenheid";
import {InstanceStatusType} from "./types";
import {Requirement} from "./requirement";
import {Evidence} from "./evidence";
import {Procedure} from "./procedure";
import {Website} from "./website";
import {Cost} from "./cost";
import {FinancialAdvantage} from "./financial-advantage";
import {ContactPoint} from "./contact-point";
import {Address} from "./address";
import {FormatPreservingDate} from "./format-preserving-date";
import {ConceptRepository} from "../port/driven/persistence/concept-repository";
import {Concept} from "./concept";

export class InstanceSnapshotToInstanceMergerDomainService {
    private readonly _instanceSnapshotRepository: InstanceSnapshotRepository;
    private readonly _instanceRepository: InstanceRepository;
    private readonly _bestuurseenheidRepository: BestuurseenheidRepository;
    private readonly _conceptRepository: ConceptRepository;


    constructor(
        instanceSnapshotRepository: InstanceSnapshotRepository,
        instanceRepository: InstanceRepository,
        bestuurseenheidRepository: BestuurseenheidRepository,
        conceptRepository: ConceptRepository) {
        this._instanceSnapshotRepository = instanceSnapshotRepository;
        this._instanceRepository = instanceRepository;
        this._bestuurseenheidRepository = bestuurseenheidRepository;
        this._conceptRepository = conceptRepository;
    }

    async merge(bestuurseenheidId: Iri, instanceSnapshotId: Iri) {
        try {
            const bestuurseenheid = await this._bestuurseenheidRepository.findById(bestuurseenheidId);
            const instanceSnapshot = await this._instanceSnapshotRepository.findById(bestuurseenheid, instanceSnapshotId);
            const existingInstance = await this._instanceRepository.exits(bestuurseenheid, instanceSnapshot.isVersionOfInstance);

            const concept = await this.getConceptIfExists(instanceSnapshot.conceptId);

            //TODO LPDC-910: if instance exists -> delete first using delete-instance-domain-service.ts

            if (!existingInstance) {
                const instance = this.asNewInstance(bestuurseenheid, instanceSnapshot, concept);

                await this._instanceRepository.save(bestuurseenheid, instance);
            }

        } catch (e) {
            //TODO LPDC-910: error handling ok ?
            console.error(`Error processing: ${JSON.stringify(instanceSnapshotId)}`);
            console.error(e);
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
            instanceSnapshot.legalResources,
        );
    }

    private copyRequirements(requirements: Requirement[]) {
        return requirements.map(r => {
                const newUuid = uuid();
                return Requirement.reconstitute(
                    new Iri(`http://data.lblod.info/id/requirement/${newUuid}`),
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
            new Iri(`http://data.lblod.info/id/evidence/${newUuid}`),
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
                    new Iri(`http://data.lblod.info/id/rule/${newUuid}`),
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
                    new Iri(`http://data.lblod.info/id/website/${newUuid}`),
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
                new Iri(`http://data.lblod.info/id/cost/${newUuid}`),
                newUuid,
                c.title,
                c.description,
                c.order,
                c.conceptCostId);
        });
    }

    private copyFinancialAdvantage(financialAdvantages: FinancialAdvantage[]) {
        return financialAdvantages.map(fa => {
                const newUuid = uuid();
                return FinancialAdvantage.reconstitute(
                    new Iri(`http://data.lblod.info/id/financial-advantage/${newUuid}`),
                    newUuid,
                    fa.title,
                    fa.description,
                    fa.order,
                    fa.conceptFinancialAdvantageId);
            }
        );
    }

    private copyContactPoints(contactPoints: ContactPoint[]) {
        return contactPoints.map(cp => {
                const newUuid = uuid();
                return ContactPoint.reconstitute(
                    new Iri(`http://data.lblod.info/id/contact-punten/${newUuid}`),
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
            new Iri(`http://data.lblod.info/id/adressen/${newUuid}`),
            newUuid, address.gemeentenaam,
            address.land,
            address.huisnummer,
            address.busnummer,
            address.postcode,
            address.straatnaam,
            address.verwijstNaar);
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
