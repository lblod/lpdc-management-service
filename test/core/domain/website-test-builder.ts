import {uuid} from "mu";
import {LanguageString} from "../../../src/core/domain/language-string";
import {aMinimalInformalLanguageString, aMinimalLanguageString} from "./language-string-test-builder";
import {WebsiteBuilder} from "../../../src/core/domain/website";

export function aMinimalWebsiteForConceptSnapshot(): WebsiteBuilder {
    return new WebsiteBuilder()
        .withId(WebsiteBuilder.buildIri(uuid()))
        .withTitle(aMinimalLanguageString(WebsiteTestBuilder.TITLE).build())
        .withOrder(1)
        .withUrl(WebsiteTestBuilder.URL);
}

export function aMinimalWebsiteForConcept(): WebsiteBuilder {
    const uniqueId = uuid();
    return new WebsiteBuilder()
        .withId(WebsiteBuilder.buildIri(uniqueId))
        .withUuid(uniqueId)
        .withTitle(aMinimalLanguageString(WebsiteTestBuilder.TITLE).build())
        .withOrder(1)
        .withUrl(WebsiteTestBuilder.URL);
}

export function aMinimalWebsiteForInstance(): WebsiteBuilder {
    const uniqueId = uuid();
    return new WebsiteBuilder()
        .withId(WebsiteBuilder.buildIri(uniqueId))
        .withUuid(uniqueId)
        .withOrder(1);
}

export function aMinimalWebsiteForInstanceSnapshot(): WebsiteBuilder {
    const uniqueId = uuid();
    return new WebsiteBuilder()
        .withId(WebsiteBuilder.buildIri(uniqueId))
        .withTitle(aMinimalInformalLanguageString(WebsiteTestBuilder.TITLE).build())
        .withOrder(1)
        .withUrl(WebsiteTestBuilder.URL);
}

export function aFullWebsite(): WebsiteBuilder {
    const uniqueId = uuid();
    return new WebsiteBuilder()
        .withId(WebsiteBuilder.buildIri(uniqueId))
        .withUuid(uniqueId)
        .withTitle(LanguageString.of(
            WebsiteTestBuilder.TITLE_NL,
            WebsiteTestBuilder.TITLE_NL_FORMAL,
            WebsiteTestBuilder.TITLE_NL_INFORMAL,
            WebsiteTestBuilder.TITLE_NL_GENERATED_FORMAL,
            WebsiteTestBuilder.TITLE_NL_GENERATED_INFORMAL))
        .withDescription(
            LanguageString.of(
                WebsiteTestBuilder.DESCRIPTION_NL,
                WebsiteTestBuilder.DESCRIPTION_NL_FORMAL,
                WebsiteTestBuilder.DESCRIPTION_NL_INFORMAL,
                WebsiteTestBuilder.DESCRIPTION_NL_GENERATED_FORMAL,
                WebsiteTestBuilder.DESCRIPTION_NL_GENERATED_INFORMAL))
        .withOrder(1)
        .withUrl(WebsiteTestBuilder.URL);
}

export function anotherFullWebsite(aUuid: string): WebsiteBuilder {
    return new WebsiteBuilder()
        .withId(WebsiteBuilder.buildIri(aUuid))
        .withUuid(aUuid)
        .withTitle(LanguageString.of(
            WebsiteTestBuilder.ANOTHER_TITLE_TEMPLATE_NL(aUuid),
            WebsiteTestBuilder.ANOTHER_TITLE_TEMPLATE_NL_FORMAL(aUuid),
            WebsiteTestBuilder.ANOTHER_TITLE_TEMPLATE_NL_INFORMAL(aUuid),
            WebsiteTestBuilder.ANOTHER_TITLE_TEMPLATE_NL_GENERATED_FORMAL(aUuid),
            WebsiteTestBuilder.ANOTHER_TITLE_TEMPLATE_NL_GENERATED_INFORMAL(aUuid)))
        .withDescription(
            LanguageString.of(
                WebsiteTestBuilder.ANOTHER_DESCRIPTION_TEMPLATE_NL(aUuid),
                WebsiteTestBuilder.ANOTHER_DESCRIPTION_TEMPLATE_NL_FORMAL(aUuid),
                WebsiteTestBuilder.ANOTHER_DESCRIPTION_TEMPLATE_NL_INFORMAL(aUuid),
                WebsiteTestBuilder.ANOTHER_DESCRIPTION_TEMPLATE_NL_GENERATED_FORMAL(aUuid),
                WebsiteTestBuilder.ANOTHER_DESCRIPTION_TEMPLATE_NL_GENERATED_INFORMAL(aUuid)))
        .withOrder(2)
        .withUrl(WebsiteTestBuilder.ANOTHER_URL_TEMPLATE(aUuid));
}

export function aFullWebsiteForInstance(): WebsiteBuilder {
    const uniqueId = uuid();
    return new WebsiteBuilder()
        .withId(WebsiteBuilder.buildIri(uniqueId))
        .withUuid(uniqueId)
        .withTitle(LanguageString.of(
            undefined,
            WebsiteTestBuilder.TITLE_NL_FORMAL))
        .withDescription(
            LanguageString.of(
                undefined,
                WebsiteTestBuilder.DESCRIPTION_NL_FORMAL))
        .withOrder(1)
        .withUrl(WebsiteTestBuilder.URL);
}

