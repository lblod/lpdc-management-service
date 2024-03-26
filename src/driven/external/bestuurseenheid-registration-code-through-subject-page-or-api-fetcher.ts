import {
    BestuurseenheidRegistrationCodeFetcher
} from "../../core/port/driven/external/bestuurseenheid-registration-code-fetcher";
import {Iri} from "../../core/domain/shared/iri";

export class BestuurseenheidRegistrationCodeThroughSubjectPageOrApiFetcher implements BestuurseenheidRegistrationCodeFetcher {

    async fetchOrgRegistryCodelistEntry(uriEntry: string): Promise<{ uri?: Iri; prefLabel?: string; }> {
        let result: {
            uri?: Iri,
            prefLabel?: string
        } = await this.fetchOrgRegistryCodelistEntryThroughSubjectPage(uriEntry);
        if (!result.prefLabel) {
            result = await this.fetchOrgRegistryCodelistEntryThroughAPI(uriEntry);
        }
        return result;
    }

    private async fetchOrgRegistryCodelistEntryThroughSubjectPage(uriEntry: string): Promise<{
        uri?: Iri,
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

        const result: { uri?: Iri, prefLabel?: string } = {};
        try {
            const response = await fetch(uriEntry, {
                headers: {'Accept': 'application/json'}
            });
            if (response.ok) {
                const organisationObject = await response.json();
                result.uri = new Iri(uriEntry);
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
        uri?: Iri,
        prefLabel?: string
    }> {
        const result: { uri?: Iri, prefLabel?: string } = {};
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
                result.uri = new Iri(uriEntry);
                result.prefLabel = organisationObject[0]?.name;
            }
        } catch (error) {
            //TODO: we suppress for now, but TBD with business how dramatic it would be to not have the entry
            console.log(`Unexpected error fetching ${url}`);
            console.log(error);
        }
        return result;
    }


}