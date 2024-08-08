import {uuid} from "mu";
import {LanguageString} from "../../../src/core/domain/language-string";
import {RequirementBuilder} from "../../../src/core/domain/requirement";
import {
    aFullEvidence,
    aFullEvidenceForInstance,
    aFullEvidenceForInstanceSnapshot,
    anotherFullEvidence,
    anotherFullEvidenceForInstance,
    anotherFullEvidenceForInstanceSnapshot
} from "./evidence-test-builder";
import {aMinimalInformalLanguageString, aMinimalLanguageString} from "./language-string-test-builder";

export function aMinimalRequirementForConceptSnapshot(): RequirementBuilder {
    return new RequirementBuilder()
        .withId(RequirementBuilder.buildIri(uuid()))
        .withTitle(aMinimalLanguageString(RequirementTestBuilder.TITLE).build())
        .withDescription(aMinimalLanguageString(RequirementTestBuilder.DESCRIPTION).build())
        .withOrder(1);
}

export function aMinimalRequirementForConcept(): RequirementBuilder {
    const uniqueId = uuid();
    return new RequirementBuilder()
        .withId(RequirementBuilder.buildIri(uniqueId))
        .withUuid(uniqueId)
        .withTitle(aMinimalLanguageString(RequirementTestBuilder.TITLE).build())
        .withDescription(aMinimalLanguageString(RequirementTestBuilder.DESCRIPTION).build())
        .withOrder(1);
}

export function aMinimalRequirementForInstance(): RequirementBuilder {
    const uniqueId = uuid();
    return new RequirementBuilder()
        .withId(RequirementBuilder.buildIri(uniqueId))
        .withUuid(uniqueId)
        .withOrder(1);
}

export function aMinimalRequirementForInstanceSnapshot(): RequirementBuilder {
    const uniqueId = uuid();
    return new RequirementBuilder()
        .withId(RequirementBuilder.buildIri(uniqueId))
        .withOrder(1)
        .withTitle(aMinimalInformalLanguageString(RequirementTestBuilder.TITLE).build())
        .withDescription(aMinimalInformalLanguageString(RequirementTestBuilder.DESCRIPTION).build());
}

export function aFullRequirement(): RequirementBuilder {
    const uniqueId = uuid();
    return new RequirementBuilder()
        .withId(RequirementBuilder.buildIri(uniqueId))
        .withUuid(uniqueId)
        .withTitle(LanguageString.of(
            RequirementTestBuilder.TITLE_NL,
            RequirementTestBuilder.TITLE_NL_FORMAL,
            RequirementTestBuilder.TITLE_NL_INFORMAL,
            RequirementTestBuilder.TITLE_NL_GENERATED_FORMAL,
            RequirementTestBuilder.TITLE_NL_GENERATED_INFORMAL))
        .withDescription(
            LanguageString.of(
                RequirementTestBuilder.DESCRIPTION_NL,
                RequirementTestBuilder.DESCRIPTION_NL_FORMAL,
                RequirementTestBuilder.DESCRIPTION_NL_INFORMAL,
                RequirementTestBuilder.DESCRIPTION_NL_GENERATED_FORMAL,
                RequirementTestBuilder.DESCRIPTION_NL_GENERATED_INFORMAL))
        .withOrder(1)
        .withEvidence(RequirementTestBuilder.EVIDENCE);
}

export function anotherFullRequirement(): RequirementBuilder {
    return new RequirementBuilder()
        .withId(RequirementBuilder.buildIri(uuid()))
        .withTitle(LanguageString.of(
            RequirementTestBuilder.ANOTHER_TITLE_NL,
            RequirementTestBuilder.ANOTHER_TITLE_NL_FORMAL,
            RequirementTestBuilder.ANOTHER_TITLE_NL_INFORMAL,
            RequirementTestBuilder.ANOTHER_TITLE_NL_GENERATED_FORMAL,
            RequirementTestBuilder.ANOTHER_TITLE_NL_GENERATED_INFORMAL))
        .withDescription(
            LanguageString.of(
                RequirementTestBuilder.ANOTHER_DESCRIPTION_NL,
                RequirementTestBuilder.ANOTHER_DESCRIPTION_NL_FORMAL,
                RequirementTestBuilder.ANOTHER_DESCRIPTION_NL_INFORMAL,
                RequirementTestBuilder.ANOTHER_DESCRIPTION_NL_GENERATED_FORMAL,
                RequirementTestBuilder.ANOTHER_DESCRIPTION_NL_GENERATED_INFORMAL))
        .withOrder(2)
        .withEvidence(RequirementTestBuilder.ANOTHER_EVIDENCE);
}

export function aFullRequirementForInstance(): RequirementBuilder {
    const uniqueId = uuid();
    return new RequirementBuilder()
        .withId(RequirementBuilder.buildIri(uniqueId))
        .withUuid(uniqueId)
        .withTitle(LanguageString.of(
            undefined,
            RequirementTestBuilder.TITLE_NL_FORMAL))
        .withDescription(LanguageString.of(
            undefined,
            RequirementTestBuilder.DESCRIPTION_NL_FORMAL))
        .withOrder(1)
        .withEvidence(RequirementTestBuilder.EVIDENCE_FOR_INSTANCE);
}

