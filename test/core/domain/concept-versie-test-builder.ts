import {Iri} from "../../../src/core/domain/shared/iri";
import {uuid} from "../../../mu-helper";
import {ConceptVersie, ProductType} from "../../../src/core/domain/concept-versie";
import {TaalString} from "../../../src/core/domain/taal-string";

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

    private id: Iri;
    private title: TaalString | undefined;
    private description: TaalString | undefined;
    private additionalDescription: TaalString | undefined;
    private exception: TaalString | undefined;
    private regulation: TaalString | undefined;
    private startDate: Date | undefined;
    private endDate: Date | undefined;
    private type: ProductType | undefined;

    static buildIri(uniqueId: string): Iri {
        return `https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${uniqueId}`;
    }

    static aMinimalConceptVersie(): ConceptVersieTestBuilder {
        return new ConceptVersieTestBuilder()
            .withId(ConceptVersieTestBuilder.buildIri(uuid()));
    }

    static aFullConceptVersie(): ConceptVersieTestBuilder {
        return new ConceptVersieTestBuilder()
            .withId(ConceptVersieTestBuilder.buildIri(uuid()))
            .withTitle(
                TaalString.of(
                    this.TITLE_EN,
                    this.TITLE_NL,
                    this.TITLE_NL_FORMAL,
                    this.TITLE_NL_INFORMAL,
                    this.TITLE_NL_GENERATED_FORMAL,
                    this.TITLE_NL_GENERATED_INFORMAL))
            .withDescription(
                TaalString.of(
                    this.DESCRIPTION_EN,
                    this.DESCRIPTION_NL,
                    this.DESCRIPTION_NL_FORMAL,
                    this.DESCRIPTION_NL_INFORMAL,
                    this.DESCRIPTION_NL_GENERATED_FORMAL,
                    this.DESCRIPTION_NL_GENERATED_INFORMAL))
            .withAdditionalDescription(
                TaalString.of(
                    this.ADDITIONAL_DESCRIPTION_EN,
                    this.ADDITIONAL_DESCRIPTION_NL,
                    this.ADDITIONAL_DESCRIPTION_NL_FORMAL,
                    this.ADDITIONAL_DESCRIPTION_NL_INFORMAL,
                    this.ADDITIONAL_DESCRIPTION_NL_GENERATED_FORMAL,
                    this.ADDITIONAL_DESCRIPTION_NL_GENERATED_INFORMAL))
            .withException(
                TaalString.of(
                    this.EXCEPTION_EN,
                    this.EXCEPTION_NL,
                    this.EXCEPTION_NL_FORMAL,
                    this.EXCEPTION_NL_INFORMAL,
                    this.EXCEPTION_NL_GENERATED_FORMAL,
                    this.EXCEPTION_NL_GENERATED_INFORMAL))
            .withRegulation(
                TaalString.of(
                    this.REGULATION_EN,
                    this.REGULATION_NL,
                    this.REGULATION_NL_FORMAL,
                    this.REGULATION_NL_INFORMAL,
                    this.REGULATION_NL_GENERATED_FORMAL,
                    this.REGULATION_NL_GENERATED_INFORMAL))
            .withStartDate(this.START_DATE)
            .withEndDate(this.END_DATE)
            .withType(this.TYPE);
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
            this.type);
    }

}