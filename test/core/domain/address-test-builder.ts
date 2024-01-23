import {Iri} from "../../../src/core/domain/shared/iri";
import {uuid} from "../../../mu-helper";
import {Address} from "../../../src/core/domain/address";
import {LanguageString} from "../../../src/core/domain/language-string";
import {buildVerwijstNaarIri} from "./iri-test-builder";


export function aMinimalAddress(): AddressTestBuilder {
    const uniqueId = uuid();
    return new AddressTestBuilder()
        .withId(AddressTestBuilder.buildIri(uniqueId))
        .withUuid(uniqueId);
}

export function aFullAddress(): AddressTestBuilder {
    const uniqueId = uuid();
    return new AddressTestBuilder()
        .withId(AddressTestBuilder.buildIri(uniqueId))
        .withUuid(uniqueId)
        .withGemeentenaam(
            LanguageString.of(
                undefined,
                AddressTestBuilder.GEMEENTENAAM_NL,
            )
        ).withLand(
            LanguageString.of(
                undefined,
                AddressTestBuilder.LAND_NL,
            )
        )
        .withHuisnummer(AddressTestBuilder.HUISNUMMER)
        .withBusnummer(AddressTestBuilder.BUSNUMMER)
        .withPostcode(AddressTestBuilder.POSTCODE)
        .withStraatnaam(LanguageString.of(
                undefined,
                AddressTestBuilder.STRAATNAAM_NL
            )
        )
        .withVerwijstNaar(AddressTestBuilder.VERWIJST_NAAR);
}

export function anotherAddress() {
    const uniqueId = uuid();
    return new AddressTestBuilder()
        .withId(AddressTestBuilder.buildIri(uniqueId))
        .withUuid(uniqueId)
        .withGemeentenaam(LanguageString.of(undefined, AddressTestBuilder.ANOTHER_GEMEENTENAAM))
        .withLand(LanguageString.of(undefined, AddressTestBuilder.LAND_NL))
        .withHuisnummer('10')
        .withPostcode('9000')
        .withStraatnaam(LanguageString.of(undefined, AddressTestBuilder.ANTOHER_STRAATNAAM))
        .withVerwijstNaar(AddressTestBuilder.ANOTHER_VERWIJST_NAAR);
}

export class AddressTestBuilder {
    public static readonly GEMEENTENAAM_EN = 'Louvain - en';
    public static readonly GEMEENTENAAM_NL = 'Leuven - nl';
    public static readonly GEMEENTENAAM_NL_FORMAL = 'Leuven - nl-formal';
    public static readonly GEMEENTENAAM_NL_INFORMAL = 'Leuven - nl-informal';
    public static readonly GEMEENTENAAM_NL_GENERATED_FORMAL = 'Leuven - nl-generated-formal';
    public static readonly GEMEENTENAAM_NL_GENERATED_INFORMAL = 'Leuven - nl-generated-informal';

    public static readonly ANOTHER_GEMEENTENAAM = 'Gent';

    public static readonly LAND_EN = 'Belgium - en';
    public static readonly LAND_NL = 'België - nl';
    public static readonly LAND_NL_FORMAL = 'België - nl-formal';
    public static readonly LAND_NL_INFORMAL = 'België - nl-informal';
    public static readonly LAND_NL_GENERATED_FORMAL = 'België - nl-generated-formal';
    public static readonly LAND_NL_GENERATED_INFORMAL = 'België - nl-generated-informal';

    public static readonly HUISNUMMER = '1';
    public static readonly ANTOHER_HUISNUMMER = '10';
    public static readonly BUSNUMMER = 'A';
    public static readonly POSTCODE = '3000';
    public static readonly ANOTHER_POSTCODE = '9000';

    public static readonly STRAATNAAM_EN = 'Professor Roger Van Overstraetenplein - en';
    public static readonly STRAATNAAM_NL = 'Professor Roger Van Overstraetenplein - nl';
    public static readonly STRAATNAAM_NL_FORMAL = 'Professor Roger Van Overstraetenplein - nl-formal';
    public static readonly STRAATNAAM_NL_INFORMAL = 'Professor Roger Van Overstraetenplein - nl-informal';
    public static readonly STRAATNAAM_NL_GENERATED_FORMAL = 'Professor Roger Van Overstraetenplein - nl-generated-formal';
    public static readonly STRAATNAAM_NL_GENERATED_INFORMAL = 'Professor Roger Van Overstraetenplein - nl-generated-informal';
    public static readonly ANTOHER_STRAATNAAM = 'Keizer Leopolstraat';

    public static readonly VERWIJST_NAAR = buildVerwijstNaarIri('3357105');

    public static readonly ANOTHER_VERWIJST_NAAR = buildVerwijstNaarIri('346083');

    private id: Iri;
    private uuid: string | undefined;
    private gemeentenaam: LanguageString | undefined;
    private land: LanguageString | undefined;
    private huisnummer: string | undefined;
    private busnummer: string | undefined;
    private postcode: string | undefined;
    private straatnaam: LanguageString | undefined;
    private verwijstNaar: Iri | undefined;

    static buildIri(uniqueId: string): Iri {
        return new Iri(`http://data.lblod.info/id/adressen/${uniqueId}`);
    }


    public withId(id: Iri): AddressTestBuilder {
        this.id = id;
        return this;
    }

    public withUuid(uuid: string): AddressTestBuilder {
        this.uuid = uuid;
        return this;
    }

    public withGemeentenaam(gemeentenaam: LanguageString): AddressTestBuilder {
        this.gemeentenaam = gemeentenaam;
        return this;
    }

    public withLand(land: LanguageString): AddressTestBuilder {
        this.land = land;
        return this;
    }

    public withHuisnummer(huisnummer: string): AddressTestBuilder {
        this.huisnummer = huisnummer;
        return this;
    }

    public withBusnummer(busnummer: string): AddressTestBuilder {
        this.busnummer = busnummer;
        return this;
    }

    public withPostcode(postcode: string): AddressTestBuilder {
        this.postcode = postcode;
        return this;
    }

    public withStraatnaam(straatnaam: LanguageString): AddressTestBuilder {
        this.straatnaam = straatnaam;
        return this;
    }

    public withVerwijstNaar(verwijstNaar: Iri): AddressTestBuilder {
        this.verwijstNaar = verwijstNaar;
        return this;
    }

    public build(): Address {
        return new Address(this.id,
            this.uuid,
            this.gemeentenaam,
            this.land,
            this.huisnummer,
            this.busnummer,
            this.postcode,
            this.straatnaam,
            this.verwijstNaar
        );
    }
}