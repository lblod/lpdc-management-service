export const extractResultsFromAllSettled = async <T>(promises: Promise<T>[]): Promise<T[]> => {
    const results = await Promise.allSettled(promises);
    const rejectedReasons = results
        .filter(r => r.status === 'rejected')
        .map(r => r['reason']);

    if (rejectedReasons.length === 0) {
        return results.map(result => (result as PromiseFulfilledResult<T>).value);
    } else {
        const msg = `Some promises were rejected [${rejectedReasons.join('; ')}]`;
        console.log(msg);
        throw new Error(msg);
    }

};
