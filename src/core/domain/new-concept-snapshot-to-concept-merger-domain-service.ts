import {querySudo, updateSudo} from '@lblod/mu-auth-sudo';
import {sparqlEscapeString, sparqlEscapeUri} from '../../../mu-helper';
import {CONCEPT_GRAPH, CONCEPT_SNAPSHOT_LDES_GRAPH, PREFIX} from '../../../config';
import {v4 as uuid} from 'uuid';
import {bindingsToNT} from '../../../utils/bindingsToNT';
import {addTypeForSubject, addUuidForSubject, groupBySubject} from '../../../utils/common';
import fetch from 'node-fetch';
import {
    loadAttachments,
    loadContactPoints,
    loadContactPointsAddresses,
    loadCosts,
    loadEvidences,
    loadFinancialAdvantages,
    loadOnlineProcedureRules,
    loadPublicService,
    loadRequirements,
    loadRules,
    loadWebsites,
    serviceUriForId
} from '../../../lib/commonQueries';
import {ConceptSnapshotRepository} from "../port/driven/persistence/concept-snapshot-repository";
import {ConceptSnapshot} from "./concept-snapshot";
import {SnapshotType} from "./types";
import {ConceptSparqlRepository} from "../../driven/persistence/concept-sparql-repository";
import {Iri} from "./shared/iri";

export class NewConceptSnapshotToConceptMergerDomainService {

    private readonly _conceptSnapshotRepository: ConceptSnapshotRepository;
    private readonly _conceptRepository: ConceptSparqlRepository;
    private readonly _connectionOptions: object; //TODO LPDC-916: remove when all replaced

    constructor(conceptSnapshotRepository: ConceptSnapshotRepository, conceptRepository: ConceptSparqlRepository, endpoint: string = "http://database:8890/sparql") {
        this._conceptSnapshotRepository = conceptSnapshotRepository;
        this._conceptRepository = conceptRepository;
        this._connectionOptions = {sparqlEndpoint: endpoint};
    }

    async merge(newConceptSnapshotId: Iri) {
        const newConceptSnapshot = await this._conceptSnapshotRepository.findById(newConceptSnapshotId);
        const conceptId = newConceptSnapshot.isVersionOfConcept;

        if (await this.shouldConceptSnapshotBeMergedToConcept(newConceptSnapshot)) {
            console.log(`New versioned resource found: ${newConceptSnapshotId} of service ${conceptId}`);
            try {
                const currentSnapshotId: string | undefined = await this.getVersionedSourceOfConcept(conceptId);
                const isConceptFunctionallyChanged = await this.isConceptChanged(newConceptSnapshot, currentSnapshotId);
                await this.upsertNewLdesVersion(newConceptSnapshotId, conceptId);
                await this.updatedVersionInformation(newConceptSnapshotId, conceptId);
                if (!currentSnapshotId || isConceptFunctionallyChanged) {
                    await this.updateLatestFunctionalChange(newConceptSnapshotId, conceptId);
                }
                const isArchiving = newConceptSnapshot.snapshotType === SnapshotType.DELETE;
                if (isArchiving) {
                    await this.markConceptAsArchived(conceptId);
                }

                //instances (in user graphs)
                const instanceReviewStatus: string | undefined = this.determineInstanceReviewStatus(isConceptFunctionallyChanged, isArchiving);
                await this.flagInstancesModifiedConcept(conceptId, instanceReviewStatus);

                //concept display configs (in user graphs)
                await this.ensureConceptDisplayConfigs(conceptId);
            } catch (e) {
                console.error(`Error processing: ${JSON.stringify(newConceptSnapshotId)}`);
                console.error(e);
            }
        } else {
            console.log(`The versioned resource ${newConceptSnapshotId} is an older version of service ${conceptId}`);
        }
    }


