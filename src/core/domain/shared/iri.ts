import {Invariant} from "./invariant";

export type Iri = string;


export const iriAsId = (iri: Iri): Iri => {
    const idInvariant = Invariant.require(iri, 'id');
    idInvariant.to(idInvariant.notBeUndefined(), idInvariant.notBeBlank());

    return iri;
};