import {Iri} from "../../../src/core/domain/shared/iri";
import {Session, SessionRoleType, SessionRoleTypeOrString} from "../../../src/core/domain/session";
import {uuid} from "mu";
import {buildBestuurseenheidIri, buildSessionIri} from "./iri-test-builder";

export function aSession(): SessionTestBuilder {
    return new SessionTestBuilder()
        .withId(buildSessionIri(uuid()))
        .withBestuurseenheidId(buildBestuurseenheidIri(uuid()))
        .withSessionRoles([SessionRoleType.LOKETLB_LPDCGEBRUIKER]);
}
export class SessionTestBuilder {
    private id: Iri;
    private bestuurseenheidId: Iri;
    private sessionRoles: SessionRoleTypeOrString[] = [];

    public withId(id: Iri): SessionTestBuilder {
        this.id = id;
        return this;
    }

    public withBestuurseenheidId(bestuurseenheidId: Iri): SessionTestBuilder {
        this.bestuurseenheidId = bestuurseenheidId;
        return this;
    }

    public withSessionRoles(sessionRoles: SessionRoleTypeOrString[]): SessionTestBuilder {
        this.sessionRoles = sessionRoles;
        return this;
    }

    public build(): Session {
        return new Session(this.id, this.bestuurseenheidId, this.sessionRoles);
    }

}
