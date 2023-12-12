import {createApp, errorHandler} from './server';
import * as sparql from './sparql';
import {v4 as uuidV4} from 'uuid';

// generates a uuid
const uuid = uuidV4;

const mu = {
    createApp: createApp,
    sparql: sparql,
    SPARQL: sparql.sparql,
    query: sparql.query,
    update: sparql.update,
    sparqlEscape: sparql.sparqlEscape,
    sparqlEscapeString: sparql.sparqlEscapeString,
    sparqlEscapeUri: sparql.sparqlEscapeUri,
    sparqlEscapeDecimal: sparql.sparqlEscapeDecimal,
    sparqlEscapeInt: sparql.sparqlEscapeInt,
    sparqlEscapeFloat: sparql.sparqlEscapeFloat,
    sparqlEscapeDate: sparql.sparqlEscapeDate,
    sparqlEscapeDateTime: sparql.sparqlEscapeDateTime,
    sparqlEscapeBool: sparql.sparqlEscapeBool,
    uuid,
    errorHandler
};

const SPARQL = mu.SPARQL,
    query = mu.query,
    update = mu.update,
    sparqlEscape = mu.sparqlEscape,
    sparqlEscapeString = mu.sparqlEscapeString,
    sparqlEscapeUri = mu.sparqlEscapeUri,
    sparqlEscapeInt = mu.sparqlEscapeInt,
    sparqlEscapeDecimal = mu.sparqlEscapeDecimal,
    sparqlEscapeFloat = mu.sparqlEscapeFloat,
    sparqlEscapeDate = mu.sparqlEscapeDate,
    sparqlEscapeDateTime = mu.sparqlEscapeDateTime,
    sparqlEscapeBool = mu.sparqlEscapeBool;

export {
    createApp,
    sparql,
    SPARQL,
    query,
    update,
    sparqlEscape,
    sparqlEscapeString,
    sparqlEscapeUri,
    sparqlEscapeDecimal,
    sparqlEscapeInt,
    sparqlEscapeFloat,
    sparqlEscapeDate,
    sparqlEscapeDateTime,
    sparqlEscapeBool,
    uuid,
    errorHandler
};

export default mu;
