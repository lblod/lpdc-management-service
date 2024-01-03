import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {ConceptSnapshotSparqlTestRepository} from "../../driven/persistence/concept-snapshot-sparql-test-repository";
import {ConceptSparqlTestRepository} from "../../driven/persistence/concept-sparql-test-repository";
import {
    NewConceptSnapshotToConceptMergerDomainService
} from "../../../src/core/domain/new-concept-snapshot-to-concept-merger-domain-service";
import {aFullConceptSnapshot} from "./concept-snapshot-test-builder";
import {buildConceptIri} from "./iri-test-builder";
import {uuid} from "../../../mu-helper";
import {DirectDatabaseAccess} from "../../driven/persistence/direct-database-access";
import {CONCEPT_GRAPH, PREFIX} from "../../../config";
import {NS} from "../../../src/driven/persistence/namespaces";
import {ConceptSnapshot} from "../../../src/core/domain/concept-snapshot";

describe('merges a new concept snapshot into a concept', () => {

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;


    const conceptSnapshotRepository = new ConceptSnapshotSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const conceptRepository = new ConceptSparqlTestRepository(TEST_SPARQL_ENDPOINT);

    const directDatabaseAccess = new DirectDatabaseAccess(TEST_SPARQL_ENDPOINT);

    const merger = new NewConceptSnapshotToConceptMergerDomainService(conceptSnapshotRepository, conceptRepository, TEST_SPARQL_ENDPOINT);

    test('Creates a new concept from a concept snapshot', async () => {
        const isVersionOfConceptId = buildConceptIri(uuid());
        const conceptSnapshot =
            aFullConceptSnapshot()
                .withIsVersionOfConcept(isVersionOfConceptId)
                .build();
        await conceptSnapshotRepository.save(conceptSnapshot);

        insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(conceptSnapshot);

        await merger.merge(conceptSnapshot.id);

        const newlyCreatedConcept = await conceptRepository.findById(isVersionOfConceptId);
        expect(newlyCreatedConcept.id).toEqual(isVersionOfConceptId);
        expect(newlyCreatedConcept.uuid).toBeDefined();
        expect(newlyCreatedConcept.title).toEqual(conceptSnapshot.title);
        expect(newlyCreatedConcept.description).toEqual(conceptSnapshot.description);
        expect(newlyCreatedConcept.additionalDescription).toEqual(conceptSnapshot.additionalDescription);
        expect(newlyCreatedConcept.exception).toEqual(conceptSnapshot.exception);
        expect(newlyCreatedConcept.regulation).toEqual(conceptSnapshot.regulation);
        expect(newlyCreatedConcept.startDate).toEqual(conceptSnapshot.startDate);
        expect(newlyCreatedConcept.endDate).toEqual(conceptSnapshot.endDate);
        expect(newlyCreatedConcept.type).toEqual(conceptSnapshot.type);
        expect(newlyCreatedConcept.targetAudiences).toEqual(conceptSnapshot.targetAudiences);
        expect(newlyCreatedConcept.themes).toEqual(conceptSnapshot.themes);
        expect(newlyCreatedConcept.competentAuthorityLevels).toEqual(conceptSnapshot.competentAuthorityLevels);
        expect(newlyCreatedConcept.competentAuthorities).toEqual(conceptSnapshot.competentAuthorities);
        expect(newlyCreatedConcept.executingAuthorityLevels).toEqual(conceptSnapshot.executingAuthorityLevels);
        expect(newlyCreatedConcept.executingAuthorities).toEqual(conceptSnapshot.executingAuthorities);
        expect(newlyCreatedConcept.publicationMedia).toEqual(conceptSnapshot.publicationMedia);
        expect(newlyCreatedConcept.yourEuropeCategories).toEqual(conceptSnapshot.yourEuropeCategories);
        expect(newlyCreatedConcept.keywords).toEqual(conceptSnapshot.keywords);
        expect(newlyCreatedConcept.requirements)
            .toEqual(expect.arrayContaining([
                expect.objectContaining({
                    _id: conceptSnapshot.requirements[0].id,
                    _uuid: expect.stringMatching(uuidRegex),
                    _title: conceptSnapshot.requirements[0].title,
                    _description: conceptSnapshot.requirements[0].description,
                    _evidence: expect.objectContaining({
                        _id: conceptSnapshot.requirements[0].evidence.id,
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: conceptSnapshot.requirements[0].evidence.title,
                        _description: conceptSnapshot.requirements[0].evidence.description,
                    })
                }),
                expect.objectContaining({
                    _id: conceptSnapshot.requirements[1].id,
                    _uuid: expect.stringMatching(uuidRegex),
                    _title: conceptSnapshot.requirements[1].title,
                    _description: conceptSnapshot.requirements[1].description,
                    _evidence: expect.objectContaining({
                        _id: conceptSnapshot.requirements[1].evidence.id,
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: conceptSnapshot.requirements[1].evidence.title,
                        _description: conceptSnapshot.requirements[1].evidence.description,
                    })
                })
            ]));
        expect(newlyCreatedConcept.procedures)
            .toEqual(expect.arrayContaining([
                expect.objectContaining({
                    _id: conceptSnapshot.procedures[0].id,
                    _uuid: expect.stringMatching(uuidRegex),
                    _title: conceptSnapshot.procedures[0].title,
                    _description: conceptSnapshot.procedures[0].description,
                    _websites: expect.arrayContaining([
                        expect.objectContaining({
                            _id: conceptSnapshot.procedures[0].websites[0].id,
                            _uuid: expect.stringMatching(uuidRegex),
                            _title: conceptSnapshot.procedures[0].websites[0].title,
                            _description: conceptSnapshot.procedures[0].websites[0].description,
                            _url: conceptSnapshot.procedures[0].websites[0].url,
                        }),
                        expect.objectContaining({
                            _id: conceptSnapshot.procedures[0].websites[1].id,
                            _uuid: expect.stringMatching(uuidRegex),
                            _title: conceptSnapshot.procedures[0].websites[1].title,
                            _description: conceptSnapshot.procedures[0].websites[1].description,
                            _url: conceptSnapshot.procedures[0].websites[1].url,
                        })
                    ])
                }),
                expect.objectContaining({
                    _id: conceptSnapshot.procedures[1].id,
                    _uuid: expect.stringMatching(uuidRegex),
                    _title: conceptSnapshot.procedures[1].title,
                    _description: conceptSnapshot.procedures[1].description,
                    _websites: expect.arrayContaining([
                        expect.objectContaining({
                            _id: conceptSnapshot.procedures[1].websites[0].id,
                            _uuid: expect.stringMatching(uuidRegex),
                            _title: conceptSnapshot.procedures[1].websites[0].title,
                            _description: conceptSnapshot.procedures[1].websites[0].description,
                            _url: conceptSnapshot.procedures[1].websites[0].url,
                        }),
                        expect.objectContaining({
                            _id: conceptSnapshot.procedures[1].websites[1].id,
                            _uuid: expect.stringMatching(uuidRegex),
                            _title: conceptSnapshot.procedures[1].websites[1].title,
                            _description: conceptSnapshot.procedures[1].websites[1].description,
                            _url: conceptSnapshot.procedures[1].websites[1].url,
                        })
                    ])
                })
            ]));

        expect(newlyCreatedConcept.websites)
            .toEqual(expect.arrayContaining([
                expect.objectContaining({
                    _id: conceptSnapshot.websites[0].id,
                    _uuid: expect.stringMatching(uuidRegex),
                    _title: conceptSnapshot.websites[0].title,
                    _description: conceptSnapshot.websites[0].description,
                    _url: conceptSnapshot.websites[0].url,
                }),
                expect.objectContaining({
                    _id: conceptSnapshot.websites[1].id,
                    _uuid: expect.stringMatching(uuidRegex),
                    _title: conceptSnapshot.websites[1].title,
                    _description: conceptSnapshot.websites[1].description,
                    _url: conceptSnapshot.websites[1].url,
                })
            ]));

        expect(newlyCreatedConcept.costs)
            .toEqual(expect.arrayContaining([
                expect.objectContaining({
                    _id: conceptSnapshot.costs[0].id,
                    _uuid: expect.stringMatching(uuidRegex),
                    _title: conceptSnapshot.costs[0].title,
                    _description: conceptSnapshot.costs[0].description
                }),
                expect.objectContaining({
                    _id: conceptSnapshot.costs[1].id,
                    _uuid: expect.stringMatching(uuidRegex),
                    _title: conceptSnapshot.costs[1].title,
                    _description: conceptSnapshot.costs[1].description
                })
            ]));
        expect(newlyCreatedConcept.financialAdvantages)
            .toEqual(expect.arrayContaining([
                expect.objectContaining({
                    _id: conceptSnapshot.financialAdvantages[0].id,
                    _uuid: expect.stringMatching(uuidRegex),
                    _title: conceptSnapshot.financialAdvantages[0].title,
                    _description: conceptSnapshot.financialAdvantages[0].description
                }),
                expect.objectContaining({
                    _id: conceptSnapshot.financialAdvantages[1].id,
                    _uuid: expect.stringMatching(uuidRegex),
                    _title: conceptSnapshot.financialAdvantages[1].title,
                    _description: conceptSnapshot.financialAdvantages[1].description
                })
            ]));
        expect(newlyCreatedConcept.productId).toEqual(conceptSnapshot.productId);
        expect(newlyCreatedConcept.latestConceptSnapshot).toEqual(conceptSnapshot.id);
        expect(newlyCreatedConcept.previousConceptSnapshots).toEqual(new Set());
        expect(newlyCreatedConcept.latestFunctionallyChangedConceptSnapshot).toEqual(conceptSnapshot.id);
        expect(newlyCreatedConcept.conceptTags).toEqual(conceptSnapshot.conceptTags);
        expect(newlyCreatedConcept.isArchived).toBeFalsy();
        expect(newlyCreatedConcept.legalResources).toEqual(conceptSnapshot.legalResources);
    });

    function insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(conceptSnapshot: ConceptSnapshot) {
        directDatabaseAccess.insertData(
            CONCEPT_GRAPH,
            [
                `<${NS.concept.type(conceptSnapshot.type).value}> skos:inScheme <${NS.conceptscheme('Type').value}>`,
                ...Array.from(conceptSnapshot.targetAudiences)
                    .map(v => `<${NS.concept.doelgroep(v).value}> skos:inScheme <${NS.conceptscheme('Doelgroep').value}>`),
                ...Array.from(conceptSnapshot.themes)
                    .map(v => `<${NS.concept.thema(v).value}> skos:inScheme <${NS.conceptscheme('Thema').value}>`),
                ...Array.from(conceptSnapshot.competentAuthorityLevels)
                    .map(v => `<${NS.concept.bevoegdBestuursniveau(v).value}> skos:inScheme <${NS.conceptscheme('BevoegdBestuursniveau').value}>`),
                ...Array.from([...conceptSnapshot.competentAuthorities, ...conceptSnapshot.executingAuthorities])
                    .map(v => `<${v}> skos:inScheme <${NS.conceptscheme('IPDCOrganisaties').value}>`),
                ...Array.from(conceptSnapshot.executingAuthorityLevels)
                    .map(v => `<${NS.concept.uitvoerendBestuursniveau(v).value}> skos:inScheme <${NS.conceptscheme('UitvoerendBestuursniveau').value}>`),
                ...Array.from(conceptSnapshot.publicationMedia)
                    .map(v => `<${NS.concept.publicatieKanaal(v).value}> skos:inScheme <${NS.conceptscheme('PublicatieKanaal').value}>`),
                ...Array.from(conceptSnapshot.yourEuropeCategories)
                    .map(v => `<${NS.concept.yourEuropeCategorie(v).value}> skos:inScheme <${NS.conceptscheme('YourEuropeCategorie').value}>`),
                ...Array.from(conceptSnapshot.conceptTags)
                    .map(v => `<${NS.concept.conceptTag(v).value}> skos:inScheme <${NS.conceptscheme('ConceptTag').value}>`),
            ],
            [
                PREFIX.skos,
            ]
        );
    }

});