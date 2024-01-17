import {Iri} from "../../../src/core/domain/shared/iri";
import {LanguageString} from "../../../src/core/domain/language-string";
import {Instance} from "../../../src/core/domain/instance";
import {buildBestuurseenheidIri, buildInstanceIri, buildSpatialRefNis2019Iri, randomNumber} from "./iri-test-builder";
import {uuid} from "../../../mu-helper";
import {FormatPreservingDate} from "../../../src/core/domain/format-preserving-date";
import {InstanceStatusType, ProductType, TargetAudienceType} from "../../../src/core/domain/types";
import {BestuurseenheidTestBuilder} from "./bestuureenheid-test-builder";

export function aMinimalInstance(): InstanceTestBuilder {
    const uniqueId = uuid();
    return new InstanceTestBuilder()
        .withId(buildInstanceIri(uniqueId))
        .withUuid(uniqueId)
        .withCreatedBy(buildBestuurseenheidIri(uuid()))
        .withDateCreated(InstanceTestBuilder.DATE_CREATED)
        .withDateModified(InstanceTestBuilder.DATE_MODIFIED)
        .withStatus(InstanceTestBuilder.STATUS);
}

export function aFullInstance(): InstanceTestBuilder {
    const uniqueId = uuid();
    return new InstanceTestBuilder()
        .withId(buildInstanceIri(uniqueId))
        .withUuid(uniqueId)
        .withCreatedBy(buildBestuurseenheidIri(uuid()))
        .withTitle(
            LanguageString.of(
                InstanceTestBuilder.TITLE_EN,
                InstanceTestBuilder.TITLE_NL,
                InstanceTestBuilder.TITLE_NL_FORMAL,
                InstanceTestBuilder.TITLE_NL_INFORMAL,
                InstanceTestBuilder.TITLE_NL_GENERATED_FORMAL,
                InstanceTestBuilder.TITLE_NL_GENERATED_INFORMAL))
        .withDescription(
            LanguageString.of(
                InstanceTestBuilder.DESCRIPTION_EN,
                InstanceTestBuilder.DESCRIPTION_NL,
                InstanceTestBuilder.DESCRIPTION_NL_FORMAL,
                InstanceTestBuilder.DESCRIPTION_NL_INFORMAL,
                InstanceTestBuilder.DESCRIPTION_NL_GENERATED_FORMAL,
                InstanceTestBuilder.DESCRIPTION_NL_GENERATED_INFORMAL))
        .withAdditionalDescription(
            LanguageString.of(
                InstanceTestBuilder.ADDITIONAL_DESCRIPTION_EN,
                undefined,
                InstanceTestBuilder.ADDITIONAL_DESCRIPTION_NL_FORMAL))
        .withException(
            LanguageString.of(
                InstanceTestBuilder.EXCEPTION_EN,
                undefined,
                InstanceTestBuilder.EXCEPTION_NL_FORMAL))
        .withRegulation(
            LanguageString.of(
                InstanceTestBuilder.REGULATION_EN,
                undefined,
                InstanceTestBuilder.REGULATION_NL_FORMAL))
        .withStartDate(InstanceTestBuilder.START_DATE)
        .withEndDate(InstanceTestBuilder.END_DATE)
        .withType(InstanceTestBuilder.TYPE)
        .withTargetAudiences(InstanceTestBuilder.TARGET_AUDIENCES)
        .withDateCreated(InstanceTestBuilder.DATE_CREATED)
        .withDateModified(InstanceTestBuilder.DATE_MODIFIED)
        .withStatus(InstanceTestBuilder.STATUS)
        .withSpatials(InstanceTestBuilder.SPATIALS)
        .withCompetentAuthorities(InstanceTestBuilder.COMPETENT_AUTHORITIES)
        .withExecutingAuthorities(InstanceTestBuilder.EXECUTING_AUTHORITIES);
}

export class InstanceTestBuilder {

    public static readonly TITLE_EN = 'Instance Title - en';
    public static readonly TITLE_NL = 'Instance Title - nl';
    public static readonly TITLE_NL_FORMAL = 'Instance Title - nl-formal';
    public static readonly TITLE_NL_INFORMAL = 'Instance Title - nl-informal';
    public static readonly TITLE_NL_GENERATED_FORMAL = 'Instance Title - nl-generated-formal';
    public static readonly TITLE_NL_GENERATED_INFORMAL = 'Instance Title - nl-generated-informal';

    public static readonly DESCRIPTION_EN = 'Instance Description - en';
    public static readonly DESCRIPTION_NL = 'Instance Description - nl';
    public static readonly DESCRIPTION_NL_FORMAL = 'Instance Description - nl-formal';
    public static readonly DESCRIPTION_NL_INFORMAL = 'Instance Description - nl-informal';
    public static readonly DESCRIPTION_NL_GENERATED_FORMAL = 'Instance Description - nl-generated-formal';
    public static readonly DESCRIPTION_NL_GENERATED_INFORMAL = 'Instance Description - nl-generated-informal';

    public static readonly DATE_CREATED = FormatPreservingDate.of('2022-10-01T13:00:42.074442Z');
    public static readonly DATE_MODIFIED = FormatPreservingDate.of('2023-10-02T20:00:20.242928Z');

