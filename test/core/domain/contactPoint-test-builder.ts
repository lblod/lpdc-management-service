import {Iri} from "../../../src/core/domain/shared/iri";
import {uuid} from "../../../mu-helper";
import {ContactPoint} from "../../../src/core/domain/contactPoint";
import {Address} from "../../../src/core/domain/address";
import {aFullAddress} from "./address-test-builder";


export function aMinimalContactPoint(): ContactPointTestBuilder {
    const uniqueId = uuid();
    return new ContactPointTestBuilder()
        .withId(ContactPointTestBuilder
            .buildIri(uniqueId))
        .withUuid(uniqueId);

}

export function aFullContactPoint(): ContactPointTestBuilder {
    const uniqueId = uuid();
    return new ContactPointTestBuilder()
        .withId(ContactPointTestBuilder.buildIri(uniqueId))
        .withUuid(uniqueId)
        .withUrl(ContactPointTestBuilder.URL)
        .withEmail(ContactPointTestBuilder.EMAIL)
        .withTelephone(ContactPointTestBuilder.TELEPHONE)
        .withOpeningHours(ContactPointTestBuilder.OPENING_HOURS)
        .withAddress(ContactPointTestBuilder.ADDRESS);
}


export class ContactPointTestBuilder {

    public static readonly EMAIL = 'test@example.com';
    public static readonly TELEPHONE = '016123123';
    public static readonly OPENING_HOURS = 'Everyday from 09:00 - 17:00';
    public static readonly ADDRESS = aFullAddress().build();
    public static readonly URL = 'https://leuven.be';


    private id: Iri;
    private uuid: string | undefined;
    private url: string | undefined;
    private email: string | undefined;
    private telephone: string | undefined;
    private openingHours: string | undefined;
    private address: Address | undefined;


    static buildIri(uniqueId: string): Iri {
        return new Iri(`http://data.lblod.info/form-data/nodes/${uniqueId}`);
    }

    public withId(id: Iri): ContactPointTestBuilder {
        this.id = id;
        return this;
    }

    public withUuid(uuid: string): ContactPointTestBuilder {
        this.uuid = uuid;
        return this;
    }

    public withUrl(url: string): ContactPointTestBuilder {
        this.url = url;
        return this;
    }

    public withEmail(email: string): ContactPointTestBuilder {
        this.email = email;
        return this;
    }

    public withTelephone(telephone: string): ContactPointTestBuilder {
        this.telephone = telephone;
        return this;
    }

    public withOpeningHours(openingHours: string): ContactPointTestBuilder {
        this.openingHours = openingHours;
        return this;
    }

    public withAddress(address: Address): ContactPointTestBuilder {
        this.address = address;
        return this;
    }


    public build(): ContactPoint {
        return new ContactPoint(
            this.id,
            this.uuid,
            this.url,
            this.email,
            this.telephone,
            this.openingHours,
            this.address);
    }
}