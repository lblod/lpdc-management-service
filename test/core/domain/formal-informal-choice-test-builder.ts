import {ChosenFormType, FormalInformalChoice} from "../../../src/core/domain/formal-informal-choice";
import {Iri} from "../../../src/core/domain/shared/iri";
import {FormatPreservingDate} from "../../../src/core/domain/format-preserving-date";
import {uuid} from "../../../mu-helper";
import {buildBestuurseenheidIri, buildFormalInformalChoiceIri} from "./iri-test-builder";

export function aFormalInformalChoice(): FormalInformalChoiceTestBuilder {
    const id = uuid();
    return new FormalInformalChoiceTestBuilder()
        .withId(buildFormalInformalChoiceIri(id))
        .withUuid(id)
        .withDateCreated(FormalInformalChoiceTestBuilder.DATE_CREATED)
        .withChosenForm(FormalInformalChoiceTestBuilder.CHOSEN_FORM)
        .withBestuurseenheidId(buildBestuurseenheidIri(uuid()));
}

export class FormalInformalChoiceTestBuilder {

    private id: Iri;
    private uuid: string;
    private dateCreated: FormatPreservingDate;
    private chosenForm: ChosenFormType;
    private bestuurseenheidId: Iri;

    public static readonly DATE_CREATED = FormatPreservingDate.of('2024-01-23 12:05:46Z');
    public static readonly CHOSEN_FORM: ChosenFormType = 'informal';

    public withId(id: Iri): FormalInformalChoiceTestBuilder {
        this.id = id;
        return this;
    }

    public withUuid(uuid: string): FormalInformalChoiceTestBuilder {
        this.uuid = uuid;
        return this;
    }

    public withDateCreated(dateCreated: FormatPreservingDate): FormalInformalChoiceTestBuilder {
        this.dateCreated = dateCreated;
        return this;
    }

    public withChosenForm(chosenForm: ChosenFormType): FormalInformalChoiceTestBuilder {
        this.chosenForm = chosenForm;
        return this;
    }

    public withBestuurseenheidId(bestuurseenheidId: Iri): FormalInformalChoiceTestBuilder {
        this.bestuurseenheidId = bestuurseenheidId;
        return this;
    }


    public build(): FormalInformalChoice {
        return new FormalInformalChoice(
            this.id,
            this.uuid,
            this.dateCreated,
            this.chosenForm,
            this.bestuurseenheidId,
        );
    }
}