    private async shouldConceptSnapshotBeMergedToConcept(conceptSnapshot: ConceptSnapshot): Promise<boolean> {
        const conceptId = conceptSnapshot.isVersionOfConcept;
        if (!await this._conceptRepository.exists(conceptId)) {
            return true;
        }
        const concept = await this._conceptRepository.findById(conceptId);
        const conceptSnapshotAlreadyLinkedToConcept = concept.appliedSnapshots.has(conceptSnapshot.id);
        if (conceptSnapshotAlreadyLinkedToConcept) {
            return false;
        }

        for(const appliedSnapshotId of concept.appliedSnapshots) {
            const alreadyAppliedSnapshot = await this._conceptSnapshotRepository.findById(appliedSnapshotId);
            if(conceptSnapshot.generatedAtTime.before(alreadyAppliedSnapshot.generatedAtTime)) {
                return false;
            }
        }

        return true;
    }

    private async upsertNewLdesVersion(newConceptSnapshotId: Iri, conceptId: Iri): Promise<void> {
        let serviceId = (await querySudo(`
    ${PREFIX.lpdcExt}
    ${PREFIX.mu}

    SELECT DISTINCT ?uuid
    WHERE {
      ${sparqlEscapeUri(conceptId)} a lpdcExt:ConceptualPublicService;
        mu:uuid ?uuid.
    }
    LIMIT 1
  `, {}, this._connectionOptions)).results.bindings[0]?.uuid?.value;

        //TODO: we should/could refactor so we can roll back in case of problems
        if (serviceId) {
            await this.removeConceptualService(serviceId);
        } else {
            serviceId = uuid();
        }
        await this.insertConceptualService(newConceptSnapshotId, conceptId, serviceId);

    }

    private async removeConceptualService(serviceId: string): Promise<void> {
        const type = 'lpdcExt:ConceptualPublicService';
        const graph = CONCEPT_GRAPH;
        const sudo = true;

        const serviceUri = await serviceUriForId(serviceId, type, this._connectionOptions);

        if (!serviceUri) {
            throw `Service URI not found for id ${serviceId}`;
        }

        const results = [];

        results.push(await loadEvidences(serviceUri, {
            graph,
            sudo,
            includeUuid: true,
            connectionOptions: this._connectionOptions
        }));
        results.push(await loadRequirements(serviceUri, {
            graph,
            sudo,
            includeUuid: true,
            connectionOptions: this._connectionOptions
        }));
        results.push(await loadOnlineProcedureRules(serviceUri, {
            graph,
            sudo,
            includeUuid: true,
            connectionOptions: this._connectionOptions
        }));
        results.push(await loadRules(serviceUri, {
            graph,
            sudo,
            includeUuid: true,
            connectionOptions: this._connectionOptions
        }));
        results.push(await loadCosts(serviceUri, {
            graph,
            sudo,
            includeUuid: true,
            connectionOptions: this._connectionOptions
        }));
        results.push(await loadFinancialAdvantages(serviceUri, {
            graph,
            sudo,
            includeUuid: true,
            connectionOptions: this._connectionOptions
        }));
        results.push(await loadContactPointsAddresses(serviceUri, {
            graph,
            sudo,
            includeUuid: true,
            connectionOptions: this._connectionOptions
        }));
        results.push(await loadContactPoints(serviceUri, {
            graph,
            sudo,
            includeUuid: true,
            connectionOptions: this._connectionOptions
        }));
        results.push(await loadWebsites(serviceUri, {
            graph,
            sudo,
            includeUuid: true,
            connectionOptions: this._connectionOptions
        }));
        results.push(await loadPublicService(serviceUri, {
            graph,
            sudo,
            includeUuid: true,
            connectionOptions: this._connectionOptions
        }));
        results.push(await loadAttachments(serviceUri, {
            graph,
            sudo,
            includeUuid: true,
            connectionOptions: this._connectionOptions
        }));

        const sourceBindings = results
            .reduce((acc, b) => [...acc, ...b]);

        const source = bindingsToNT(sourceBindings);

        // Due to confirmed bug in virtuoso, we need to execute statements
        // separatly: https://github.com/openlink/virtuoso-opensource/issues/1055
        for (const statement of source) {
            await updateSudo(`
        DELETE DATA {
          GRAPH ${sparqlEscapeUri(graph)} {
            ${statement}
          }
        }`, {}, this._connectionOptions);
        }
    }

