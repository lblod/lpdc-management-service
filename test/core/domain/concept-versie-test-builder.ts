import {Iri} from "../../../src/core/domain/shared/iri";
import {uuid} from "../../../mu-helper";
import {
    CompetentAuthorityLevelType,
    ConceptVersie,
    ExecutingAuthorityLevelType,
    ProductType,
    PublicationMediumType,
    TargetAudienceType,
    ThemeType,
    YourEuropeCategoryType
} from "../../../src/core/domain/concept-versie";
import {TaalString} from "../../../src/core/domain/taal-string";
import {BestuurseenheidTestBuilder} from "./bestuureenheid-test-builder";
import {Requirement} from "../../../src/core/domain/requirement";
import {aFullRequirement, anotherFullRequirement} from "./requirement-test-builder";
import {Procedure} from "../../../src/core/domain/procedure";
import {aFullProcedure, anotherFullProcedure} from "./procedure-test-builder";
import {anotherFullWebsite} from "./website-test-builder";
import {Website} from "../../../src/core/domain/website";
import {aFullCost, anotherFullCost} from "./cost-test-builder";
import {Cost} from "../../../src/core/domain/cost";
import {aFullFinancialAdvantage, anotherFullFinancialAdvantage} from "./financial-advantage-test-builder";
import {FinancialAdvantage} from "../../../src/core/domain/financial-advantage";


export function aMinimalConceptVersie(): ConceptVersieTestBuilder {
    return new ConceptVersieTestBuilder()
        .withId(ConceptVersieTestBuilder.buildIri(uuid()));
}

export function aFullConceptVersie(): ConceptVersieTestBuilder {
    return new ConceptVersieTestBuilder()
        .withId(ConceptVersieTestBuilder.buildIri(uuid()))
        .withTitle(
            TaalString.of(
                ConceptVersieTestBuilder.TITLE_EN,
                ConceptVersieTestBuilder.TITLE_NL,
                ConceptVersieTestBuilder.TITLE_NL_FORMAL,
                ConceptVersieTestBuilder.TITLE_NL_INFORMAL,
                ConceptVersieTestBuilder.TITLE_NL_GENERATED_FORMAL,
                ConceptVersieTestBuilder.TITLE_NL_GENERATED_INFORMAL))
        .withDescription(
            TaalString.of(
                ConceptVersieTestBuilder.DESCRIPTION_EN,
                ConceptVersieTestBuilder.DESCRIPTION_NL,
                ConceptVersieTestBuilder.DESCRIPTION_NL_FORMAL,
                ConceptVersieTestBuilder.DESCRIPTION_NL_INFORMAL,
                ConceptVersieTestBuilder.DESCRIPTION_NL_GENERATED_FORMAL,
                ConceptVersieTestBuilder.DESCRIPTION_NL_GENERATED_INFORMAL))
        .withAdditionalDescription(
            TaalString.of(
                ConceptVersieTestBuilder.ADDITIONAL_DESCRIPTION_EN,
                ConceptVersieTestBuilder.ADDITIONAL_DESCRIPTION_NL,
                ConceptVersieTestBuilder.ADDITIONAL_DESCRIPTION_NL_FORMAL,
                ConceptVersieTestBuilder.ADDITIONAL_DESCRIPTION_NL_INFORMAL,
                ConceptVersieTestBuilder.ADDITIONAL_DESCRIPTION_NL_GENERATED_FORMAL,
                ConceptVersieTestBuilder.ADDITIONAL_DESCRIPTION_NL_GENERATED_INFORMAL))
        .withException(
            TaalString.of(
                ConceptVersieTestBuilder.EXCEPTION_EN,
                ConceptVersieTestBuilder.EXCEPTION_NL,
                ConceptVersieTestBuilder.EXCEPTION_NL_FORMAL,
                ConceptVersieTestBuilder.EXCEPTION_NL_INFORMAL,
                ConceptVersieTestBuilder.EXCEPTION_NL_GENERATED_FORMAL,
                ConceptVersieTestBuilder.EXCEPTION_NL_GENERATED_INFORMAL))
        .withRegulation(
            TaalString.of(
                ConceptVersieTestBuilder.REGULATION_EN,
                ConceptVersieTestBuilder.REGULATION_NL,
                ConceptVersieTestBuilder.REGULATION_NL_FORMAL,
                ConceptVersieTestBuilder.REGULATION_NL_INFORMAL,
                ConceptVersieTestBuilder.REGULATION_NL_GENERATED_FORMAL,
                ConceptVersieTestBuilder.REGULATION_NL_GENERATED_INFORMAL))
        .withStartDate(ConceptVersieTestBuilder.START_DATE)
        .withEndDate(ConceptVersieTestBuilder.END_DATE)
        .withType(ConceptVersieTestBuilder.TYPE)
        .withTargetAudiences(ConceptVersieTestBuilder.TARGET_AUDIENCES)
        .withThemes(ConceptVersieTestBuilder.THEMES)
        .withCompetentAuthorityLevels(ConceptVersieTestBuilder.COMPETENT_AUTHORITY_LEVELS)
        .withCompetentAuthorities(ConceptVersieTestBuilder.COMPETENT_AUTHORITIES)
        .withExecutingAuthorityLevels(ConceptVersieTestBuilder.EXECUTING_AUTHORITY_LEVELS)
        .withExecutingAuthorities(ConceptVersieTestBuilder.EXECUTING_AUTHORITIES)
        .withPublicationMedia(ConceptVersieTestBuilder.PUBLICATION_MEDIA)
        .withYourEuropeCategories(ConceptVersieTestBuilder.YOUR_EUROPE_CATEGORIES)
        .withKeywords(ConceptVersieTestBuilder.KEYWORDS)
        .withRequirements(ConceptVersieTestBuilder.REQUIREMENTS)
        .withProcedures(ConceptVersieTestBuilder.PROCEDURES)
        .withWebsites(ConceptVersieTestBuilder.WEBSITES)
        .withCosts(ConceptVersieTestBuilder.COSTS)
        .withFinancialAdvantages(ConceptVersieTestBuilder.FINANCIAL_ADVANTAGES);
}

