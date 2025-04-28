import { Iri } from "./shared/iri";
import { requiredValue, requireNoDuplicates } from "./shared/invariant";
import { asSortedArray } from "./shared/collections-helper";
import { Person } from './person';

export class Session {
  private readonly _id: Iri;
  private readonly _bestuurseenheidId: Iri;
  private readonly _user: Person;
  private readonly _sessionRoles: SessionRoleTypeOrString[];

  constructor(
    id: Iri,
    bestuurseenheidId: Iri,
    user: Person,
    sessionRoles: SessionRoleTypeOrString[],
  ) {
    this._id = requiredValue(id, "id");
    this._bestuurseenheidId = requiredValue(
      bestuurseenheidId,
      "bestuurseenheidId",
    );
    this._user = requiredValue(
      user,
      "person",
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

  get user(): Person {
    return this._user;
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
