import {uuid} from "mu";
import {LanguageString} from "../../../src/core/domain/language-string";
import {EvidenceBuilder} from "../../../src/core/domain/evidence";
import {aMinimalLanguageString} from "./language-string-test-builder";

export function aMinimalEvidenceForConceptSnapshot(): EvidenceBuilder {
    return new EvidenceBuilder()
        .withId(EvidenceBuilder.buildIri(uuid()))
        .withTitle(aMinimalLanguageString(EvidenceTestBuilder.TITLE).build())
        .withDescription(aMinimalLanguageString(EvidenceTestBuilder.DESCRIPTION).build());
}

export function aMinimalEvidenceForConcept(): EvidenceBuilder {
    const uniqueId = uuid();
    return new EvidenceBuilder()
        .withId(EvidenceBuilder.buildIri(uniqueId))
        .withUuid(uniqueId)
        .withTitle(aMinimalLanguageString(EvidenceTestBuilder.TITLE).build())
        .withDescription(aMinimalLanguageString(EvidenceTestBuilder.DESCRIPTION).build());
}

export function aMinimalEvidenceForInstance(): EvidenceBuilder {
    const uniqueId = uuid();
    return new EvidenceBuilder()
        .withId(EvidenceBuilder.buildIri(uniqueId))
        .withUuid(uniqueId);
}

export function aFullEvidence(): EvidenceBuilder {
    const uniqueId = uuid();
    return new EvidenceBuilder()
        .withId(EvidenceBuilder.buildIri(uniqueId))
        .withUuid(uniqueId)
        .withTitle(LanguageString.of(
            EvidenceTestBuilder.TITLE_NL,
            EvidenceTestBuilder.TITLE_NL_FORMAL,
            EvidenceTestBuilder.TITLE_NL_INFORMAL,
            EvidenceTestBuilder.TITLE_NL_GENERATED_FORMAL,
            EvidenceTestBuilder.TITLE_NL_GENERATED_INFORMAL))
        .withDescription(
            LanguageString.of(
                EvidenceTestBuilder.DESCRIPTION_NL,
                EvidenceTestBuilder.DESCRIPTION_NL_FORMAL,
                EvidenceTestBuilder.DESCRIPTION_NL_INFORMAL,
                EvidenceTestBuilder.DESCRIPTION_NL_GENERATED_FORMAL,
                EvidenceTestBuilder.DESCRIPTION_NL_GENERATED_INFORMAL));
}

export function anotherFullEvidence(): EvidenceBuilder {
    return new EvidenceBuilder()
        .withId(EvidenceBuilder.buildIri(uuid()))
        .withTitle(LanguageString.of(
            EvidenceTestBuilder.ANOTHER_TITLE_NL,
            EvidenceTestBuilder.ANOTHER_TITLE_NL_FORMAL,
            EvidenceTestBuilder.ANOTHER_TITLE_NL_INFORMAL,
            EvidenceTestBuilder.ANOTHER_TITLE_NL_GENERATED_FORMAL,
            EvidenceTestBuilder.ANOTHER_TITLE_NL_GENERATED_INFORMAL))
        .withDescription(
            LanguageString.of(
                EvidenceTestBuilder.ANOTHER_DESCRIPTION_NL,
                EvidenceTestBuilder.ANOTHER_DESCRIPTION_NL_FORMAL,
                EvidenceTestBuilder.ANOTHER_DESCRIPTION_NL_INFORMAL,
                EvidenceTestBuilder.ANOTHER_DESCRIPTION_NL_GENERATED_FORMAL,
                EvidenceTestBuilder.ANOTHER_DESCRIPTION_NL_GENERATED_INFORMAL));
}

export function aFullEvidenceForInstance(): EvidenceBuilder {
    const uniqueId = uuid();
    return new EvidenceBuilder()
        .withId(EvidenceBuilder.buildIri(uniqueId))
        .withUuid(uniqueId)
        .withTitle(LanguageString.of(
            undefined,
            EvidenceTestBuilder.TITLE_NL_FORMAL))
        .withDescription(LanguageString.of(
            undefined,
            EvidenceTestBuilder.DESCRIPTION_NL_FORMAL));
}

