import {FormApplicationService} from "../../../src/core/application/form-application-service";
import {ConceptSparqlRepository} from "../../../src/driven/persistence/concept-sparql-repository";
import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {aFullConcept, aMinimalConcept} from "../domain/concept-test-builder";
import {mock} from 'jest-mock-extended';
import {CodeRepository} from "../../../src/core/port/driven/persistence/code-repository";
import {FormDefinitionRepository} from "../../../src/core/port/driven/persistence/form-definition-repository";
import {SelectConceptLanguageDomainService} from "../../../src/core/domain/select-concept-language-domain-service";
import {aFormalInformalChoice} from "../domain/formal-informal-choice-test-builder";
import {
    ChosenFormType,
    FormType,
    InstanceReviewStatusType,
    PublicationMediumType
} from "../../../src/core/domain/types";
import {aBestuurseenheid} from "../domain/bestuurseenheid-test-builder";
import {BestuurseenheidSparqlTestRepository} from "../../driven/persistence/bestuurseenheid-sparql-test-repository";
import {Language} from "../../../src/core/domain/language";
import {LanguageString} from "../../../src/core/domain/language-string";
import {aFullInstance, aMinimalInstance} from "../domain/instance-test-builder";
import {SemanticFormsMapperImpl} from "../../../src/driven/persistence/semantic-forms-mapper-impl";
import {FormDefinitionFileRepository} from "../../../src/driven/persistence/form-definition-file-repository";
import {CodeSparqlRepository} from "../../../src/driven/persistence/code-sparql-repository";
import {
    FormalInformalChoiceSparqlRepository
} from "../../../src/driven/persistence/formal-informal-choice-sparql-repository";
import {aFullRequirementForInstance, aMinimalRequirementForConceptSnapshot} from "../domain/requirement-test-builder";
import {aFullEvidenceForInstance} from "../domain/evidence-test-builder";
import {aFullProcedureForInstance, aMinimalProcedureForConceptSnapshot} from "../domain/procedure-test-builder";
import {aFullWebsiteForInstance, aMinimalWebsiteForConceptSnapshot} from "../domain/website-test-builder";
import {aFullCostForInstance, aMinimalCostForConceptSnapshot} from "../domain/cost-test-builder";
import {
    aFullFinancialAdvantageForInstance,
    aMinimalFinancialAdvantageForConceptSnapshot
} from "../domain/financial-advantage-test-builder";
import {
    aFullLegalResourceForInstance,
    aMinimalLegalResourceForConceptSnapshot
} from "../domain/legal-resource-test-builder";
import {aFullContactPointForInstance} from "../domain/contact-point-test-builder";
import {
    aFullConceptSnapshot,
    aMinimalConceptSnapshot,
    ConceptSnapshotTestBuilder
} from "../domain/concept-snapshot-test-builder";
import {ConceptSnapshotSparqlTestRepository} from "../../driven/persistence/concept-snapshot-sparql-test-repository";
import {ConceptSnapshotSparqlRepository} from "../../../src/driven/persistence/concept-snapshot-sparql-repository";
import {SystemError} from "../../../src/core/domain/shared/lpdc-error";
import {buildConceptIri} from "../domain/iri-test-builder";
import {uuid} from "../../../mu-helper";
import {NS} from "../../../src/driven/persistence/namespaces";
import {InstanceSparqlTestRepository} from "../../driven/persistence/instance-sparql-test-repository";

