import {uuid} from "../../../mu-helper";
import {LanguageString} from "../../../src/core/domain/language-string";
import {Iri} from "../../../src/core/domain/shared/iri";
import {Evidence} from "../../../src/core/domain/evidence";


export function aMinimalEvidence(): EvidenceTestBuilder {
    return new EvidenceTestBuilder()
        .withId(EvidenceTestBuilder.buildIri(uuid()));
}

export function aFullEvidence(): EvidenceTestBuilder {
    return new EvidenceTestBuilder()
        .withId(EvidenceTestBuilder.buildIri(uuid()))
        .withTitle(LanguageString.of(
            EvidenceTestBuilder.TITLE_EN,
            EvidenceTestBuilder.TITLE_NL,
            EvidenceTestBuilder.TITLE_NL_FORMAL,
            EvidenceTestBuilder.TITLE_NL_INFORMAL,
            EvidenceTestBuilder.TITLE_NL_GENERATED_FORMAL,
            EvidenceTestBuilder.TITLE_NL_GENERATED_INFORMAL))
        .withDescription(
            LanguageString.of(
                EvidenceTestBuilder.DESCRIPTION_EN,
                EvidenceTestBuilder.DESCRIPTION_NL,
                EvidenceTestBuilder.DESCRIPTION_NL_FORMAL,
                EvidenceTestBuilder.DESCRIPTION_NL_INFORMAL,
                EvidenceTestBuilder.DESCRIPTION_NL_GENERATED_FORMAL,
                EvidenceTestBuilder.DESCRIPTION_NL_GENERATED_INFORMAL));
}

export function anotherFullEvidence(): EvidenceTestBuilder {
    return new EvidenceTestBuilder()
        .withId(EvidenceTestBuilder.buildIri(uuid()))
        .withTitle(LanguageString.of(
            EvidenceTestBuilder.ANOTHER_TITLE_EN,
            EvidenceTestBuilder.ANOTHER_TITLE_NL,
            EvidenceTestBuilder.ANOTHER_TITLE_NL_FORMAL,
            EvidenceTestBuilder.ANOTHER_TITLE_NL_INFORMAL,
            EvidenceTestBuilder.ANOTHER_TITLE_NL_GENERATED_FORMAL,
            EvidenceTestBuilder.ANOTHER_TITLE_NL_GENERATED_INFORMAL))
        .withDescription(
            LanguageString.of(
                EvidenceTestBuilder.ANOTHER_DESCRIPTION_EN,
                EvidenceTestBuilder.ANOTHER_DESCRIPTION_NL,
                EvidenceTestBuilder.ANOTHER_DESCRIPTION_NL_FORMAL,
                EvidenceTestBuilder.ANOTHER_DESCRIPTION_NL_INFORMAL,
                EvidenceTestBuilder.ANOTHER_DESCRIPTION_NL_GENERATED_FORMAL,
                EvidenceTestBuilder.ANOTHER_DESCRIPTION_NL_GENERATED_INFORMAL));
}

export class EvidenceTestBuilder {

    public static readonly TITLE_EN = 'Evidence Title - en';
    public static readonly TITLE_NL = 'Evidence Title - nl';
    public static readonly TITLE_NL_FORMAL = 'Evidence Title - nl-formal';
    public static readonly TITLE_NL_INFORMAL = 'Evidence Title - nl-informal';
    public static readonly TITLE_NL_GENERATED_FORMAL = 'Evidence Title - nl-generated-formal';
    public static readonly TITLE_NL_GENERATED_INFORMAL = 'Evidence Title - nl-generated-informal';

    public static readonly DESCRIPTION_EN = 'Evidence Description - en';
    public static readonly DESCRIPTION_NL = 'Evidence Description - nl';
    public static readonly DESCRIPTION_NL_FORMAL = 'Evidence Description - nl-formal';
    public static readonly DESCRIPTION_NL_INFORMAL = 'Evidence Description - nl-informal';
    public static readonly DESCRIPTION_NL_GENERATED_FORMAL = 'Evidence Description - nl-generated-formal';
    public static readonly DESCRIPTION_NL_GENERATED_INFORMAL = 'Evidence Description - nl-generated-informal';

    public static readonly ANOTHER_TITLE_EN = 'Evidence Another Title - en';
    public static readonly ANOTHER_TITLE_NL = 'Evidence Another Title - nl';
    public static readonly ANOTHER_TITLE_NL_FORMAL = 'Evidence Another Title - nl-formal';
    public static readonly ANOTHER_TITLE_NL_INFORMAL = 'Evidence Another Title - nl-informal';
    public static readonly ANOTHER_TITLE_NL_GENERATED_FORMAL = 'Evidence Another Title - nl-generated-formal';
    public static readonly ANOTHER_TITLE_NL_GENERATED_INFORMAL = 'Evidence Another Title - nl-generated-informal';

    public static readonly ANOTHER_DESCRIPTION_EN = 'Evidence Another Description - en';
    public static readonly ANOTHER_DESCRIPTION_NL = 'Evidence Another Description - nl';
    public static readonly ANOTHER_DESCRIPTION_NL_FORMAL = 'Evidence Another Description - nl-formal';
    public static readonly ANOTHER_DESCRIPTION_NL_INFORMAL = 'Evidence Another Description - nl-informal';
    public static readonly ANOTHER_DESCRIPTION_NL_GENERATED_FORMAL = 'Evidence Another Description - nl-generated-formal';
    public static readonly ANOTHER_DESCRIPTION_NL_GENERATED_INFORMAL = 'Evidence Another Description - nl-generated-informal';

    private id: Iri;
    private title: LanguageString | undefined;
    private description: LanguageString | undefined;

    static buildIri(uniqueId: string): Iri {
        return `http://data.lblod.info/id/evidence/${uniqueId}`;
    }

    public withId(id: Iri): EvidenceTestBuilder {
        this.id = id;
        return this;
    }

    public withTitle(title: LanguageString): EvidenceTestBuilder {
        this.title = title;
        return this;
    }

    public withDescription(description: LanguageString): EvidenceTestBuilder {
        this.description = description;
        return this;
    }

    public build(): Evidence {
        return new Evidence(
            this.id,
            this.title,
            this.description);
    }

}