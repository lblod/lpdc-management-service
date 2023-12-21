import {Iri} from "./shared/iri";
import {TaalString} from "./taal-string";


export class ConceptVersie {

    private readonly _id: Iri;
    private readonly _title: TaalString | undefined;
    private readonly _description: TaalString | undefined;
    private readonly _additionalDescription: TaalString | undefined;
    private readonly _exception: TaalString | undefined;
    private readonly _regulation: TaalString | undefined;

    constructor(id: Iri,
                title: TaalString | undefined,
                description: TaalString | undefined,
                additionalDescription: TaalString | undefined,
                exception: TaalString | undefined,
                regulation: TaalString | undefined) {
        //TODO LPDC-916: enforce invariants ?
        this._id = id;
        this._title = title;
        this._description = description;
        this._additionalDescription = additionalDescription;
        this._exception = exception;
        this._regulation = regulation;
    }

    get id(): Iri {
        return this._id;
    }

    get title(): TaalString | undefined {
        return this._title;
    }

    get description(): TaalString | undefined {
        return this._description;
    }

    get additionalDescription(): TaalString | undefined {
        return this._additionalDescription;
    }

    get exception(): TaalString | undefined {
        return this._exception;
    }

    get regulation(): TaalString | undefined {
        return this._regulation;
    }

    static isFunctionallyChanged(aConceptVersie: ConceptVersie, anotherConceptVersie: ConceptVersie): boolean {
        return TaalString.isFunctionallyChanged(aConceptVersie.title, anotherConceptVersie.title)
            || TaalString.isFunctionallyChanged(aConceptVersie.description, anotherConceptVersie.description)
            || TaalString.isFunctionallyChanged(aConceptVersie.additionalDescription, anotherConceptVersie.additionalDescription)
            || TaalString.isFunctionallyChanged(aConceptVersie.exception, anotherConceptVersie.exception)
            || TaalString.isFunctionallyChanged(aConceptVersie.regulation, anotherConceptVersie.regulation);
    }

}