import {Invariant} from "./invariant";

export type Iri = string;

//TODO LPDC-916: add format validation ?
export const requiredIri = (iri: Iri, name: string = 'iri'): Iri => {
    const invariant = Invariant.require(iri, name);
    return invariant.to(invariant.notBeUndefined(), invariant.notBeBlank());
};