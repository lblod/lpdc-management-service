import {Iri} from "../../../src/core/domain/shared/iri";
import {uuid} from "../../../mu-helper";
import {LanguageString} from "../../../src/core/domain/language-string";
import {Requirement} from "../../../src/core/domain/requirement";
import {aFullEvidence, anotherFullEvidence} from "./evidence-test-builder";
import {Evidence} from "../../../src/core/domain/evidence";
import {aMinimalLanguageString} from "./language-string-test-builder";


export function aMinimalRequirementForConceptSnapshot(): RequirementTestBuilder {
    return new RequirementTestBuilder()
        .withId(RequirementTestBuilder.buildIri(uuid()))
        .withTitle(aMinimalLanguageString(RequirementTestBuilder.TITLE).build())
        .withDescription(aMinimalLanguageString(RequirementTestBuilder.DESCRIPTION).build());
}

export function aMinimalRequirementForConcept(): RequirementTestBuilder {
    const uniqueId = uuid();
    return new RequirementTestBuilder()
        .withId(RequirementTestBuilder.buildIri(uniqueId))
        .withUuid(uniqueId)
        .withTitle(aMinimalLanguageString(RequirementTestBuilder.TITLE).build())
        .withDescription(aMinimalLanguageString(RequirementTestBuilder.DESCRIPTION).build());
}

export function aFullRequirement(): RequirementTestBuilder {
    const uniqueId = uuid();
    return new RequirementTestBuilder()
        .withId(RequirementTestBuilder.buildIri(uniqueId))
        .withUuid(uniqueId)
        .withTitle(LanguageString.of(
            RequirementTestBuilder.TITLE_EN,
            RequirementTestBuilder.TITLE_NL,
            RequirementTestBuilder.TITLE_NL_FORMAL,
            RequirementTestBuilder.TITLE_NL_INFORMAL,
            RequirementTestBuilder.TITLE_NL_GENERATED_FORMAL,
            RequirementTestBuilder.TITLE_NL_GENERATED_INFORMAL))
        .withDescription(
            LanguageString.of(
                RequirementTestBuilder.DESCRIPTION_EN,
                RequirementTestBuilder.DESCRIPTION_NL,
                RequirementTestBuilder.DESCRIPTION_NL_FORMAL,
                RequirementTestBuilder.DESCRIPTION_NL_INFORMAL,
                RequirementTestBuilder.DESCRIPTION_NL_GENERATED_FORMAL,
                RequirementTestBuilder.DESCRIPTION_NL_GENERATED_INFORMAL))
        .withEvidence(RequirementTestBuilder.EVIDENCE);
}

export function anotherFullRequirement(): RequirementTestBuilder {
    return new RequirementTestBuilder()
        .withId(RequirementTestBuilder.buildIri(uuid()))
        .withTitle(LanguageString.of(
            RequirementTestBuilder.ANOTHER_TITLE_EN,
            RequirementTestBuilder.ANOTHER_TITLE_NL,
            RequirementTestBuilder.ANOTHER_TITLE_NL_FORMAL,
            RequirementTestBuilder.ANOTHER_TITLE_NL_INFORMAL,
            RequirementTestBuilder.ANOTHER_TITLE_NL_GENERATED_FORMAL,
            RequirementTestBuilder.ANOTHER_TITLE_NL_GENERATED_INFORMAL))
        .withDescription(
            LanguageString.of(
                RequirementTestBuilder.ANOTHER_DESCRIPTION_EN,
                RequirementTestBuilder.ANOTHER_DESCRIPTION_NL,
                RequirementTestBuilder.ANOTHER_DESCRIPTION_NL_FORMAL,
                RequirementTestBuilder.ANOTHER_DESCRIPTION_NL_INFORMAL,
                RequirementTestBuilder.ANOTHER_DESCRIPTION_NL_GENERATED_FORMAL,
                RequirementTestBuilder.ANOTHER_DESCRIPTION_NL_GENERATED_INFORMAL))
        .withEvidence(RequirementTestBuilder.ANOTHER_EVIDENCE);
}

