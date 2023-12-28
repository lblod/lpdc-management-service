import {FormatPreservingDate} from "../../../src/core/domain/format-preserving-date";


describe('format preserving date', () => {

    test('preserves format exactly', () => {
       expect(FormatPreservingDate.of('2027-09-16 00:00:00Z').value).toEqual('2027-09-16 00:00:00Z');
       expect(FormatPreservingDate.of('2023-09-12 20:00:20.564313Z').value).toEqual('2023-09-12 20:00:20.564313Z');
       expect(FormatPreservingDate.of('2023-09-12 20:00:20.564Z').value).toEqual('2023-09-12 20:00:20.564Z');
       expect(FormatPreservingDate.of('2023-09-12Z').value).toEqual('2023-09-12Z');
    });

    test('equal', () => {
        expect(FormatPreservingDate.of('2027-09-16 00:00:00Z').isEqual(FormatPreservingDate.of('2027-09-16 00:00:00Z'))).toBeTruthy();
        expect(FormatPreservingDate.of('2027-09-16 20:00:20.564Z').isEqual(FormatPreservingDate.of('2027-09-16 20:00:20.564Z'))).toBeTruthy();
        expect(FormatPreservingDate.of('2027-09-16 20:00:20.564313Z').isEqual(FormatPreservingDate.of('2027-09-16 20:00:20.564313Z'))).toBeTruthy();

        expect(FormatPreservingDate.of('2027-09-16 20:00:20.000Z').isEqual(FormatPreservingDate.of('2027-09-16 20:00:20.000000Z'))).toBeTruthy();
        expect(FormatPreservingDate.of('2027-09-16 20:00:20.564Z').isEqual(FormatPreservingDate.of('2027-09-16 20:00:20.564000Z'))).toBeTruthy();
        expect(FormatPreservingDate.of('2027-09-16 20:00:22Z').isEqual(FormatPreservingDate.of('2027-09-16 20:00:22.000Z'))).toBeTruthy();
        expect(FormatPreservingDate.of('2027-09-16 20:00:22Z').isEqual(FormatPreservingDate.of('2027-09-16 20:00:22.000000Z'))).toBeTruthy();
    });

    test('not equal', () => {
        expect(FormatPreservingDate.of('2027-09-16 00:00:00Z').isEqual(undefined)).toBeFalsy();

        expect(FormatPreservingDate.of('2027-09-16 00:00:00Z').isEqual(FormatPreservingDate.of('2027-09-17 00:00:00Z'))).toBeFalsy();
        expect(FormatPreservingDate.of('2027-09-16 20:00:20.564Z').isEqual(FormatPreservingDate.of('2027-09-16 20:00:20.561Z'))).toBeFalsy();
        expect(FormatPreservingDate.of('2027-09-16 20:00:20.564313Z').isEqual(FormatPreservingDate.of('2027-09-16 20:00:20.564311Z'))).toBeFalsy();

        expect(FormatPreservingDate.of('2027-09-16 20:00:20.000Z').isEqual(FormatPreservingDate.of('2027-09-16 20:00:20.000001Z'))).toBeFalsy();
        expect(FormatPreservingDate.of('2027-09-16 20:00:20.564Z').isEqual(FormatPreservingDate.of('2027-09-16 20:00:20.564001Z'))).toBeFalsy();
        expect(FormatPreservingDate.of('2027-09-16 20:00:20Z').isEqual(FormatPreservingDate.of('2027-09-16 20:00:20.001Z'))).toBeFalsy();
        expect(FormatPreservingDate.of('2027-09-16 20:00:20Z').isEqual(FormatPreservingDate.of('2027-09-16 20:00:20.000001Z'))).toBeFalsy();
    });


});