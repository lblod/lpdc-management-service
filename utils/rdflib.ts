import {graph as Graph, parse as rdflibParse, sym as RDFNode} from 'rdflib';

function parse(ttl, store, {graph, contentType = 'text/turtle'}: { graph?: string, contentType?: string } = {}): void {
    rdflibParse(ttl, store, graph, contentType);
}

//TODO LPDC-917: remove file
export {
    parse,
    Graph,
    RDFNode
};