export class ConceptVersieTestBuilder {

    public static readonly TITLE_EN = 'Concept Versie Title - en';
    public static readonly TITLE_NL = 'Concept Versie Title - nl';
    public static readonly TITLE_NL_FORMAL = 'Concept Versie Title - nl-formal';
    public static readonly TITLE_NL_INFORMAL = 'Concept Versie Title - nl-informal';
    public static readonly TITLE_NL_GENERATED_FORMAL = 'Concept Versie Title - nl-generated-formal';
    public static readonly TITLE_NL_GENERATED_INFORMAL = 'Concept Versie Title - nl-generated-informal';

    public static readonly DESCRIPTION_EN = 'Concept Versie Description - en';
    public static readonly DESCRIPTION_NL = 'Concept Versie Description - nl';
    public static readonly DESCRIPTION_NL_FORMAL = 'Concept Versie Description - nl-formal';
    public static readonly DESCRIPTION_NL_INFORMAL = 'Concept Versie Description - nl-informal';
    public static readonly DESCRIPTION_NL_GENERATED_FORMAL = 'Concept Versie Description - nl-generated-formal';
    public static readonly DESCRIPTION_NL_GENERATED_INFORMAL = 'Concept Versie Description - nl-generated-informal';

    public static readonly ADDITIONAL_DESCRIPTION_EN = 'Concept Versie Additional Description - en';
    public static readonly ADDITIONAL_DESCRIPTION_NL = 'Concept Versie Additional Description - nl';
    public static readonly ADDITIONAL_DESCRIPTION_NL_FORMAL = 'Concept Versie Additional Description - nl-formal';
    public static readonly ADDITIONAL_DESCRIPTION_NL_INFORMAL = 'Concept Versie Additional Description - nl-informal';
    public static readonly ADDITIONAL_DESCRIPTION_NL_GENERATED_FORMAL = 'Concept Versie Additional Description - nl-generated-formal';
    public static readonly ADDITIONAL_DESCRIPTION_NL_GENERATED_INFORMAL = 'Concept Versie Additional Description - nl-generated-informal';

    public static readonly EXCEPTION_EN = 'Concept Versie Exception - en';
    public static readonly EXCEPTION_NL = 'Concept Versie Exception - nl';
    public static readonly EXCEPTION_NL_FORMAL = 'Concept Versie Exception - nl-formal';
    public static readonly EXCEPTION_NL_INFORMAL = 'Concept Versie Exception - nl-informal';
    public static readonly EXCEPTION_NL_GENERATED_FORMAL = 'Concept Versie Exception - nl-generated-formal';
    public static readonly EXCEPTION_NL_GENERATED_INFORMAL = 'Concept Versie Exception - nl-generated-informal';

