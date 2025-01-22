import { requiredValue } from "./shared/invariant";
import { Iri } from "./shared/iri";

export class Spatial {
  private readonly _id: Iri;
  private readonly _uuid: string;
  private readonly _prefLabel: string;
  private readonly _notation: string;
  private readonly _endDate: Date | undefined;

  constructor(
    id: Iri,
    uuid: string,
    prefLabel: string,
    notation: string,
    endDate?: Date | undefined,
  ) {
    this._id = requiredValue(id, "id");
    this._uuid = requiredValue(uuid, "uuid");
    this._prefLabel = requiredValue(prefLabel, "prefLabel");
    this._notation = requiredValue(notation, "notation");
    this._endDate = endDate;
  }

  get id(): Iri {
    return this._id;
  }

  get uuid(): string {
    return this._uuid;
  }

  get prefLabel(): string {
    return this._prefLabel;
  }

  get notation(): string {
    return this._notation;
  }

  get endDate(): Date {
    return this._endDate;
  }

  get isExpired(): boolean {
    return this.endDate && this.endDate < new Date();
  }
}
