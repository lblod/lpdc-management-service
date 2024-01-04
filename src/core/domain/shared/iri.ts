import {Invariant} from "./invariant";

export type Iri = string;


export const requiredIri = (iri: Iri, name: string = 'iri'): Iri => {
    const idInvariant = Invariant.require(iri, name);
    idInvariant.to(idInvariant.notBeUndefined(), idInvariant.notBeBlank());

    return iri;
};