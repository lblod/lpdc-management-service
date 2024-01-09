import {Iri} from "../../../src/core/domain/shared/iri";
import {Session, SessionRole} from "../../../src/core/domain/session";
import {uuid} from "../../../mu-helper";
import {buildBestuurseenheidIri} from "./iri-test-builder";

export function aSession(): SessionTestBuilder {
    return new SessionTestBuilder()
        .withId(SessionTestBuilder.buildIri(uuid()))
        .withBestuurseenheidId(buildBestuurseenheidIri(uuid()))
        .withSessionRole(SessionRole.LOKETLB_LPDCGEBRUIKER);
}
export class SessionTestBuilder {
    private id: Iri;
    private bestuurseenheidId: Iri;
    private sessionRole: SessionRole;

    static buildIri(uniqueId: string): Iri {
        return new Iri(`http://mu.semte.ch/sessions/${uniqueId}`);
    }

    public withId(id: Iri): SessionTestBuilder {
        this.id = id;
        return this;
    }

    public withBestuurseenheidId(bestuurseenheidId: Iri): SessionTestBuilder {
        this.bestuurseenheidId = bestuurseenheidId;
        return this;
    }

    public withSessionRole(sessionRole: SessionRole): SessionTestBuilder {
        this.sessionRole = sessionRole;
        return this;
    }

    public build(): Session {
        return new Session(this.id, this.bestuurseenheidId, this.sessionRole);
    }

}