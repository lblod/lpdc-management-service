import {uuid} from "../../../mu-helper";
import {LanguageString} from "../../../src/core/domain/language-string";
import {Iri} from "../../../src/core/domain/shared/iri";
import {Procedure} from "../../../src/core/domain/procedure";
import {aFullWebsite, anotherFullWebsite} from "./website-test-builder";
import {Website} from "../../../src/core/domain/website";
import {aMinimalLanguageString} from "./language-string-test-builder";

export function aMinimalProcedure(): ProcedureTestBuilder {
    return new ProcedureTestBuilder()
        .withId(ProcedureTestBuilder.buildIri(uuid()))
        .withTitle(aMinimalLanguageString(ProcedureTestBuilder.TITLE).build())
        .withDescription(aMinimalLanguageString(ProcedureTestBuilder.DESCRIPTION).build());
}

export function aFullProcedure(): ProcedureTestBuilder {
    return new ProcedureTestBuilder()
        .withId(ProcedureTestBuilder.buildIri(uuid()))
        .withTitle(LanguageString.of(
            ProcedureTestBuilder.TITLE_EN,
            ProcedureTestBuilder.TITLE_NL,
            ProcedureTestBuilder.TITLE_NL_FORMAL,
            ProcedureTestBuilder.TITLE_NL_INFORMAL,
            ProcedureTestBuilder.TITLE_NL_GENERATED_FORMAL,
            ProcedureTestBuilder.TITLE_NL_GENERATED_INFORMAL))
        .withDescription(
            LanguageString.of(
                ProcedureTestBuilder.DESCRIPTION_EN,
                ProcedureTestBuilder.DESCRIPTION_NL,
                ProcedureTestBuilder.DESCRIPTION_NL_FORMAL,
                ProcedureTestBuilder.DESCRIPTION_NL_INFORMAL,
                ProcedureTestBuilder.DESCRIPTION_NL_GENERATED_FORMAL,
                ProcedureTestBuilder.DESCRIPTION_NL_GENERATED_INFORMAL))
        .withWebsites(ProcedureTestBuilder.WEBSITES);
}

export function anotherFullProcedure(): ProcedureTestBuilder {
    return new ProcedureTestBuilder()
        .withId(ProcedureTestBuilder.buildIri(uuid()))
        .withTitle(LanguageString.of(
            ProcedureTestBuilder.ANOTHER_TITLE_EN,
            ProcedureTestBuilder.ANOTHER_TITLE_NL,
            ProcedureTestBuilder.ANOTHER_TITLE_NL_FORMAL,
            ProcedureTestBuilder.ANOTHER_TITLE_NL_INFORMAL,
            ProcedureTestBuilder.ANOTHER_TITLE_NL_GENERATED_FORMAL,
            ProcedureTestBuilder.ANOTHER_TITLE_NL_GENERATED_INFORMAL))
        .withDescription(
            LanguageString.of(
                ProcedureTestBuilder.ANOTHER_DESCRIPTION_EN,
                ProcedureTestBuilder.ANOTHER_DESCRIPTION_NL,
                ProcedureTestBuilder.ANOTHER_DESCRIPTION_NL_FORMAL,
                ProcedureTestBuilder.ANOTHER_DESCRIPTION_NL_INFORMAL,
                ProcedureTestBuilder.ANOTHER_DESCRIPTION_NL_GENERATED_FORMAL,
                ProcedureTestBuilder.ANOTHER_DESCRIPTION_NL_GENERATED_INFORMAL))
        .withWebsites(ProcedureTestBuilder.ANOTHER_WEBSITES);
}

export class ProcedureTestBuilder {

    public static readonly TITLE = 'Procedure Title';
    public static readonly TITLE_EN = 'Procedure Title - en';
    public static readonly TITLE_NL = 'Procedure Title - nl';
    public static readonly TITLE_NL_FORMAL = 'Procedure Title - nl-formal';
    public static readonly TITLE_NL_INFORMAL = 'Procedure Title - nl-informal';
    public static readonly TITLE_NL_GENERATED_FORMAL = 'Procedure Title - nl-generated-formal';
    public static readonly TITLE_NL_GENERATED_INFORMAL = 'Procedure Title - nl-generated-informal';

    public static readonly DESCRIPTION = 'Procedure Description';
    public static readonly DESCRIPTION_EN = 'Procedure Description - en';
    public static readonly DESCRIPTION_NL = 'Procedure Description - nl';
    public static readonly DESCRIPTION_NL_FORMAL = 'Procedure Description - nl-formal';
    public static readonly DESCRIPTION_NL_INFORMAL = 'Procedure Description - nl-informal';
    public static readonly DESCRIPTION_NL_GENERATED_FORMAL = 'Procedure Description - nl-generated-formal';
    public static readonly DESCRIPTION_NL_GENERATED_INFORMAL = 'Procedure Description - nl-generated-informal';

    public static readonly ANOTHER_TITLE_EN = 'Procedure Another Title - en';
    public static readonly ANOTHER_TITLE_NL = 'Procedure Another Title - nl';
    public static readonly ANOTHER_TITLE_NL_FORMAL = 'Procedure Another Title - nl-formal';
    public static readonly ANOTHER_TITLE_NL_INFORMAL = 'Procedure Another Title - nl-informal';
    public static readonly ANOTHER_TITLE_NL_GENERATED_FORMAL = 'Procedure Another Title - nl-generated-formal';
    public static readonly ANOTHER_TITLE_NL_GENERATED_INFORMAL = 'Procedure Another Title - nl-generated-informal';

    public static readonly ANOTHER_DESCRIPTION_EN = 'Procedure Another Description - en';
    public static readonly ANOTHER_DESCRIPTION_NL = 'Procedure Another Description - nl';
    public static readonly ANOTHER_DESCRIPTION_NL_FORMAL = 'Procedure Another Description - nl-formal';
    public static readonly ANOTHER_DESCRIPTION_NL_INFORMAL = 'Procedure Another Description - nl-informal';
    public static readonly ANOTHER_DESCRIPTION_NL_GENERATED_FORMAL = 'Procedure Another Description - nl-generated-formal';
    public static readonly ANOTHER_DESCRIPTION_NL_GENERATED_INFORMAL = 'Procedure Another Description - nl-generated-informal';

    public static readonly WEBSITES = [aFullWebsite().build(), anotherFullWebsite(uuid()).build()];
    public static readonly ANOTHER_WEBSITES = [anotherFullWebsite(uuid()).build(), anotherFullWebsite(uuid()).build()];

    private id: Iri;
    private uuid: string | undefined;
    private title: LanguageString | undefined;
    private description: LanguageString | undefined;
    private websites: Website[] = [];

    static buildIri(uniqueId: string): Iri {
        return new Iri(`http://data.lblod.info/id/rule/${uniqueId}`);
    }

    public withId(id: Iri): ProcedureTestBuilder {
        this.id = id;
        return this;
    }

    public withUuid(uuid: string): ProcedureTestBuilder {
        this.uuid = uuid;
        return this;
    }

    public withTitle(title: LanguageString): ProcedureTestBuilder {
        this.title = title;
        return this;
    }

    public withDescription(description: LanguageString): ProcedureTestBuilder {
        this.description = description;
        return this;
    }

    public withWebsites(websites: Website[]): ProcedureTestBuilder {
        this.websites = websites;
        return this;
    }

    public build(): Procedure {
        return new Procedure(
            this.id,
            this.uuid,
            this.title,
            this.description,
            this.websites,
        );
    }

}