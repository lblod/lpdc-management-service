import { Iri } from "./shared/iri";
import { requiredValue } from "./shared/invariant";
import { Address } from "./address";
import { uuid } from "../../../mu-helper";
import { zip } from "lodash";

export class ContactPoint {
  private readonly _id: Iri;
  private readonly _uuid: string | undefined; //required for mu-cl-resources.
  private readonly _url: string | undefined;
  private readonly _email: string | undefined;
  private readonly _telephone: string | undefined;
  private readonly _openingHours: string | undefined;
  private readonly _order: number;
  private readonly _address: Address | undefined;

  private constructor(
    id: Iri,
    uuid: string | undefined,
    url: string | undefined,
    email: string | undefined,
    telephone: string | undefined,
    openingHours: string | undefined,
    order: number,
    address: Address | undefined,
  ) {
    this._id = requiredValue(id, "id");
    this._uuid = uuid;
    this._url = url;
    this._email = email;
    this._telephone = telephone;
    this._openingHours = openingHours;
    this._order = requiredValue(order, "order");
    this._address = address && !address.isEmpty() ? address : undefined;
  }

  static forInstance(contactPoint: ContactPoint): ContactPoint {
    return new ContactPoint(
      contactPoint.id,
      requiredValue(contactPoint.uuid, "uuid"),
      contactPoint.url,
      contactPoint.email,
      contactPoint.telephone,
      contactPoint.openingHours,
      contactPoint.order,
      contactPoint.address !== undefined
        ? Address.forInstance(contactPoint.address)
        : undefined,
    );
  }

  static forInstanceSnapshot(contactPoint: ContactPoint): ContactPoint {
    return new ContactPoint(
      contactPoint.id,
      undefined,
      contactPoint.url,
      contactPoint.email,
      contactPoint.telephone,
      contactPoint.openingHours,
      contactPoint.order,
      contactPoint.address !== undefined
        ? Address.forInstanceSnapshot(contactPoint.address)
        : undefined,
    );
  }

  static reconstitute(
    id: Iri,
    uuid: string | undefined,
    url: string | undefined,
    email: string | undefined,
    telephone: string | undefined,
    openingHours: string | undefined,
    order: number,
    address: Address | undefined,
  ): ContactPoint {
    return new ContactPoint(
      id,
      uuid,
      url,
      email,
      telephone,
      openingHours,
      order,
      address,
    );
  }

  get id(): Iri {
    return this._id;
  }

  get uuid(): string | undefined {
    return this._uuid;
  }

  get url(): string | undefined {
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

  get order(): number {
    return this._order;
  }

  get address(): Address | undefined {
    return this._address;
  }

  transformWithNewId(): ContactPoint {
    const uniqueId = uuid();
    return ContactPointBuilder.from(this)
      .withId(ContactPointBuilder.buildIri(uniqueId))
      .withUuid(uniqueId)
      .withAddress(this._address?.transformWithNewId())
      .build();
  }

  static isFunctionallyChanged(
    value: ContactPoint[],
    other: ContactPoint[],
  ): boolean {
    return (
      value.length !== other.length ||
      zip(value, other).some(([left, right]: [ContactPoint, ContactPoint]) => {
        return (
          left.url !== right.url ||
          left.email !== right.email ||
          left.telephone !== right.telephone ||
          left.openingHours !== right.openingHours ||
          left.order !== right.order ||
          Address.isFunctionallyChanged(left.address, right.address)
        );
      })
    );
  }

  public isEmpty(): boolean {
    const hasNoEmail = this._email === undefined || this._email.trim() === "";
    const hasNoTelephone =
      this._telephone === undefined || this._telephone.trim() === "";
    const hasNoUrl = this._url === undefined || this._url.trim() === "";
    const hasNoOpeningHours =
      this._openingHours === undefined || this._openingHours.trim() === "";
    const hasNoAddress = this._address === undefined;

    return (
      hasNoUrl &&
      hasNoEmail &&
      hasNoTelephone &&
      hasNoOpeningHours &&
      hasNoAddress
    );
  }
}
export class ContactPointBuilder {
  private id: Iri;
  private uuid: string | undefined;
  private url: string | undefined;
  private email: string | undefined;
  private telephone: string | undefined;
  private openingHours: string | undefined;
  private order: number;
  private address: Address | undefined;

  static buildIri(uniqueId: string): Iri {
    return new Iri(`http://data.lblod.info/id/contact-point/${uniqueId}`);
  }

  static from(contactPoint: ContactPoint): ContactPointBuilder {
    return new ContactPointBuilder()
      .withId(contactPoint.id)
      .withUuid(contactPoint.uuid)
      .withUrl(contactPoint.url)
      .withEmail(contactPoint.email)
      .withTelephone(contactPoint.telephone)
      .withOpeningHours(contactPoint.openingHours)
      .withAddress(contactPoint.address)
      .withOrder(contactPoint.order);
  }

  public withId(id: Iri): ContactPointBuilder {
    this.id = id;
    return this;
  }

  public withUuid(uuid: string): ContactPointBuilder {
    this.uuid = uuid;
    return this;
  }

  public withUrl(url: string): ContactPointBuilder {
    this.url = url;
    return this;
  }

  public withEmail(email: string): ContactPointBuilder {
    this.email = email;
    return this;
  }

  public withTelephone(telephone: string): ContactPointBuilder {
    this.telephone = telephone;
    return this;
  }

  public withOpeningHours(openingHours: string): ContactPointBuilder {
    this.openingHours = openingHours;
    return this;
  }

  public withOrder(order: number): ContactPointBuilder {
    this.order = order;
    return this;
  }

  public withAddress(address: Address): ContactPointBuilder {
    this.address = address;
    return this;
  }

  public build(): ContactPoint {
    return ContactPoint.reconstitute(
      this.id,
      this.uuid,
      this.url,
      this.email,
      this.telephone,
      this.openingHours,
      this.order,
      this.address,
    );
  }
}
