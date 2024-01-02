

export function asSortedArray<T>(anArray: T[], compareFn?: (a: T, b: T) => number): T[] {
    const arr = [...anArray];
    arr.sort(compareFn);
    return arr;
}

export function asSortedSet<T>(aSet: Set<T>, compareFn?: (a: T, b: T) => number): Set<T> {
    return new Set(asSortedArray(Array.from(aSet), compareFn));
}

