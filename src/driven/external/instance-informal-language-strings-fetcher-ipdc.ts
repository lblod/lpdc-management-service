import {Bestuurseenheid} from "../../core/domain/bestuurseenheid";
import {DoubleQuadReporter, LoggingDoubleQuadReporter, QuadsToDomainMapper} from "../shared/quads-to-domain-mapper";
import {Logger} from "../../../platform/logger";
import {Instance, InstanceBuilder} from "../../core/domain/instance";
import {graph, parse, Statement} from "rdflib";
import {NS} from "../persistence/namespaces";
import {Requirement, RequirementBuilder} from "../../core/domain/requirement";
import {LanguageString} from "../../core/domain/language-string";
import {SystemError} from "../../core/domain/shared/lpdc-error";
import {zip} from "lodash";
import {Procedure, ProcedureBuilder} from "../../core/domain/procedure";
import {Cost, CostBuilder} from "../../core/domain/cost";
import {Website, WebsiteBuilder} from "../../core/domain/website";
import {FinancialAdvantage, FinancialAdvantageBuilder} from "../../core/domain/financial-advantage";
import {Evidence, EvidenceBuilder} from "../../core/domain/evidence";
import {LegalResource, LegalResourceBuilder} from "../../core/domain/legal-resource";
import {
    InstanceInformalLanguageStringsFetcher
} from "../../core/port/driven/external/instance-informal-language-strings-fetcher";

export class InstanceInformalLanguageStringsFetcherIpdc implements InstanceInformalLanguageStringsFetcher {

    private readonly endpoint: string;

    constructor(endpoint: string) {
        this.endpoint = endpoint;
    }

    async fetchInstanceAndMap(bestuurseenheid: Bestuurseenheid, initialInstance: Instance): Promise<Instance> {
        const jsonInstance = await this.fetchInstance(initialInstance);

        jsonInstance['@context'] = await this.fetchContext(jsonInstance['@context']);

        const jsonLdDataAsString = JSON.stringify(jsonInstance);
        return this.mapInstance(jsonLdDataAsString, bestuurseenheid, initialInstance);
    }

    private async mapInstance(jsonLdData: string, bestuurseenheid: Bestuurseenheid, initialInstance: Instance): Promise<Instance> {
        const quadsToDomainMapper = await new Promise<QuadsToDomainMapper>((resolve, reject) => {

            const store = graph();
            parse(jsonLdData, store, bestuurseenheid.userGraph().value, 'application/ld+json', (error: any, kb: any) => {
                if (error) {
                    reject(error);
                    return;
                }

                const doubleQuadReporter: DoubleQuadReporter = new LoggingDoubleQuadReporter(new Logger('Instance-QuadsToDomainLogger'));
                const quads: Statement[] = kb.statementsMatching();

                if (quads.length < 5) {
                    reject(new SystemError(`Er is een fout opgetreden bij het bevragen van Ipdc voor instance ${initialInstance.id}`));
                }
                const mapper: QuadsToDomainMapper = new QuadsToDomainMapper(quads, bestuurseenheid.userGraph(), doubleQuadReporter);

                resolve(mapper);
            });
        });
        return this.mappedInstance(quadsToDomainMapper, initialInstance);
    }

    private mappedInstance(mapper: QuadsToDomainMapper, initialInstance: Instance): Instance {
        const id = initialInstance.id;
        mapper.errorIfMissingOrIncorrectType(id, NS.lpdcExt('InstancePublicService'));

        const fetchedDateModified = mapper.dateModified(id);
        if (fetchedDateModified.value != initialInstance.dateModified.value) {
            throw new SystemError(`Wijzigingsdatum ipdc is niet gelijk aan wijzigingsdatum lpdc voor ${initialInstance.id}`);
        }

        return InstanceBuilder.from(initialInstance)
            .withTitle(this.mapLanguageString(mapper.title(id), initialInstance.title))
            .withDescription(this.mapLanguageString(mapper.description(id), initialInstance.description))
            .withAdditionalDescription(this.mapLanguageString(mapper.additionalDescription(id), initialInstance.additionalDescription))
            .withException(this.mapLanguageString(mapper.exception(id), initialInstance.exception))
            .withRegulation(this.mapLanguageString(mapper.regulation(id), initialInstance.regulation))
            .withRequirements(this.mapRequirements(mapper.requirements(id), initialInstance.requirements))
            .withProcedures(this.mapProcedure(mapper.procedures(id), initialInstance.procedures))
            .withWebsites(this.mapWebsites(mapper.websites(id), initialInstance.websites))
            .withCosts(this.mapCosts(mapper.costs(id), initialInstance.costs))
            .withFinancialAdvantages(this.mapFinancialAdvantages(mapper.financialAdvantages(id), initialInstance.financialAdvantages))
            .withLegalResources(this.mapLegalResources(mapper.legalResources(id), initialInstance.legalResources))
            .build();
    }

