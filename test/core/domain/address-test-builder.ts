import { uuid } from "../../../mu-helper";
import { AddressBuilder } from "../../../src/core/domain/address";
import { LanguageString } from "../../../src/core/domain/language-string";
import { buildVerwijstNaarIri } from "./iri-test-builder";

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
    .withGemeentenaam(LanguageString.of(AddressTestBuilder.GEMEENTENAAM))
    .withLand(LanguageString.of(AddressTestBuilder.LAND))
    .withHuisnummer(AddressTestBuilder.HUISNUMMER)
    .withBusnummer(AddressTestBuilder.BUSNUMMER)
    .withPostcode(AddressTestBuilder.POSTCODE)
    .withStraatnaam(LanguageString.of(AddressTestBuilder.STRAATNAAM))
    .withVerwijstNaar(AddressTestBuilder.VERWIJST_NAAR);
}

export function anotherFullAddressForInstance(): AddressBuilder {
  const uniqueId = uuid();
  return new AddressBuilder()
    .withId(AddressBuilder.buildIri(uniqueId))
    .withUuid(uniqueId)
    .withGemeentenaam(
      LanguageString.of(AddressTestBuilder.ANOTHER_GEMEENTENAAM),
    )
    .withLand(LanguageString.of(AddressTestBuilder.LAND))
    .withHuisnummer("10")
    .withPostcode("9000")
    .withStraatnaam(LanguageString.of(AddressTestBuilder.ANOTHER_STRAATNAAM))
    .withVerwijstNaar(AddressTestBuilder.ANOTHER_VERWIJST_NAAR);
}

export function aMinimalAddressForInstanceSnapshot(): AddressBuilder {
  return aMinimalAddressForInstance().withUuid(undefined);
}

export function aFullAddressForInstanceSnapshot(): AddressBuilder {
  return aFullAddressForInstance().withUuid(undefined);
}

export function anotherFullAddressForInstanceSnapshot(): AddressBuilder {
  return anotherFullAddressForInstance().withUuid(undefined);
}

export class AddressTestBuilder {
  public static readonly GEMEENTENAAM = "Harelbeke";
  public static readonly ANOTHER_GEMEENTENAAM = "Gent";
  public static readonly LAND = "België";
  public static readonly HUISNUMMER = "2";
  public static readonly ANOTHER_HUISNUMMER = "10";
  public static readonly BUSNUMMER = "0050";
  public static readonly POSTCODE = "8530";
  public static readonly ANOTHER_POSTCODE = "9000";

  public static readonly STRAATNAAM = "Generaal Deprezstraat";
  public static readonly ANOTHER_STRAATNAAM = "Keizer Leopolstraat";

  public static readonly VERWIJST_NAAR = buildVerwijstNaarIri("5516749");

  public static readonly ANOTHER_VERWIJST_NAAR = buildVerwijstNaarIri("346083");
}
