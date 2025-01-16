import { Iri } from "./shared/iri";
import { requiredValue, requireNoDuplicates } from "./shared/invariant";
import { asSortedArray } from "./shared/collections-helper";

export class Session {
  private readonly _id: Iri;
  private readonly _bestuurseenheidId: Iri;
  private readonly _sessionRoles: SessionRoleTypeOrString[];

  constructor(
    id: Iri,
    bestuurseenheidId: Iri,
    sessionRoles: SessionRoleTypeOrString[],
  ) {
    this._id = requiredValue(id, "id");
    this._bestuurseenheidId = requiredValue(
      bestuurseenheidId,
      "bestuurseenheidId",
    );
    this._sessionRoles = requireNoDuplicates(
      asSortedArray(sessionRoles),
      "sessionRoles",
    );
  }

  get id(): Iri {
    return this._id;
  }

  get bestuurseenheidId(): Iri {
    return this._bestuurseenheidId;
  }

  get sessionRoles(): SessionRoleTypeOrString[] {
    return [...this._sessionRoles];
  }

  hasRole(role: SessionRoleType): boolean {
    return this._sessionRoles.includes(requiredValue(role, "role"));
  }
}

export enum SessionRoleType {
  LOKETLB_LPDCGEBRUIKER = "LoketLB-LPDCGebruiker",
}

export type SessionRoleTypeOrString = SessionRoleType | string;
