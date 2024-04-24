import {uuid} from "../../../mu-helper";
import {AddressBuilder} from "../../../src/core/domain/address";
import {LanguageString} from "../../../src/core/domain/language-string";
import {buildVerwijstNaarIri} from "./iri-test-builder";


export function aMinimalAddressForInstance(): AddressBuilder {
    const uniqueId = uuid();
    return new AddressBuilder()
        .withId(AddressBuilder.buildIri(uniqueId))
        .withUuid(uniqueId);
}

export function aFullAddressForInstance(): AddressBuilder {
    const uniqueId = uuid();
    return new AddressBuilder()
        .withId(AddressBuilder.buildIri(uniqueId))
        .withUuid(uniqueId)
        .withGemeentenaam(LanguageString.of(AddressTestBuilder.GEMEENTENAAM_NL))
        .withLand(LanguageString.of(AddressTestBuilder.LAND_NL))
        .withHuisnummer(AddressTestBuilder.HUISNUMMER)
        .withBusnummer(AddressTestBuilder.BUSNUMMER)
        .withPostcode(AddressTestBuilder.POSTCODE)
        .withStraatnaam(LanguageString.of(AddressTestBuilder.STRAATNAAM_NL))
        .withVerwijstNaar(AddressTestBuilder.VERWIJST_NAAR);
}

export function anotherFullAddressForInstance(): AddressBuilder {
    const uniqueId = uuid();
    return new AddressBuilder()
        .withId(AddressBuilder.buildIri(uniqueId))
        .withUuid(uniqueId)
        .withGemeentenaam(LanguageString.of(AddressTestBuilder.ANOTHER_GEMEENTENAAM))
        .withLand(LanguageString.of(AddressTestBuilder.LAND_NL))
        .withHuisnummer('10')
        .withPostcode('9000')
        .withStraatnaam(LanguageString.of(AddressTestBuilder.ANOTHER_STRAATNAAM))
        .withVerwijstNaar(AddressTestBuilder.ANOTHER_VERWIJST_NAAR);
}

export function aMinimalAddressForInstanceSnapshot(): AddressBuilder {
    return aMinimalAddressForInstance()
        .withUuid(undefined);
}

export function aFullAddressForInstanceSnapshot(): AddressBuilder {
    return aFullAddressForInstance()
        .withUuid(undefined);
}

export function anotherFullAddressForInstanceSnapshot(): AddressBuilder {
    return anotherFullAddressForInstance()
        .withUuid(undefined);
}

export class AddressTestBuilder {
    public static readonly GEMEENTENAAM_NL = 'Leuven - nl';
    public static readonly GEMEENTENAAM_NL_FORMAL = 'Leuven - nl-formal';
    public static readonly GEMEENTENAAM_NL_INFORMAL = 'Leuven - nl-informal';
    public static readonly GEMEENTENAAM_NL_GENERATED_FORMAL = 'Leuven - nl-generated-formal';
    public static readonly GEMEENTENAAM_NL_GENERATED_INFORMAL = 'Leuven - nl-generated-informal';

    public static readonly ANOTHER_GEMEENTENAAM = 'Gent';

    public static readonly LAND_NL = 'België - nl';
    public static readonly LAND_NL_FORMAL = 'België - nl-formal';
    public static readonly LAND_NL_INFORMAL = 'België - nl-informal';
    public static readonly LAND_NL_GENERATED_FORMAL = 'België - nl-generated-formal';
    public static readonly LAND_NL_GENERATED_INFORMAL = 'België - nl-generated-informal';

    public static readonly HUISNUMMER = '1';
    public static readonly ANOTHER_HUISNUMMER = '10';
    public static readonly BUSNUMMER = 'A';
    public static readonly POSTCODE = '3000';
    public static readonly ANOTHER_POSTCODE = '9000';

    public static readonly STRAATNAAM_NL = 'Professor Roger Van Overstraetenplein - nl';
    public static readonly STRAATNAAM_NL_FORMAL = 'Professor Roger Van Overstraetenplein - nl-formal';
    public static readonly STRAATNAAM_NL_INFORMAL = 'Professor Roger Van Overstraetenplein - nl-informal';
    public static readonly STRAATNAAM_NL_GENERATED_FORMAL = 'Professor Roger Van Overstraetenplein - nl-generated-formal';
    public static readonly STRAATNAAM_NL_GENERATED_INFORMAL = 'Professor Roger Van Overstraetenplein - nl-generated-informal';
    public static readonly ANOTHER_STRAATNAAM = 'Keizer Leopolstraat';

    public static readonly VERWIJST_NAAR = buildVerwijstNaarIri('3357105');

    public static readonly ANOTHER_VERWIJST_NAAR = buildVerwijstNaarIri('346083');


}