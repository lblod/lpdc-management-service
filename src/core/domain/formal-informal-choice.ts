import {Iri} from "./shared/iri";
import {FormatPreservingDate} from "./format-preserving-date";
import {requiredValue} from "./shared/invariant";
import {ChosenFormType} from "./types";

export function buildFormalInformalChoiceIri(uniqueId: string): Iri {
    return new Iri(`http://data.lblod.info/id/formalInformalChoice/${uniqueId}`);
}

export class FormalInformalChoice {

    private readonly _id: Iri;
    private readonly _uuid: string;
    private readonly _dateCreated: FormatPreservingDate;
    private readonly _chosenForm: ChosenFormType;
    private readonly _bestuurseenheidId: Iri;

    constructor(id: Iri,
                uuid: string,
                dateCreated: FormatPreservingDate,
                chosenForm: ChosenFormType,
                bestuurseenheidId: Iri) {
        this._id = requiredValue(id, 'id');
        this._uuid = requiredValue(uuid, 'uuid');
        this._dateCreated = requiredValue(dateCreated, 'dateCreated');
        this._chosenForm = requiredValue(chosenForm, 'chosenForm');
        this._bestuurseenheidId = requiredValue(bestuurseenheidId, 'bestuurseenheidId');
    }

    get id(): Iri {
        return this._id;
    }

    get uuid(): string {
        return this._uuid;
    }

    get dateCreated(): FormatPreservingDate {
        return this._dateCreated;
    }

    get chosenForm(): ChosenFormType {
        return this._chosenForm;
    }

    get bestuurseenheidId(): Iri {
        return this._bestuurseenheidId;
    }

}

