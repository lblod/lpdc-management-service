import {Iri} from "../../../src/core/domain/shared/iri";
import {LanguageString} from "../../../src/core/domain/language-string";
import {FormatPreservingDate} from "../../../src/core/domain/format-preserving-date";
import {
    CompetentAuthorityLevelType,
    ExecutingAuthorityLevelType,
    LanguageType,
    ProductType,
    PublicationMediumType,
    TargetAudienceType,
    ThemeType,
    YourEuropeCategoryType
} from "../../../src/core/domain/types";
import {Requirement} from "../../../src/core/domain/requirement";
import {Procedure} from "../../../src/core/domain/procedure";
import {Website} from "../../../src/core/domain/website";
import {Cost} from "../../../src/core/domain/cost";
import {FinancialAdvantage} from "../../../src/core/domain/financial-advantage";
import {ContactPoint} from "../../../src/core/domain/contact-point";
import {InstanceSnapshot} from "../../../src/core/domain/instance-snapshot";
import {uuid} from "../../../mu-helper";
import {buildBestuurseenheidIri, buildInstanceSnapshotIri} from "./iri-test-builder";

export function aMinimalInstanceSnapshot(): InstanceSnapshotTestBuilder {
    const uniqueId = uuid();
    return new InstanceSnapshotTestBuilder()
        .withId(buildInstanceSnapshotIri(uniqueId))
        .withCreatedBy(buildBestuurseenheidIri(uuid()))
        .withDateCreated(InstanceSnapshotTestBuilder.DATE_CREATED)
        .withDateModified(InstanceSnapshotTestBuilder.DATE_MODIFIED);
}

export class InstanceSnapshotTestBuilder {

    public static readonly TITLE_EN = 'Instance Snapshot Title - en';
    public static readonly TITLE_NL = 'Instance Snapshot Title - nl';
    public static readonly TITLE_NL_FORMAL = 'Instance Title Snapshot - nl-formal';
    public static readonly TITLE_NL_INFORMAL = 'Instance Title Snapshot - nl-informal';

    public static readonly DATE_CREATED = FormatPreservingDate.of('2024-01-08T12:13:42.074442Z');
    public static readonly DATE_MODIFIED = FormatPreservingDate.of('2024-02-06T16:16:20.242928Z');

    private id: Iri;
    private createdBy: Iri;
    private title: LanguageString | undefined;
    private description: LanguageString | undefined;
    private additionalDescription: LanguageString | undefined;
    private exception: LanguageString | undefined;
    private regulation: LanguageString | undefined;
    private startDate: FormatPreservingDate | undefined;
    private endDate: FormatPreservingDate | undefined;
    private type: ProductType | undefined;
    private targetAudiences: TargetAudienceType[] = [];
    private themes: ThemeType[] = [];
    private competentAuthorityLevels: CompetentAuthorityLevelType[] = [];
    private competentAuthorities: Iri[] = [];
    private executingAuthorityLevels: ExecutingAuthorityLevelType[] = [];
    private executingAuthorities: Iri[] = [];
    private publicationMedia: PublicationMediumType[] = [];
    private yourEuropeCategories: YourEuropeCategoryType[] = [];
    private keywords: LanguageString[] = [];
    private requirements: Requirement[] = [];
    private procedures: Procedure[] = [];
    private websites: Website[] = [];
    private costs: Cost[] = [];
    private financialAdvantages: FinancialAdvantage[] = [];
    private contactPoints: ContactPoint[] = [];
    private conceptId: Iri | undefined;
    private languages: LanguageType[] = [];
    private dateCreated: FormatPreservingDate;
    private dateModified: FormatPreservingDate;
    private generatedAtTime: FormatPreservingDate;
    private isArchived: boolean;
    private spatials: Iri[] = [];
    private legalResources: Iri[] = [];

    public withId(id: Iri): InstanceSnapshotTestBuilder {
        this.id = id;
        return this;
    }

    public withCreatedBy(createdBy: Iri): InstanceSnapshotTestBuilder {
        this.createdBy = createdBy;
        return this;
    }

    public withTitle(title: LanguageString): InstanceSnapshotTestBuilder {
        this.title = title;
        return this;
    }

    public withDescription(description: LanguageString): InstanceSnapshotTestBuilder {
        this.description = description;
        return this;
    }

    public withAdditionalDescription(additionalDescription: LanguageString): InstanceSnapshotTestBuilder {
        this.additionalDescription = additionalDescription;
        return this;
    }

    public withException(exception: LanguageString): InstanceSnapshotTestBuilder {
        this.exception = exception;
        return this;
    }

    public withRegulation(regulation: LanguageString): InstanceSnapshotTestBuilder {
        this.regulation = regulation;
        return this;
    }

