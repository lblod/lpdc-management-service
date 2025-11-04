import { LanguageString } from "../language-string";
import { Iri } from "./iri";

export function asSortedArray<T>(
  anArray: T[],
  compareFn?: (a: T, b: T) => number,
): T[] {
  const arr = [...anArray];
  arr.sort(compareFn);
  return arr;
}

export function arraysEqual<T>(
  anArray: T[],
  otherArray: T[],
  compareFn: (a: T, b: T) => boolean,
) {
  return (
    anArray.length === otherArray.length &&
    anArray.every((x, i) => compareFn(x, otherArray[i]))
  );
}

export function iriArraysEqual(anArray: Iri[], otherArray: Iri[]) {
  return arraysEqual(anArray, otherArray, (x: Iri, y: Iri) => x.equals(y));
}

export function languageStringArraysFunctionallyChanged(
  anArray: LanguageString[],
  otherArray: LanguageString[],
) {
  return !arraysEqual(
    anArray,
    otherArray,
    (x: LanguageString, y: LanguageString) =>
      LanguageString.isFunctionallyChanged(x, y),
  );
}
