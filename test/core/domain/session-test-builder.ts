import { Iri } from "../../../src/core/domain/shared/iri";
import {
  Session,
  SessionRoleType,
  SessionRoleTypeOrString,
} from "../../../src/core/domain/session";
import { uuid } from "../../../mu-helper";
import { buildBestuurseenheidIri, buildAccountIri, buildSessionIri } from "./iri-test-builder";

export function aSession(): SessionTestBuilder {
  return new SessionTestBuilder()
    .withId(buildSessionIri(uuid()))
    .withBestuurseenheidId(buildBestuurseenheidIri(uuid()))
    .withAccountId(buildAccountIri(uuid()))
    .withSessionRoles([SessionRoleType.LOKETLB_LPDCGEBRUIKER]);
}
export class SessionTestBuilder {
  private id: Iri;
  private bestuurseenheidId: Iri;
  private accountId: Iri;
  private sessionRoles: SessionRoleTypeOrString[] = [];

  public withId(id: Iri): SessionTestBuilder {
    this.id = id;
    return this;
  }

  public withBestuurseenheidId(bestuurseenheidId: Iri): SessionTestBuilder {
    this.bestuurseenheidId = bestuurseenheidId;
    return this;
  }

  public withAccountId(accountId: Iri): SessionTestBuilder {
    this.accountId = accountId;
    return this;
  }

  public withSessionRoles(
    sessionRoles: SessionRoleTypeOrString[],
  ): SessionTestBuilder {
    this.sessionRoles = sessionRoles;
    return this;
  }

  public build(): Session {
    return new Session(this.id, this.bestuurseenheidId, this.accountId, this.sessionRoles);
  }
}