export class RequirementTestBuilder {

    public static readonly TITLE = 'Requirement Title';
    public static readonly TITLE_EN = 'Requirement Title - en';
    public static readonly TITLE_NL = 'Requirement Title - nl';
    public static readonly TITLE_NL_FORMAL = 'Requirement Title - nl-formal';
    public static readonly TITLE_NL_INFORMAL = 'Requirement Title - nl-informal';
    public static readonly TITLE_NL_GENERATED_FORMAL = 'Requirement Title - nl-generated-formal';
    public static readonly TITLE_NL_GENERATED_INFORMAL = 'Requirement Title - nl-generated-informal';

    public static readonly DESCRIPTION = 'Requirement Description';
    public static readonly DESCRIPTION_EN = 'Requirement Description - en';
    public static readonly DESCRIPTION_NL = 'Requirement Description - nl';
    public static readonly DESCRIPTION_NL_FORMAL = 'Requirement Description - nl-formal';
    public static readonly DESCRIPTION_NL_INFORMAL = 'Requirement Description - nl-informal';
    public static readonly DESCRIPTION_NL_GENERATED_FORMAL = 'Requirement Description - nl-generated-formal';
    public static readonly DESCRIPTION_NL_GENERATED_INFORMAL = 'Requirement Description - nl-generated-informal';

    public static readonly ANOTHER_TITLE_EN = 'Requirement Another Title - en';
    public static readonly ANOTHER_TITLE_NL = 'Requirement Another Title - nl';
    public static readonly ANOTHER_TITLE_NL_FORMAL = 'Requirement Another Title - nl-formal';
    public static readonly ANOTHER_TITLE_NL_INFORMAL = 'Requirement Another Title - nl-informal';
    public static readonly ANOTHER_TITLE_NL_GENERATED_FORMAL = 'Requirement Another Title - nl-generated-formal';
    public static readonly ANOTHER_TITLE_NL_GENERATED_INFORMAL = 'Requirement Another Title - nl-generated-informal';

    public static readonly ANOTHER_DESCRIPTION_EN = 'Requirement Another Description - en';
    public static readonly ANOTHER_DESCRIPTION_NL = 'Requirement Another Description - nl';
    public static readonly ANOTHER_DESCRIPTION_NL_FORMAL = 'Requirement Another Description - nl-formal';
    public static readonly ANOTHER_DESCRIPTION_NL_INFORMAL = 'Requirement Another Description - nl-informal';
    public static readonly ANOTHER_DESCRIPTION_NL_GENERATED_FORMAL = 'Requirement Another Description - nl-generated-formal';
    public static readonly ANOTHER_DESCRIPTION_NL_GENERATED_INFORMAL = 'Requirement Another Description - nl-generated-informal';

    public static readonly EVIDENCE = aFullEvidence().build();
    public static readonly ANOTHER_EVIDENCE = anotherFullEvidence().build();

    private id: Iri;
    private uuid: string | undefined;
    private title: LanguageString | undefined;
    private description: LanguageString | undefined;
    private evidence: Evidence | undefined;

    static buildIri(uniqueId: string): Iri {
        return new Iri(`http://data.lblod.info/id/requirement/${uniqueId}`);
    }

    public withId(id: Iri): RequirementTestBuilder {
        this.id = id;
        return this;
    }

    public withUuid(uuid: string): RequirementTestBuilder {
        this.uuid = uuid;
        return this;
    }

    public withTitle(title: LanguageString): RequirementTestBuilder {
        this.title = title;
        return this;
    }

    public withDescription(description: LanguageString): RequirementTestBuilder {
        this.description = description;
        return this;
    }

    public withEvidence(evidence: Evidence): RequirementTestBuilder {
        this.evidence = evidence;
        return this;
    }

    public build(): Requirement {
        return Requirement.reconstitute(
            this.id,
            this.uuid,
            this.title,
            this.description,
            this.evidence
        );
    }

}