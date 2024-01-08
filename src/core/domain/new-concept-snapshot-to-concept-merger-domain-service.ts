import {querySudo, updateSudo} from '@lblod/mu-auth-sudo';
import {sparqlEscapeString, sparqlEscapeUri} from '../../../mu-helper';
import {PREFIX} from '../../../config';
import {v4 as uuid} from 'uuid';
import fetch from 'node-fetch';
import {ConceptSnapshotRepository} from "../port/driven/persistence/concept-snapshot-repository";
import {ConceptSnapshot} from "./concept-snapshot";
import {SnapshotType} from "./types";
import {Iri} from "./shared/iri";
import {Concept} from "./concept";
import {ConceptRepository} from "../port/driven/persistence/concept-repository";
import {Requirement} from "./requirement";
import {Evidence} from "./evidence";
import {Procedure} from "./procedure";
import {Website} from "./website";
import {Cost} from "./cost";
import {FinancialAdvantage} from "./financial-advantage";
import {
    ConceptDisplayConfigurationRepository
} from "../port/driven/persistence/concept-display-configuration-repository";

export class NewConceptSnapshotToConceptMergerDomainService {

    private readonly _conceptSnapshotRepository: ConceptSnapshotRepository;
    private readonly _conceptRepository: ConceptRepository;
    private readonly _conceptDisplayConfigurationRepository: ConceptDisplayConfigurationRepository;
    private readonly _connectionOptions: object; //TODO LPDC-916: remove when all replaced

    constructor(
        conceptSnapshotRepository: ConceptSnapshotRepository,
        conceptRepository: ConceptRepository,
        conceptDisplayConfigurationRepository: ConceptDisplayConfigurationRepository,
        endpoint: string = "http://database:8890/sparql") {
        this._conceptSnapshotRepository = conceptSnapshotRepository;
        this._conceptRepository = conceptRepository;
        this._conceptDisplayConfigurationRepository = conceptDisplayConfigurationRepository;
        this._connectionOptions = {sparqlEndpoint: endpoint};
    }

    async merge(newConceptSnapshotId: Iri) {
        try {
            const newConceptSnapshot = await this._conceptSnapshotRepository.findById(newConceptSnapshotId);
            const conceptId = newConceptSnapshot.isVersionOfConcept;
            const conceptExists = await this._conceptRepository.exists(conceptId);
            const concept: Concept | undefined = conceptExists ? await this._conceptRepository.findById(conceptId) : undefined;

            const newConceptSnapshotAlreadyLinkedToConcept = concept?.appliedSnapshots.has(newConceptSnapshot.id);
            const isNewerSnapshotThanAllPreviouslyApplied = await this.isNewerSnapshotThanAllPreviouslyApplied(newConceptSnapshot, concept);

            if (newConceptSnapshotAlreadyLinkedToConcept) {

                //TODO LPDC-916: when doing impotent implementation, we still need to execute next steps ... (instance review status, ensure concept display configs),
                console.log(`The versioned resource ${newConceptSnapshotId} is already processed on service ${conceptId}`);

            } else if (conceptExists && !isNewerSnapshotThanAllPreviouslyApplied) {

                console.log(`The versioned resource ${newConceptSnapshotId} is an older version of service ${conceptId}`);

                const updatedConcept = this.addAsPreviousConceptSnapshot(newConceptSnapshot, concept);
                await this._conceptRepository.update(updatedConcept, concept);

            } else {

                console.log(`New versioned resource found: ${newConceptSnapshotId} of service ${conceptId}`);

                //TODO LPDC-916: move to a separate repo?
                //Some code list entries might be missing in our DB we insert these here
                await this.ensureNewIpdcOrganisations(newConceptSnapshotId);

                const currentConceptSnapshotId: Iri | undefined = concept?.latestConceptSnapshot;
                const isConceptFunctionallyChanged = await this.isConceptChanged(newConceptSnapshot, currentConceptSnapshotId);

                const isArchiving = newConceptSnapshot.snapshotType === SnapshotType.DELETE;

                if (!conceptExists) {
                    const newConcept = this.asNewConcept(newConceptSnapshot);
                    await this._conceptRepository.save(newConcept);
                } else {
                    const updatedConcept = this.asMergedConcept(newConceptSnapshot, concept, isConceptFunctionallyChanged);
                    await this._conceptRepository.update(updatedConcept, concept);
                }

                //TODO LPDC-916: move to a separate repo?
                //instances (in user graphs)
                const instanceReviewStatus: string | undefined = this.determineInstanceReviewStatus(isConceptFunctionallyChanged, isArchiving);
                await this.flagInstancesModifiedConcept(conceptId, instanceReviewStatus);

                await this._conceptDisplayConfigurationRepository.ensureConceptDisplayConfigurationsForAllBestuurseenheden(conceptId);

            }
        } catch (e) {
            console.error(`Error processing: ${JSON.stringify(newConceptSnapshotId)}`);
            console.error(e);
        }
    }