    public withStartDate(startDate: FormatPreservingDate): InstanceSnapshotTestBuilder {
        this.startDate = startDate;
        return this;
    }

    public withEndDate(endDate: FormatPreservingDate): InstanceSnapshotTestBuilder {
        this.endDate = endDate;
        return this;
    }

    public withType(type: ProductType): InstanceSnapshotTestBuilder {
        this.type = type;
        return this;
    }

    public withTargetAudiences(targetAudiences: TargetAudienceType[]): InstanceSnapshotTestBuilder {
        this.targetAudiences = targetAudiences;
        return this;
    }

    public withThemes(themes: ThemeType[]): InstanceSnapshotTestBuilder {
        this.themes = themes;
        return this;
    }

    public withCompetentAuthorityLevels(competentAuthorityLevels: CompetentAuthorityLevelType[]): InstanceSnapshotTestBuilder {
        this.competentAuthorityLevels = competentAuthorityLevels;
        return this;
    }

    public withCompetentAuthorities(competentAuthorities: Iri[]): InstanceSnapshotTestBuilder {
        this.competentAuthorities = competentAuthorities;
        return this;
    }

    public withExecutingAuthorityLevels(executingAuthorityLevels: ExecutingAuthorityLevelType[]): InstanceSnapshotTestBuilder {
        this.executingAuthorityLevels = executingAuthorityLevels;
        return this;
    }

    public withExecutingAuthorities(executingAuthorities: Iri[]): InstanceSnapshotTestBuilder {
        this.executingAuthorities = executingAuthorities;
        return this;
    }

    public withPublicationMedia(publicationMedia: PublicationMediumType[]): InstanceSnapshotTestBuilder {
        this.publicationMedia = publicationMedia;
        return this;
    }

    public withYourEuropeCategories(yourEuropeCategories: YourEuropeCategoryType[]): InstanceSnapshotTestBuilder {
        this.yourEuropeCategories = yourEuropeCategories;
        return this;
    }

    public withKeywords(keywords: LanguageString[]): InstanceSnapshotTestBuilder {
        this.keywords = keywords;
        return this;
    }

    public withRequirements(requirements: Requirement[]): InstanceSnapshotTestBuilder {
        this.requirements = requirements;
        return this;
    }

    public withProcedures(procedures: Procedure[]): InstanceSnapshotTestBuilder {
        this.procedures = procedures;
        return this;
    }

    public withWebsites(websites: Website[]): InstanceSnapshotTestBuilder {
        this.websites = websites;
        return this;
    }

    public withCosts(costs: Cost[]): InstanceSnapshotTestBuilder {
        this.costs = costs;
        return this;
    }

    public withFinancialAdvantages(financialAdvantages: FinancialAdvantage[]): InstanceSnapshotTestBuilder {
        this.financialAdvantages = financialAdvantages;
        return this;
    }

    public withContactPoints(contactPoints: ContactPoint[]): InstanceSnapshotTestBuilder {
        this.contactPoints = contactPoints;
        return this;
    }

    public withConceptId(conceptId: Iri): InstanceSnapshotTestBuilder {
        this.conceptId = conceptId;
        return this;
    }

    public withLanguages(languages: LanguageType[]): InstanceSnapshotTestBuilder {
        this.languages = languages;
        return this;
    }

    public withDateCreated(dateCreated: FormatPreservingDate): InstanceSnapshotTestBuilder {
        this.dateCreated = dateCreated;
        return this;
    }

    public withDateModified(dateModified: FormatPreservingDate): InstanceSnapshotTestBuilder {
        this.dateModified = dateModified;
        return this;
    }

    public withGeneratedAtTime(generatedAtTime: FormatPreservingDate): InstanceSnapshotTestBuilder {
        this.generatedAtTime = generatedAtTime;
        return this;
    }

    public withIsArchived(isArchived: boolean): InstanceSnapshotTestBuilder {
        this.isArchived = isArchived;
        return this;
    }

    public withSpatials(spatials: Iri[]): InstanceSnapshotTestBuilder {
        this.spatials = spatials;
        return this;
    }

    public withLegalResources(legalResources: Iri[]): InstanceSnapshotTestBuilder {
        this.legalResources = legalResources;
        return this;
    }

    public build(): InstanceSnapshot {
        return new InstanceSnapshot(
            this.id,
            this.createdBy,
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
            this.financialAdvantages,
            this.contactPoints,
            this.conceptId,
            this.languages,
            this.dateCreated,
            this.dateModified,
            this.generatedAtTime,
            this.isArchived,
            this.spatials,
            this.legalResources,
            );
    }

}