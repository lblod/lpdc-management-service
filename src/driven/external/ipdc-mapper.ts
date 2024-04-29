import {Bestuurseenheid} from "../../core/domain/bestuurseenheid";
import {DoubleQuadReporter, LoggingDoubleQuadReporter, QuadsToDomainMapper} from "../shared/quads-to-domain-mapper";
import {Logger} from "../../../platform/logger";
import {Instance, InstanceBuilder} from "../../core/domain/instance";
import {graph, parse} from "rdflib";
import {NS} from "../persistence/namespaces";
import {Requirement, RequirementBuilder} from "../../core/domain/requirement";
import {LanguageString} from "../../core/domain/language-string";
import {InvariantError} from "../../core/domain/shared/lpdc-error";
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

export class IpdcMapper implements InstanceInformalLanguageStringsFetcher {

    async fetchIpdcInstanceAndMap(bestuurseenheid: Bestuurseenheid, initialInstance: Instance): Promise<Instance> {
        try {
            //TODO LPDC-1139: error handling ...
            // Check connection problem ?
            // Check response ok
            // log if response NOK
            // consistent with address
            const jsonIpdcInstance = await this.fetchIpdcInstance(initialInstance);
            //TODO LPDC-1139: error handling ...
            // IDEM
            const expandedContext = await this.fetchIpdcContext(jsonIpdcInstance['@context']);
            jsonIpdcInstance['@context'] = (await expandedContext.json())['@context'];

            const jsonLdDataAsString = JSON.stringify(jsonIpdcInstance);
            return this.mapIpdcInstance(jsonLdDataAsString, bestuurseenheid, initialInstance);
        } catch (e) {
            console.error(e);
        }
    }


    private mapIpdcInstance(jsonLdData: string, bestuurseenheid: Bestuurseenheid, initialInstance: Instance): Promise<Instance> {
        return new Promise<QuadsToDomainMapper>((resolve, reject) => {

            const store = graph();
            parse(jsonLdData, store, bestuurseenheid.userGraph().value, 'application/ld+json', (error: any, kb: any) => {
                if (error) {
                    reject(error);
                    return;
                }

                const doubleQuadReporter: DoubleQuadReporter = new LoggingDoubleQuadReporter(new Logger('Instance-QuadsToDomainLogger'));
                const quads = kb.statementsMatching();

                // TODO LPDC-1139: check that quads is larger then 0

                const quadsToDomainMapper: QuadsToDomainMapper = new QuadsToDomainMapper(quads, bestuurseenheid.userGraph(), doubleQuadReporter);

                resolve(quadsToDomainMapper);

            });
        }).then(quadsToDomainMapper => this.mappedInstance(quadsToDomainMapper, initialInstance));
    }


    private mappedInstance(mapper: QuadsToDomainMapper, initialInstance: Instance): Instance {
        const id = initialInstance.id;
        mapper.errorIfMissingOrIncorrectType(id, NS.lpdcExt('InstancePublicService'));

        //TODO LPDC-1139: verify dateModified with fetched =>  systemError
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

    private async fetchIpdcInstance(initialInstance: Instance) {
        //TODO LPDC-1139: make dynamic
        const ipdcInstance = await fetch(`https://productcatalogus.ipdc.tni-vlaanderen.be/doc/instantie/${initialInstance.uuid}`, {
            headers: {'Accept': 'application/ld+json'}
        });
        const ipdcInstanceJson = await ipdcInstance.json();
        ipdcInstanceJson['@id'] = initialInstance.id.value;
        return ipdcInstanceJson;
    }

    private async fetchIpdcContext(context: string) {
        return await fetch(context, {
            headers: {'Accept': 'application/ld+json'}
        });
    }

    private mapLanguageString(newValue: LanguageString | undefined, initialValue: LanguageString | undefined): LanguageString | undefined {
        if (newValue && initialValue) {
            const informalNewValue = newValue.nlGeneratedInformal;

            if (!informalNewValue || informalNewValue.trim() === "") {
                throw new InvariantError('Geen informal waarde verkregen');
            }

            if (initialValue?.nl) {
                return LanguageString.of(initialValue?.en, informalNewValue);
            } else {
                return LanguageString.of(initialValue?.en, undefined, informalNewValue);
            }
        } else if (!newValue && !initialValue) {
        return undefined;
        }

        throw new InvariantError("De nieuwe en initiële waarde moeten beiden aanwezig of afwezig zijn");
    }

    private mapRequirements(newRequirements: Requirement[], initialRequirements: Requirement[]): Requirement[] {
        if (newRequirements.length != initialRequirements.length) {
            throw new InvariantError("Het aantal voorwaarden van ipdc is niet gelijk aan het aantal originele voorwaarden");
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
        throw new InvariantError("Het bewijs van ipdc is niet gelijk aan het originele bewijs");
    }

    private mapProcedure(newProcedures: Procedure[], initialProcedures: Procedure[]): Procedure[] {
        if (newProcedures.length != initialProcedures.length) {
            throw new InvariantError("Het aantal procedures van ipdc is niet gelijk aan het aantal originele procedures");
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
            throw new InvariantError("Het aantal websites van ipdc is niet gelijk aan het aantal originele websites");
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
            throw new InvariantError("Het aantal kosten van ipdc is niet gelijk aan het aantal originele kosten");
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
            throw new InvariantError("Het aantal financiele voordelen van ipdc is niet gelijk aan het aantal originele financiele voordelen");
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
            throw new InvariantError("Het aantal regelgevingen van ipdc is niet gelijk aan het aantal originele regelgevingen");
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
