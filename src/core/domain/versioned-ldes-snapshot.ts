import {FormatPreservingDate} from "./format-preserving-date";
import {Iri} from "./shared/iri";
import {requiredValue} from "./shared/invariant";


export abstract class VersionedLdesSnapshot {

    private readonly _id: Iri;
    private readonly _generatedAtTime: FormatPreservingDate;
    private readonly _isVersionOf: Iri;

    constructor(id: Iri,
                generatedAtTime: FormatPreservingDate,
                isVersionOf: Iri) {
        this._id = requiredValue(id, 'id');
        this._generatedAtTime = requiredValue(generatedAtTime, 'generatedAtTime');
        this._isVersionOf = requiredValue(isVersionOf, 'isVersionOf');
    }

    get id() {
        return this._id;
    }

    get generatedAtTime() {
        return this._generatedAtTime;
    }

    get isVersionOf() {
        return this._isVersionOf;
    }
}
