import { Iri } from "../../../domain/shared/iri";

export interface BestuurseenheidRegistrationCodeFetcher {
  fetchOrgRegistryCodelistEntry(
    uriEntry: string,
  ): Promise<{ uri?: Iri; prefLabel?: string }>;
}