    private async fetchInstance(initialInstance: Instance) {
        //TODO LPDC-1139: take last part of id of Instance instead of taking uuid -> see frontend logic ...
        const response = await fetch(`${this.endpoint}/doc/instantie/${initialInstance.uuid}`, {
            headers: {'Accept': 'application/ld+json'}
        });

        if (response.ok) {
            const instanceJson = await response.json();
            //TODO LPDC-1139: ask why the @id of ipdc is not our generated iri id ?
            instanceJson['@id'] = initialInstance.id.value;
            return instanceJson;
        }

        if (response.status === 404) {
            console.error(await response.text());
            throw new SystemError(`Instantie ${initialInstance.id} niet gevonden bij ipdc`);
        } else {
            console.error(await response.text());
            throw new SystemError(`Er is een fout opgetreden bij het bevragen van Ipdc voor instantie ${initialInstance.id}`);
        }
    }

    private async fetchContext(context: string) {
        const response = await fetch(context, {
            headers: {'Accept': 'application/ld+json'}
        });
        if (response.ok) {
            const contextAsJson = await response.json();
            const expandedContext = contextAsJson['@context'];
            if(!expandedContext) {
                console.error(`Context ${context} is incorrect [${JSON.stringify(contextAsJson)}] `);
                throw new SystemError(`Er is een fout opgetreden bij het bevragen van de context ${context} bij Ipdc, context was incorrect`);
            }
            return expandedContext;
        } else {
            console.error(await response.text());
            throw new SystemError(`Er is een fout opgetreden bij het bevragen van de context ${context} bij Ipdc`);
        }
    }

    private mapLanguageString(newValue: LanguageString | undefined, initialValue: LanguageString | undefined): LanguageString | undefined {
        //TODO LPDC-1139: verify if the initialValue is the same as the newValue for the language of the initialValue -> then we are a bit more sure we are not mapping some random other string ...
        if (newValue && initialValue) {
            const informalNewValue = newValue.nlGeneratedInformal;

            if (!informalNewValue || informalNewValue.trim() === "") {
                throw new SystemError('Geen informal waarde verkregen');
            }

            if (initialValue?.nl) {
                return LanguageString.of(initialValue?.en, informalNewValue);
            } else {
                return LanguageString.of(initialValue?.en, undefined, informalNewValue);
            }
        } else if (!newValue && !initialValue) {
             return undefined;
        }

        throw new SystemError("De nieuwe en initiële waarde moeten beiden aanwezig of afwezig zijn");
    }

    private mapRequirements(newRequirements: Requirement[], initialRequirements: Requirement[]): Requirement[] {
        if (newRequirements.length != initialRequirements.length) {
            throw new SystemError("Het aantal voorwaarden van ipdc is niet gelijk aan het aantal originele voorwaarden");
        }
        let requirements: Requirement[] = [];

        zip(newRequirements, initialRequirements).some((reqs: [Requirement, Requirement]) => {

            requirements = [...requirements, RequirementBuilder.from(reqs[1])
                .withTitle(this.mapLanguageString(reqs[0].title, reqs[1].title))
                .withDescription(this.mapLanguageString(reqs[0].description, reqs[1].description))
                .withEvidence(this.mapEvidence(reqs[0].evidence, reqs[1].evidence)).build()];
        });
        return requirements;
    }

