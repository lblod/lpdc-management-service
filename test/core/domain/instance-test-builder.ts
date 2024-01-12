import {Iri} from "../../../src/core/domain/shared/iri";
import {LanguageString} from "../../../src/core/domain/language-string";
import {Instance} from "../../../src/core/domain/instance";
import {buildBestuurseenheidIri, buildInstanceIri} from "./iri-test-builder";
import {uuid} from "../../../mu-helper";

export function aMinimalInstance(): InstanceTestBuilder {
    const uniqueId = uuid();
    return new InstanceTestBuilder()
        .withId(buildInstanceIri(uniqueId))
        .withUuid(uniqueId)
        .withBestuurseenheidId(buildBestuurseenheidIri(uuid()));
}

export function aFullInstance(): InstanceTestBuilder {
    const uniqueId = uuid();
    return new InstanceTestBuilder()
        .withId(buildInstanceIri(uniqueId))
        .withUuid(uniqueId)
        .withBestuurseenheidId(uuid())
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
                InstanceTestBuilder.DESCRIPTION_NL_GENERATED_INFORMAL));

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


    private id: Iri;
    private uuid: string;
    private bestuurseenheidId: Iri;
    private title: LanguageString | undefined;
    private description: LanguageString | undefined;


    public withId(id: Iri): InstanceTestBuilder {
        this.id = id;
        return this;
    }

    public withUuid(uuid: string): InstanceTestBuilder {
        this.uuid = uuid;
        return this;
    }

    public withBestuurseenheidId(bestuurseenheidId: Iri): InstanceTestBuilder {
        this.bestuurseenheidId = bestuurseenheidId;
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

    public build(): Instance {
        return new Instance(
            this.id,
            this.uuid,
            this.bestuurseenheidId,
            this.title,
            this.description
        );
    }
}


