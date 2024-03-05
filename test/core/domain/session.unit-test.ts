import {aSession} from "./session-test-builder";
import {Iri} from "../../../src/core/domain/shared/iri";
import {SessionRoleType} from "../../../src/core/domain/session";
import {InvariantError} from "../../../src/core/domain/shared/lpdc-error";

describe('constructing', () => {
    test('Undefined id throws error', () => {
        expect(() => aSession().withId(undefined).build()).toThrowWithMessage(InvariantError, 'id should not be absent');
    });
    test('Invalid iri id throws error', () => {
        expect(() => aSession().withId(new Iri('   ')).build()).toThrowWithMessage(InvariantError, 'iri should not be blank');
    });

    test('Undefined bestuurseenheidId throws error', () => {
        expect(() => aSession().withBestuurseenheidId(undefined).build()).toThrowWithMessage(InvariantError, 'bestuurseenheidId should not be absent');
    });
    test('Invalid iri bestuurseenheidId throws error', () => {
        expect(() => aSession().withBestuurseenheidId(new Iri('   ')).build()).toThrowWithMessage(InvariantError, 'iri should not be blank');
    });

    test('Duplicate session roles throws error', () => {
        expect(() => aSession().withSessionRoles(['abc', 'abc']).build()).toThrowWithMessage(InvariantError, 'sessionRoles should not contain duplicates');
    });

    test('hasRole', () => {
        expect(aSession().withSessionRoles([]).build().hasRole(SessionRoleType.LOKETLB_LPDCGEBRUIKER)).toBeFalsy();
        expect(aSession().withSessionRoles(['abc']).build().hasRole(SessionRoleType.LOKETLB_LPDCGEBRUIKER)).toBeFalsy();
        expect(aSession().withSessionRoles(['def', 'abc']).build().hasRole(SessionRoleType.LOKETLB_LPDCGEBRUIKER)).toBeFalsy();
        expect(aSession().withSessionRoles(['def', 'abc', SessionRoleType.LOKETLB_LPDCGEBRUIKER]).build().hasRole(SessionRoleType.LOKETLB_LPDCGEBRUIKER)).toBeTruthy();

        expect(() => aSession().withSessionRoles([SessionRoleType.LOKETLB_LPDCGEBRUIKER]).build().hasRole(undefined)).toThrowWithMessage(InvariantError, 'role should not be absent');
    });

});