    private mapEvidence(newEvidence: Evidence | undefined, initialEvidence: Evidence | undefined): Evidence | undefined {
        if (!newEvidence && !initialEvidence) {
            return undefined;
        }

        if (newEvidence && initialEvidence) {
            return EvidenceBuilder.from(initialEvidence)
                .withTitle(this.mapLanguageString(newEvidence.title, initialEvidence.title))
                .withDescription(this.mapLanguageString(newEvidence.description, initialEvidence.description))
                .build();
        }
        throw new SystemError("Het bewijs van ipdc is niet gelijk aan het originele bewijs");
    }

    private mapProcedure(newProcedures: Procedure[], initialProcedures: Procedure[]): Procedure[] {
        if (newProcedures.length != initialProcedures.length) {
            throw new SystemError("Het aantal procedures van ipdc is niet gelijk aan het aantal originele procedures");
        }
        let procedures: Procedure[] = [];

        zip(newProcedures, initialProcedures).some((reqs: [Procedure, Procedure]) => {

            procedures = [...procedures, ProcedureBuilder.from(reqs[1])
                .withTitle(this.mapLanguageString(reqs[0].title, reqs[1].title))
                .withDescription(this.mapLanguageString(reqs[0].description, reqs[1].description))
                .withWebsites(this.mapWebsites(reqs[0].websites, reqs[1].websites)).build()];
        });
        return procedures;
    }

    private mapWebsites(newWebsites: Website[], initialWebsites: Website[]): Website[] {
        if (newWebsites.length != initialWebsites.length) {
            throw new SystemError("Het aantal websites van ipdc is niet gelijk aan het aantal originele websites");
        }
        let websites: Website[] = [];

        zip(newWebsites, initialWebsites).some((reqs: [Website, Website]) => {

            const website = WebsiteBuilder.from(reqs[1])
                .withTitle(this.mapLanguageString(reqs[0].title, reqs[1].title))
                .withDescription(this.mapLanguageString(reqs[0].description, reqs[1].description))
                .build();
            websites = [...websites, website];
        });
        return websites;
    }

    private mapCosts(newCosts: Cost[], initialCosts: Cost[]): Cost[] {
        if (newCosts.length != initialCosts.length) {
            throw new SystemError("Het aantal kosten van ipdc is niet gelijk aan het aantal originele kosten");
        }
        let costs: Cost[] = [];

        zip(newCosts, initialCosts).some((reqs: [Cost, Cost]) => {

            costs = [...costs, CostBuilder.from(reqs[1])
                .withTitle(this.mapLanguageString(reqs[0].title, reqs[1].title))
                .withDescription(this.mapLanguageString(reqs[0].description, reqs[1].description))
                .build()];
        });
        return costs;
    }

    private mapFinancialAdvantages(newFinancialAdvantages: FinancialAdvantage[], initialFinancialAdvantages: FinancialAdvantage[]): FinancialAdvantage[] {
        if (newFinancialAdvantages.length != initialFinancialAdvantages.length) {
            throw new SystemError("Het aantal financiele voordelen van ipdc is niet gelijk aan het aantal originele financiele voordelen");
        }
        let financialAdvantages: FinancialAdvantage[] = [];

        zip(newFinancialAdvantages, initialFinancialAdvantages).some((reqs: [FinancialAdvantage, FinancialAdvantage]) => {

            financialAdvantages = [...financialAdvantages, FinancialAdvantageBuilder.from(reqs[1])
                .withTitle(this.mapLanguageString(reqs[0].title, reqs[1].title))
                .withDescription(this.mapLanguageString(reqs[0].description, reqs[1].description))
                .build()];
        });
        return financialAdvantages;
    }

    private mapLegalResources(newLegalResources: LegalResource[], initialLegalResources: LegalResource[]): LegalResource[] {
        if (newLegalResources.length != initialLegalResources.length) {
            throw new SystemError("Het aantal regelgevingen van ipdc is niet gelijk aan het aantal originele regelgevingen");
        }
        let legalResources: LegalResource[] = [];

        zip(newLegalResources, initialLegalResources).some((reqs: [LegalResource, LegalResource]) => {

            legalResources = [...legalResources, LegalResourceBuilder.from(reqs[1])
                .withTitle(this.mapLanguageString(reqs[0].title, reqs[1].title))
                .withDescription(this.mapLanguageString(reqs[0].description, reqs[1].description))
                .build()];
        });
        return legalResources;
    }
}
