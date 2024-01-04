import {uuid} from "../../../mu-helper";
import {LanguageString} from "../../../src/core/domain/language-string";
import {Iri} from "../../../src/core/domain/shared/iri";
import {Website} from "../../../src/core/domain/website";

export function aMinimalWebsite(): WebsiteTestBuilder {
    return new WebsiteTestBuilder()
        .withId(WebsiteTestBuilder.buildIri(uuid()))
        .withUrl(WebsiteTestBuilder.URL);
}

export function aFullWebsite(): WebsiteTestBuilder {
    return new WebsiteTestBuilder()
        .withId(WebsiteTestBuilder.buildIri(uuid()))
        .withTitle(LanguageString.of(
            WebsiteTestBuilder.TITLE_EN,
            WebsiteTestBuilder.TITLE_NL,
            WebsiteTestBuilder.TITLE_NL_FORMAL,
            WebsiteTestBuilder.TITLE_NL_INFORMAL,
            WebsiteTestBuilder.TITLE_NL_GENERATED_FORMAL,
            WebsiteTestBuilder.TITLE_NL_GENERATED_INFORMAL))
        .withDescription(
            LanguageString.of(
                WebsiteTestBuilder.DESCRIPTION_EN,
                WebsiteTestBuilder.DESCRIPTION_NL,
                WebsiteTestBuilder.DESCRIPTION_NL_FORMAL,
                WebsiteTestBuilder.DESCRIPTION_NL_INFORMAL,
                WebsiteTestBuilder.DESCRIPTION_NL_GENERATED_FORMAL,
                WebsiteTestBuilder.DESCRIPTION_NL_GENERATED_INFORMAL))
        .withUrl(WebsiteTestBuilder.URL);
}

export function anotherFullWebsite(aUuid: string): WebsiteTestBuilder {
    return new WebsiteTestBuilder()
        .withId(WebsiteTestBuilder.buildIri(aUuid))
        .withTitle(LanguageString.of(
            WebsiteTestBuilder.ANOTHER_TITLE_TEMPLATE_EN(aUuid),
            WebsiteTestBuilder.ANOTHER_TITLE_TEMPLATE_NL(aUuid),
            WebsiteTestBuilder.ANOTHER_TITLE_TEMPLATE_NL_FORMAL(aUuid),
            WebsiteTestBuilder.ANOTHER_TITLE_TEMPLATE_NL_INFORMAL(aUuid),
            WebsiteTestBuilder.ANOTHER_TITLE_TEMPLATE_NL_GENERATED_FORMAL(aUuid),
            WebsiteTestBuilder.ANOTHER_TITLE_TEMPLATE_NL_GENERATED_INFORMAL(aUuid)))
        .withDescription(
            LanguageString.of(
                WebsiteTestBuilder.ANOTHER_DESCRIPTION_TEMPLATE_EN(aUuid),
                WebsiteTestBuilder.ANOTHER_DESCRIPTION_TEMPLATE_NL(aUuid),
                WebsiteTestBuilder.ANOTHER_DESCRIPTION_TEMPLATE_NL_FORMAL(aUuid),
                WebsiteTestBuilder.ANOTHER_DESCRIPTION_TEMPLATE_NL_INFORMAL(aUuid),
                WebsiteTestBuilder.ANOTHER_DESCRIPTION_TEMPLATE_NL_GENERATED_FORMAL(aUuid),
                WebsiteTestBuilder.ANOTHER_DESCRIPTION_TEMPLATE_NL_GENERATED_INFORMAL(aUuid)))
        .withUrl(WebsiteTestBuilder.ANOTHER_URL_TEMPLATE(aUuid));
}

export class WebsiteTestBuilder {

