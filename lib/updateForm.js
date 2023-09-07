import { sparqlEscapeUri, uuid } from 'mu';
import { updateSudo } from '@lblod/mu-auth-sudo';
import { Graph, parse, RDFNode } from '../utils/rdflib';
import { bestuurseenheidForSession, isAllowdForLPDC } from '../utils/session-utils';
import { Literal, Statement } from "rdflib";

export async function updateForm(data, sessionUri) {

    if (!(await isAllowdForLPDC(sessionUri))) {
        throw `Session ${sessionUri} is not an LPDC User`;
    }

    const {uuid} = await bestuurseenheidForSession(sessionUri);
    const targetGraph = `http://mu.semte.ch/graphs/organizations/${uuid}/LoketLB-LPDCGebruiker`;

    const deletes = parseStatements(data.removals);
    const inserts = parseStatements(data.additions);

    const formStatements = parseStatements(data.graph);

    const modifiedTimeStamp = formStatements.find(quad => quad.predicate.value === 'http://purl.org/dc/terms/modified');
    const updatedModifiedTimeStamp =
        new Statement(modifiedTimeStamp.subject,
            modifiedTimeStamp.predicate,
            new Literal(new Date().toISOString(), modifiedTimeStamp.object.language, modifiedTimeStamp.object.datatype),
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
                    }`, {}, {sparqlEndpoint : 'http://virtuoso:8890/sparql'}); //TODO LPDC-603: create an extra parameter for this url ... do not hard code

    const updateResult = result.results.bindings[0]['callret-0'].value;

    if (updateResult.includes("delete 0 (or less) and insert 0 (or less) triples")) {
        throw new Error("Concurrent update");
    }

}

function parseStatements(statements) {
    const store = new Graph();
    const graph = `http://mutate-graph/${uuid()}`;
    parse(statements, store, {graph});
    return store.match(undefined, undefined, undefined, RDFNode(graph));
}