export function anotherFullEvidenceForInstance(): EvidenceBuilder {
    const uniqueId = uuid();
    return new EvidenceBuilder()
        .withId(EvidenceBuilder.buildIri(uniqueId))
        .withUuid(uniqueId)
        .withTitle(LanguageString.of(
            undefined,
            EvidenceTestBuilder.ANOTHER_TITLE_NL_FORMAL))
        .withDescription(LanguageString.of(
            undefined,
            EvidenceTestBuilder.ANOTHER_DESCRIPTION_NL_FORMAL));
}

export function aFullEvidenceForInstanceSnapshot(): EvidenceBuilder {
    const uniqueId = uuid();
    return new EvidenceBuilder()
        .withId(EvidenceBuilder.buildIri(uniqueId))
        .withTitle(LanguageString.of(
            undefined,
            undefined,
            EvidenceTestBuilder.TITLE_NL_INFORMAL))
        .withDescription(LanguageString.of(
            undefined,
            undefined,
            EvidenceTestBuilder.DESCRIPTION_NL_INFORMAL));
}

export function anotherFullEvidenceForInstanceSnapshot(): EvidenceBuilder {
    const uniqueId = uuid();
    return new EvidenceBuilder()
        .withId(EvidenceBuilder.buildIri(uniqueId))
        .withTitle(LanguageString.of(
            undefined,
            undefined,
            EvidenceTestBuilder.ANOTHER_TITLE_NL_INFORMAL))
        .withDescription(LanguageString.of(
            undefined,
            undefined,
            EvidenceTestBuilder.ANOTHER_DESCRIPTION_NL_INFORMAL));
}

export class EvidenceTestBuilder {

    public static readonly TITLE = 'Evidence Title';
    public static readonly TITLE_NL = 'Evidence Title - nl';
    public static readonly TITLE_NL_FORMAL = 'Evidence Title - nl-formal';
    public static readonly TITLE_NL_INFORMAL = 'Evidence Title - nl-informal';
    public static readonly TITLE_NL_GENERATED_FORMAL = 'Evidence Title - nl-generated-formal';
    public static readonly TITLE_NL_GENERATED_INFORMAL = 'Evidence Title - nl-generated-informal';

    public static readonly DESCRIPTION = 'Evidence Description';
    public static readonly DESCRIPTION_NL = 'Evidence Description - nl';
    public static readonly DESCRIPTION_NL_FORMAL = 'Evidence Description - nl-formal';
    public static readonly DESCRIPTION_NL_INFORMAL = 'Evidence Description - nl-informal';
    public static readonly DESCRIPTION_NL_GENERATED_FORMAL = 'Evidence Description - nl-generated-formal';
    public static readonly DESCRIPTION_NL_GENERATED_INFORMAL = 'Evidence Description - nl-generated-informal';

    public static readonly ANOTHER_TITLE_NL = 'Evidence Another Title - nl';
    public static readonly ANOTHER_TITLE_NL_FORMAL = 'Evidence Another Title - nl-formal';
    public static readonly ANOTHER_TITLE_NL_INFORMAL = 'Evidence Another Title - nl-informal';
    public static readonly ANOTHER_TITLE_NL_GENERATED_FORMAL = 'Evidence Another Title - nl-generated-formal';
    public static readonly ANOTHER_TITLE_NL_GENERATED_INFORMAL = 'Evidence Another Title - nl-generated-informal';

    public static readonly ANOTHER_DESCRIPTION_NL = 'Evidence Another Description - nl';
    public static readonly ANOTHER_DESCRIPTION_NL_FORMAL = 'Evidence Another Description - nl-formal';
    public static readonly ANOTHER_DESCRIPTION_NL_INFORMAL = 'Evidence Another Description - nl-informal';
    public static readonly ANOTHER_DESCRIPTION_NL_GENERATED_FORMAL = 'Evidence Another Description - nl-generated-formal';
    public static readonly ANOTHER_DESCRIPTION_NL_GENERATED_INFORMAL = 'Evidence Another Description - nl-generated-informal';

}
