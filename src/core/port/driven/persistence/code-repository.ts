import {Iri} from "../../../domain/shared/iri";

export interface CodeRepository {

    exists(schema: CodeSchema, id: Iri): Promise<boolean>;

    save(schema: CodeSchema, id: Iri, prefLabel: string, seeAlso: Iri): Promise<void>;

}

export enum CodeSchema {
    IPDCOrganisaties = 'IPDCOrganisaties',
}