    public static readonly STATUS = InstanceStatusType.ONTWERP;

    public static readonly SPATIALS = [buildSpatialRefNis2019Iri(randomNumber(10000, 19999)), buildSpatialRefNis2019Iri(randomNumber(20000, 29999))];

    public static readonly COMPETENT_AUTHORITIES = [BestuurseenheidTestBuilder.PEPINGEN_IRI, BestuurseenheidTestBuilder.HOUTHALEN_HELCHTEREN_IRI, BestuurseenheidTestBuilder.BORGLOON_IRI];

    public static readonly EXECUTING_AUTHORITIES = [BestuurseenheidTestBuilder.PEPINGEN_IRI, BestuurseenheidTestBuilder.OUD_HEVERLEE_IRI];

    public static readonly ADDITIONAL_DESCRIPTION_EN = 'Instance Additional Description - en';
    public static readonly ADDITIONAL_DESCRIPTION_NL_FORMAL = 'Instance Additional Description - nl-formal';
    public static readonly ADDITIONAL_DESCRIPTION_NL_INFORMAL = 'Instance Additional Description - nl-informal';

    public static readonly EXCEPTION_EN = 'Instance Exception - en';
    public static readonly EXCEPTION_NL_FORMAL = 'Instance Exception - nl-formal';
    public static readonly EXCEPTION_NL_INFORMAL = 'Instance Exception - nl-informal';

    public static readonly REGULATION_EN = 'Instance Regulation - en';
    public static readonly REGULATION_NL_FORMAL = 'Instance Regulation - nl-formal';
    public static readonly REGULATION_NL_INFORMAL = 'Instance Regulation - nl-informal';

    public static readonly START_DATE = FormatPreservingDate.of('2023-10-21 00:00:00Z');
    public static readonly END_DATE = FormatPreservingDate.of('2027-09-17 00:00:00.000Z');

    public static readonly TYPE = ProductType.BEWIJS;

    public static readonly TARGET_AUDIENCES = [TargetAudienceType.ORGANISATIE, TargetAudienceType.VERENIGING, TargetAudienceType.BURGER];

    private id: Iri;
    private uuid: string;
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
    private dateCreated: FormatPreservingDate;
    private dateModified: FormatPreservingDate;
    private status: InstanceStatusType;
    private spatials: Iri[] = [];
    private competentAuthorities: Iri[] = [];
    private executingAuthorities: Iri[] = [];

    public withId(id: Iri): InstanceTestBuilder {
        this.id = id;
        return this;
    }

    public withUuid(uuid: string): InstanceTestBuilder {
        this.uuid = uuid;
        return this;
    }

    public withCreatedBy(createdBy: Iri): InstanceTestBuilder {
        this.createdBy = createdBy;
        return this;
    }

    public withTitle(title: LanguageString): InstanceTestBuilder {
        this.title = title;
        return this;
    }

    public withDescription(description: LanguageString): InstanceTestBuilder {
        this.description = description;
        return this;
    }

    public withAdditionalDescription(additionalDescription: LanguageString): InstanceTestBuilder {
        this.additionalDescription = additionalDescription;
        return this;
    }

    public withException(exception: LanguageString): InstanceTestBuilder {
        this.exception = exception;
        return this;
    }

    public withRegulation(regulation: LanguageString): InstanceTestBuilder {
        this.regulation = regulation;
        return this;
    }

    public withStartDate(startDate: FormatPreservingDate): InstanceTestBuilder {
        this.startDate = startDate;
        return this;
    }

    public withEndDate(endDate: FormatPreservingDate): InstanceTestBuilder {
        this.endDate = endDate;
        return this;
    }

    public withType(type: ProductType): InstanceTestBuilder {
        this.type = type;
        return this;
    }

    public withTargetAudiences(targetAudiences: TargetAudienceType[]): InstanceTestBuilder {
        this.targetAudiences = targetAudiences;
        return this;
    }

    public withDateCreated(dateCreated: FormatPreservingDate): InstanceTestBuilder {
        this.dateCreated = dateCreated;
        return this;
    }

    public withDateModified(dateModified: FormatPreservingDate): InstanceTestBuilder {
        this.dateModified = dateModified;
        return this;
    }

    public withStatus(status: InstanceStatusType): InstanceTestBuilder {
        this.status = status;
        return this;
    }

    public withSpatials(spatials: Iri[]): InstanceTestBuilder {
        this.spatials = spatials;
        return this;
    }

    public withCompetentAuthorities(competentAuthorities: Iri[]): InstanceTestBuilder {
        this.competentAuthorities = competentAuthorities;
        return this;
    }

    public withExecutingAuthorities(executingAuthorities: Iri[]): InstanceTestBuilder {
        this.executingAuthorities = executingAuthorities;
        return this;
    }

    public build(): Instance {
        return new Instance(
            this.id,
            this.uuid,
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
            this.dateCreated,
            this.dateModified,
            this.status,
            this.spatials,
            this.competentAuthorities,
            this.executingAuthorities,
        );
    }
}