export function anotherFullWebsiteForInstance(aUuid: string): WebsiteBuilder {
    const uniqueId = uuid();
    return new WebsiteBuilder()
        .withId(WebsiteBuilder.buildIri(uniqueId))
        .withUuid(uniqueId)
        .withTitle(LanguageString.of(
            undefined,
            WebsiteTestBuilder.ANOTHER_TITLE_TEMPLATE_NL_FORMAL(aUuid)))
        .withDescription(LanguageString.of(
            undefined,
            WebsiteTestBuilder.ANOTHER_DESCRIPTION_TEMPLATE_NL_FORMAL(aUuid)))
        .withOrder(2)
        .withUrl(WebsiteTestBuilder.ANOTHER_URL_TEMPLATE(aUuid));
}

export function aFullWebsiteForInstanceSnapshot(): WebsiteBuilder {
    const uniqueId = uuid();
    return new WebsiteBuilder()
        .withId(WebsiteBuilder.buildIri(uniqueId))
        .withTitle(LanguageString.of(
            undefined,
            undefined,
            WebsiteTestBuilder.TITLE_NL_INFORMAL))
        .withDescription(
            LanguageString.of(
                undefined,
                undefined,
                WebsiteTestBuilder.DESCRIPTION_NL_INFORMAL))
        .withOrder(1)
        .withUrl(WebsiteTestBuilder.URL);
}

export function anotherFullWebsiteForInstanceSnapshot(aUuid: string): WebsiteBuilder {
    const uniqueId = uuid();
    return new WebsiteBuilder()
        .withId(WebsiteBuilder.buildIri(uniqueId))
        .withTitle(LanguageString.of(
            undefined,
            undefined,
            WebsiteTestBuilder.ANOTHER_TITLE_TEMPLATE_NL_INFORMAL(aUuid)))
        .withDescription(LanguageString.of(
            undefined,
            undefined,
            WebsiteTestBuilder.ANOTHER_DESCRIPTION_TEMPLATE_NL_INFORMAL(aUuid)))
        .withOrder(2)
        .withUrl(WebsiteTestBuilder.ANOTHER_URL_TEMPLATE(aUuid));
}

export class WebsiteTestBuilder {

    public static readonly TITLE = 'Website Title';
    public static readonly TITLE_NL = 'Website Title - nl';
    public static readonly TITLE_NL_FORMAL = 'Website Title - nl-formal';
    public static readonly TITLE_NL_INFORMAL = 'Website Title - nl-informal';
    public static readonly TITLE_NL_GENERATED_FORMAL = 'Website Title - nl-generated-formal';
    public static readonly TITLE_NL_GENERATED_INFORMAL = 'Website Title - nl-generated-informal';

    public static readonly DESCRIPTION = 'Website Description';
    public static readonly DESCRIPTION_NL = 'Website Description - nl';
    public static readonly DESCRIPTION_NL_FORMAL = 'Website Description - nl-formal';
    public static readonly DESCRIPTION_NL_INFORMAL = 'Website Description - nl-informal';
    public static readonly DESCRIPTION_NL_GENERATED_FORMAL = 'Website Description - nl-generated-formal';
    public static readonly DESCRIPTION_NL_GENERATED_INFORMAL = 'Website Description - nl-generated-informal';

    public static readonly ANOTHER_TITLE_TEMPLATE_NL = (param: string) => `Website Another Title - nl - ${param}`;
    public static readonly ANOTHER_TITLE_TEMPLATE_NL_FORMAL = (param: string) => `Website Another Title - nl-formal - ${param}`;
    public static readonly ANOTHER_TITLE_TEMPLATE_NL_INFORMAL = (param: string) => `Website Another Title - nl-informal - ${param}`;
    public static readonly ANOTHER_TITLE_TEMPLATE_NL_GENERATED_FORMAL = (param: string) => `Website Another Title - nl-generated-formal - ${param}`;
    public static readonly ANOTHER_TITLE_TEMPLATE_NL_GENERATED_INFORMAL = (param: string) => `Website Another Title - nl-generated-informal - ${param}`;

    public static readonly ANOTHER_DESCRIPTION_TEMPLATE_NL = (param: string) => `Website Another Description - nl - ${param}`;
    public static readonly ANOTHER_DESCRIPTION_TEMPLATE_NL_FORMAL = (param: string) => `Website Another Description - nl-formal - ${param}`;
    public static readonly ANOTHER_DESCRIPTION_TEMPLATE_NL_INFORMAL = (param: string) => `Website Another Description - nl-informal - ${param}`;
    public static readonly ANOTHER_DESCRIPTION_TEMPLATE_NL_GENERATED_FORMAL = (param: string) => `Website Another Description - nl-generated-formal - ${param}`;
    public static readonly ANOTHER_DESCRIPTION_TEMPLATE_NL_GENERATED_INFORMAL = (param: string) => `Website Another Description - nl-generated-informal - ${param}`;

    public static readonly URL = 'https://some-url.test';
    public static readonly ANOTHER_URL_TEMPLATE = (param: string) => `https://some-other-url-${param}.test`;

}
