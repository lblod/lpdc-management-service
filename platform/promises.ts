export const extractResultsFromAllSettled = async <T>(promises: Promise<T>[]): Promise<T[]> => {
    const results = await Promise.allSettled(promises);
    if (results.some(result => result.status === 'rejected')) {
        const reasons =
            results
                .filter(r => r.status === 'rejected')
                .map(r => r['reason']);
        const msg = `Some promises were rejected [${reasons.join('; ')}]`;
        console.log(msg);
        throw new Error(msg);
    }
    return results.map(result => (result as PromiseFulfilledResult<T>).value);
};