import {uuid} from "../../../mu-helper";
import {LanguageString} from "../../../src/core/domain/language-string";
import {ProcedureBuilder} from "../../../src/core/domain/procedure";
import {
    aFullWebsite,
    aFullWebsiteForInstance,
    anotherFullWebsite,
    anotherFullWebsiteForInstance
} from "./website-test-builder";
import {aMinimalLanguageString} from "./language-string-test-builder";

export function aMinimalProcedureForConceptSnapshot(): ProcedureBuilder {
    return new ProcedureBuilder()
        .withId(ProcedureBuilder.buildIri(uuid()))
        .withTitle(aMinimalLanguageString(ProcedureTestBuilder.TITLE).build())
        .withDescription(aMinimalLanguageString(ProcedureTestBuilder.DESCRIPTION).build())
        .withOrder(1);
}

export function aMinimalProcedureForConcept(): ProcedureBuilder {
    const uniqueId = uuid();
    return new ProcedureBuilder()
        .withId(ProcedureBuilder.buildIri(uniqueId))
        .withUuid(uniqueId)
        .withTitle(aMinimalLanguageString(ProcedureTestBuilder.TITLE).build())
        .withDescription(aMinimalLanguageString(ProcedureTestBuilder.DESCRIPTION).build())
        .withOrder(1);
}

export function aMinimalProcedureForInstance(): ProcedureBuilder {
    const uniqueId = uuid();
    return new ProcedureBuilder()
        .withId(ProcedureBuilder.buildIri(uniqueId))
        .withUuid(uniqueId)
        .withOrder(1);
}

export function aFullProcedure(): ProcedureBuilder {
    const uniqueId = uuid();
    return new ProcedureBuilder()
        .withId(ProcedureBuilder.buildIri(uniqueId))
        .withUuid(uniqueId)
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
        .withOrder(1)
        .withWebsites(ProcedureTestBuilder.WEBSITES);
}

export function anotherFullProcedure(): ProcedureBuilder {
    return new ProcedureBuilder()
        .withId(ProcedureBuilder.buildIri(uuid()))
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
        .withOrder(2)
        .withWebsites(ProcedureTestBuilder.ANOTHER_WEBSITES);
}

export function aFullProcedureForInstance(): ProcedureBuilder {
    const uniqueId = uuid();
    return new ProcedureBuilder()
        .withId(ProcedureBuilder.buildIri(uniqueId))
        .withUuid(uniqueId)
        .withTitle(LanguageString.of(
            ProcedureTestBuilder.TITLE_EN,
            undefined,
            ProcedureTestBuilder.TITLE_NL_FORMAL
        ))
        .withDescription(
            LanguageString.of(
                ProcedureTestBuilder.DESCRIPTION_EN,
                undefined,
                ProcedureTestBuilder.DESCRIPTION_NL_FORMAL
            ))
        .withOrder(1)
        .withWebsites(ProcedureTestBuilder.WEBSITES_FOR_INSTANCE);
}

export function anotherFullProcedureForInstance() {
    return new ProcedureBuilder()
        .withId(ProcedureBuilder.buildIri(uuid()))
        .withTitle(LanguageString.of(
            ProcedureTestBuilder.ANOTHER_TITLE_EN,
            undefined,
            ProcedureTestBuilder.ANOTHER_TITLE_NL_FORMAL
        ))
        .withDescription(LanguageString.of(
            ProcedureTestBuilder.ANOTHER_DESCRIPTION_EN,
            undefined,
            ProcedureTestBuilder.ANOTHER_DESCRIPTION_NL_FORMAL
        ))
        .withOrder(2)
        .withWebsites(ProcedureTestBuilder.ANOTHER_WEBSITES_FOR_INSTANCE);
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

    public static readonly WEBSITES = [aFullWebsite().withOrder(1).build(), anotherFullWebsite(uuid()).withOrder(2).build()];
    public static readonly ANOTHER_WEBSITES = [anotherFullWebsite(uuid()).withOrder(1).build(), anotherFullWebsite(uuid()).withOrder(2).build()];
    public static readonly WEBSITES_FOR_INSTANCE = [aFullWebsiteForInstance().withOrder(1).build(), anotherFullWebsiteForInstance(uuid()).withOrder(2).build()];
    public static readonly ANOTHER_WEBSITES_FOR_INSTANCE = [anotherFullWebsiteForInstance(uuid()).withOrder(1).build(), anotherFullWebsiteForInstance(uuid()).withOrder(2).build()];

}