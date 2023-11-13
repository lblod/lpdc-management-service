import { findDutchLanguageVersionsOfTriples, selectLanguageVersionForConcept } from "../../lib/formalInformalChoice";

const conceptLanguages = {
    onlyNl: ['nl'],
    unknown: ['nl', 'nl-be-x-generated-informal', 'nl-be-x-generated-formal'],
    informal: ['nl', 'nl-be-x-informal', 'nl-be-x-generated-formal'],
    formal: ['nl', 'nl-be-x-formal', 'nl-be-x-generated-informal'],
    both: ['nl', 'nl-be-x-formal', 'nl-be-x-informal']
};

describe('formalInformalChoice', () => {

    describe('findConceptOrInstanceLanguages', () => {

        it('Should return language version of publicService', () => {
            const serviceUri = 'http://data.lblod.info/id/public-service/323216fa-c4ce-4804-8c14-ed8bba71cc1c';
            const triples = [
                {
                    s: {value: serviceUri, type: 'uri'},
                    p: {value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', type: 'uri'},
                    o: {value: 'http://purl.org/vocab/cpsv#PublicService', type: 'uri'}
                },
                {
                    s: {value: serviceUri, type: 'uri'},
                    p: {value: 'http://purl.org/dc/terms/title', type: 'uri'},
                    o: {value: 'this is the title', type: 'literal', ['xml:lang']: 'nl'}
                }
            ];
            const actual = findDutchLanguageVersionsOfTriples(triples);
            expect(actual).toEqual(['nl']);
        });

        it('Should return all language versions of public service', () => {
            const serviceUri = 'http://data.lblod.info/id/public-service/323216fa-c4ce-4804-8c14-ed8bba71cc1c';
            const triples = [
                {
                    s: {value: serviceUri, type: 'uri'},
                    p: {value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', type: 'uri'},
                    o: {value: 'http://purl.org/vocab/cpsv#PublicService', type: 'uri'}
                },
                {
                    s: {value: serviceUri, type: 'uri'},
                    p: {value: 'http://purl.org/dc/terms/title', type: 'uri'},
                    o: {value: 'this is the title', type: 'literal', ['xml:lang']: 'nl'}
                },
                {
                    s: {value: serviceUri, type: 'uri'},
                    p: {value: 'http://purl.org/dc/terms/title', type: 'uri'},
                    o: {value: 'this is the title', type: 'literal', ['xml:lang']: 'nl-be-x-generated-formal'}
                },
                {
                    s: {value: serviceUri, type: 'uri'},
                    p: {value: 'http://purl.org/dc/terms/title', type: 'uri'},
                    o: {value: 'this is the title', type: 'literal', ['xml:lang']: 'nl-be-x-generated-informal'}
                },
            ];
            const actual = findDutchLanguageVersionsOfTriples(triples);
            expect(actual).toEqual(['nl', 'nl-be-x-generated-formal', 'nl-be-x-generated-informal']);
        });

        it('Should return all language versions of concept', () => {
            const serviceUri = 'http://data.lblod.info/id/concept/323216fa-c4ce-4804-8c14-ed8bba71cc1c';
            const triples = [
                {
                    s: {value: serviceUri, type: 'uri'},
                    p: {value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', type: 'uri'},
                    o: {
                        value: 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService',
                        type: 'uri'
                    }
                },
                {
                    s: {value: serviceUri, type: 'uri'},
                    p: {value: 'http://purl.org/dc/terms/title', type: 'uri'},
                    o: {value: 'this is the title', type: 'literal', ['xml:lang']: 'nl'}
                },
                {
                    s: {value: serviceUri, type: 'uri'},
                    p: {value: 'http://purl.org/dc/terms/title', type: 'uri'},
                    o: {value: 'this is the title', type: 'literal', ['xml:lang']: 'nl-be-x-generated-formal'}
                },
                {
                    s: {value: serviceUri, type: 'uri'},
                    p: {value: 'http://purl.org/dc/terms/title', type: 'uri'},
                    o: {value: 'this is the title', type: 'literal', ['xml:lang']: 'nl-be-x-generated-informal'}
                },
            ];
            const actual = findDutchLanguageVersionsOfTriples(triples);
            expect(actual).toEqual(['nl', 'nl-be-x-generated-formal', 'nl-be-x-generated-informal']);
        });

        it('Should return language version of triples except keyword', () => {
            const serviceUri = 'http://data.lblod.info/id/concept/323216fa-c4ce-4804-8c14-ed8bba71cc1c';
            const triples = [
                {
                    s: {value: serviceUri, type: 'uri'},
                    p: {value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', type: 'uri'},
                    o: {
                        value: 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService',
                        type: 'uri'
                    }
                },
                {
                    s: {value: serviceUri, type: 'uri'},
                    p: {value: 'http://purl.org/dc/terms/description', type: 'uri'},
                    o: {value: 'this is the title', type: 'literal', ['xml:lang']: 'nl-be-x-generated-formal'}
                },
                {
                    s: {value: serviceUri, type: 'uri'},
                    p: {value: 'http://www.w3.org/ns/dcat#keyword', type: 'uri'},
                    o: {value: 'keyword', type: 'literal', ['xml:lang']: 'nl'}
                },
            ];
            const actual = findDutchLanguageVersionsOfTriples(triples);
            expect(actual).toEqual(['nl-be-x-generated-formal']);
        });

        it('Should return empty array when no language versions exist', () => {
            const serviceUri = 'http://data.lblod.info/id/concept/323216fa-c4ce-4804-8c14-ed8bba71cc1c';
            const triples = [
                {
                    s: {value: serviceUri, type: 'uri'},
                    p: {value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', type: 'uri'},
                    o: {
                        value: 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService',
                        type: 'uri'
                    }
                }
            ];
            const actual = findDutchLanguageVersionsOfTriples(triples);
            expect(actual).toEqual([]);
        });

        it('Should return empty array when only english language versions exist', () => {
            const serviceUri = 'http://data.lblod.info/id/concept/323216fa-c4ce-4804-8c14-ed8bba71cc1c';
            const triples = [
                {
                    s: {value: serviceUri, type: 'uri'},
                    p: {value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', type: 'uri'},
                    o: {
                        value: 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService',
                        type: 'uri'
                    }
                },
                {
                    s: {value: serviceUri, type: 'uri'},
                    p: {value: 'http://purl.org/dc/terms/description', type: 'uri'},
                    o: {value: 'this is the title', type: 'literal', ['xml:lang']: 'en'}
                },
            ];
            const actual = findDutchLanguageVersionsOfTriples(triples);
            expect(actual).toEqual([]);
        });

        it('Should return languages that start with nl', () => {
            const serviceUri = 'http://data.lblod.info/id/concept/323216fa-c4ce-4804-8c14-ed8bba71cc1c';
            const triples = [
                {
                    s: {value: serviceUri, type: 'uri'},
                    p: {value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', type: 'uri'},
                    o: {
                        value: 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService',
                        type: 'uri'
                    }
                },
                {
                    s: {value: serviceUri, type: 'uri'},
                    p: {value: 'http://purl.org/dc/terms/description', type: 'uri'},
                    o: {value: 'this is the title', type: 'literal', ['xml:lang']: 'fr'}
                },
                {
                    s: {value: serviceUri, type: 'uri'},
                    p: {value: 'http://purl.org/dc/terms/description', type: 'uri'},
                    o: {value: 'this is the title', type: 'literal', ['xml:lang']: 'de'}
                },
                {
                    s: {value: serviceUri, type: 'uri'},
                    p: {value: 'http://purl.org/dc/terms/description', type: 'uri'},
                    o: {value: 'this is the title', type: 'literal', ['xml:lang']: 'en'}
                },
                {
                    s: {value: serviceUri, type: 'uri'},
                    p: {value: 'http://purl.org/dc/terms/description', type: 'uri'},
                    o: {value: 'this is the title', type: 'literal', ['xml:lang']: 'es'}
                },
                {
                    s: {value: serviceUri, type: 'uri'},
                    p: {value: 'http://purl.org/dc/terms/description', type: 'uri'},
                    o: {value: 'this is the title', type: 'literal', ['xml:lang']: 'nl-be-x-generated-formal'}
                },
                {
                    s: {value: serviceUri, type: 'uri'},
                    p: {value: 'http://purl.org/dc/terms/description', type: 'uri'},
                    o: {value: 'this is the title', type: 'literal', ['xml:lang']: 'nl-be-x-generated-informal'}
                },
                {
                    s: {value: serviceUri, type: 'uri'},
                    p: {value: 'http://purl.org/dc/terms/description', type: 'uri'},
                    o: {value: 'this is the title', type: 'literal', ['xml:lang']: 'nl-other-forms'}
                },
                {
                    s: {value: serviceUri, type: 'uri'},
                    p: {value: 'http://purl.org/dc/terms/description', type: 'uri'},
                    o: {value: 'this is the title', type: 'literal', ['xml:lang']: 'nl'}
                },
            ];
            const actual = findDutchLanguageVersionsOfTriples(triples);
            expect(actual).toEqual(['nl-be-x-generated-formal', 'nl-be-x-generated-informal', 'nl-other-forms', 'nl']);
        });
    });

    describe('selectLanguageVersionForChosenForm', () => {

        it('When chosenForm informal and concept in informal version then formLanguage should be @nl-be-x-informal', () => {
            const actual = selectLanguageVersionForConcept(conceptLanguages.informal, 'informal');

            expect(actual).toEqual('nl-be-x-informal');
        });

        it('When chosenForm informal and concept in formal version then formLanguage should be @nl-be-x-generated-informal', () => {
            const actual = selectLanguageVersionForConcept(conceptLanguages.formal, 'informal',);

            expect(actual).toEqual('nl-be-x-generated-informal');
        });

        it('When chosenForm informal and concept in unknown version then formLanguage should be @nl-be-x-generated-informal', () => {
            const actual = selectLanguageVersionForConcept(conceptLanguages.unknown, 'informal');

            expect(actual).toEqual('nl-be-x-generated-informal');
        });

        it('When chosenForm informal and concept in both version then formLanguage should be @nl-be-x-informal', () => {
            const chosenForm = 'informal';

            const actual = selectLanguageVersionForConcept(conceptLanguages.both, chosenForm);

            expect(actual).toEqual('nl-be-x-informal');
        });

        it('When chosenForm informal and concept only in nl version then formLanguage should be @nl', () => {
            const actual = selectLanguageVersionForConcept(conceptLanguages.onlyNl, 'informal');

            expect(actual).toEqual('nl');
        });

        it('When chosenForm formal and concept in formal version then formLanguage should be @nl-be-x-formal', () => {
            const actual = selectLanguageVersionForConcept(conceptLanguages.formal, 'formal');

            expect(actual).toEqual('nl-be-x-formal');
        });

        it('When chosenForm formal and concept in informal version then formLanguage should be @nl-be-x-generated-formal', () => {
            const actual = selectLanguageVersionForConcept(conceptLanguages.informal, 'formal');

            expect(actual).toEqual('nl-be-x-generated-formal');
        });

        it('When chosenForm formal and concept in unknown versions then formLanguage should be @nl', () => {
            const actual = selectLanguageVersionForConcept(conceptLanguages.unknown, 'formal');

            expect(actual).toEqual('nl');
        });

        it('When chosenForm formal and concept in both versions then formLanguage should be @nl-be-x-formal', () => {
            const actual = selectLanguageVersionForConcept(conceptLanguages.both, 'formal');

            expect(actual).toEqual('nl-be-x-formal');
        });

        it('When chosenForm formal and concept only in nl then formLanguage should be @nl', () => {

            const actual = selectLanguageVersionForConcept(conceptLanguages.onlyNl, 'formal');

            expect(actual).toEqual('nl');
        });

        it('When no chosenForm and concept in formal version then formLanguage should be @nl-be-x-formal', () => {
            const actual = selectLanguageVersionForConcept(conceptLanguages.formal, undefined);

            expect(actual).toEqual('nl-be-x-formal');
        });

        it('When no chosenForm and concept in informal version then formLanguage should be @nl-be-x-generated-formal', () => {
            const actual = selectLanguageVersionForConcept(conceptLanguages.informal, undefined);

            expect(actual).toEqual('nl-be-x-generated-formal');
        });

        it('When no chosenForm and concept in unknown versions then formLanguage should be @nl', () => {
            const actual = selectLanguageVersionForConcept(conceptLanguages.unknown, undefined);

            expect(actual).toEqual('nl');
        });

        it('When no chosenForm and concept in both versions then formLanguage should be @nl-be-x-formal', () => {
            const actual = selectLanguageVersionForConcept(conceptLanguages.both, undefined);

            expect(actual).toEqual('nl-be-x-formal');
        });

        it('When no chosenForm and concept only in nl then formLanguage should be @nl', () => {
            const actual = selectLanguageVersionForConcept(conceptLanguages.onlyNl, undefined);

            expect(actual).toEqual('nl');
        });
    });

    describe('findDutchLanguageVersionsOfTriples', () => {

        it('Should return array of languages', () => {
            const triples = [
                {
                    s: {
                        value: 'https://ipdc.tni-vlaanderen.be/id/concept/1c3c0181-8158-487a-a508-84ae983c20a2',
                        type: 'uri'
                    },
                    p: {
                        value: 'http://purl.org/dc/terms/title',
                        type: 'uri'
                    },
                    o: {
                        value: 'title',
                        ['xml:lang']: 'nl',
                        type: 'literal'
                    }
                },
                {
                    s: {
                        value: 'https://ipdc.tni-vlaanderen.be/id/concept/1c3c0181-8158-487a-a508-84ae983c20a2',
                        type: 'uri'
                    },
                    p: {
                        value: 'http://purl.org/dc/terms/title',
                        type: 'uri'
                    },
                    o: {
                        value: 'title',
                        ['xml:lang']: 'nl-be-generated-formal',
                        type: 'literal'
                    }
                }
            ];

            const actual = findDutchLanguageVersionsOfTriples(triples);
            expect(actual).toEqual(['nl', 'nl-be-generated-formal']);
        });

        it('Should not contain doubles', () => {
            const triples = [
                {
                    s: {
                        value: 'https://ipdc.tni-vlaanderen.be/id/concept/1c3c0181-8158-487a-a508-84ae983c20a2',
                        type: 'uri'
                    },
                    p: {
                        value: 'http://purl.org/dc/terms/title',
                        type: 'uri'
                    },
                    o: {
                        value: 'title',
                        ['xml:lang']: 'nl',
                        type: 'literal'
                    }
                },
                {
                    s: {
                        value: 'https://ipdc.tni-vlaanderen.be/id/concept/1c3c0181-8158-487a-a508-84ae983c20a2',
                        type: 'uri'
                    },
                    p: {
                        value: 'http://purl.org/dc/terms/description',
                        type: 'uri'
                    },
                    o: {
                        value: 'title',
                        ['xml:lang']: 'nl',
                        type: 'literal'
                    }
                }
            ];

            const actual = findDutchLanguageVersionsOfTriples(triples);
            expect(actual).toEqual(['nl']);
        });

        it('Should not contain english', () => {
            const triples = [
                {
                    s: {
                        value: 'https://ipdc.tni-vlaanderen.be/id/concept/1c3c0181-8158-487a-a508-84ae983c20a2',
                        type: 'uri'
                    },
                    p: {
                        value: 'http://purl.org/dc/terms/title',
                        type: 'uri'
                    },
                    o: {
                        value: 'title',
                        ['xml:lang']: 'nl',
                        type: 'literal'
                    }
                },
                {
                    s: {
                        value: 'https://ipdc.tni-vlaanderen.be/id/concept/1c3c0181-8158-487a-a508-84ae983c20a2',
                        type: 'uri'
                    },
                    p: {
                        value: 'http://purl.org/dc/terms/title',
                        type: 'uri'
                    },
                    o: {
                        value: 'title',
                        ['xml:lang']: 'en',
                        type: 'literal'
                    }
                }
            ];

            const actual = findDutchLanguageVersionsOfTriples(triples);
            expect(actual).toEqual(['nl']);
        });

        it('Should not contain language of keyword', () => {
            const triples = [
                {
                    s: {
                        value: 'https://ipdc.tni-vlaanderen.be/id/concept/1c3c0181-8158-487a-a508-84ae983c20a2',
                        type: 'uri'
                    },
                    p: {
                        value: 'http://purl.org/dc/terms/title',
                        type: 'uri'
                    },
                    o: {
                        value: 'title',
                        ['xml:lang']: 'nl-be-generated-formal',
                        type: 'literal'
                    }
                },
                {
                    s: {
                        value: 'https://ipdc.tni-vlaanderen.be/id/concept/1c3c0181-8158-487a-a508-84ae983c20a2',
                        type: 'uri'
                    },
                    p: {
                        value: 'http://www.w3.org/ns/dcat#keyword',
                        type: 'uri'
                    },
                    o: {
                        value: 'title',
                        ['xml:lang']: 'nl',
                        type: 'literal'
                    }
                }
            ];

            const actual = findDutchLanguageVersionsOfTriples(triples);
            expect(actual).toEqual(['nl-be-generated-formal']);
        });

    });
});