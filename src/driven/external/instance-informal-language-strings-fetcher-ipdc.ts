import { Bestuurseenheid } from "../../core/domain/bestuurseenheid";
import {
  DoubleQuadReporter,
  LoggingDoubleQuadReporter,
  QuadsToDomainMapper,
} from "../shared/quads-to-domain-mapper";
import { Logger } from "../../../platform/logger";
import { Instance, InstanceBuilder } from "../../core/domain/instance";
import { graph, parse, Statement } from "rdflib";
import { NS } from "../persistence/namespaces";
import { Requirement, RequirementBuilder } from "../../core/domain/requirement";
import { LanguageString } from "../../core/domain/language-string";
import { SystemError } from "../../core/domain/shared/lpdc-error";
import { zip } from "lodash";
import { Procedure, ProcedureBuilder } from "../../core/domain/procedure";
import { Cost, CostBuilder } from "../../core/domain/cost";
import { Website, WebsiteBuilder } from "../../core/domain/website";
import {
  FinancialAdvantage,
  FinancialAdvantageBuilder,
} from "../../core/domain/financial-advantage";
import { Evidence, EvidenceBuilder } from "../../core/domain/evidence";
import {
  LegalResource,
  LegalResourceBuilder,
} from "../../core/domain/legal-resource";
import { InstanceInformalLanguageStringsFetcher } from "../../core/port/driven/external/instance-informal-language-strings-fetcher";
import { Language } from "../../core/domain/language";

