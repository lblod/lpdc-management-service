import {uuid} from "../../../mu-helper";
import {ContactPointBuilder} from "../../../src/core/domain/contact-point";
import {
    aFullAddressForInstance,
    aFullAddressForInstanceSnapshot,
    anotherFullAddressForInstance,
    anotherFullAddressForInstanceSnapshot
} from "./address-test-builder";


export function aMinimalContactPointForInstance(): ContactPointBuilder {
    const uniqueId = uuid();
    return new ContactPointBuilder()
        .withId(ContactPointBuilder.buildIri(uniqueId))
        .withUuid(uniqueId)
        .withOrder(1);
}

export function aFullContactPointForInstance(): ContactPointBuilder {
    const uniqueId = uuid();
    return new ContactPointBuilder()
        .withId(ContactPointBuilder.buildIri(uniqueId))
        .withUuid(uniqueId)
        .withUrl(ContactPointTestBuilder.URL)
        .withEmail(ContactPointTestBuilder.EMAIL)
        .withTelephone(ContactPointTestBuilder.TELEPHONE)
        .withOpeningHours(ContactPointTestBuilder.OPENING_HOURS)
        .withOrder(1)
        .withAddress(ContactPointTestBuilder.ADDRESS_FOR_INSTANCE);
}

export function anotherFullContactPointForInstance(): ContactPointBuilder {
    const uniqueId = uuid();
    return new ContactPointBuilder()
        .withId(ContactPointBuilder.buildIri(uniqueId))
        .withUuid(uniqueId)
        .withUrl(ContactPointTestBuilder.ANOTHER_URL)
        .withEmail(ContactPointTestBuilder.ANOTHER_EMAIL)
        .withTelephone(ContactPointTestBuilder.ANOTHER_TELEPHONE)
        .withOpeningHours(ContactPointTestBuilder.OPENING_HOURS)
        .withOrder(2)
        .withAddress(ContactPointTestBuilder.ANOTHER_ADDRESS_FOR_INSTANCE);
}

export function aMinimalContactPointForInstanceSnapshot(): ContactPointBuilder {
    return aMinimalContactPointForInstance()
        .withUuid(undefined);
}

export function aFullContactPointForInstanceSnapshot(): ContactPointBuilder {
    return aFullContactPointForInstance()
        .withUuid(undefined)
        .withAddress(ContactPointTestBuilder.ADDRESS_FOR_INSTANCE_SNAPSHOT);
}

export function anotherFullContactPointForInstanceSnapshot(): ContactPointBuilder {
    return anotherFullContactPointForInstance()
        .withUuid(undefined)
        .withAddress(ContactPointTestBuilder.ANOTHER_ADDRESS_FOR_INSTANCE_SNAPSHOT);
}

export class ContactPointTestBuilder {

    public static readonly EMAIL = 'test@leuven.com';
    public static readonly ANOTHER_EMAIL = 'test@gent.com';
    public static readonly TELEPHONE = '016123123';
    public static readonly ANOTHER_TELEPHONE = '016456456';
    public static readonly OPENING_HOURS = 'Everyday from 09:00 - 17:00';
    public static readonly ADDRESS_FOR_INSTANCE = aFullAddressForInstance().build();
    public static readonly ANOTHER_ADDRESS_FOR_INSTANCE = anotherFullAddressForInstance().build();
    public static readonly ADDRESS_FOR_INSTANCE_SNAPSHOT = aFullAddressForInstanceSnapshot().build();
    public static readonly ANOTHER_ADDRESS_FOR_INSTANCE_SNAPSHOT = anotherFullAddressForInstanceSnapshot().build();
    public static readonly URL = 'https://leuven.be';
    public static readonly ANOTHER_URL = 'https://gent.be';

}