    private async isNewerSnapshotThanAllPreviouslyApplied(conceptSnapshot: ConceptSnapshot, concept: Concept | undefined): Promise<boolean> {
        if (concept) {
            for (const appliedSnapshotId of concept.appliedSnapshots) {
                const alreadyAppliedSnapshot = await this._conceptSnapshotRepository.findById(appliedSnapshotId);
                if (conceptSnapshot.generatedAtTime.before(alreadyAppliedSnapshot.generatedAtTime)) {
                    return false;
                }
            }
        }
        return true;
    }

    private asNewConcept(conceptSnapshot: ConceptSnapshot): Concept {
        return new Concept(
            conceptSnapshot.isVersionOfConcept,
            uuid(),
            conceptSnapshot.title,
            conceptSnapshot.description,
            conceptSnapshot.additionalDescription,
            conceptSnapshot.exception,
            conceptSnapshot.regulation,
            conceptSnapshot.startDate,
            conceptSnapshot.endDate,
            conceptSnapshot.type,
            conceptSnapshot.targetAudiences,
            conceptSnapshot.themes,
            conceptSnapshot.competentAuthorityLevels,
            conceptSnapshot.competentAuthorities,
            conceptSnapshot.executingAuthorityLevels,
            conceptSnapshot.executingAuthorities,
            conceptSnapshot.publicationMedia,
            conceptSnapshot.yourEuropeCategories,
            conceptSnapshot.keywords,
            this.copyRequirements(conceptSnapshot.requirements),
            this.copyProcedures(conceptSnapshot.procedures),
            this.copyWebsites(conceptSnapshot.websites),
            this.copyCosts(conceptSnapshot.costs),
            this.copyFinancialAdvantages(conceptSnapshot.financialAdvantages),
            conceptSnapshot.productId,
            conceptSnapshot.id,
            new Set(),
            conceptSnapshot.id,
            conceptSnapshot.conceptTags,
            conceptSnapshot.snapshotType === SnapshotType.DELETE,
            conceptSnapshot.legalResources,
        );
    }

    private asMergedConcept(conceptSnapshot: ConceptSnapshot, concept: Concept, isConceptFunctionallyChanged: boolean): Concept {
        return new Concept(
            concept.id,
            concept.uuid,
            conceptSnapshot.title,
            conceptSnapshot.description,
            conceptSnapshot.additionalDescription,
            conceptSnapshot.exception,
            conceptSnapshot.regulation,
            conceptSnapshot.startDate,
            conceptSnapshot.endDate,
            conceptSnapshot.type,
            conceptSnapshot.targetAudiences,
            conceptSnapshot.themes,
            conceptSnapshot.competentAuthorityLevels,
            conceptSnapshot.competentAuthorities,
            conceptSnapshot.executingAuthorityLevels,
            conceptSnapshot.executingAuthorities,
            conceptSnapshot.publicationMedia,
            conceptSnapshot.yourEuropeCategories,
            conceptSnapshot.keywords,
            this.copyRequirements(conceptSnapshot.requirements),
            this.copyProcedures(conceptSnapshot.procedures),
            this.copyWebsites(conceptSnapshot.websites),
            this.copyCosts(conceptSnapshot.costs),
            this.copyFinancialAdvantages(conceptSnapshot.financialAdvantages),
            conceptSnapshot.productId,
            conceptSnapshot.id,
            concept.appliedSnapshots,
            isConceptFunctionallyChanged ? conceptSnapshot.id : concept.latestConceptSnapshot,
            conceptSnapshot.conceptTags,
            conceptSnapshot.snapshotType === SnapshotType.DELETE,
            conceptSnapshot.legalResources,
        );
    }

    private addAsPreviousConceptSnapshot(conceptSnapshot: ConceptSnapshot, concept: Concept): Concept {
        return new Concept(
            concept.id,
            concept.uuid,
            concept.title,
            concept.description,
            concept.additionalDescription,
            concept.exception,
            concept.regulation,
            concept.startDate,
            concept.endDate,
            concept.type,
            concept.targetAudiences,
            concept.themes,
            concept.competentAuthorityLevels,
            concept.competentAuthorities,
            concept.executingAuthorityLevels,
            concept.executingAuthorities,
            concept.publicationMedia,
            concept.yourEuropeCategories,
            concept.keywords,
            concept.requirements,
            concept.procedures,
            concept.websites,
            concept.costs,
            concept.financialAdvantages,
            concept.productId,
            concept.latestConceptSnapshot,
            new Set([...concept.previousConceptSnapshots, conceptSnapshot.id]),
            concept.latestConceptSnapshot,
            concept.conceptTags,
            concept.isArchived,
            concept.legalResources,
        );
    }

