import {sparqlEscapeUri, update, uuid} from '../mu-helper';
import {updateSudo} from '@lblod/mu-auth-sudo';
import {APPLICATION_GRAPH} from '../config';
import {Graph, parse, RDFNode} from '../utils/rdflib';
import {isAllowedForLPDC} from '../utils/session-utils';
import {getScopedGraphsForStatement} from '../utils/common';
import {Literal, Statement} from "rdflib";
import {Quad} from "rdflib/lib/tf-types";
import LPDCError from "../utils/lpdc-error";
import {SessieSparqlRepository} from "../src/driven/persistence/sessie-sparql-repository";
import {BestuurseenheidSparqlRepository} from "../src/driven/persistence/bestuurseenheid-sparql-repository";


export async function updateFormAtomic(data: any, sessionUri: string, sessieRepository: SessieSparqlRepository, bestuurseenheidRepository: BestuurseenheidSparqlRepository): Promise<void> {

    const sessie = await sessieRepository.findById(sessionUri);
    const bestuurseenheid = await bestuurseenheidRepository.findById(sessie.getBestuurseenheidId());

    if (!(await isAllowedForLPDC(sessie.getId()))) {
        throw `Session ${sessie.getId()} is not an LPDC User`;
    }

    const targetGraph = `http://mu.semte.ch/graphs/organizations/${bestuurseenheid.getUUID()}/LoketLB-LPDCGebruiker`;

    const deletes = parseStatements(data.removals);
    const inserts = parseStatements(data.additions);

    const formStatements = parseStatements(data.graph);

    const modifiedTimeStamp = formStatements.find(quad => quad.predicate.value === 'http://purl.org/dc/terms/modified') as Statement;
    const updatedModifiedTimeStamp =
        new Statement(modifiedTimeStamp.subject,
            modifiedTimeStamp.predicate,
            new Literal(new Date().toISOString(), (modifiedTimeStamp.object as Literal).language, (modifiedTimeStamp.object as Literal).datatype),
            modifiedTimeStamp.graph);

    const result = await updateSudo(`
                    WITH ${sparqlEscapeUri(targetGraph)}
                    DELETE {
                        ${[...deletes, modifiedTimeStamp.toNT()].join('\n')}
                    }
                    INSERT {
                        ${[...inserts, updatedModifiedTimeStamp.toNT()].join('\n')}
                    }
                    WHERE {
                        ${modifiedTimeStamp.toNT()}
                    }`, {}, {sparqlEndpoint: 'http://virtuoso:8890/sparql'}); //TODO LPDC-603: create an extra parameter for this url ... do not hard code

    const updateResult = result.results.bindings[0]['callret-0'].value;

    if (updateResult.includes("delete 0 (or less) and insert 0 (or less) triples")) {
        throw new LPDCError(400, "De productfiche is gelijktijdig aangepast door een andere gebruiker. Refresh en geef je aanpassingen opnieuw in.");
    }

}

function parseStatements(statements: Statement[]): Array<Quad> {
    const store = Graph();
    const graph = `http://mutate-graph/${uuid()}`;
    parse(statements, store, {graph});
    return store.match(undefined, undefined, undefined, RDFNode(graph));
}


export async function updateForm(data: any, sessionUri: string, sessieRepository: SessieSparqlRepository, bestuurseenheidRepository: BestuurseenheidSparqlRepository) {
    const sessie = await sessieRepository.findById(sessionUri);
    const bestuurseenheid = await bestuurseenheidRepository.findById(sessie.getBestuurseenheidId());

    if (!(await isAllowedForLPDC(sessie.getId()))) {
        throw `Session ${sessie.getId()} is not an LPDC User`;
    }


    if (data.removals) await mutate('DELETE', data.removals, bestuurseenheid.getUUID());
    if (data.additions) await mutate('INSERT', data.additions);
}

async function mutate(mutationType: string, statements: any, bestuurseenheidUUID: string = null): Promise<void> {
    const store = Graph();
    const graph = `http://mutate-graph/${uuid()}`;
    parse(statements, store, {graph});
    const parsedStatements = store.match(undefined, undefined, undefined, RDFNode(graph)) as Statement[];

    if (parsedStatements.length > 0) {
        if (mutationType == 'DELETE') {
            // This is one hell of a workaround for a bug in virtuoso.
            // the bug: https://github.com/openlink/virtuoso-opensource/issues/1055
            // Due to this bug, deleting can't be delegated to mu-auth in the following case:
            //  A session DELETING a triple with a langString, that has a type occuring
            //  in multiple mu-allowed-groups AND the session having matching mu-allowed-groups
            // (In short: when a langTyped triple needs to be removed from multiple graphs).
            // Hence, we'll have to do some extra work ourselves.
            // We first check if the session has LPDC-rights, because we end up in sudo-space
            // If allowed, we make very specific calls, we know work for virtuoso through mu-auth. (see implemenetation)
            // We do a best effort check, but it is NOT bullet proof.
            // No type checking is done (what mu-auth should do), so all triples of the organisation the session is linked to, can be removed.
            // That would be in case we have very smart (authenticated) users (their fault) OR
            //   if a triple also IS availible in another graph, the session is not allowed on (sorry if you'll ever have to debug this).
            // We expect these to be a mega-edge case, but warn here.
            // There is new version of mu-auth underway, which will easily shield us from virtuoso. Or maybe the bugfix from virtuoso is earlier.
            // Keep code in sync with deleteForm.js

            const source = parsedStatements.map(t => t.toNT());
            for (const statement of source) {
                // The workaround: ensure mu-auth deletes one triple in one graph at a time. We know that works.
                const targetGraphPattern = `http://mu.semte.ch/graphs/organizations/${bestuurseenheidUUID}/`;
                const targetGraphs = await getScopedGraphsForStatement(statement, targetGraphPattern);

                for (const graph of targetGraphs) {
                    await updateSudo(`
            DELETE DATA {
              GRAPH ${sparqlEscapeUri(graph)} {
                ${statement}
              }
            }`);
                }
            }
        } else {
            await update(`
        ${mutationType} DATA {
          GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
            ${parsedStatements.join('\n')}
          }
        }`);
        }
    }
}