    private async insertConceptualService(versionedServiceUri: string, serviceUri: string, serviceId: string): Promise<void> {
        const graph = CONCEPT_SNAPSHOT_LDES_GRAPH;
        const sudo = true;

        //Some code list entries might be missing in our DB we insert these here
        await this.ensureNewIpdcOrganisations(versionedServiceUri);

        const loadAndPostProcess = async (callBack, newType = null): Promise<any[]> => {
            let finalResults = [];
            const bindings = await callBack(versionedServiceUri, {
                graph,
                sudo,
                connectionOptions: this._connectionOptions
            });
            const bindingsPerSubject = groupBySubject(bindings);
            for (const bindings of Object.values(bindingsPerSubject)) {
                let updatedBindings = addUuidForSubject(bindings);
                if (newType) {
                    updatedBindings = addTypeForSubject(updatedBindings, newType);
                }
                finalResults = [...finalResults, ...updatedBindings];
            }
            return finalResults;
        };

        const results = [];

        //TODO: probably we will be able to get rid of these extra typings, once IPDC cleans the data
        results.push(await loadAndPostProcess(loadEvidences, 'http://data.europa.eu/m8g/Evidence'));
        results.push(await loadAndPostProcess(loadRequirements));
        results.push(await loadAndPostProcess(loadOnlineProcedureRules, 'http://schema.org/WebSite'));
        results.push(await loadAndPostProcess(loadRules));
        results.push(await loadAndPostProcess(loadCosts));
        results.push(await loadAndPostProcess(loadFinancialAdvantages));
        results.push(await loadAndPostProcess(loadContactPointsAddresses));
        results.push(await loadAndPostProcess(loadContactPoints));
        results.push(await loadAndPostProcess(loadWebsites));
        results.push(await loadAndPostProcess(loadAttachments));

        let serviceResultBindings = await loadPublicService(versionedServiceUri, {
            graph,
            sudo,
            connectionOptions: this._connectionOptions
        });
        serviceResultBindings = addUuidForSubject(serviceResultBindings, serviceId);
        for (const tripleData of serviceResultBindings) {
            tripleData.s.value = serviceUri;
        }

        results.push(serviceResultBindings);

        const sourceBindings = results
            .reduce((acc, b) => [...acc, ...b]);

        const source = bindingsToNT(sourceBindings);

        //TODO: could be faster, but slow and steady?
        for (const statement of source) {
            await updateSudo(`
        INSERT DATA {
          GRAPH ${sparqlEscapeUri(CONCEPT_GRAPH)} {
            ${statement}
          }
        }`, {}, this._connectionOptions);
        }
    }