    private copyRequirements(requirements: Requirement[]) {
        return requirements.map(r =>
            new Requirement(
                r.id,
                uuid(),
                r.title,
                r.description,
                r.evidence ? new Evidence(r.evidence.id, uuid(), r.evidence.title, r.evidence.description) : undefined));
    }

    private copyProcedures(procedures: Procedure[]) {
        return procedures.map(p =>
            new Procedure(
                p.id,
                uuid(),
                p.title,
                p.description,
                this.copyWebsites(p.websites)));
    }

    private copyWebsites(websites: Website[]) {
        return websites.map(w =>
            new Website(w.id, uuid(), w.title, w.description, w.url));
    }

    private copyCosts(costs: Cost[]) {
        return costs.map(c =>
            new Cost(c.id, uuid(), c.title, c.description));
    }

    private copyFinancialAdvantages(financialAdvantages: FinancialAdvantage[]) {
        return financialAdvantages.map(fa =>
            new FinancialAdvantage(fa.id, uuid(), fa.title, fa.description));
    }

    private async ensureNewIpdcOrganisations(service: string): Promise<void> {
        let codelistEntries = await this.getCodeListEntriesForPredicate(service, 'm8g:hasCompetentAuthority');
        codelistEntries = [...codelistEntries, ...await this.getCodeListEntriesForPredicate(service, 'lpdcExt:hasExecutingAuthority')];
        for (const code of codelistEntries) {
            if (!await this.existingCode(code)) {
                const codeListData: any = await this.fetchOrgRegistryCodelistEntry(code);
                if (codeListData.prefLabel) {
                    console.log(`Inserting new codeList ${code}`);
                    await this.insertCodeListData(codeListData);
                }
            }
        }
    }

    private async getCodeListEntriesForPredicate(service: string, predicate: string = 'm8g:hasCompetentAuthority'): Promise<string[]> {
        const queryStr = `
    ${PREFIX.m8g}
    ${PREFIX.lpdcExt}
    SELECT DISTINCT ?codeListEntry {
      ${sparqlEscapeUri(service)} ${predicate} ?codeListEntry.
    }
  `;
        const result = await querySudo(queryStr, {}, this._connectionOptions);
        return result.results.bindings.map(r => r.codeListEntry.value);
    }

    async existingCode(code: string, conceptScheme: string = 'dvcs:IPDCOrganisaties'): Promise<boolean> {
        const queryStr = `
  ${PREFIX.m8g}
  ${PREFIX.lpdcExt}
  ${PREFIX.dvcs}
  ${PREFIX.skos}
  ASK {
    GRAPH ?g {
      ${sparqlEscapeUri(code)} a skos:Concept;
       skos:inScheme ${conceptScheme}.
    }
  }`;
        const queryData = await querySudo(queryStr, {}, this._connectionOptions);
        return queryData.boolean;
    }

    private async fetchOrgRegistryCodelistEntry(uriEntry: string): Promise<{ uri?: string, prefLabel?: string }> {
        let result: {
            uri?: string,
            prefLabel?: string
        } = await this.fetchOrgRegistryCodelistEntryThroughSubjectPage(uriEntry);
        if (!result.prefLabel) {
            result = await this.fetchOrgRegistryCodelistEntryThroughAPI(uriEntry);
        }
        return result;
    }

    private async fetchOrgRegistryCodelistEntryThroughSubjectPage(uriEntry: string): Promise<{
        uri?: string,
        prefLabel?: string
    }> {
        // The response is super nested, hence we make a little helper to extract it
        // Note:a oneliner was even less readable.
        const parsePrefLabel = response => {
            const prefLabelUri = "http://www.w3.org/2004/02/skos/core#prefLabel";

            if (response[uriEntry] && response[uriEntry][prefLabelUri]) {
                if (response[uriEntry][prefLabelUri].length) {
                    return response[uriEntry][prefLabelUri][0].value;
                } else return null;
            } else return null;
        };

        const result: { uri?: string, prefLabel?: string } = {};
        try {
            const response = await fetch(uriEntry, {
                headers: {'Accept': 'application/json'}
            });
            if (response.ok) {
                const organisationObject = await response.json();
                result.uri = uriEntry;
                result.prefLabel = parsePrefLabel(organisationObject);
            }
        } catch (error) {
            //TODO: we suppress for now, but TBD with business how dramatic it would be to not have the entry
            console.log(`Unexpected error fetching ${uriEntry}`);
            console.log(error);
        }
        return result;
    }

