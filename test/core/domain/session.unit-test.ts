import {aSession} from "./session-test-builder";
import {Iri} from "../../../src/core/domain/shared/iri";
import {SessionRoleType} from "../../../src/core/domain/session";

describe('constructing', () => {
    test('Undefined id throws error', () => {
        expect(() => aSession().withId(undefined).build()).toThrow(new Error('id should not be absent'));
    });
    test('Invalid iri id throws error', () => {
        expect(() => aSession().withId(new Iri('   ')).build()).toThrow(new Error('iri should not be blank'));
    });

    test('Undefined bestuurseenheidId throws error', () => {
        expect(() => aSession().withBestuurseenheidId(undefined).build()).toThrow(new Error('bestuurseenheidId should not be absent'));
    });
    test('Invalid iri bestuurseenheidId throws error', () => {
        expect(() => aSession().withBestuurseenheidId(new Iri('   ')).build()).toThrow(new Error('iri should not be blank'));
    });

    test('Duplicate session roles throws error', () => {
        expect(() => aSession().withSessionRoles(['abc', 'abc']).build()).toThrow(new Error('sessionRoles should not contain duplicates'));
    });

    test('hasRole', () => {
        expect(aSession().withSessionRoles([]).build().hasRole(SessionRoleType.LOKETLB_LPDCGEBRUIKER)).toBeFalsy();
        expect(aSession().withSessionRoles(['abc']).build().hasRole(SessionRoleType.LOKETLB_LPDCGEBRUIKER)).toBeFalsy();
        expect(aSession().withSessionRoles(['def', 'abc']).build().hasRole(SessionRoleType.LOKETLB_LPDCGEBRUIKER)).toBeFalsy();
        expect(aSession().withSessionRoles(['def', 'abc', SessionRoleType.LOKETLB_LPDCGEBRUIKER]).build().hasRole(SessionRoleType.LOKETLB_LPDCGEBRUIKER)).toBeTruthy();

        expect(() => aSession().withSessionRoles([SessionRoleType.LOKETLB_LPDCGEBRUIKER]).build().hasRole(undefined)).toThrow(new Error('role should not be absent'));
    });

});