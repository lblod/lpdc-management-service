import {Iri} from "./shared/iri";
import {requiredValue} from "./shared/invariant";
import {Address} from "./address";

export class ContactPoint {
    private readonly _id: Iri;
    private readonly _uuid: string; //required for mu-cl-resources.
    private readonly _url: string;
    private readonly _email: string | undefined;
    private readonly _telephone: string | undefined;
    private readonly _openingHours: string | undefined;
    private readonly _address: Address | undefined;


    constructor(id: Iri,
                uuid: string,
                url: string | undefined,
                email: string | undefined,
                telephone: string | undefined,
                openingHours: string | undefined,
                address: Address) {
        this._id = requiredValue(id, 'id');
        this._uuid = requiredValue(uuid, 'uuid');
        this._url = url;
        this._email = email;
        this._telephone = telephone;
        this._openingHours = openingHours;
        this._address = address;
    }


    get id(): Iri {
        return this._id;
    }

    get uuid(): string {
        return this._uuid;
    }

    get url(): string {
        return this._url;
    }

    get email(): string | undefined {
        return this._email;
    }

    get telephone(): string | undefined {
        return this._telephone;
    }

    get openingHours(): string | undefined {
        return this._openingHours;
    }

    get address(): Address | undefined {
        return this._address;
    }
}