    private async fetchOrgRegistryCodelistEntryThroughAPI(uriEntry: string): Promise<{
        uri?: string,
        prefLabel?: string
    }> {
        const result: { uri?: string, prefLabel?: string } = {};
        const ovoNumber = uriEntry.split('OVO')[1];
        if (!ovoNumber) {
            return result;
        }
        const url = `https://api.wegwijs.vlaanderen.be/v1/search/organisations?q=ovoNumber:OVO${ovoNumber}`;
        try {
            const response = await fetch(url, {
                headers: {'Accept': 'application/json'}
            });
            if (response.ok) {
                const organisationObject = await response.json();
                result.uri = uriEntry;
                result.prefLabel = organisationObject[0]?.name;
            }
        } catch (error) {
            //TODO: we suppress for now, but TBD with business how dramatic it would be to not have the entry
            console.log(`Unexpected error fetching ${url}`);
            console.log(error);
        }
        return result;
    }

    private async insertCodeListData(codeListData: { uri?: string, prefLabel?: string },
                                     seeAlso: string = 'https://wegwijs.vlaanderen.be',
                                     conceptScheme: string = 'dvcs:IPDCOrganisaties'): Promise<void> {
        const codeListDataUuid = uuid();
        const queryStr = `
    ${PREFIX.dvcs}
    ${PREFIX.skos}
    ${PREFIX.mu}
    ${PREFIX.rdfs}
    INSERT {
      GRAPH ?g {
        ${sparqlEscapeUri(codeListData.uri)} a skos:Concept.
        ${sparqlEscapeUri(codeListData.uri)} skos:inScheme ${conceptScheme}.
        ${sparqlEscapeUri(codeListData.uri)} skos:topConceptOf ${conceptScheme}.
        ${sparqlEscapeUri(codeListData.uri)} skos:prefLabel ${sparqlEscapeString(codeListData.prefLabel)}.
        ${sparqlEscapeUri(codeListData.uri)} mu:uuid ${sparqlEscapeString(codeListDataUuid)}.
        ${sparqlEscapeUri(codeListData.uri)} rdfs:seeAlso ${sparqlEscapeUri(seeAlso)}.
      }
    } WHERE {
       GRAPH ?g {
         ${conceptScheme} a skos:ConceptScheme.
       }
    }
 `;
        await querySudo(queryStr, {}, this._connectionOptions);
    }

    private determineInstanceReviewStatus(isModified: boolean, isArchiving: boolean): string | undefined {
        const reviewStatus = {
            conceptUpdated: 'http://lblod.data.gift/concepts/5a3168e2-f39b-4b5d-8638-29f935023c83',
            conceptArchived: 'http://lblod.data.gift/concepts/cf22e8d1-23c3-45da-89bc-00826eaf23c3'
        };

        if (isArchiving) {
            return reviewStatus.conceptArchived;
        } else if (isModified) {
            return reviewStatus.conceptUpdated;
        } else {
            return undefined;
        }
    }

    private async flagInstancesModifiedConcept(conceptId: Iri, reviewStatus?: string): Promise<void> {
        if (reviewStatus) {
            const updateQueryStr = `
            ${PREFIX.ext}
            ${PREFIX.cpsv}
            DELETE {
                GRAPH ?g {
                    ?service ext:reviewStatus ?status.
                }
            }
            INSERT {
                GRAPH ?g {
                    ?service ext:reviewStatus ${sparqlEscapeUri(reviewStatus)}.
                }
            }
            WHERE {
                GRAPH ?g {
                    ?service a cpsv:PublicService;
                    <http://purl.org/dc/terms/source> ${sparqlEscapeUri(conceptId)}.
                }
            }`;
            await updateSudo(updateQueryStr, {}, this._connectionOptions);
        }
    }

    private async isConceptChanged(newConceptSnapshot: ConceptSnapshot, currentSnapshotId: Iri): Promise<boolean> {
        if (!currentSnapshotId) {
            return false;
        }

        const currentConceptSnapshot = await this._conceptSnapshotRepository.findById(currentSnapshotId);

        return ConceptSnapshot.isFunctionallyChanged(currentConceptSnapshot, newConceptSnapshot);
    }

}