    public static readonly REGULATION_EN = 'Concept Versie Regulation - en';
    public static readonly REGULATION_NL = 'Concept Versie Regulation - nl';
    public static readonly REGULATION_NL_FORMAL = 'Concept Versie Regulation - nl-formal';
    public static readonly REGULATION_NL_INFORMAL = 'Concept Versie Regulation - nl-informal';
    public static readonly REGULATION_NL_GENERATED_FORMAL = 'Concept Versie Regulation - nl-generated-formal';
    public static readonly REGULATION_NL_GENERATED_INFORMAL = 'Concept Versie Regulation - nl-generated-informal';

    public static readonly START_DATE = new Date('2023-10-28');
    public static readonly END_DATE = new Date('2027-09-16');

    public static readonly TYPE = ProductType.FINANCIEELVOORDEEL;

    public static readonly TARGET_AUDIENCES = new Set([TargetAudienceType.BURGER, TargetAudienceType.VLAAMSEOVERHEID, TargetAudienceType.ORGANISATIE]);

    public static readonly THEMES = new Set([ThemeType.CULTUURSPORTVRIJETIJD, ThemeType.MOBILITEITOPENBAREWERKEN, ThemeType.WELZIJNGEZONDHEID]);

    public static readonly COMPETENT_AUTHORITY_LEVELS = new Set([CompetentAuthorityLevelType.LOKAAL, CompetentAuthorityLevelType.PROVINCIAAL, CompetentAuthorityLevelType.EUROPEES]);
    public static readonly COMPETENT_AUTHORITIES = new Set([BestuurseenheidTestBuilder.PEPINGEN_IRI, BestuurseenheidTestBuilder.HOUTHALEN_HELCHTEREN_IRI, BestuurseenheidTestBuilder.BORGLOON_IRI]);

    public static readonly EXECUTING_AUTHORITY_LEVELS = new Set([ExecutingAuthorityLevelType.LOKAAL, ExecutingAuthorityLevelType.PROVINCIAAL, ExecutingAuthorityLevelType.DERDEN]);
    public static readonly EXECUTING_AUTHORITIES = new Set([BestuurseenheidTestBuilder.PEPINGEN_IRI, BestuurseenheidTestBuilder.OUD_HEVERLEE_IRI, BestuurseenheidTestBuilder.ASSENEDE_IRI]);

    public static readonly PUBLICATION_MEDIA = new Set([PublicationMediumType.YOUREUROPE, PublicationMediumType.RECHTENVERKENNER]);

    public static readonly YOUR_EUROPE_CATEGORIES = new Set([YourEuropeCategoryType.BEDRIJFINSOLVENTIELIQUIDATIE, YourEuropeCategoryType.PROCEDUREPENSIONERING, YourEuropeCategoryType.GOEDERENRECYCLAGE]);

    public static readonly KEYWORDS = [TaalString.of('buitenland'), TaalString.of(undefined, 'buitenland'), TaalString.of(undefined, 'ambulante activiteit'), TaalString.of('levensloos')];

    public static readonly REQUIREMENTS = [aFullRequirement().build(), anotherFullRequirement().build()];

    public static readonly PROCEDURES = [aFullProcedure().build(), anotherFullProcedure().build()];

    public static readonly WEBSITES = [anotherFullWebsite(uuid()).build(), anotherFullWebsite(uuid()).build()];

    public static readonly COSTS = [aFullCost().build(), anotherFullCost().build()];

    public static readonly FINANCIAL_ADVANTAGES = [aFullFinancialAdvantage().build(), anotherFullFinancialAdvantage().build()];

    private id: Iri;
    private title: TaalString | undefined;
    private description: TaalString | undefined;
    private additionalDescription: TaalString | undefined;
    private exception: TaalString | undefined;
    private regulation: TaalString | undefined;
    private startDate: Date | undefined;
    private endDate: Date | undefined;
    private type: ProductType | undefined;
    private targetAudiences: Set<TargetAudienceType> = new Set();
    private themes: Set<ThemeType> = new Set();
    private competentAuthorityLevels: Set<CompetentAuthorityLevelType> = new Set();
    private competentAuthorities: Set<Iri> = new Set();
    private executingAuthorityLevels: Set<ExecutingAuthorityLevelType> = new Set();
    private executingAuthorities: Set<Iri> = new Set();
    private publicationMedia: Set<PublicationMediumType> = new Set();
    private yourEuropeCategories: Set<YourEuropeCategoryType> = new Set();
    private keywords: TaalString[] = [];
    private requirements: Requirement[] = [];
    private procedures: Procedure[] = [];
    private websites: Website[] = [];
    private costs: Cost[] = [];
    private financialAdvantages: FinancialAdvantage[] = [];

