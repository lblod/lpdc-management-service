import {Bestuurseenheid} from "../../core/domain/bestuurseenheid";
import {FormalInformalChoice} from "../../core/domain/formal-informal-choice";
import {FormalInformalChoiceRepository} from "../../core/port/driven/persistence/formal-informal-choice-repository";
import {SparqlQuerying} from "./sparql-querying";
import {PREFIX} from "../../../config";
import {sparqlEscapeUri} from "../../../mu-helper";
import {Iri} from "../../core/domain/shared/iri";
import {FormatPreservingDate} from "../../core/domain/format-preserving-date";
import {ChosenFormType} from "../../core/domain/types";

export class FormalInformalChoiceSparqlRepository implements FormalInformalChoiceRepository {

    protected readonly querying: SparqlQuerying;

    constructor(endpoint?: string) {
        this.querying = new SparqlQuerying(endpoint);
    }

    async findByBestuurseenheid(bestuurseenheid: Bestuurseenheid): Promise<FormalInformalChoice> {
        const query = `
            ${PREFIX.lpdcExt}
            ${PREFIX.mu}
            ${PREFIX.schema}
            ${PREFIX.dct}
            
            SELECT ?formalInformalChoiceId ?uuid ?dateCreated ?chosenForm ?bestuurseenheidId WHERE {
                GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                    ?formalInformalChoiceId a lpdcExt:FormalInformalChoice ;
                        mu:uuid ?uuid ;
                        schema:dateCreated ?dateCreated ;
                        lpdcExt:chosenForm ?chosenForm ;
                        dct:relation ?bestuurseenheidId .
                    
                }
            }
        `;
        const result = await this.querying.singleRow(query);

        if (!result) {
            return undefined;
        }

        const formalInformalChoiceId = new Iri(result['formalInformalChoiceId'].value)

        const rawChosenForm = result['chosenForm'].value;

        const chosenFormKey: string | undefined = Object.keys(ChosenFormType)
            .find(key => ChosenFormType[key] === rawChosenForm);
        if(!chosenFormKey) {
            throw Error(`could not map '${rawChosenForm}' for iri: <${formalInformalChoiceId}>`);
        }

        const formalInformalChoice = new FormalInformalChoice(
            formalInformalChoiceId,
            result['uuid'].value,
            FormatPreservingDate.of(result['dateCreated'].value),
            rawChosenForm,
            new Iri(result['bestuurseenheidId'].value),
        );

        if(!formalInformalChoice.bestuurseenheidId.equals(bestuurseenheid.id)) {
            throw Error(`formal informal choice found <${formalInformalChoice.id}> in incorrect user graph`);
        }


        return formalInformalChoice;

    }

}