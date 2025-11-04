import { Iri } from "./shared/iri";
import { requiredValue } from "./shared/invariant";
import { LanguageString } from "./language-string";
import { Language } from "./language";
import { uuid } from "../../../mu-helper";

export class Address {
  private readonly _id: Iri;
  private readonly _uuid: string | undefined; //required for mu-cl-resources.
  private readonly _gemeentenaam: LanguageString | undefined;
  private readonly _land: LanguageString | undefined;
  private readonly _huisnummer: string | undefined;
  private readonly _busnummer: string | undefined;
  private readonly _postcode: string | undefined;
  private readonly _straatnaam: LanguageString | undefined;
  private readonly _verwijstNaar: Iri | undefined;

  private constructor(
    id: Iri,
    uuid: string | undefined,
    gemeentenaam: LanguageString | undefined,
    land: LanguageString | undefined,
    huisnummer: string | undefined,
    busnummer: string | undefined,
    postcode: string | undefined,
    straatnaam: LanguageString | undefined,
    verwijstNaar: Iri | undefined,
  ) {
    LanguageString.validateUniqueAndCorrectLanguages(
      [Language.NL],
      gemeentenaam,
      land,
      straatnaam,
    );

    this._id = requiredValue(id, "id");
    this._uuid = uuid;
    this._gemeentenaam = gemeentenaam;
    this._land = land;
    this._huisnummer = huisnummer;
    this._busnummer = busnummer;
    this._postcode = postcode;
    this._straatnaam = straatnaam;
    this._verwijstNaar = verwijstNaar;
  }

  static forInstance(address: Address) {
    requiredValue(address.uuid, "uuid");
    return address;
  }

  static forInstanceSnapshot(address: Address) {
    return new Address(
      address.id,
      undefined,
      address.gemeentenaam,
      address.land,
      address.huisnummer,
      address.busnummer,
      address.postcode,
      address.straatnaam,
      address.verwijstNaar,
    );
  }

  static reconstitute(
    id: Iri,
    uuid: string | undefined,
    gemeentenaam: LanguageString | undefined,
    land: LanguageString | undefined,
    huisnummer: string | undefined,
    busnummer: string | undefined,
    postcode: string | undefined,
    straatnaam: LanguageString | undefined,
    verwijstNaar: Iri | undefined,
  ) {
    return new Address(
      id,
      uuid,
      gemeentenaam,
      land,
      huisnummer,
      busnummer,
      postcode,
      straatnaam,
      verwijstNaar,
    );
  }

  get id(): Iri {
    return this._id;
  }

  get uuid(): string | undefined {
    return this._uuid;
  }

  get gemeentenaam(): LanguageString | undefined {
    return this._gemeentenaam;
  }

  get land(): LanguageString | undefined {
    return this._land;
  }

  get huisnummer(): string | undefined {
    return this._huisnummer;
  }

  get busnummer(): string | undefined {
    return this._busnummer;
  }

  get postcode(): string | undefined {
    return this._postcode;
  }

  get straatnaam(): LanguageString | undefined {
    return this._straatnaam;
  }

  get verwijstNaar(): Iri | undefined {
    return this._verwijstNaar;
  }

  isValid(): boolean {
    return !!this.verwijstNaar;
  }

  transformWithNewId(): Address {
    const uniqueId = uuid();
    return AddressBuilder.from(this)
      .withId(AddressBuilder.buildIri(uniqueId))
      .withUuid(uniqueId)
      .build();
  }

  static isFunctionallyChanged(value: Address, other: Address): boolean {
    return (
      LanguageString.isFunctionallyChanged(
        value?.gemeentenaam,
        other?.gemeentenaam,
      ) ||
      LanguageString.isFunctionallyChanged(value?.land, other?.land) ||
      value?.huisnummer !== other?.huisnummer ||
      value?.busnummer !== other?.busnummer ||
      value?.postcode !== other?.postcode ||
      LanguageString.isFunctionallyChanged(
        value?.straatnaam,
        other?.straatnaam,
      ) ||
      Iri.compare(value?.verwijstNaar, other?.verwijstNaar) !== 0
    );
  }

  public isEmpty(): boolean {
    const hasNoGemeentenaam =
      this._gemeentenaam === undefined || this._gemeentenaam.isEmpty();
    const hasNoLand = this._land === undefined || this._land.isEmpty();
    const hasNoHuisnummer =
      this._huisnummer === undefined || this._huisnummer.trim() === "";
    const hasNoBusnummer =
      this._busnummer === undefined || this._busnummer.trim() === "";
    const hasNoPostcode =
      this._postcode === undefined || this._postcode.trim() === "";
    const hasNoStraatnaam =
      this._straatnaam === undefined || this._straatnaam.isEmpty();
    const hasNoVerwijstNaar = this._verwijstNaar === undefined;

    return (
      hasNoGemeentenaam &&
      hasNoLand &&
      hasNoHuisnummer &&
      hasNoBusnummer &&
      hasNoPostcode &&
      hasNoStraatnaam &&
      hasNoVerwijstNaar
    );
  }
}

export class AddressBuilder {
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
    return new Iri(`http://data.lblod.info/id/address/${uniqueId}`);
  }

  static from(address: Address): AddressBuilder {
    return new AddressBuilder()
      .withId(address.id)
      .withUuid(address.uuid)
      .withGemeentenaam(address.gemeentenaam)
      .withLand(address.land)
      .withHuisnummer(address.huisnummer)
      .withBusnummer(address.busnummer)
      .withPostcode(address.postcode)
      .withStraatnaam(address.straatnaam)
      .withVerwijstNaar(address.verwijstNaar);
  }

  public withId(id: Iri): AddressBuilder {
    this.id = id;
    return this;
  }

  public withUuid(uuid: string): AddressBuilder {
    this.uuid = uuid;
    return this;
  }

  public withGemeentenaam(gemeentenaam: LanguageString): AddressBuilder {
    this.gemeentenaam = gemeentenaam;
    return this;
  }

  public withLand(land: LanguageString): AddressBuilder {
    this.land = land;
    return this;
  }

  public withHuisnummer(huisnummer: string): AddressBuilder {
    this.huisnummer = huisnummer;
    return this;
  }

  public withBusnummer(busnummer: string): AddressBuilder {
    this.busnummer = busnummer;
    return this;
  }

  public withPostcode(postcode: string): AddressBuilder {
    this.postcode = postcode;
    return this;
  }

  public withStraatnaam(straatnaam: LanguageString): AddressBuilder {
    this.straatnaam = straatnaam;
    return this;
  }

  public withVerwijstNaar(verwijstNaar: Iri): AddressBuilder {
    this.verwijstNaar = verwijstNaar;
    return this;
  }

  public build(): Address {
    return Address.reconstitute(
      this.id,
      this.uuid,
      this.gemeentenaam,
      this.land,
      this.huisnummer,
      this.busnummer,
      this.postcode,
      this.straatnaam,
      this.verwijstNaar,
    );
  }
}
