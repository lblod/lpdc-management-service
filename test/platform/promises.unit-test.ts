import {extractResultsFromAllSettled} from "../../platform/promises";

describe('promises tests', () => {

    test('returns the resolved results of all promises', async () => {
        const result = await extractResultsFromAllSettled<any>([
            Promise.resolve('abc'),
            Promise.resolve('def'),
            Promise.resolve('ghi'),
            Promise.resolve(12),
        ]);
        expect(result).toEqual(['abc','def', 'ghi', 12]);
    });

    test('throws an error when a promise rejects and specifies reason', async () => {
        await expect(extractResultsFromAllSettled<any>([
            Promise.resolve('abc'),
            Promise.reject('this specific promise was rejected!'),
            Promise.resolve('ghi'),
            Promise.resolve(12),
        ])).rejects.toThrow(new Error('Some promises were rejected ["this specific promise was rejected!"]'));
    });

});