import {
  CodeRepository,
  CodeSchema,
} from "../port/driven/persistence/code-repository";
import { BestuurseenheidRegistrationCodeFetcher } from "../port/driven/external/bestuurseenheid-registration-code-fetcher";
import { Iri } from "./shared/iri";
import { Logger } from "../../../platform/logger";
import { WEGWIJS_URL } from "../../../config";

type CodeListData = {
  uri?: Iri;
  prefLabel?: string;
};

export class EnsureLinkedAuthoritiesExistAsCodeListDomainService {
  private readonly _bestuurseenheidRegistrationCodeFetcher: BestuurseenheidRegistrationCodeFetcher;
  private readonly _codeRepository: CodeRepository;
  private readonly _logger: Logger = new Logger(
    "EnsureLinkedAuthoritiesExistAsCodeListDomainService",
  );

  constructor(
    bestuurseenheidRegistrationCodeFetcher: BestuurseenheidRegistrationCodeFetcher,
    codeRepository: CodeRepository,
    logger?: Logger,
  ) {
    this._codeRepository = codeRepository;
    this._bestuurseenheidRegistrationCodeFetcher =
      bestuurseenheidRegistrationCodeFetcher;
    this._logger = logger ?? this._logger;
  }

  async getLinkedAuthority(iri: Iri) {
    return await this._bestuurseenheidRegistrationCodeFetcher.fetchOrgRegistryCodelistEntry(
      iri.value,
    );
  }

  async addAuthoritiesToCodeList(authorities: CodeListData[]) {
    authorities
      .filter(
        (authority) =>
          authority.uri !== undefined && authority.prefLabel !== undefined,
      )
      .forEach(async (authority) => await this.insertCodeListData(authority));
  }

  async ensureLinkedAuthoritiesExistAsCodeList(
    linkedAuthorities: Iri[],
  ): Promise<void> {
    for (const code of linkedAuthorities) {
      if (
        !(await this._codeRepository.exists(CodeSchema.IPDCOrganisaties, code))
      ) {
        const codeListData: any =
          await this._bestuurseenheidRegistrationCodeFetcher.fetchOrgRegistryCodelistEntry(
            code.value,
          );
        if (codeListData.prefLabel) {
          this._logger.log(`Inserting new codeList ${code}`);
          await this.insertCodeListData(codeListData);
        }
      }
    }
  }

  private async insertCodeListData(codeListData: CodeListData): Promise<void> {
    return this._codeRepository.save(
      CodeSchema.IPDCOrganisaties,
      codeListData.uri,
      codeListData.prefLabel,
      new Iri(WEGWIJS_URL),
    );
  }
}
