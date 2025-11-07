export function asSortedArray<T>(
  anArray: T[],
  compareFn?: (a: T, b: T) => number,
): T[] {
  const arr = [...anArray];
  arr.sort(compareFn);
  return arr;
}