describe('Form application service tests', () => {

    describe('loadConceptForm', () => {

        const conceptRepository = new ConceptSparqlRepository(TEST_SPARQL_ENDPOINT);
        const conceptSnapshotRepository = new ConceptSnapshotSparqlRepository(TEST_SPARQL_ENDPOINT);
        const instanceRepository = new InstanceSparqlTestRepository(TEST_SPARQL_ENDPOINT);
        const formDefinitionRepository = mock<FormDefinitionRepository>();
        const codeRepository = mock<CodeRepository>();
        const formalInformalChoiceRepository = new FormalInformalChoiceSparqlRepository(TEST_SPARQL_ENDPOINT);
        const selectConceptLanguageDomainService = new SelectConceptLanguageDomainService();
        const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(TEST_SPARQL_ENDPOINT);
        const semanticFormsMapper = new SemanticFormsMapperImpl();

        const formApplicationService = new FormApplicationService(conceptRepository, conceptSnapshotRepository, instanceRepository, formDefinitionRepository, codeRepository, formalInformalChoiceRepository, selectConceptLanguageDomainService, semanticFormsMapper);

        test('can load a inhoud form for a concept in correct language', async () => {
            const concept =
                aFullConcept()
                    .withTitle(
                        LanguageString.of('nl', undefined, 'title informal', 'title generated formal', undefined)
                    )
                    .withPublicationMedia([PublicationMediumType.RECHTENVERKENNER])
                    .build();
            await conceptRepository.save(concept);

            const bestuurseenheid =
                aBestuurseenheid()
                    .build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const formalInformalChoice =
                aFormalInformalChoice()
                    .withChosenForm(ChosenFormType.INFORMAL)
                    .build();
            await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

            formDefinitionRepository.loadConceptFormDefinition.calledWith(FormType.INHOUD, Language.INFORMAL).mockReturnValue('formdefinition');

            const {
                form,
                meta,
                source,
                serviceUri
            } = await formApplicationService.loadConceptForm(bestuurseenheid, concept.id, FormType.INHOUD);

            expect(form).toEqual('formdefinition');
            expect(meta).toEqual('');
            expect(source).toEqual(semanticFormsMapper.conceptAsTurtleFormat(concept).join("\r\n"));
            expect(source).toContain(`<${concept.id}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService> .`);
            expect(serviceUri).toEqual(concept.id.value);
        });

        test('can load a eigenschappen form for a concept in correct language', async () => {

            const concept =
                aFullConcept()
                    .withTitle(
                        LanguageString.of('nl', undefined, 'title informal', 'title generated formal', undefined)
                    )
                    .withPublicationMedia([PublicationMediumType.RECHTENVERKENNER])
                    .build();
            await conceptRepository.save(concept);

            const bestuurseenheid =
                aBestuurseenheid()
                    .build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const formalInformalChoice =
                aFormalInformalChoice()
                    .withChosenForm(ChosenFormType.INFORMAL)
                    .build();
            await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

            formDefinitionRepository.loadConceptFormDefinition.calledWith(FormType.EIGENSCHAPPEN, Language.INFORMAL).mockReturnValue('formdefinition');
            codeRepository.loadIPDCOrganisatiesTailoredInTurtleFormat.mockReturnValue(Promise.resolve(['org1 a concept.', 'org2 a concept.']));

            const {
                form,
                meta,
                source,
                serviceUri
            } = await formApplicationService.loadConceptForm(bestuurseenheid, concept.id, FormType.EIGENSCHAPPEN);

            expect(form).toEqual('formdefinition');
            expect(meta).toEqual('org1 a concept.\r\norg2 a concept.');
            expect(source).toEqual(semanticFormsMapper.conceptAsTurtleFormat(concept).join("\r\n"));
            expect(source).toContain(`<${concept.id}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService> .`);
            expect(serviceUri).toEqual(concept.id.value);

        });

    });

    describe('loadInstanceForm', () => {

        const conceptRepository = new ConceptSparqlRepository(TEST_SPARQL_ENDPOINT);
        const conceptSnapshotRepository = new ConceptSnapshotSparqlTestRepository(TEST_SPARQL_ENDPOINT);
        const instanceRepository = new InstanceSparqlTestRepository(TEST_SPARQL_ENDPOINT);
        const formDefinitionRepository = mock<FormDefinitionRepository>();
        const codeRepository = mock<CodeRepository>();
        const formalInformalChoiceRepository = new FormalInformalChoiceSparqlRepository(TEST_SPARQL_ENDPOINT);
        const selectConceptLanguageDomainService = new SelectConceptLanguageDomainService();
        const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(TEST_SPARQL_ENDPOINT);
        const semanticFormsMapper = new SemanticFormsMapperImpl();

        const formApplicationService = new FormApplicationService(conceptRepository, conceptSnapshotRepository, instanceRepository, formDefinitionRepository, codeRepository, formalInformalChoiceRepository, selectConceptLanguageDomainService, semanticFormsMapper);

        describe('inhoud form', () => {

            test('can load form for an instance without concept in correct language', async () => {
                const bestuurseenheid = aBestuurseenheid().build();
                await bestuurseenheidRepository.save(bestuurseenheid);

                const instance = aMinimalInstance()
                    .build();
                await instanceRepository.save(bestuurseenheid, instance);

                const formalInformalChoice =
                    aFormalInformalChoice()
                        .withChosenForm(ChosenFormType.INFORMAL)
                        .build();
                await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

                formDefinitionRepository.loadInstanceFormDefinition.calledWith(FormType.INHOUD, Language.FORMAL).mockReturnValue('formdefinition');

                const {
                    form,
                    meta,
                    source,
                    serviceUri
                } = await formApplicationService.loadInstanceForm(bestuurseenheid, instance.id, undefined, FormType.INHOUD);

                expect(form).toEqual('formdefinition');
                expect(meta).toEqual('');
                expect(source).toEqual(semanticFormsMapper.instanceAsTurtleFormat(bestuurseenheid, instance).join("\r\n"));
                expect(source).toContain(`<${instance.id}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService> .`);
                expect(serviceUri).toEqual(instance.id.value);
            });

            test('can load form for an instance with concept, without review status in correct language', async () => {
                const bestuurseenheid = aBestuurseenheid().build();
                await bestuurseenheidRepository.save(bestuurseenheid);

                const concept = aMinimalConcept()
                    .build();
                await conceptRepository.save(concept);

                const conceptSnapshot = aMinimalConceptSnapshot()
                    .withIsVersionOfConcept(concept.id)
                    .build();
                await conceptSnapshotRepository.save(conceptSnapshot);

                const instance = aMinimalInstance()
                    .withConceptId(concept.id)
                    .withConceptSnapshotId(conceptSnapshot.id)
                    .withProductId(concept.productId)
                    .withReviewStatus(undefined)
                    .build();

                await instanceRepository.save(bestuurseenheid, instance);

                const formalInformalChoice =
                    aFormalInformalChoice()
                        .withChosenForm(ChosenFormType.INFORMAL)
                        .build();
                await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

                formDefinitionRepository.loadInstanceFormDefinition.calledWith(FormType.INHOUD, Language.FORMAL).mockReturnValue('formdefinition');

                const {
                    form,
                    meta,
                    source,
                    serviceUri
                } = await formApplicationService.loadInstanceForm(bestuurseenheid, instance.id, conceptSnapshot.id, FormType.INHOUD);

                expect(form).toEqual('formdefinition');
                expect(meta).toEqual('');
                expect(source).toEqual(semanticFormsMapper.instanceAsTurtleFormat(bestuurseenheid, instance).join("\r\n"));
                expect(source).toContain(`<${instance.id}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService> .`);
                expect(serviceUri).toEqual(instance.id.value);
            });

            test('can load form for an instance with concept and review status in correct language', async () => {
                const bestuurseenheid = aBestuurseenheid().build();
                await bestuurseenheidRepository.save(bestuurseenheid);

                const concept = aMinimalConcept()
                    .build();
                await conceptRepository.save(concept);

                const conceptSnapshot = aFullConceptSnapshot()
                    .withIsVersionOfConcept(concept.id)
                    .withTitle(
                        LanguageString.of(
                            ConceptSnapshotTestBuilder.TITLE_NL,
                            ConceptSnapshotTestBuilder.TITLE_NL_FORMAL,
                            ConceptSnapshotTestBuilder.TITLE_NL_INFORMAL,
                            ConceptSnapshotTestBuilder.TITLE_NL_GENERATED_FORMAL,
                            ConceptSnapshotTestBuilder.TITLE_NL_GENERATED_INFORMAL))
                    .build();
                const latestConceptSnapshot = aFullConceptSnapshot()
                    .withIsVersionOfConcept(concept.id)
                    .withTitle(
                        LanguageString.of(
                            ConceptSnapshotTestBuilder.TITLE_NL + 'latest',
                            ConceptSnapshotTestBuilder.TITLE_NL_FORMAL + 'latest',
                            ConceptSnapshotTestBuilder.TITLE_NL_INFORMAL + 'latest',
                            ConceptSnapshotTestBuilder.TITLE_NL_GENERATED_FORMAL + 'latest',
                            ConceptSnapshotTestBuilder.TITLE_NL_GENERATED_INFORMAL + 'latest'))
                    .build();

                await conceptSnapshotRepository.save(conceptSnapshot);
                await conceptSnapshotRepository.save(latestConceptSnapshot);

                const instance = aMinimalInstance()
                    .withConceptId(concept.id)
                    .withConceptSnapshotId(conceptSnapshot.id)
                    .withProductId(concept.productId)
                    .withReviewStatus(InstanceReviewStatusType.CONCEPT_GEWIJZIGD)
                    .build();

                await instanceRepository.save(bestuurseenheid, instance);

                const formalInformalChoice =
                    aFormalInformalChoice()
                        .withChosenForm(ChosenFormType.INFORMAL)
                        .build();
                await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

                formDefinitionRepository.loadInstanceFormDefinition.calledWith(FormType.INHOUD, Language.FORMAL).mockReturnValue('formdefinition');

                const {
                    form,
                    meta,
                    source,
                    serviceUri
                } = await formApplicationService.loadInstanceForm(bestuurseenheid, instance.id, latestConceptSnapshot.id, FormType.INHOUD);

                expect(form).toEqual('formdefinition');
                expect(meta).toContain(`<${conceptSnapshot.id}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`);
                expect(meta).toContain(`<${conceptSnapshot.id}> <http://purl.org/dc/terms/title> "Concept Snapshot Title - nl-formal"@nl-be-x-formal`);
                expect(meta).not.toContain(`<${conceptSnapshot.id}> <http://purl.org/dc/terms/title> "Concept Snapshot Title - nl"@nl`);
                expect(meta).not.toContain(`<${conceptSnapshot.id}> <http://purl.org/dc/terms/title> "Concept Snapshot Title - nl-informal"@nl-be-x-informal`);
                expect(meta).not.toContain(`<${conceptSnapshot.id}> <http://purl.org/dc/terms/title> "Concept Snapshot Title - nl-generated-formal"@nl-be-x-generated-formal`);
                expect(meta).not.toContain(`<${conceptSnapshot.id}> <http://purl.org/dc/terms/title> "Concept Snapshot Title - nl-generated-informal"@nl-be-x-generated-informal`);
                expect(meta).toContain(`<${latestConceptSnapshot.id}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`);
                expect(meta).toContain(`<${latestConceptSnapshot.id}> <http://purl.org/dc/terms/title> "Concept Snapshot Title - nl-formallatest"@nl-be-x-formal`);
                expect(meta).not.toContain(`<${latestConceptSnapshot.id}> <http://purl.org/dc/terms/title> "Concept Snapshot Title - nllatest"@nl`);
                expect(meta).not.toContain(`<${latestConceptSnapshot.id}> <http://purl.org/dc/terms/title> "Concept Snapshot Title - nl-informallatest"@nl-be-x-informal`);
                expect(meta).not.toContain(`<${latestConceptSnapshot.id}> <http://purl.org/dc/terms/title> "Concept Snapshot Title - nl-generated-formallatest"@nl-be-x-generated-formal`);
                expect(meta).not.toContain(`<${latestConceptSnapshot.id}> <http://purl.org/dc/terms/title> "Concept Snapshot Title - nl-generated-informallatest"@nl-be-x-generated-informal`);
                expect(source).toEqual(semanticFormsMapper.instanceAsTurtleFormat(bestuurseenheid, instance).join("\r\n"));
                expect(source).toContain(`<${instance.id}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService> .`);
                expect(serviceUri).toEqual(instance.id.value);
            });

            test('load form with boolean values as 0 and 1', async () => {
                const bestuurseenheid = aBestuurseenheid().build();
                await bestuurseenheidRepository.save(bestuurseenheid);

                const instance = aMinimalInstance()
                    .withNeedsConversionFromFormalToInformal(false)
                    .withForMunicipalityMerger(true)
                    .build();

                await instanceRepository.save(bestuurseenheid, instance);

                formDefinitionRepository.loadInstanceFormDefinition.calledWith(FormType.INHOUD, Language.FORMAL).mockReturnValue('formdefinition');

                const {
                    form,
                    source,
                    serviceUri
                } = await formApplicationService.loadInstanceForm(bestuurseenheid, instance.id, undefined, FormType.INHOUD);

                expect(form).toEqual('formdefinition');
                expect(source).toEqual(semanticFormsMapper.instanceAsTurtleFormat(bestuurseenheid, instance).join("\r\n"));
                expect(source).toContain(`<${instance.id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#forMunicipalityMerger> "1"^^<http://www.w3.org/2001/XMLSchema#boolean> .`);
                expect(source).toContain(`<${instance.id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#needsConversionFromFormalToInformal> "0"^^<http://www.w3.org/2001/XMLSchema#boolean> .`);
                expect(serviceUri).toEqual(instance.id.value);
            });

            test('meta data contains comparison sources for instance with concept and review status', async () => {
                const bestuurseenheid = aBestuurseenheid().build();
                await bestuurseenheidRepository.save(bestuurseenheid);

                const concept = aMinimalConcept().build();
                await conceptRepository.save(concept);

                const conceptSnapshot = aFullConceptSnapshot()
                    .withIsVersionOfConcept(concept.id)
                    .build();
                const latestConceptSnapshot = aFullConceptSnapshot()
                    .withIsVersionOfConcept(concept.id)
                    .build();

                await conceptSnapshotRepository.save(conceptSnapshot);
                await conceptSnapshotRepository.save(latestConceptSnapshot);

                const instance = aFullInstance()
                    .withConceptId(concept.id)
                    .withConceptSnapshotId(conceptSnapshot.id)
                    .withProductId(concept.productId)
                    .withReviewStatus(InstanceReviewStatusType.CONCEPT_GEWIJZIGD)
                    .build();

                await instanceRepository.save(bestuurseenheid, instance);

                const formalInformalChoice = aFormalInformalChoice()
                    .withChosenForm(ChosenFormType.INFORMAL)
                    .build();
                await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

                formDefinitionRepository.loadInstanceFormDefinition.calledWith(FormType.INHOUD, Language.FORMAL).mockReturnValue('formdefinition');

                const {
                    form,
                    meta,
                    serviceUri
                } = await formApplicationService.loadInstanceForm(bestuurseenheid, instance.id, latestConceptSnapshot.id, FormType.INHOUD);

                expect(form).toEqual('formdefinition');
                expect(meta).toContain(`<${instance.id}> <${NS.ext('comparisonSourceCurrent').value}> <${conceptSnapshot.id}> .`);
                expect(meta).toContain(`<${instance.id}> <${NS.ext('comparisonSourceLatest').value}> <${latestConceptSnapshot.id}> .`);
                expect(meta).toContain(`<${instance.requirements[0].id}> <${NS.ext('comparisonSourceCurrent').value}> <${conceptSnapshot.requirements[0].id}> .`);
                expect(meta).toContain(`<${instance.requirements[0].id}> <${NS.ext('comparisonSourceLatest').value}> <${latestConceptSnapshot.requirements[0].id}> .`);
                expect(meta).toContain(`<${instance.requirements[0].evidence.id}> <${NS.ext('comparisonSourceCurrent').value}> <${conceptSnapshot.requirements[0].evidence.id}> .`);
                expect(meta).toContain(`<${instance.requirements[0].evidence.id}> <${NS.ext('comparisonSourceLatest').value}> <${latestConceptSnapshot.requirements[0].evidence.id}> .`);
                expect(meta).toContain(`<${instance.requirements[1].id}> <${NS.ext('comparisonSourceCurrent').value}> <${conceptSnapshot.requirements[1].id}> .`);
                expect(meta).toContain(`<${instance.requirements[1].id}> <${NS.ext('comparisonSourceLatest').value}> <${latestConceptSnapshot.requirements[1].id}> .`);
                expect(meta).toContain(`<${instance.requirements[1].evidence.id}> <${NS.ext('comparisonSourceCurrent').value}> <${conceptSnapshot.requirements[1].evidence.id}> .`);
                expect(meta).toContain(`<${instance.requirements[1].evidence.id}> <${NS.ext('comparisonSourceLatest').value}> <${latestConceptSnapshot.requirements[1].evidence.id}> .`);
                expect(meta).toContain(`<${instance.procedures[0].id}> <${NS.ext('comparisonSourceCurrent').value}> <${conceptSnapshot.procedures[0].id}> .`);
                expect(meta).toContain(`<${instance.procedures[0].id}> <${NS.ext('comparisonSourceLatest').value}> <${latestConceptSnapshot.procedures[0].id}> .`);
                expect(meta).toContain(`<${instance.procedures[0].websites[0].id}> <${NS.ext('comparisonSourceCurrent').value}> <${conceptSnapshot.procedures[0].websites[0].id}> .`);
                expect(meta).toContain(`<${instance.procedures[0].websites[0].id}> <${NS.ext('comparisonSourceLatest').value}> <${latestConceptSnapshot.procedures[0].websites[0].id}> .`);
                expect(meta).toContain(`<${instance.procedures[0].websites[1].id}> <${NS.ext('comparisonSourceCurrent').value}> <${conceptSnapshot.procedures[0].websites[1].id}> .`);
                expect(meta).toContain(`<${instance.procedures[0].websites[1].id}> <${NS.ext('comparisonSourceLatest').value}> <${latestConceptSnapshot.procedures[0].websites[1].id}> .`);
                expect(meta).toContain(`<${instance.procedures[1].id}> <${NS.ext('comparisonSourceCurrent').value}> <${conceptSnapshot.procedures[1].id}> .`);
                expect(meta).toContain(`<${instance.procedures[1].id}> <${NS.ext('comparisonSourceLatest').value}> <${latestConceptSnapshot.procedures[1].id}> .`);
                expect(meta).toContain(`<${instance.procedures[1].websites[0].id}> <${NS.ext('comparisonSourceCurrent').value}> <${conceptSnapshot.procedures[1].websites[0].id}> .`);
                expect(meta).toContain(`<${instance.procedures[1].websites[0].id}> <${NS.ext('comparisonSourceLatest').value}> <${latestConceptSnapshot.procedures[1].websites[0].id}> .`);
                expect(meta).toContain(`<${instance.procedures[1].websites[1].id}> <${NS.ext('comparisonSourceCurrent').value}> <${conceptSnapshot.procedures[1].websites[1].id}> .`);
                expect(meta).toContain(`<${instance.procedures[1].websites[1].id}> <${NS.ext('comparisonSourceLatest').value}> <${latestConceptSnapshot.procedures[1].websites[1].id}> .`);
                expect(meta).toContain(`<${instance.costs[0].id}> <${NS.ext('comparisonSourceCurrent').value}> <${conceptSnapshot.costs[0].id}> .`);
                expect(meta).toContain(`<${instance.costs[0].id}> <${NS.ext('comparisonSourceLatest').value}> <${latestConceptSnapshot.costs[0].id}> .`);
                expect(meta).toContain(`<${instance.costs[1].id}> <${NS.ext('comparisonSourceCurrent').value}> <${conceptSnapshot.costs[1].id}> .`);
                expect(meta).toContain(`<${instance.costs[1].id}> <${NS.ext('comparisonSourceLatest').value}> <${latestConceptSnapshot.costs[1].id}> .`);
                expect(meta).toContain(`<${instance.financialAdvantages[0].id}> <${NS.ext('comparisonSourceCurrent').value}> <${conceptSnapshot.financialAdvantages[0].id}> .`);
                expect(meta).toContain(`<${instance.financialAdvantages[0].id}> <${NS.ext('comparisonSourceLatest').value}> <${latestConceptSnapshot.financialAdvantages[0].id}> .`);
                expect(meta).toContain(`<${instance.financialAdvantages[1].id}> <${NS.ext('comparisonSourceCurrent').value}> <${conceptSnapshot.financialAdvantages[1].id}> .`);
                expect(meta).toContain(`<${instance.financialAdvantages[1].id}> <${NS.ext('comparisonSourceLatest').value}> <${latestConceptSnapshot.financialAdvantages[1].id}> .`);
                expect(meta).toContain(`<${instance.websites[0].id}> <${NS.ext('comparisonSourceCurrent').value}> <${conceptSnapshot.websites[0].id}> .`);
                expect(meta).toContain(`<${instance.websites[0].id}> <${NS.ext('comparisonSourceLatest').value}> <${latestConceptSnapshot.websites[0].id}> .`);
                expect(meta).toContain(`<${instance.websites[1].id}> <${NS.ext('comparisonSourceCurrent').value}> <${conceptSnapshot.websites[1].id}> .`);
                expect(meta).toContain(`<${instance.websites[1].id}> <${NS.ext('comparisonSourceLatest').value}> <${latestConceptSnapshot.websites[1].id}> .`);
                expect(meta).toContain(`<${instance.legalResources[0].id}> <${NS.ext('comparisonSourceCurrent').value}> <${conceptSnapshot.legalResources[0].id}> .`);
                expect(meta).toContain(`<${instance.legalResources[0].id}> <${NS.ext('comparisonSourceLatest').value}> <${latestConceptSnapshot.legalResources[0].id}> .`);
                expect(meta).toContain(`<${instance.legalResources[1].id}> <${NS.ext('comparisonSourceCurrent').value}> <${conceptSnapshot.legalResources[1].id}> .`);
                expect(meta).toContain(`<${instance.legalResources[1].id}> <${NS.ext('comparisonSourceLatest').value}> <${latestConceptSnapshot.legalResources[1].id}> .`);
                expect(serviceUri).toEqual(instance.id.value);
            });

            test('meta data contains comparison sources for instance with concept and review status where length of nested objects differ', async () => {
                const bestuurseenheid = aBestuurseenheid().build();
                await bestuurseenheidRepository.save(bestuurseenheid);

                const concept = aMinimalConcept().build();
                await conceptRepository.save(concept);

                const conceptSnapshot = aFullConceptSnapshot()
                    .withIsVersionOfConcept(concept.id)
                    .withRequirements([aMinimalRequirementForConceptSnapshot().build()])
                    .withProcedures([aMinimalProcedureForConceptSnapshot().build()])
                    .withCosts([aMinimalCostForConceptSnapshot().withOrder(0).build(), aMinimalCostForConceptSnapshot().withOrder(1).build(), aMinimalCostForConceptSnapshot().withOrder(2).build()])
                    .withFinancialAdvantages([aMinimalFinancialAdvantageForConceptSnapshot().build()])
                    .withWebsites([aMinimalWebsiteForConceptSnapshot().build()])
                    .withLegalResources([aMinimalLegalResourceForConceptSnapshot().build()])
                    .build();
                const latestConceptSnapshot = aFullConceptSnapshot()
                    .withIsVersionOfConcept(concept.id)
                    .build();

                await conceptSnapshotRepository.save(conceptSnapshot);
                await conceptSnapshotRepository.save(latestConceptSnapshot);

                const instance = aFullInstance()
                    .withConceptId(concept.id)
                    .withConceptSnapshotId(conceptSnapshot.id)
                    .withProductId(concept.productId)
                    .withReviewStatus(InstanceReviewStatusType.CONCEPT_GEWIJZIGD)
                    .build();

                await instanceRepository.save(bestuurseenheid, instance);

                const formalInformalChoice = aFormalInformalChoice()
                    .withChosenForm(ChosenFormType.INFORMAL)
                    .build();
                await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

                formDefinitionRepository.loadInstanceFormDefinition.calledWith(FormType.INHOUD, Language.FORMAL).mockReturnValue('formdefinition');

                const {
                    form,
                    meta,
                    serviceUri
                } = await formApplicationService.loadInstanceForm(bestuurseenheid, instance.id, latestConceptSnapshot.id, FormType.INHOUD);

                expect(form).toEqual('formdefinition');
                expect(meta).toContain(`<${instance.id}> <${NS.ext('comparisonSourceCurrent').value}> <${conceptSnapshot.id}> .`);
                expect(meta).toContain(`<${instance.id}> <${NS.ext('comparisonSourceLatest').value}> <${latestConceptSnapshot.id}> .`);
                expect(meta).toContain(`<${instance.requirements[0].id}> <${NS.ext('comparisonSourceCurrent').value}> <${conceptSnapshot.requirements[0].id}> .`);
                expect(meta).toContain(`<${instance.requirements[0].id}> <${NS.ext('comparisonSourceLatest').value}> <${latestConceptSnapshot.requirements[0].id}> .`);
                expect(meta).not.toContain(`<${instance.requirements[0].evidence.id}> <${NS.ext('comparisonSourceCurrent').value}>`);
                expect(meta).toContain(`<${instance.requirements[0].evidence.id}> <${NS.ext('comparisonSourceLatest').value}> <${latestConceptSnapshot.requirements[0].evidence.id}> .`);
                expect(meta).not.toContain(`<${instance.requirements[1].id}> <${NS.ext('comparisonSourceCurrent').value}>`);
                expect(meta).toContain(`<${instance.requirements[1].id}> <${NS.ext('comparisonSourceLatest').value}> <${latestConceptSnapshot.requirements[1].id}> .`);
                expect(meta).not.toContain(`<${instance.requirements[1].evidence.id}> <${NS.ext('comparisonSourceCurrent').value}>`);
                expect(meta).toContain(`<${instance.requirements[1].evidence.id}> <${NS.ext('comparisonSourceLatest').value}> <${latestConceptSnapshot.requirements[1].evidence.id}> .`);
                expect(meta).toContain(`<${instance.procedures[0].id}> <${NS.ext('comparisonSourceCurrent').value}> <${conceptSnapshot.procedures[0].id}> .`);
                expect(meta).toContain(`<${instance.procedures[0].id}> <${NS.ext('comparisonSourceLatest').value}> <${latestConceptSnapshot.procedures[0].id}> .`);
                expect(meta).not.toContain(`<${instance.procedures[0].websites[0].id}> <${NS.ext('comparisonSourceCurrent').value}>`);
                expect(meta).toContain(`<${instance.procedures[0].websites[0].id}> <${NS.ext('comparisonSourceLatest').value}> <${latestConceptSnapshot.procedures[0].websites[0].id}> .`);
                expect(meta).not.toContain(`<${instance.procedures[0].websites[1].id}> <${NS.ext('comparisonSourceCurrent').value}>`);
                expect(meta).toContain(`<${instance.procedures[0].websites[1].id}> <${NS.ext('comparisonSourceLatest').value}> <${latestConceptSnapshot.procedures[0].websites[1].id}> .`);
                expect(meta).not.toContain(`<${instance.procedures[1].id}> <${NS.ext('comparisonSourceCurrent').value}>`);
                expect(meta).toContain(`<${instance.procedures[1].id}> <${NS.ext('comparisonSourceLatest').value}> <${latestConceptSnapshot.procedures[1].id}> .`);
                expect(meta).not.toContain(`<${instance.procedures[1].websites[0].id}> <${NS.ext('comparisonSourceCurrent').value}>`);
                expect(meta).toContain(`<${instance.procedures[1].websites[0].id}> <${NS.ext('comparisonSourceLatest').value}> <${latestConceptSnapshot.procedures[1].websites[0].id}> .`);
                expect(meta).not.toContain(`<${instance.procedures[1].websites[1].id}> <${NS.ext('comparisonSourceCurrent').value}>`);
                expect(meta).toContain(`<${instance.procedures[1].websites[1].id}> <${NS.ext('comparisonSourceLatest').value}> <${latestConceptSnapshot.procedures[1].websites[1].id}> .`);
                expect(meta).toContain(`<${instance.costs[0].id}> <${NS.ext('comparisonSourceCurrent').value}> <${conceptSnapshot.costs[0].id}> .`);
                expect(meta).toContain(`<${instance.costs[0].id}> <${NS.ext('comparisonSourceLatest').value}> <${latestConceptSnapshot.costs[0].id}> .`);
                expect(meta).toContain(`<${instance.costs[1].id}> <${NS.ext('comparisonSourceCurrent').value}> <${conceptSnapshot.costs[1].id}> .`);
                expect(meta).toContain(`<${instance.costs[1].id}> <${NS.ext('comparisonSourceLatest').value}> <${latestConceptSnapshot.costs[1].id}> .`);
                expect(meta).not.toContain(`<${NS.ext('comparisonSourceCurrent').value}> <${conceptSnapshot.costs[2].id}> .`);
                expect(meta).toContain(`<${instance.financialAdvantages[0].id}> <${NS.ext('comparisonSourceCurrent').value}> <${conceptSnapshot.financialAdvantages[0].id}> .`);
                expect(meta).toContain(`<${instance.financialAdvantages[0].id}> <${NS.ext('comparisonSourceLatest').value}> <${latestConceptSnapshot.financialAdvantages[0].id}> .`);
                expect(meta).not.toContain(`<${instance.financialAdvantages[1].id}> <${NS.ext('comparisonSourceCurrent').value}>`);
                expect(meta).toContain(`<${instance.financialAdvantages[1].id}> <${NS.ext('comparisonSourceLatest').value}> <${latestConceptSnapshot.financialAdvantages[1].id}> .`);
                expect(meta).toContain(`<${instance.websites[0].id}> <${NS.ext('comparisonSourceCurrent').value}> <${conceptSnapshot.websites[0].id}> .`);
                expect(meta).toContain(`<${instance.websites[0].id}> <${NS.ext('comparisonSourceLatest').value}> <${latestConceptSnapshot.websites[0].id}> .`);
                expect(meta).not.toContain(`<${instance.websites[1].id}> <${NS.ext('comparisonSourceCurrent').value}>`);
                expect(meta).toContain(`<${instance.websites[1].id}> <${NS.ext('comparisonSourceLatest').value}> <${latestConceptSnapshot.websites[1].id}> .`);
                expect(meta).toContain(`<${instance.legalResources[0].id}> <${NS.ext('comparisonSourceCurrent').value}> <${conceptSnapshot.legalResources[0].id}> .`);
                expect(meta).toContain(`<${instance.legalResources[0].id}> <${NS.ext('comparisonSourceLatest').value}> <${latestConceptSnapshot.legalResources[0].id}> .`);
                expect(meta).not.toContain(`<${instance.legalResources[1].id}> <${NS.ext('comparisonSourceCurrent').value}>`);
                expect(meta).toContain(`<${instance.legalResources[1].id}> <${NS.ext('comparisonSourceLatest').value}> <${latestConceptSnapshot.legalResources[1].id}> .`);
                expect(serviceUri).toEqual(instance.id.value);
            });

            test('throws a system error when trying to load form for an instance with concept and review status but latestConceptSnapshotId absent', async () => {
                const bestuurseenheid = aBestuurseenheid().build();
                await bestuurseenheidRepository.save(bestuurseenheid);

                const concept = aMinimalConcept()
                    .build();
                await conceptRepository.save(concept);

                const conceptSnapshot = aFullConceptSnapshot()
                    .withIsVersionOfConcept(concept.id)
                    .build();
                const latestConceptSnapshot = aFullConceptSnapshot()
                    .withIsVersionOfConcept(concept.id)
                    .build();

                await conceptSnapshotRepository.save(conceptSnapshot);
                await conceptSnapshotRepository.save(latestConceptSnapshot);

                const instance = aMinimalInstance()
                    .withConceptId(concept.id)
                    .withConceptSnapshotId(conceptSnapshot.id)
                    .withProductId(concept.productId)
                    .withReviewStatus(InstanceReviewStatusType.CONCEPT_GEWIJZIGD)
                    .build();

                await instanceRepository.save(bestuurseenheid, instance);

                const formalInformalChoice =
                    aFormalInformalChoice()
                        .withChosenForm(ChosenFormType.INFORMAL)
                        .build();
                await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

                formDefinitionRepository.loadInstanceFormDefinition.calledWith(FormType.INHOUD, Language.FORMAL).mockReturnValue('formdefinition');

                await expect(formApplicationService.loadInstanceForm(bestuurseenheid, instance.id, undefined, FormType.INHOUD)).rejects.toThrowWithMessage(SystemError, 'latestConceptSnapshotId mag niet ontbreken');
            });

            test('throws a system error when trying to load form for an instance with concept and review status but latestConceptSnapshotId of different concept', async () => {
                const bestuurseenheid = aBestuurseenheid().build();
                await bestuurseenheidRepository.save(bestuurseenheid);

                const concept = aMinimalConcept()
                    .build();
                await conceptRepository.save(concept);

                const conceptSnapshot = aFullConceptSnapshot()
                    .withIsVersionOfConcept(concept.id)
                    .build();
                const latestConceptSnapshot = aFullConceptSnapshot()
                    .withIsVersionOfConcept(buildConceptIri(uuid()))
                    .build();

                await conceptSnapshotRepository.save(conceptSnapshot);
                await conceptSnapshotRepository.save(latestConceptSnapshot);

                const instance = aMinimalInstance()
                    .withConceptId(concept.id)
                    .withConceptSnapshotId(conceptSnapshot.id)
                    .withProductId(concept.productId)
                    .withReviewStatus(InstanceReviewStatusType.CONCEPT_GEWIJZIGD)
                    .build();

                await instanceRepository.save(bestuurseenheid, instance);

                const formalInformalChoice =
                    aFormalInformalChoice()
                        .withChosenForm(ChosenFormType.INFORMAL)
                        .build();
                await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

                formDefinitionRepository.loadInstanceFormDefinition.calledWith(FormType.INHOUD, Language.FORMAL).mockReturnValue('formdefinition');

                await expect(formApplicationService.loadInstanceForm(bestuurseenheid, instance.id, latestConceptSnapshot.id, FormType.INHOUD)).rejects.toThrowWithMessage(SystemError, 'latestConceptSnapshot hoort niet bij concept van instantie');
            });

            test('throws a system error when trying to load form for an instance with concept and review status but versioned concept snapshot id of instance is of different concept', async () => {
                const bestuurseenheid = aBestuurseenheid().build();
                await bestuurseenheidRepository.save(bestuurseenheid);

                const concept = aMinimalConcept()
                    .build();
                await conceptRepository.save(concept);

                const conceptSnapshot = aFullConceptSnapshot()
                    .withIsVersionOfConcept(buildConceptIri(uuid()))
                    .build();
                const latestConceptSnapshot = aFullConceptSnapshot()
                    .withIsVersionOfConcept(concept.id)
                    .build();

                await conceptSnapshotRepository.save(conceptSnapshot);
                await conceptSnapshotRepository.save(latestConceptSnapshot);

                const instance = aMinimalInstance()
                    .withConceptId(concept.id)
                    .withConceptSnapshotId(conceptSnapshot.id)
                    .withProductId(concept.productId)
                    .withReviewStatus(InstanceReviewStatusType.CONCEPT_GEWIJZIGD)
                    .build();

                await instanceRepository.save(bestuurseenheid, instance);

                const formalInformalChoice =
                    aFormalInformalChoice()
                        .withChosenForm(ChosenFormType.INFORMAL)
                        .build();
                await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

                formDefinitionRepository.loadInstanceFormDefinition.calledWith(FormType.INHOUD, Language.FORMAL).mockReturnValue('formdefinition');

                await expect(formApplicationService.loadInstanceForm(bestuurseenheid, instance.id, latestConceptSnapshot.id, FormType.INHOUD)).rejects.toThrowWithMessage(SystemError, 'concept snapshot van instantie hoort niet bij concept van instantie');
            });


        });

        describe('eigenschappen form', () => {

            test('can load form for an instance without concept in correct language', async () => {
                const bestuurseenheid =
                    aBestuurseenheid()
                        .build();
                await bestuurseenheidRepository.save(bestuurseenheid);

                const instance =
                    aMinimalInstance()
                        .withTitle(LanguageString.of(undefined, undefined, undefined))
                        .withDescription(undefined)
                        .withAdditionalDescription(undefined)
                        .withException(undefined)
                        .withRegulation(undefined)
                        .withDutchLanguageVariant(Language.INFORMAL)
                        .withPublicationMedia([PublicationMediumType.RECHTENVERKENNER])
                        .withConceptId(undefined)
                        .withConceptSnapshotId(undefined)
                        .withProductId(undefined)
                        .build();
                await instanceRepository.save(bestuurseenheid, instance);

                const formalInformalChoice =
                    aFormalInformalChoice()
                        .withChosenForm(ChosenFormType.INFORMAL)
                        .build();
                await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

                formDefinitionRepository.loadInstanceFormDefinition.calledWith(FormType.EIGENSCHAPPEN, Language.INFORMAL).mockReturnValue('formdefinition');
                codeRepository.loadIPDCOrganisatiesTailoredInTurtleFormat.mockReturnValue(Promise.resolve(['org1 a concept.', 'org2 a concept.']));

                const {
                    form,
                    meta,
                    source,
                    serviceUri
                } = await formApplicationService.loadInstanceForm(bestuurseenheid, instance.id, undefined, FormType.EIGENSCHAPPEN);

                expect(form).toEqual('formdefinition');
                expect(meta).toEqual('org1 a concept.\r\norg2 a concept.');
                expect(source).toEqual(semanticFormsMapper.instanceAsTurtleFormat(bestuurseenheid, instance).join("\r\n"));
                expect(source).toContain(`<${instance.id}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService> .`);
                expect(serviceUri).toEqual(instance.id.value);

            });

            test('can load form for an instance with concept, without review status in correct language', async () => {
                const bestuurseenheid =
                    aBestuurseenheid()
                        .build();
                await bestuurseenheidRepository.save(bestuurseenheid);

                const concept = aMinimalConcept()
                    .build();
                await conceptRepository.save(concept);

                const conceptSnapshot = aMinimalConceptSnapshot()
                    .withIsVersionOfConcept(concept.id)
                    .build();
                await conceptSnapshotRepository.save(conceptSnapshot);

                const instance =
                    aMinimalInstance()
                        .withTitle(LanguageString.of(undefined, undefined, undefined))
                        .withDescription(undefined)
                        .withAdditionalDescription(undefined)
                        .withException(undefined)
                        .withRegulation(undefined)
                        .withDutchLanguageVariant(Language.INFORMAL)
                        .withPublicationMedia([PublicationMediumType.RECHTENVERKENNER])
                        .withConceptId(concept.id)
                        .withConceptSnapshotId(conceptSnapshot.id)
                        .withProductId(concept.productId)
                        .build();
                await instanceRepository.save(bestuurseenheid, instance);

                const formalInformalChoice =
                    aFormalInformalChoice()
                        .withChosenForm(ChosenFormType.INFORMAL)
                        .build();
                await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

                formDefinitionRepository.loadInstanceFormDefinition.calledWith(FormType.EIGENSCHAPPEN, Language.INFORMAL).mockReturnValue('formdefinition');
                codeRepository.loadIPDCOrganisatiesTailoredInTurtleFormat.mockReturnValue(Promise.resolve(['org1 a concept.', 'org2 a concept.']));

                const {
                    form,
                    meta,
                    source,
                    serviceUri
                } = await formApplicationService.loadInstanceForm(bestuurseenheid, instance.id, conceptSnapshot.id, FormType.EIGENSCHAPPEN);

                expect(form).toEqual('formdefinition');
                expect(meta).toEqual('org1 a concept.\r\norg2 a concept.');
                expect(source).toEqual(semanticFormsMapper.instanceAsTurtleFormat(bestuurseenheid, instance).join("\r\n"));
                expect(source).toContain(`<${instance.id}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService> .`);
                expect(serviceUri).toEqual(instance.id.value);

            });

            test('can load form for an instance with concept and review status in correct language', async () => {
                const bestuurseenheid =
                    aBestuurseenheid()
                        .build();
                await bestuurseenheidRepository.save(bestuurseenheid);

                const concept = aMinimalConcept()
                    .build();
                await conceptRepository.save(concept);

                const conceptSnapshot = aFullConceptSnapshot()
                    .withIsVersionOfConcept(concept.id)
                    .build();
                const latestConceptSnapshot = aFullConceptSnapshot()
                    .withIsVersionOfConcept(concept.id)
                    .build();

                await conceptSnapshotRepository.save(conceptSnapshot);
                await conceptSnapshotRepository.save(latestConceptSnapshot);

                const instance =
                    aMinimalInstance()
                        .withTitle(LanguageString.of(undefined, undefined, undefined))
                        .withDescription(undefined)
                        .withAdditionalDescription(undefined)
                        .withException(undefined)
                        .withRegulation(undefined)
                        .withDutchLanguageVariant(Language.INFORMAL)
                        .withPublicationMedia([PublicationMediumType.RECHTENVERKENNER])
                        .withConceptId(concept.id)
                        .withConceptSnapshotId(conceptSnapshot.id)
                        .withReviewStatus(InstanceReviewStatusType.CONCEPT_GEWIJZIGD)
                        .withProductId(concept.productId)
                        .build();
                await instanceRepository.save(bestuurseenheid, instance);

                const formalInformalChoice =
                    aFormalInformalChoice()
                        .withChosenForm(ChosenFormType.INFORMAL)
                        .build();
                await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

                formDefinitionRepository.loadInstanceFormDefinition.calledWith(FormType.EIGENSCHAPPEN, Language.INFORMAL).mockReturnValue('formdefinition');
                codeRepository.loadIPDCOrganisatiesTailoredInTurtleFormat.mockReturnValue(Promise.resolve(['org1 a concept.', 'org2 a concept.']));

                const {
                    form,
                    meta,
                    source,
                    serviceUri
                } = await formApplicationService.loadInstanceForm(bestuurseenheid, instance.id, latestConceptSnapshot.id, FormType.EIGENSCHAPPEN);

                expect(form).toEqual('formdefinition');
                expect(meta).toContain('org1 a concept.');
                expect(meta).toContain('org2 a concept.');
                expect(meta).toContain(`<${conceptSnapshot.id}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`);
                expect(meta).toContain(`<${latestConceptSnapshot.id}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`);
                expect(source).toEqual(semanticFormsMapper.instanceAsTurtleFormat(bestuurseenheid, instance).join("\r\n"));
                expect(source).toContain(`<${instance.id}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService> .`);
                expect(serviceUri).toEqual(instance.id.value);

            });
        });

    });

    describe('validateForms', () => {

        const conceptRepository = new ConceptSparqlRepository(TEST_SPARQL_ENDPOINT);
        const conceptSnapshotRepository = new ConceptSnapshotSparqlRepository(TEST_SPARQL_ENDPOINT);
        const instanceRepository = new InstanceSparqlTestRepository(TEST_SPARQL_ENDPOINT);
        const formDefinitionRepository = new FormDefinitionFileRepository();
        const codeRepository = new CodeSparqlRepository(TEST_SPARQL_ENDPOINT);
        const formalInformalChoiceRepository = new FormalInformalChoiceSparqlRepository(TEST_SPARQL_ENDPOINT);
        const selectConceptLanguageDomainService = new SelectConceptLanguageDomainService();
        const semanticFormsMapper = new SemanticFormsMapperImpl();

        const formApplicationService = new FormApplicationService(conceptRepository, conceptSnapshotRepository, instanceRepository, formDefinitionRepository, codeRepository, formalInformalChoiceRepository, selectConceptLanguageDomainService, semanticFormsMapper);

        test('valid form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance().build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([]);
        });

        test('no title, error in inhoud form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withTitle(undefined)
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "inhoud",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no description, error in inhoud form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withDescription(undefined)
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "inhoud",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no requirement title, error in inhoud form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withRequirements([aFullRequirementForInstance().withTitle(undefined).build()])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "inhoud",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no requirement description, error in inhoud form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withRequirements([aFullRequirementForInstance().withDescription(undefined).build()])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "inhoud",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no evidence title, error in inhoud form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withRequirements([aFullRequirementForInstance().withEvidence(aFullEvidenceForInstance().withTitle(undefined).build()).build()])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "inhoud",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no evidence description, error in inhoud form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withRequirements([aFullRequirementForInstance().withEvidence(aFullEvidenceForInstance().withDescription(undefined).build()).build()])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "inhoud",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no procedure title, error in inhoud form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withProcedures([aFullProcedureForInstance().withTitle(undefined).build()])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "inhoud",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no procedure description, error in inhoud form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withProcedures([aFullProcedureForInstance().withDescription(undefined).build()])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "inhoud",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no procedure website title, error in inhoud form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withProcedures([aFullProcedureForInstance().withWebsites([aFullWebsiteForInstance().withTitle(undefined).build()]).build()])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);
            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);

            expect(errors).toEqual([{
                formId: "inhoud",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no procedure website url, error in inhoud form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withProcedures([aFullProcedureForInstance().withWebsites([aFullWebsiteForInstance().withUrl(undefined).build()]).build()])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "inhoud",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('invalid procedure website url, error in inhoud form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withProcedures([aFullProcedureForInstance().withWebsites([aFullWebsiteForInstance().withUrl('www.example.com').build()]).build()])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "inhoud",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no cost title, error in inhoud form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withCosts([aFullCostForInstance().withTitle(undefined).build()])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "inhoud",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no cost description, error in inhoud form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withCosts([aFullCostForInstance().withDescription(undefined).build()])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "inhoud",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no financialAdvantage title, error in inhoud form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withFinancialAdvantages([aFullFinancialAdvantageForInstance().withTitle(undefined).build()])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "inhoud",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no financialAdvantage description, error in inhoud form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withFinancialAdvantages([aFullFinancialAdvantageForInstance().withDescription(undefined).build()])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "inhoud",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no legalResource url, error in inhoud form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withLegalResources([aFullLegalResourceForInstance().withUrl(undefined).build()])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "inhoud",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('invalid legalResource url, error in inhoud form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withLegalResources([aFullLegalResourceForInstance().withUrl('codex.vlaanderen.be').build()])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "inhoud",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('invalid contactPoint email, error in inhoud form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withContactPoints([aFullContactPointForInstance().withEmail('notValidEmail').build()])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "inhoud",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('invalid contactPoint phone number, error in inhoud form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withContactPoints([aFullContactPointForInstance().withTelephone('123').build()])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "inhoud",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('invalid contactPoint website url, error in inhoud form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withContactPoints([aFullContactPointForInstance().withUrl('www.example.com').build()])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "inhoud",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no website title, error in inhoud form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withWebsites([aFullWebsiteForInstance().withTitle(undefined).build()])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "inhoud",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no website url, error in inhoud form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withWebsites([aFullWebsiteForInstance().withUrl(undefined).build()])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "inhoud",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('invalid website url, error in inhoud form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withWebsites([aFullWebsiteForInstance().withUrl('www.example.com').build()])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "inhoud",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no competentAuthority, error in eigenschappen form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withCompetentAuthorities([])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "eigenschappen",
                message: `Er zijn fouten opgetreden in de tab "eigenschappen". Gelieve deze te verbeteren!`
            }]);
        });

        test('no spatial, error in eigenschappen form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withSpatials([])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "eigenschappen",
                message: `Er zijn fouten opgetreden in de tab "eigenschappen". Gelieve deze te verbeteren!`
            }]);
        });

        test('no yourEuropeCategory when YourEurope publicationChannel, error in eigenschappen form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withPublicationMedia([PublicationMediumType.YOUREUROPE])
                .withYourEuropeCategories([])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "eigenschappen",
                message: `Er zijn fouten opgetreden in de tab "eigenschappen". Gelieve deze te verbeteren!`
            }]);
        });

    });
});
