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
import {ContactPoint, ContactPointBuilder} from "../../src/core/domain/contact-point";
import {AddressFetcher} from "../../src/core/port/driven/external/address-fetcher";
import {AddressBuilder} from "../../src/core/domain/address";

export class TransferInstanceService {

    private readonly bestuurseenheidRepository: BestuurseenheidRepository;
    private readonly instanceRepository: InstanceRepository;
    private formalInformalChoiceRepository: FormalInformalChoiceRepository;
    private addressFetcher: AddressFetcher;

    constructor(bestuurseenheidRepository: BestuurseenheidRepository, instanceRepository: InstanceRepository, formalInformalChoiceRepository: FormalInformalChoiceRepository, addressFetcher: AddressFetcher) {
        this.bestuurseenheidRepository = bestuurseenheidRepository;
        this.instanceRepository = instanceRepository;
        this.formalInformalChoiceRepository = formalInformalChoiceRepository;
        this.addressFetcher = addressFetcher;
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

    private async transferInstance(toAuthorityId: Iri, toAuthorityChoice: ChosenFormType, instanceToCopy: Instance) {
        const instanceUuid = uuid();
        const instanceId = InstanceBuilder.buildIri(instanceUuid);

        const hasCompetentAuthorityLevelLokaal = instanceToCopy.competentAuthorityLevels.includes(CompetentAuthorityLevelType.LOKAAL);
        const needsConversionFromFormalToInformal = (toAuthorityChoice === ChosenFormType.INFORMAL && instanceToCopy.dutchLanguageVariant !== Language.INFORMAL);

        const contactpointsWithUpdatedAddresses = await this.mapAddressesForContactpoints(instanceToCopy.contactPoints);


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
            .withContactPoints(contactpointsWithUpdatedAddresses.map(fa => fa.transformWithNewId()))
            .withStatus(InstanceStatusType.ONTWERP)
            .withDateSent(undefined)
            .withNeedsConversionFromFormalToInformal(needsConversionFromFormalToInformal)
            .withLegalResources(instanceToCopy.legalResources.map(lr => lr.transformWithNewId()))
            .withSpatials(instanceToCopy.forMunicipalityMerger ? instanceToCopy.spatials : [])
            .withExecutingAuthorities(instanceToCopy.forMunicipalityMerger ? instanceToCopy.executingAuthorities : [])
            .withCompetentAuthorities(!instanceToCopy.forMunicipalityMerger && hasCompetentAuthorityLevelLokaal ? [] : instanceToCopy.competentAuthorities)
            .withForMunicipalityMerger(false)
            .withCopyOf(undefined)
            .build();
    }

    private async mapAddressesForContactpoints(contactPoints: ContactPoint[]): Promise<ContactPoint[]> {
        const fetchAddressMatch = async (cp: ContactPoint) => {
            const address = cp.address;
            if (address?.gemeentenaam && address?.straatnaam && address?.huisnummer) {
                const match = await this.addressFetcher.findAddressMatch(
                    address.gemeentenaam?.nl,
                    address.straatnaam?.nl,
                    address.huisnummer,
                    address.busnummer
                );
                const updatedAddress = AddressBuilder.from(address)
                    .withPostcode(match['postcode'] ? match['postcode'] : undefined)
                    .withVerwijstNaar(match['adressenRegisterId'] ? new Iri(match['adressenRegisterId']) : undefined)
                    .build();
                return ContactPointBuilder.from(cp).withAddress(updatedAddress).build();
            }
            return cp;
        };

        return await Promise.all(contactPoints.map(fetchAddressMatch));
    }

}