    static buildIri(uniqueId: string): Iri {
        return `https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${uniqueId}`;
    }

    public withId(id: Iri): ConceptVersieTestBuilder {
        this.id = id;
        return this;
    }

    public withTitle(title: TaalString): ConceptVersieTestBuilder {
        this.title = title;
        return this;
    }

    public withDescription(description: TaalString): ConceptVersieTestBuilder {
        this.description = description;
        return this;
    }

    public withAdditionalDescription(additionalDescription: TaalString): ConceptVersieTestBuilder {
        this.additionalDescription = additionalDescription;
        return this;
    }

    public withException(exception: TaalString): ConceptVersieTestBuilder {
        this.exception = exception;
        return this;
    }

    public withRegulation(regulation: TaalString): ConceptVersieTestBuilder {
        this.regulation = regulation;
        return this;
    }

    public withStartDate(startDate: Date): ConceptVersieTestBuilder {
        this.startDate = startDate;
        return this;
    }

    public withEndDate(endDate: Date): ConceptVersieTestBuilder {
        this.endDate = endDate;
        return this;
    }

    public withType(type: ProductType): ConceptVersieTestBuilder {
        this.type = type;
        return this;
    }

    public withTargetAudiences(targetAudiences: Set<TargetAudienceType>): ConceptVersieTestBuilder {
        this.targetAudiences = targetAudiences;
        return this;
    }

    public withThemes(themes: Set<ThemeType>): ConceptVersieTestBuilder {
        this.themes = themes;
        return this;
    }

    public withCompetentAuthorityLevels(competentAuthorityLevels: Set<CompetentAuthorityLevelType>): ConceptVersieTestBuilder {
        this.competentAuthorityLevels = competentAuthorityLevels;
        return this;
    }

    public withCompetentAuthorities(competentAuthorities: Set<Iri>): ConceptVersieTestBuilder {
        this.competentAuthorities = competentAuthorities;
        return this;
    }

    public withExecutingAuthorityLevels(executingAuthorityLevels: Set<ExecutingAuthorityLevelType>): ConceptVersieTestBuilder {
        this.executingAuthorityLevels = executingAuthorityLevels;
        return this;
    }

    public withExecutingAuthorities(executingAuthorities: Set<Iri>): ConceptVersieTestBuilder {
        this.executingAuthorities = executingAuthorities;
        return this;
    }

    public withPublicationMedia(publicationMedia: Set<PublicationMediumType>): ConceptVersieTestBuilder {
        this.publicationMedia = publicationMedia;
        return this;
    }

    public withYourEuropeCategories(yourEuropeCategories: Set<YourEuropeCategoryType>): ConceptVersieTestBuilder {
        this.yourEuropeCategories = yourEuropeCategories;
        return this;
    }

    public withKeywords(keywords: TaalString[]): ConceptVersieTestBuilder {
        this.keywords = keywords;
        return this;
    }

    public withRequirements(requirements: Requirement[]): ConceptVersieTestBuilder {
        this.requirements = requirements;
        return this;
    }

    public withProcedures(procedures: Procedure[]): ConceptVersieTestBuilder {
        this.procedures = procedures;
        return this;
    }

    public withWebsites(websites: Website[]): ConceptVersieTestBuilder {
        this.websites = websites;
        return this;
    }

    public withCosts(costs: Cost[]): ConceptVersieTestBuilder {
        this.costs = costs;
        return this;
    }

    public withFinancialAdvantages(financialAdvantages: FinancialAdvantage[]): ConceptVersieTestBuilder {
        this.financialAdvantages = financialAdvantages;
        return this;
    }

    public build(): ConceptVersie {
        return new ConceptVersie(
            this.id,
            this.title,
            this.description,
            this.additionalDescription,
            this.exception,
            this.regulation,
            this.startDate,
            this.endDate,
            this.type,
            this.targetAudiences,
            this.themes,
            this.competentAuthorityLevels,
            this.competentAuthorities,
            this.executingAuthorityLevels,
            this.executingAuthorities,
            this.publicationMedia,
            this.yourEuropeCategories,
            this.keywords,
            this.requirements,
            this.procedures,
            this.websites,
            this.costs,
            this.financialAdvantages);
    }

}