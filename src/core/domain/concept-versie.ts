import {Iri} from "./shared/iri";
import {TaalString} from "./taal-string";


export class ConceptVersie {

    private readonly _id: Iri;
    private readonly _title: TaalString | undefined;
    private readonly _description: TaalString | undefined;

    constructor(id: Iri,
                title: TaalString | undefined,
                description: TaalString | undefined) {
        //TODO LPDC-916: enforce invariants ?
        this._id = id;
        this._title = title;
        this._description = description;
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

    static isFunctionallyChanged(aConceptVersie: ConceptVersie, anotherConceptVersie: ConceptVersie): boolean {
        return TaalString.isFunctionallyChanged(aConceptVersie.title, anotherConceptVersie.title)
            || TaalString.isFunctionallyChanged(aConceptVersie.description, anotherConceptVersie.description);
    }

}