import {Iri} from "../../../src/core/domain/shared/iri";
import {uuid} from "../../../mu-helper";
import {ContactPoint} from "../../../src/core/domain/contact-point";
import {Address} from "../../../src/core/domain/address";
import {aFullAddress, anotherAddress} from "./address-test-builder";


export function aMinimalContactPoint(): ContactPointTestBuilder {
    const uniqueId = uuid();
    return new ContactPointTestBuilder()
        .withId(ContactPointTestBuilder
            .buildIri(uniqueId))
        .withUuid(uniqueId)
        .withOrder(1);

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
        .withOrder(1)
        .withAddress(ContactPointTestBuilder.ADDRESS);
}

export function anotherFullContactPoint(): ContactPointTestBuilder {
    const uniqueId = uuid();
    return new ContactPointTestBuilder()
        .withId(ContactPointTestBuilder.buildIri(uniqueId))
        .withUuid(uniqueId)
        .withUrl(ContactPointTestBuilder.ANOTHER_URL)
        .withEmail(ContactPointTestBuilder.ANOTHER_EMAIL)
        .withTelephone(ContactPointTestBuilder.ANOTHER_TELEPHONE)
        .withOpeningHours(ContactPointTestBuilder.OPENING_HOURS)
        .withOrder(2)
        .withAddress(ContactPointTestBuilder.ANOTHER_ADDRESS);
}


export class ContactPointTestBuilder {

    public static readonly EMAIL = 'test@leuven.com';
    public static readonly ANOTHER_EMAIL = 'test@gent.com';
    public static readonly TELEPHONE = '016123123';
    public static readonly ANOTHER_TELEPHONE = '016456456';
    public static readonly OPENING_HOURS = 'Everyday from 09:00 - 17:00';
    public static readonly ADDRESS = aFullAddress().build();
    public static readonly ANOTHER_ADDRESS = anotherAddress().build();
    public static readonly URL = 'https://leuven.be';
    public static readonly ANOTHER_URL = 'https://gent.be';


    private id: Iri;
    private uuid: string | undefined;
    private url: string | undefined;
    private email: string | undefined;
    private telephone: string | undefined;
    private openingHours: string | undefined;
    private order: number;
    private address: Address | undefined;


    static buildIri(uniqueId: string): Iri {
        return new Iri(`http://data.lblod.info/id/contact-punten/${uniqueId}`);
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

    public withOrder(order: number): ContactPointTestBuilder {
        this.order = order;
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
            this.order,
            this.address);
    }
}