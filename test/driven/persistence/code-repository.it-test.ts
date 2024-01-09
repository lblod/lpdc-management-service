import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {DirectDatabaseAccess} from "./direct-database-access";
import {CodeSparqlRepository} from "../../../src/driven/persistence/code-sparql-repository";
import {sparqlEscapeUri, uuid} from "../../../mu-helper";
import {PREFIX} from "../../../config";
import {CodeSchema} from "../../../src/core/port/driven/persistence/code-repository";
import {Iri} from "../../../src/core/domain/shared/iri";

describe('Code Repository', () => {

    const repository = new CodeSparqlRepository(TEST_SPARQL_ENDPOINT);
    const directDatabaseAccess = new DirectDatabaseAccess(TEST_SPARQL_ENDPOINT);

    describe('exists', () => {

        test('returns true when code exists for given schema', async () => {
            const someIri = new Iri(`http://some-iri/${uuid()}`);

            await directDatabaseAccess.insertData(
                "http://mu.semte.ch/graphs/public",
                [`<${someIri}> a skos:Concept`,
                    `<${someIri}> skos:inScheme dvcs:IPDCOrganisaties`,

                ],
                [
                    PREFIX.skos,
                    PREFIX.dvcs,
                ]);

            const result = await repository.exists(CodeSchema.IPDCOrganisaties, someIri);
            expect(result).toBeTruthy();
        });

        test('returns false when code does not exist for given schema', async () => {
            const someIri = new Iri(`http://some-iri/${uuid()}`);
            const anotherIri = new Iri(`http://some-iri/${uuid()}`);

            await directDatabaseAccess.insertData(
                "http://mu.semte.ch/graphs/public",
                [`<${someIri}> a skos:Concept`,
                    `<${someIri}> skos:inScheme dvcs:IPDCOrganisaties`,

                ],
                [
                    PREFIX.skos,
                    PREFIX.dvcs,
                ]);

            const result = await repository.exists(CodeSchema.IPDCOrganisaties, anotherIri);
            expect(result).toBeFalsy();

        });

        test('returns false when iri references another type', async () => {
            const someIri = new Iri(`http://some-iri/${uuid()}`);

            await directDatabaseAccess.insertData(
                "http://mu.semte.ch/graphs/public",
                [`<${someIri}> a skos:SomeOtherType`,
                    `<${someIri}> skos:inScheme dvcs:IPDCOrganisaties`,

                ],
                [
                    PREFIX.skos,
                    PREFIX.dvcs,
                ]);

            const result = await repository.exists(CodeSchema.IPDCOrganisaties, someIri);
            expect(result).toBeFalsy();
        });

        test('returns false when code exists for other schema', async () => {
            const someIri = new Iri(`http://some-iri/${uuid()}`);

            await directDatabaseAccess.insertData(
                "http://mu.semte.ch/graphs/public",
                [`<${someIri}> a skos:Concept`,
                    `<${someIri}> skos:inScheme dvcs:SomeOtherScheme`,

                ],
                [
                    PREFIX.skos,
                    PREFIX.dvcs,
                ]);

            const result = await repository.exists(CodeSchema.IPDCOrganisaties, someIri);
            expect(result).toBeFalsy();
        });

    });

    describe('save', () => {

        test('saves a code from a schema', async () => {
            const uniqueId = uuid();
            const someIri = new Iri(`http://some-iri/${uniqueId}`);

            await repository.save(CodeSchema.IPDCOrganisaties, someIri, `preferred label ${uniqueId}`, new Iri(`http://some-see-also-iri/${uniqueId}`));

            const savedCode = `           
            ${PREFIX.lpdcExt}
            ${PREFIX.mu}
            ${PREFIX.rdfs}            
            SELECT ?uuid WHERE {
                GRAPH <http://mu.semte.ch/graphs/public> {
                    ${sparqlEscapeUri(someIri)} a skos:Concept;
                        skos:inScheme <https://productencatalogus.data.vlaanderen.be/id/conceptscheme/IPDCOrganisaties> ;
                        skos:topConceptOf <https://productencatalogus.data.vlaanderen.be/id/conceptscheme/IPDCOrganisaties> ;
                        skos:prefLabel "preferred label ${uniqueId}" ;
                        mu:uuid ?uuid ;
                        rdfs:seeAlso <http://some-see-also-iri/${uniqueId}> .
                }
            }
        `;
            const codeResult = await directDatabaseAccess.list(savedCode);
            expect(codeResult.length).toEqual(1);

            const uuidFromCode = codeResult[0]['uuid'].value;
            expect(uuidFromCode).not.toBeUndefined();
        });

    });


});