export function anotherFullRequirementForInstance(): RequirementBuilder {
    const uniqueId = uuid();
    return new RequirementBuilder()
        .withId(RequirementBuilder.buildIri(uniqueId))
        .withUuid(uniqueId)
        .withTitle(LanguageString.of(
            undefined,
            RequirementTestBuilder.ANOTHER_TITLE_NL_FORMAL))
        .withDescription(LanguageString.of(
            undefined,
            RequirementTestBuilder.ANOTHER_DESCRIPTION_NL_FORMAL))
        .withOrder(2)
        .withEvidence(RequirementTestBuilder.ANOTHER_EVIDENCE_FOR_INSTANCE);
}

export function aFullRequirementForInstanceSnapshot(): RequirementBuilder {
    const uniqueId = uuid();
    return new RequirementBuilder()
        .withId(RequirementBuilder.buildIri(uniqueId))
        .withTitle(LanguageString.of(
            undefined,
            undefined,
            RequirementTestBuilder.TITLE_NL_INFORMAL))
        .withDescription(LanguageString.of(
            undefined,
            undefined,
            RequirementTestBuilder.DESCRIPTION_NL_INFORMAL))
        .withOrder(1)
        .withEvidence(RequirementTestBuilder.EVIDENCE_FOR_INSTANCE_SNAPSHOT);
}

export function anotherFullRequirementForInstanceSnapshot(): RequirementBuilder {
    const uniqueId = uuid();
    return new RequirementBuilder()
        .withId(RequirementBuilder.buildIri(uniqueId))
        .withTitle(LanguageString.of(
            undefined,
            undefined,
            RequirementTestBuilder.ANOTHER_TITLE_NL_INFORMAL))
        .withDescription(LanguageString.of(
            undefined,
            undefined,
            RequirementTestBuilder.ANOTHER_DESCRIPTION_NL_INFORMAL))
        .withOrder(2)
        .withEvidence(RequirementTestBuilder.ANOTHER_EVIDENCE_FOR_INSTANCE_SNAPSHOT);
}

export class RequirementTestBuilder {

    public static readonly TITLE = 'Requirement Title';
    public static readonly TITLE_NL = 'Requirement Title - nl';
    public static readonly TITLE_NL_FORMAL = 'Requirement Title - nl-formal';
    public static readonly TITLE_NL_INFORMAL = 'Requirement Title - nl-informal';
    public static readonly TITLE_NL_GENERATED_FORMAL = 'Requirement Title - nl-generated-formal';
    public static readonly TITLE_NL_GENERATED_INFORMAL = 'Requirement Title - nl-generated-informal';

    public static readonly DESCRIPTION = 'Requirement Description';
    public static readonly DESCRIPTION_NL = 'Requirement Description - nl';
    public static readonly DESCRIPTION_NL_FORMAL = 'Requirement Description - nl-formal';
    public static readonly DESCRIPTION_NL_INFORMAL = 'Requirement Description - nl-informal';
    public static readonly DESCRIPTION_NL_GENERATED_FORMAL = 'Requirement Description - nl-generated-formal';
    public static readonly DESCRIPTION_NL_GENERATED_INFORMAL = 'Requirement Description - nl-generated-informal';

    public static readonly ANOTHER_TITLE_NL = 'Requirement Another Title - nl';
    public static readonly ANOTHER_TITLE_NL_FORMAL = 'Requirement Another Title - nl-formal';
    public static readonly ANOTHER_TITLE_NL_INFORMAL = 'Requirement Another Title - nl-informal';
    public static readonly ANOTHER_TITLE_NL_GENERATED_FORMAL = 'Requirement Another Title - nl-generated-formal';
    public static readonly ANOTHER_TITLE_NL_GENERATED_INFORMAL = 'Requirement Another Title - nl-generated-informal';

    public static readonly ANOTHER_DESCRIPTION_NL = 'Requirement Another Description - nl';
    public static readonly ANOTHER_DESCRIPTION_NL_FORMAL = 'Requirement Another Description - nl-formal';
    public static readonly ANOTHER_DESCRIPTION_NL_INFORMAL = 'Requirement Another Description - nl-informal';
    public static readonly ANOTHER_DESCRIPTION_NL_GENERATED_FORMAL = 'Requirement Another Description - nl-generated-formal';
    public static readonly ANOTHER_DESCRIPTION_NL_GENERATED_INFORMAL = 'Requirement Another Description - nl-generated-informal';

    public static readonly EVIDENCE = aFullEvidence().build();
    public static readonly EVIDENCE_FOR_INSTANCE = aFullEvidenceForInstance().build();
    public static readonly EVIDENCE_FOR_INSTANCE_SNAPSHOT = aFullEvidenceForInstanceSnapshot().build();
    public static readonly ANOTHER_EVIDENCE = anotherFullEvidence().build();
    public static readonly ANOTHER_EVIDENCE_FOR_INSTANCE = anotherFullEvidenceForInstance().build();
    public static readonly ANOTHER_EVIDENCE_FOR_INSTANCE_SNAPSHOT = anotherFullEvidenceForInstanceSnapshot().build();

}