    private async updatedVersionInformation(newConceptSnapshotId: Iri, conceptId: Iri): Promise<void> {
        const queryStr = `
   ${PREFIX.ext}
   DELETE {
     GRAPH ?g {
      ?s ext:hasVersionedSource ?version.
    }
   }
   INSERT {
     GRAPH ?g {
      ?s ext:previousVersionedSource ?version.
      ?s ext:hasVersionedSource ${sparqlEscapeUri(newConceptSnapshotId)}.
     }
   }
   WHERE {
     BIND(${sparqlEscapeUri(conceptId)} as ?s)
     GRAPH ?g {
      ?s a ?what.
      OPTIONAL { ?s ext:hasVersionedSource ?version. }
    }
   }
  `;
        await updateSudo(queryStr, {}, this._connectionOptions);
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

    private async ensureConceptDisplayConfigs(conceptualService: string): Promise<void> {
        const insertConfigsQuery = `
    ${PREFIX.lpdcExt}
    ${PREFIX.mu}
    ${PREFIX.dct}
    ${PREFIX.besluit}
    
    INSERT {
      GRAPH ?bestuurseenheidGraph {
        ?concept lpdcExt:hasConceptDisplayConfiguration ?configUri .
        ?configUri a lpdcExt:ConceptDisplayConfiguration ;
          mu:uuid ?configId ;
          lpdcExt:conceptIsNew "true"^^<http://mu.semte.ch/vocabularies/typed-literals/boolean> ;
          lpdcExt:conceptInstantiated "false"^^<http://mu.semte.ch/vocabularies/typed-literals/boolean> ;
          dct:relation ?eenheid .
      }
    }
    WHERE {
      ?eenheid a besluit:Bestuurseenheid ;
        mu:uuid ?eenheidId .
    
      BIND(IRI(CONCAT("http://mu.semte.ch/graphs/organizations/", STR(?eenheidId), "/LoketLB-LPDCGebruiker")) as ?bestuurseenheidGraph)
      BIND(${sparqlEscapeUri(conceptualService)} as ?concept)
    
      GRAPH ?bestuurseenheidGraph {
        FILTER NOT EXISTS {
          ?concept lpdcExt:hasConceptDisplayConfiguration ?configUri .
          ?configUri dct:relation ?eenheid .
        }
      }
    
      ${/*this is a bit of trickery to generate UUID and URI's since STRUUID doesn't work properly in Virtuoso: https://github.com/openlink/virtuoso-opensource/issues/515#issuecomment-456848368 */''}
      BIND(SHA512(CONCAT(STR(?concept), STR(?eenheidId))) as ?configId) ${/* concept + eenheid should be unique per config object */''}
      BIND(IRI(CONCAT('http://data.lblod.info/id/conceptual-display-configuration/', STR(?configId))) as ?configUri)
    }
  `;

        await updateSudo(insertConfigsQuery, {}, this._connectionOptions);
    }

    private async markConceptAsArchived(conceptualService: string): Promise<void> {
        const archivedStatusConcept = 'http://lblod.data.gift/concepts/3f2666df-1dae-4cc2-a8dc-e8213e713081';
        const markAsArchivedQuery = `
    ${PREFIX.adms}

    INSERT DATA {
      GRAPH ${sparqlEscapeUri(CONCEPT_GRAPH)} {
        ${sparqlEscapeUri(conceptualService)} adms:status ${sparqlEscapeUri(archivedStatusConcept)} .
      }
    }
  `;

        await updateSudo(markAsArchivedQuery, {}, this._connectionOptions);
    }

    private async isConceptChanged(newConceptSnapshot: ConceptSnapshot, currentSnapshotId: string): Promise<boolean> {
        if (!currentSnapshotId) {
            return false;
        }

        const currentConceptSnapshot = await this._conceptSnapshotRepository.findById(currentSnapshotId);

        return ConceptSnapshot.isFunctionallyChanged(currentConceptSnapshot, newConceptSnapshot);
    }

    private async getVersionedSourceOfConcept(conceptUri: string): Promise<string> {
        const query = `
      ${PREFIX.ext}
      SELECT ?snapshotUri WHERE {
          ${sparqlEscapeUri(conceptUri)} ext:hasVersionedSource ?snapshotUri .
      }
  `;
        return (await querySudo(query, {}, this._connectionOptions)).results.bindings[0]?.snapshotUri?.value;
    }

    private async updateLatestFunctionalChange(conceptSnapshotUri: string, conceptUri: string): Promise<void> {
        const queryStr = `
   ${PREFIX.lpdcExt}
   DELETE {
        GRAPH <http://mu.semte.ch/graphs/public> {
            ${sparqlEscapeUri(conceptUri)} lpdcExt:hasLatestFunctionalChange ?snapshot.
        }
   }
   INSERT {
        GRAPH <http://mu.semte.ch/graphs/public> {
            ${sparqlEscapeUri(conceptUri)} lpdcExt:hasLatestFunctionalChange ${sparqlEscapeUri(conceptSnapshotUri)}.
        }
  }
   WHERE {
        GRAPH <http://mu.semte.ch/graphs/public> {
            ${sparqlEscapeUri(conceptUri)} a lpdcExt:ConceptualPublicService.
            OPTIONAL {
                ${sparqlEscapeUri(conceptUri)} lpdcExt:hasLatestFunctionalChange ?snapshot.
            }
        }
   }
`;
        await updateSudo(queryStr, {}, this._connectionOptions);
    }

}
