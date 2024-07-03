import {Instance, InstanceBuilder} from "../../src/core/domain/instance";
import {BestuurseenheidRepository} from "../../src/core/port/driven/persistence/bestuurseenheid-repository";
import {Iri} from "../../src/core/domain/shared/iri";
import {InstanceRepository} from "../../src/core/port/driven/persistence/instance-repository";
import {FormalInformalChoiceRepository} from "../../src/core/port/driven/persistence/formal-informal-choice-repository";
import {ChosenFormType, CompetentAuthorityLevelType, InstanceStatusType} from "../../src/core/domain/types";
import {InvariantError} from "../../src/core/domain/shared/lpdc-error";
import {uuid} from "../../mu-helper";
import {Language} from "../../src/core/domain/language";
import {FormatPreservingDate} from "../../src/core/domain/format-preserving-date";

export class TransferInstanceService {

    private readonly bestuurseenheidRepository: BestuurseenheidRepository;
    private readonly instanceRepository: InstanceRepository;
    private formalInformalChoiceRepository: FormalInformalChoiceRepository;

    constructor(bestuurseenheidRepository: BestuurseenheidRepository, instanceRepository: InstanceRepository, formalInformalChoiceRepository: FormalInformalChoiceRepository) {
        this.bestuurseenheidRepository = bestuurseenheidRepository;
        this.instanceRepository = instanceRepository;
        this.formalInformalChoiceRepository = formalInformalChoiceRepository;
    }

    async transfer(instanceId: Iri, fromAuthorityId: Iri, toAuthorityId: Iri): Promise<Instance> {

        const fromAuthority = await this.bestuurseenheidRepository.findById(fromAuthorityId);
        const toAuthority = await this.bestuurseenheidRepository.findById(toAuthorityId);

        const toAuthorityChoice = (await this.formalInformalChoiceRepository.findByBestuurseenheid(toAuthority))?.chosenForm;

        const instance: Instance = await this.instanceRepository.findById(fromAuthority, instanceId);

        if (toAuthorityChoice === ChosenFormType.FORMAL && instance.dutchLanguageVariant === Language.INFORMAL) {
            throw new InvariantError("transforming informal instance to formal is not possible");
        }
        return this.transferInstance(toAuthority.id, toAuthorityChoice, instance);

    }

    private transferInstance(toAuthorityId: Iri, toAuthorityChoice: ChosenFormType, instanceToCopy: Instance) {
        const instanceUuid = uuid();
        const instanceId = InstanceBuilder.buildIri(instanceUuid);

        const hasCompetentAuthorityLevelLokaal = instanceToCopy.competentAuthorityLevels.includes(CompetentAuthorityLevelType.LOKAAL);
        const needsConversionFromFormalToInformal = (toAuthorityChoice === ChosenFormType.INFORMAL && instanceToCopy.dutchLanguageVariant !== Language.INFORMAL);

        return InstanceBuilder.from(instanceToCopy)
            .withId(instanceId)
            .withUuid(instanceUuid)
            .withCreatedBy(toAuthorityId)
            .withDateCreated(FormatPreservingDate.now())
            .withDateModified(FormatPreservingDate.now())
            .withRequirements(instanceToCopy.requirements.map(req => req.transformWithNewId()))
            .withProcedures(instanceToCopy.procedures.map(proc => proc.transformWithNewId()))
            .withWebsites(instanceToCopy.websites.map(ws => ws.transformWithNewId()))
            .withCosts(instanceToCopy.costs.map(c => c.transformWithNewId()))
            .withFinancialAdvantages(instanceToCopy.financialAdvantages.map(fa => fa.transformWithNewId()))
            .withContactPoints(instanceToCopy.contactPoints.map(fa => fa.transformWithNewId()))
            .withStatus(InstanceStatusType.ONTWERP)
            .withDateSent(undefined)
            .withPublicationStatus(undefined)
            .withDatePublished(undefined)
            .withNeedsConversionFromFormalToInformal(needsConversionFromFormalToInformal)
            .withLegalResources(instanceToCopy.legalResources.map(lr => lr.transformWithNewId()))
            .withSpatials(instanceToCopy.forMunicipalityMerger ? instanceToCopy.spatials : [])
            .withExecutingAuthorities(instanceToCopy.forMunicipalityMerger ? instanceToCopy.executingAuthorities : [])
            .withCompetentAuthorities(!instanceToCopy.forMunicipalityMerger && hasCompetentAuthorityLevelLokaal ? [] : instanceToCopy.competentAuthorities)
            .withForMunicipalityMerger(false)
            .withCopyOf(undefined)
            .build();
    }
}