    public static readonly TITLE_EN = 'Website Title - en';
    public static readonly TITLE_NL = 'Website Title - nl';
    public static readonly TITLE_NL_FORMAL = 'Website Title - nl-formal';
    public static readonly TITLE_NL_INFORMAL = 'Website Title - nl-informal';
    public static readonly TITLE_NL_GENERATED_FORMAL = 'Website Title - nl-generated-formal';
    public static readonly TITLE_NL_GENERATED_INFORMAL = 'Website Title - nl-generated-informal';

    public static readonly DESCRIPTION_EN = 'Website Description - en';
    public static readonly DESCRIPTION_NL = 'Website Description - nl';
    public static readonly DESCRIPTION_NL_FORMAL = 'Website Description - nl-formal';
    public static readonly DESCRIPTION_NL_INFORMAL = 'Website Description - nl-informal';
    public static readonly DESCRIPTION_NL_GENERATED_FORMAL = 'Website Description - nl-generated-formal';
    public static readonly DESCRIPTION_NL_GENERATED_INFORMAL = 'Website Description - nl-generated-informal';

    public static readonly ANOTHER_TITLE_TEMPLATE_EN = (param: string) => `Website Another Title - en - ${param}`;
    public static readonly ANOTHER_TITLE_TEMPLATE_NL = (param: string) => `Website Another Title - nl - ${param}`;
    public static readonly ANOTHER_TITLE_TEMPLATE_NL_FORMAL = (param: string) => `Website Another Title - nl-formal - ${param}`;
    public static readonly ANOTHER_TITLE_TEMPLATE_NL_INFORMAL = (param: string) => `Website Another Title - nl-informal - ${param}`;
    public static readonly ANOTHER_TITLE_TEMPLATE_NL_GENERATED_FORMAL = (param: string) => `Website Another Title - nl-generated-formal - ${param}`;
    public static readonly ANOTHER_TITLE_TEMPLATE_NL_GENERATED_INFORMAL = (param: string) => `Website Another Title - nl-generated-informal - ${param}`;

    public static readonly ANOTHER_DESCRIPTION_TEMPLATE_EN = (param: string) => `Website Another Description - en - ${param}`;
    public static readonly ANOTHER_DESCRIPTION_TEMPLATE_NL = (param: string) => `Website Another Description - nl - ${param}`;
    public static readonly ANOTHER_DESCRIPTION_TEMPLATE_NL_FORMAL = (param: string) => `Website Another Description - nl-formal - ${param}`;
    public static readonly ANOTHER_DESCRIPTION_TEMPLATE_NL_INFORMAL = (param: string) => `Website Another Description - nl-informal - ${param}`;
    public static readonly ANOTHER_DESCRIPTION_TEMPLATE_NL_GENERATED_FORMAL = (param: string) => `Website Another Description - nl-generated-formal - ${param}`;
    public static readonly ANOTHER_DESCRIPTION_TEMPLATE_NL_GENERATED_INFORMAL = (param: string) => `Website Another Description - nl-generated-informal - ${param}`;

    public static readonly URL = 'https://some-url.test';
    public static readonly ANOTHER_URL_TEMPLATE = (param: string) => `https://some-other-url-${param}.test`;

    private id: Iri;
    private uuid: string | undefined;
    private title: LanguageString | undefined;
    private description: LanguageString | undefined;
    private url: string | undefined;

    static buildIri(uniqueId: string): Iri {
        return `http://data.lblod.info/id/website/${uniqueId}`;
    }

    public withId(id: Iri): WebsiteTestBuilder {
        this.id = id;
        return this;
    }

    public withUuid(uuid: string): WebsiteTestBuilder {
        this.uuid = uuid;
        return this;
    }

    public withTitle(title: LanguageString): WebsiteTestBuilder {
        this.title = title;
        return this;
    }

    public withDescription(description: LanguageString): WebsiteTestBuilder {
        this.description = description;
        return this;
    }

    public withUrl(url: string): WebsiteTestBuilder {
        this.url = url;
        return this;
    }

    public build(): Website {
        return new Website(
            this.id,
            this.uuid,
            this.title,
            this.description,
            this.url);
    }


}