export class InstanceInformalLanguageStringsFetcherIpdc
  implements InstanceInformalLanguageStringsFetcher
{
  private readonly endpoint: string;
  private readonly authenticationKey: string;

  constructor(endpoint: string, authenticationKey: string) {
    this.endpoint = endpoint;
    this.authenticationKey = authenticationKey;
  }

  async fetchInstanceAndMap(
    bestuurseenheid: Bestuurseenheid,
    initialInstance: Instance,
  ): Promise<Instance> {
    const jsonInstance = await this.fetchInstance(initialInstance);

    jsonInstance["@context"] = await this.fetchContextsContent(
      jsonInstance["@context"],
    );

    return this.mapInstance(
      JSON.stringify(jsonInstance),
      bestuurseenheid,
      initialInstance,
    );
  }

  private async mapInstance(
    jsonLdData: string,
    bestuurseenheid: Bestuurseenheid,
    initialInstance: Instance,
  ): Promise<Instance> {
    const quadsToDomainMapper = await new Promise<QuadsToDomainMapper>(
      (resolve, reject) => {
        const store = graph();
        parse(
          jsonLdData,
          store,
          bestuurseenheid.userGraph().value,
          "application/ld+json",
          (error: any, kb: any) => {
            if (error) {
              reject(error);
              return;
            }

            const doubleQuadReporter: DoubleQuadReporter =
              new LoggingDoubleQuadReporter(
                new Logger("Instance-QuadsToDomainLogger"),
              );
            const quads: Statement[] = kb.statementsMatching();

            if (quads.length < 5) {
              reject(
                new SystemError(
                  `Er is een fout opgetreden bij het bevragen van Ipdc voor instance ${initialInstance.id}, aantal quads [${quads.length}]`,
                ),
              );
            }
            const mapper: QuadsToDomainMapper = new QuadsToDomainMapper(
              quads,
              bestuurseenheid.userGraph(),
              doubleQuadReporter,
            );

            resolve(mapper);
          },
        );
      },
    );
    return this.mappedInstance(quadsToDomainMapper, initialInstance);
  }

  private mappedInstance(
    mapper: QuadsToDomainMapper,
    initialInstance: Instance,
  ): Instance {
    const id = initialInstance.id;
    mapper.errorIfMissingOrIncorrectType(
      id,
      NS.lpdcExt("InstancePublicService"),
    );

    return InstanceBuilder.from(initialInstance)
      .withTitle(
        this.mapLanguageString(
          mapper.title(id),
          initialInstance.title,
          initialInstance.dutchLanguageVariant,
        ),
      )
      .withDescription(
        this.mapLanguageString(
          mapper.description(id),
          initialInstance.description,
          initialInstance.dutchLanguageVariant,
        ),
      )
      .withAdditionalDescription(
        this.mapLanguageString(
          mapper.additionalDescription(id),
          initialInstance.additionalDescription,
          initialInstance.dutchLanguageVariant,
        ),
      )
      .withException(
        this.mapLanguageString(
          mapper.exception(id),
          initialInstance.exception,
          initialInstance.dutchLanguageVariant,
        ),
      )
      .withRegulation(
        this.mapLanguageString(
          mapper.regulation(id),
          initialInstance.regulation,
          initialInstance.dutchLanguageVariant,
        ),
      )
      .withRequirements(
        this.mapRequirements(
          mapper.requirements(id),
          initialInstance.requirements,
          initialInstance.dutchLanguageVariant,
        ),
      )
      .withProcedures(
        this.mapProcedure(
          mapper.procedures(id),
          initialInstance.procedures,
          initialInstance.dutchLanguageVariant,
        ),
      )
      .withWebsites(
        this.mapWebsites(
          mapper.websites(id),
          initialInstance.websites,
          initialInstance.dutchLanguageVariant,
        ),
      )
      .withCosts(
        this.mapCosts(
          mapper.costs(id),
          initialInstance.costs,
          initialInstance.dutchLanguageVariant,
        ),
      )
      .withFinancialAdvantages(
        this.mapFinancialAdvantages(
          mapper.financialAdvantages(id),
          initialInstance.financialAdvantages,
          initialInstance.dutchLanguageVariant,
        ),
      )
      .withLegalResources(
        this.mapLegalResources(
          mapper.legalResources(id),
          initialInstance.legalResources,
          initialInstance.dutchLanguageVariant,
        ),
      )
      .build();
  }

  private async fetchInstance(instance: Instance) {
    const response = await fetch(
      `${this.endpoint}/doc/instantie/${instance.uuid}`,
      {
        headers: {
          Accept: "application/ld+json",
          "x-api-key": this.authenticationKey,
        },
      },
    );
    if (response.ok) {
      const instanceJson = await response.json();
      // ipdc generates a new iri-id for our id ; so we need to mimic in the read data that it is our id referenced ...
      instanceJson["@id"] = instance.id.value;
      return instanceJson;
    }
    if (response.status === 401) {
      console.error(await response.text());
      throw new SystemError(`Niet geauthenticeerd bij ipdc`);
    } else if (response.status === 404) {
      console.error(await response.text());
      throw new SystemError(`Instantie ${instance.id} niet gevonden bij ipdc`);
    } else {
      console.error(await response.text());
      throw new SystemError(
        `Er is een fout opgetreden bij het bevragen van Ipdc voor instantie ${instance.id}; status=[${response.status}]`,
      );
    }
  }

  private async fetchContextsContent(
    contexts: string | string[],
  ): Promise<any> {
    if (typeof contexts === "string") {
      return await this.fetchContextContent(contexts);
    } else {
      let result = {};
      for (const context of contexts) {
        result = { ...result, ...(await this.fetchContextContent(context)) };
      }
      return result;
    }
  }

  private async fetchContextContent(context: string): Promise<any> {
    const response = await fetch(context, {
      headers: {
        Accept: "application/ld+json",
        "x-api-key": this.authenticationKey,
      },
    });
    if (response.ok) {
      const contextAsJson = await response.json();
      const expandedContext = contextAsJson["@context"];
      if (!expandedContext) {
        console.error(
          `Context ${context} is incorrect [${JSON.stringify(contextAsJson)}] `,
        );
        throw new SystemError(
          `Er is een fout opgetreden bij het bevragen van de context ${context} bij Ipdc, context was incorrect`,
        );
      }
      return expandedContext;
    } else if (response.status === 401) {
      console.error(await response.text());
      throw new SystemError(`Niet geauthenticeerd bij ipdc`);
    } else {
      console.error(await response.text());
      throw new SystemError(
        `Er is een fout opgetreden bij het bevragen van de context ${context} bij Ipdc; status=[${response.status}]`,
      );
    }
  }

  private mapLanguageString(
    newValue: LanguageString | undefined,
    initialValue: LanguageString | undefined,
    initialDutchLanguageVariant: Language,
  ): LanguageString | undefined {
    if (
      newValue &&
      initialValue &&
      newValue?.getLanguageValue(initialDutchLanguageVariant) ===
        initialValue?.getLanguageValue(initialDutchLanguageVariant)
    ) {
      const informalNewValue = newValue.nlGeneratedInformal;

      if (!informalNewValue || informalNewValue.trim() === "") {
        throw new SystemError(
          `Geen informal waarde verkregen {nieuw[${JSON.stringify(newValue)}], initial[${JSON.stringify(initialValue)}], dutchLanguage[${initialDutchLanguageVariant}]}`,
        );
      }

      if (initialValue?.nl) {
        return LanguageString.ofValueInLanguage(informalNewValue, Language.NL);
      } else {
        return LanguageString.ofValueInLanguage(
          informalNewValue,
          Language.FORMAL,
        );
      }
    } else if (
      LanguageString.isAbsent(newValue, initialDutchLanguageVariant) &&
      LanguageString.isAbsent(initialValue, initialDutchLanguageVariant)
    ) {
      return undefined;
    }

    throw new SystemError(
      `De nieuwe en initiële waarde moeten beiden aanwezig of afwezig zijn {nieuw[${JSON.stringify(newValue)}], initial[${JSON.stringify(initialValue)}], dutchLanguage[${initialDutchLanguageVariant}]}`,
    );
  }

  private mapRequirements(
    newRequirements: Requirement[],
    initialRequirements: Requirement[],
    initialDutchLanguageVariant: Language,
  ): Requirement[] {
    if (newRequirements.length != initialRequirements.length) {
      throw new SystemError(
        "Het aantal voorwaarden van ipdc is niet gelijk aan het aantal originele voorwaarden",
      );
    }
    return zip(newRequirements, initialRequirements).map(
      (reqs: [Requirement, Requirement]) => {
        return RequirementBuilder.from(reqs[1])
          .withTitle(
            this.mapLanguageString(
              reqs[0].title,
              reqs[1].title,
              initialDutchLanguageVariant,
            ),
          )
          .withDescription(
            this.mapLanguageString(
              reqs[0].description,
              reqs[1].description,
              initialDutchLanguageVariant,
            ),
          )
          .withEvidence(
            this.mapEvidence(
              reqs[0].evidence,
              reqs[1].evidence,
              initialDutchLanguageVariant,
            ),
          )
          .build();
      },
    );
  }

  private mapEvidence(
    newEvidence: Evidence | undefined,
    initialEvidence: Evidence | undefined,
    initialDutchLanguageVariant: Language,
  ): Evidence | undefined {
    if (!newEvidence && !initialEvidence) {
      return undefined;
    }

    if (newEvidence && initialEvidence) {
      return EvidenceBuilder.from(initialEvidence)
        .withTitle(
          this.mapLanguageString(
            newEvidence.title,
            initialEvidence.title,
            initialDutchLanguageVariant,
          ),
        )
        .withDescription(
          this.mapLanguageString(
            newEvidence.description,
            initialEvidence.description,
            initialDutchLanguageVariant,
          ),
        )
        .build();
    }
    throw new SystemError(
      "Het bewijs van ipdc is niet gelijk aan het originele bewijs",
    );
  }

  private mapProcedure(
    newProcedures: Procedure[],
    initialProcedures: Procedure[],
    initialDutchLanguageVariant: Language,
  ): Procedure[] {
    if (newProcedures.length != initialProcedures.length) {
      throw new SystemError(
        "Het aantal procedures van ipdc is niet gelijk aan het aantal originele procedures",
      );
    }
    return zip(newProcedures, initialProcedures).map(
      (procs: [Procedure, Procedure]) => {
        return ProcedureBuilder.from(procs[1])
          .withTitle(
            this.mapLanguageString(
              procs[0].title,
              procs[1].title,
              initialDutchLanguageVariant,
            ),
          )
          .withDescription(
            this.mapLanguageString(
              procs[0].description,
              procs[1].description,
              initialDutchLanguageVariant,
            ),
          )
          .withWebsites(
            this.mapWebsites(
              procs[0].websites,
              procs[1].websites,
              initialDutchLanguageVariant,
            ),
          )
          .build();
      },
    );
  }

  private mapWebsites(
    newWebsites: Website[],
    initialWebsites: Website[],
    initialDutchLanguageVariant: Language,
  ): Website[] {
    if (newWebsites.length != initialWebsites.length) {
      throw new SystemError(
        "Het aantal websites van ipdc is niet gelijk aan het aantal originele websites",
      );
    }
    return zip(newWebsites, initialWebsites).map(
      (websites: [Website, Website]) => {
        return WebsiteBuilder.from(websites[1])
          .withTitle(
            this.mapLanguageString(
              websites[0].title,
              websites[1].title,
              initialDutchLanguageVariant,
            ),
          )
          .withDescription(
            this.mapLanguageString(
              websites[0].description,
              websites[1].description,
              initialDutchLanguageVariant,
            ),
          )
          .build();
      },
    );
  }

  private mapCosts(
    newCosts: Cost[],
    initialCosts: Cost[],
    initialDutchLanguageVariant: Language,
  ): Cost[] {
    if (newCosts.length != initialCosts.length) {
      throw new SystemError(
        "Het aantal kosten van ipdc is niet gelijk aan het aantal originele kosten",
      );
    }
    return zip(newCosts, initialCosts).map((costs: [Cost, Cost]) => {
      return CostBuilder.from(costs[1])
        .withTitle(
          this.mapLanguageString(
            costs[0].title,
            costs[1].title,
            initialDutchLanguageVariant,
          ),
        )
        .withDescription(
          this.mapLanguageString(
            costs[0].description,
            costs[1].description,
            initialDutchLanguageVariant,
          ),
        )
        .build();
    });
  }

  private mapFinancialAdvantages(
    newFinancialAdvantages: FinancialAdvantage[],
    initialFinancialAdvantages: FinancialAdvantage[],
    initialDutchLanguageVariant: Language,
  ): FinancialAdvantage[] {
    if (newFinancialAdvantages.length != initialFinancialAdvantages.length) {
      throw new SystemError(
        "Het aantal financiele voordelen van ipdc is niet gelijk aan het aantal originele financiele voordelen",
      );
    }
    return zip(newFinancialAdvantages, initialFinancialAdvantages).map(
      (financialAdvantages: [FinancialAdvantage, FinancialAdvantage]) => {
        return FinancialAdvantageBuilder.from(financialAdvantages[1])
          .withTitle(
            this.mapLanguageString(
              financialAdvantages[0].title,
              financialAdvantages[1].title,
              initialDutchLanguageVariant,
            ),
          )
          .withDescription(
            this.mapLanguageString(
              financialAdvantages[0].description,
              financialAdvantages[1].description,
              initialDutchLanguageVariant,
            ),
          )
          .build();
      },
    );
  }

  private mapLegalResources(
    newLegalResources: LegalResource[],
    initialLegalResources: LegalResource[],
    initialDutchLanguageVariant: Language,
  ): LegalResource[] {
    if (newLegalResources.length != initialLegalResources.length) {
      throw new SystemError(
        "Het aantal regelgevingen van ipdc is niet gelijk aan het aantal originele regelgevingen",
      );
    }
    return zip(newLegalResources, initialLegalResources).map(
      (legalResources: [LegalResource, LegalResource]) => {
        return LegalResourceBuilder.from(legalResources[1])
          .withTitle(
            this.mapLanguageString(
              legalResources[0].title,
              legalResources[1].title,
              initialDutchLanguageVariant,
            ),
          )
          .withDescription(
            this.mapLanguageString(
              legalResources[0].description,
              legalResources[1].description,
              initialDutchLanguageVariant,
            ),
          )
          .build();
      },
    );
  }
}
