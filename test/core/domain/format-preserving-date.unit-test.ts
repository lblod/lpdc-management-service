import {FormatPreservingDate} from "../../../src/core/domain/format-preserving-date";


describe('format preserving date', () => {

    test('preserves format exactly', () => {
       expect(FormatPreservingDate.of('2027-09-16 00:00:00Z').value).toEqual('2027-09-16 00:00:00Z');
       expect(FormatPreservingDate.of('2023-09-12 20:00:20.564313Z').value).toEqual('2023-09-12 20:00:20.564313Z');
       expect(FormatPreservingDate.of('2023-09-12 20:00:20.564Z').value).toEqual('2023-09-12 20:00:20.564Z');
       expect(FormatPreservingDate.of('2023-09-12Z').value).toEqual('2023-09-12Z');
    });

    test('functionally not changed', () => {
        expect(FormatPreservingDate.isFunctionallyChanged(undefined, undefined)).toBeFalsy();
        expect(FormatPreservingDate.isFunctionallyChanged(FormatPreservingDate.of('2027-09-16 00:00:00Z'), FormatPreservingDate.of('2027-09-16 00:00:00Z'))).toBeFalsy();
        expect(FormatPreservingDate.isFunctionallyChanged(FormatPreservingDate.of('2027-09-16 20:00:20.564Z'), FormatPreservingDate.of('2027-09-16 20:00:20.564Z'))).toBeFalsy();
        expect(FormatPreservingDate.isFunctionallyChanged(FormatPreservingDate.of('2027-09-16 20:00:20.564313Z'), FormatPreservingDate.of('2027-09-16 20:00:20.564313Z'))).toBeFalsy();

        expect(FormatPreservingDate.isFunctionallyChanged(FormatPreservingDate.of('2027-09-16 20:00:20.000Z'), FormatPreservingDate.of('2027-09-16 20:00:20.000000Z'))).toBeFalsy();
        expect(FormatPreservingDate.isFunctionallyChanged(FormatPreservingDate.of('2027-09-16 20:00:20.564Z'), FormatPreservingDate.of('2027-09-16 20:00:20.564000Z'))).toBeFalsy();
        expect(FormatPreservingDate.isFunctionallyChanged(FormatPreservingDate.of('2027-09-16 20:00:22Z'), FormatPreservingDate.of('2027-09-16 20:00:22.000Z'))).toBeFalsy();
        expect(FormatPreservingDate.isFunctionallyChanged(FormatPreservingDate.of('2027-09-16 20:00:22Z'), FormatPreservingDate.of('2027-09-16 20:00:22.000000Z'))).toBeFalsy();
    });

    test('functionally changed', () => {
        expect(FormatPreservingDate.isFunctionallyChanged(FormatPreservingDate.of('2027-09-16 00:00:00Z'), undefined)).toBeTruthy();
        expect(FormatPreservingDate.isFunctionallyChanged(undefined, FormatPreservingDate.of('2027-09-17 00:00:00Z'))).toBeTruthy();

        expect(FormatPreservingDate.isFunctionallyChanged(FormatPreservingDate.of('2027-09-16 00:00:00Z'), FormatPreservingDate.of('2027-09-17 00:00:00Z'))).toBeTruthy();
        expect(FormatPreservingDate.isFunctionallyChanged(FormatPreservingDate.of('2027-09-16 20:00:20.564Z'), FormatPreservingDate.of('2027-09-16 20:00:20.561Z'))).toBeTruthy();
        expect(FormatPreservingDate.isFunctionallyChanged(FormatPreservingDate.of('2027-09-16 20:00:20.564313Z'), FormatPreservingDate.of('2027-09-16 20:00:20.564311Z'))).toBeTruthy();

        expect(FormatPreservingDate.isFunctionallyChanged(FormatPreservingDate.of('2027-09-16 20:00:20.000Z'), FormatPreservingDate.of('2027-09-16 20:00:20.000001Z'))).toBeTruthy();
        expect(FormatPreservingDate.isFunctionallyChanged(FormatPreservingDate.of('2027-09-16 20:00:20.564Z'), FormatPreservingDate.of('2027-09-16 20:00:20.564001Z'))).toBeTruthy();
        expect(FormatPreservingDate.isFunctionallyChanged(FormatPreservingDate.of('2027-09-16 20:00:20Z'), FormatPreservingDate.of('2027-09-16 20:00:20.001Z'))).toBeTruthy();
        expect(FormatPreservingDate.isFunctionallyChanged(FormatPreservingDate.of('2027-09-16 20:00:20Z'), FormatPreservingDate.of('2027-09-16 20:00:20.000001Z'))).toBeTruthy();
    });


});