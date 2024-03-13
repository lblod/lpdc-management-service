import {FormApplicationService} from "../../../src/core/application/form-application-service";
import {ConceptSparqlRepository} from "../../../src/driven/persistence/concept-sparql-repository";
import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {aFullConcept} from "../domain/concept-test-builder";
import {mock} from 'jest-mock-extended';
import {CodeRepository} from "../../../src/core/port/driven/persistence/code-repository";
import {FormDefinitionRepository} from "../../../src/core/port/driven/persistence/form-definition-repository";
import {SelectFormLanguageDomainService} from "../../../src/core/domain/select-form-language-domain-service";
import {
    FormalInformalChoiceSparqlTestRepository
} from "../../driven/persistence/formal-informal-choice-sparql-test-repository";
import {aFormalInformalChoice} from "../domain/formal-informal-choice-test-builder";
import {ChosenFormType, FormType, PublicationMediumType} from "../../../src/core/domain/types";
import {aBestuurseenheid} from "../domain/bestuurseenheid-test-builder";
import {BestuurseenheidSparqlTestRepository} from "../../driven/persistence/bestuurseenheid-sparql-test-repository";
import {Language} from "../../../src/core/domain/language";
import {LanguageString} from "../../../src/core/domain/language-string";
import {aFullInstance, aMinimalInstance} from "../domain/instance-test-builder";
import {InstanceSparqlRepository} from "../../../src/driven/persistence/instance-sparql-repository";
import {SemanticFormsMapperImpl} from "../../../src/driven/persistence/semantic-forms-mapper-impl";
import {FormDefinitionFileRepository} from "../../../src/driven/persistence/form-definition-file-repository";
import {CodeSparqlRepository} from "../../../src/driven/persistence/code-sparql-repository";
import {
    FormalInformalChoiceSparqlRepository
} from "../../../src/driven/persistence/formal-informal-choice-sparql-repository";
import {aFullRequirementForInstance} from "../domain/requirement-test-builder";
import {aFullEvidenceForInstance} from "../domain/evidence-test-builder";
import {aFullProcedureForInstance} from "../domain/procedure-test-builder";
import {aFullWebsiteForInstance} from "../domain/website-test-builder";
import {aFullCostForInstance} from "../domain/cost-test-builder";
import {aFullFinancialAdvantageForInstance} from "../domain/financial-advantage-test-builder";
import {aFullLegalResourceForInstance} from "../domain/legal-resource-test-builder";
import {aFullContactPointForInstance} from "../domain/contact-point-test-builder";

describe('Form application service tests', () => {

    describe('loadConceptForm', () => {

        const conceptRepository = new ConceptSparqlRepository(TEST_SPARQL_ENDPOINT);
        const instanceRepository = new InstanceSparqlRepository(TEST_SPARQL_ENDPOINT);
        const formDefinitionRepository = mock<FormDefinitionRepository>();
        const codeRepository = mock<CodeRepository>();
        const formalInformalChoiceRepository = new FormalInformalChoiceSparqlTestRepository(TEST_SPARQL_ENDPOINT);
        const selectFormLanguageDomainService = new SelectFormLanguageDomainService(formalInformalChoiceRepository);
        const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(TEST_SPARQL_ENDPOINT);
        const semanticFormsMapper = new SemanticFormsMapperImpl();

        const formApplicationService = new FormApplicationService(conceptRepository, instanceRepository, formDefinitionRepository, codeRepository, selectFormLanguageDomainService, semanticFormsMapper);

        test('can load a content form for a concept in correct language', async () => {
            const concept =
                aFullConcept()
                    .withTitle(
                        LanguageString.of(undefined, 'nl', undefined, 'title informal', 'title generated formal', undefined)
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

            formDefinitionRepository.loadFormDefinition.calledWith(FormType.CONTENT, Language.INFORMAL, false).mockReturnValue('formdefinition');

            const {
                form,
                meta,
                source,
                serviceUri
            } = await formApplicationService.loadConceptForm(bestuurseenheid, concept.id, FormType.CONTENT);

            expect(form).toEqual('formdefinition');
            expect(meta).toEqual('');
            expect(source).toEqual(semanticFormsMapper.conceptAsTurtleFormat(concept).join("\r\n"));
            expect(source).toContain(`<${concept.id}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService> .`);
            expect(serviceUri).toEqual(concept.id.value);
        });

        test('can load a content form for a concept in correct language and add english requirements if publication medium is your europe', async () => {
            const concept =
                aFullConcept()
                    .withTitle(
                        LanguageString.of(undefined, 'nl', undefined, 'title informal', 'title generated formal', undefined)
                    )
                    .withPublicationMedia([PublicationMediumType.YOUREUROPE])
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

            formDefinitionRepository.loadFormDefinition.calledWith(FormType.CONTENT, Language.INFORMAL, true).mockReturnValue('formdefinition with english requirements');

            const {
                form,
                meta,
                source,
                serviceUri
            } = await formApplicationService.loadConceptForm(bestuurseenheid, concept.id, FormType.CONTENT);

            expect(form).toEqual('formdefinition with english requirements');
            expect(meta).toEqual('');
            expect(source).toEqual(semanticFormsMapper.conceptAsTurtleFormat(concept).join("\r\n"));
            expect(source).toContain(`<${concept.id}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService> .`);
            expect(serviceUri).toEqual(concept.id.value);

        });

        test('can load a characteristics form for a concept in correct language', async () => {
            const concept =
                aFullConcept()
                    .withTitle(
                        LanguageString.of(undefined, 'nl', undefined, 'title informal', 'title generated formal', undefined)
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

            formDefinitionRepository.loadFormDefinition.calledWith(FormType.CHARACTERISTICS, Language.INFORMAL, false).mockReturnValue('formdefinition');
            codeRepository.loadIPDCOrganisatiesTailoredInTurtleFormat.mockReturnValue(Promise.resolve(['org1 a concept.', 'org2 a concept.']));

            const {
                form,
                meta,
                source,
                serviceUri
            } = await formApplicationService.loadConceptForm(bestuurseenheid, concept.id, FormType.CHARACTERISTICS);

            expect(form).toEqual('formdefinition');
            expect(meta).toEqual('org1 a concept.\r\norg2 a concept.');
            expect(source).toEqual(semanticFormsMapper.conceptAsTurtleFormat(concept).join("\r\n"));
            expect(source).toContain(`<${concept.id}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService> .`);
            expect(serviceUri).toEqual(concept.id.value);

        });

    });

    describe('loadInstanceForm', () => {

        const conceptRepository = new ConceptSparqlRepository(TEST_SPARQL_ENDPOINT);
        const instanceRepository = new InstanceSparqlRepository(TEST_SPARQL_ENDPOINT);
        const formDefinitionRepository = mock<FormDefinitionRepository>();
        const codeRepository = mock<CodeRepository>();
        const formalInformalChoiceRepository = new FormalInformalChoiceSparqlTestRepository(TEST_SPARQL_ENDPOINT);
        const selectFormLanguageDomainService = new SelectFormLanguageDomainService(formalInformalChoiceRepository);
        const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(TEST_SPARQL_ENDPOINT);
        const semanticFormsMapper = new SemanticFormsMapperImpl();

        const formApplicationService = new FormApplicationService(conceptRepository, instanceRepository, formDefinitionRepository, codeRepository, selectFormLanguageDomainService, semanticFormsMapper);

        test('can load a content form for an instance in correct language', async () => {
            const bestuurseenheid =
                aBestuurseenheid()
                    .build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const instance =
                aFullInstance()
                    .withTitle(
                        LanguageString.of(undefined, undefined, 'nl formal')
                    )
                    .withDescription(undefined)
                    .withAdditionalDescription(undefined)
                    .withException(undefined)
                    .withRegulation(undefined)
                    .withPublicationMedia([PublicationMediumType.RECHTENVERKENNER])
                    .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const formalInformalChoice =
                aFormalInformalChoice()
                    .withChosenForm(ChosenFormType.INFORMAL)
                    .build();
            await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

            formDefinitionRepository.loadFormDefinition.calledWith(FormType.CONTENT, Language.FORMAL, false).mockReturnValue('formdefinition');

            const {
                form,
                meta,
                source,
                serviceUri
            } = await formApplicationService.loadInstanceForm(bestuurseenheid, instance.id, FormType.CONTENT);

            expect(form).toEqual('formdefinition');
            expect(meta).toEqual('');
            expect(source).toEqual(semanticFormsMapper.instanceAsTurtleFormat(bestuurseenheid, instance).join("\r\n"));
            expect(source).toContain(`<${instance.id}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/vocab/cpsv#PublicService> .`);
            expect(serviceUri).toEqual(instance.id.value);
        });

        test('can load a content form for an instance in correct language and add english requirements if publication medium is your europe', async () => {
            const bestuurseenheid =
                aBestuurseenheid()
                    .build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const instance =
                aFullInstance()
                    .withTitle(
                        LanguageString.of(undefined, undefined, 'nl formal')
                    )
                    .withDescription(undefined)
                    .withAdditionalDescription(undefined)
                    .withException(undefined)
                    .withRegulation(undefined)
                    .withPublicationMedia([PublicationMediumType.YOUREUROPE])
                    .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const formalInformalChoice =
                aFormalInformalChoice()
                    .withChosenForm(ChosenFormType.INFORMAL)
                    .build();
            await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

            formDefinitionRepository.loadFormDefinition.calledWith(FormType.CONTENT, Language.FORMAL, true).mockReturnValue('formdefinition with english requirements');

            const {
                form,
                meta,
                source,
                serviceUri
            } = await formApplicationService.loadInstanceForm(bestuurseenheid, instance.id, FormType.CONTENT);

            expect(form).toEqual('formdefinition with english requirements');
            expect(meta).toEqual('');
            expect(source).toEqual(semanticFormsMapper.instanceAsTurtleFormat(bestuurseenheid, instance).join("\r\n"));
            expect(source).toContain(`<${instance.id}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/vocab/cpsv#PublicService> .`);
            expect(serviceUri).toEqual(instance.id.value);

        });

        test('can load a characteristics form for an instance in correct language', async () => {
            const bestuurseenheid =
                aBestuurseenheid()
                    .build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const instance =
                aMinimalInstance()
                    .withTitle(
                        LanguageString.of(undefined, undefined, undefined)
                    )
                    .withDescription(undefined)
                    .withAdditionalDescription(undefined)
                    .withException(undefined)
                    .withRegulation(undefined)
                    .withPublicationMedia([PublicationMediumType.RECHTENVERKENNER])
                    .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const formalInformalChoice =
                aFormalInformalChoice()
                    .withChosenForm(ChosenFormType.INFORMAL)
                    .build();
            await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

            formDefinitionRepository.loadFormDefinition.calledWith(FormType.CHARACTERISTICS, Language.INFORMAL, false).mockReturnValue('formdefinition');
            codeRepository.loadIPDCOrganisatiesTailoredInTurtleFormat.mockReturnValue(Promise.resolve(['org1 a concept.', 'org2 a concept.']));

            const {
                form,
                meta,
                source,
                serviceUri
            } = await formApplicationService.loadInstanceForm(bestuurseenheid, instance.id, FormType.CHARACTERISTICS);

            expect(form).toEqual('formdefinition');
            expect(meta).toEqual('org1 a concept.\r\norg2 a concept.');
            expect(source).toEqual(semanticFormsMapper.instanceAsTurtleFormat(bestuurseenheid, instance).join("\r\n"));
            expect(source).toContain(`<${instance.id}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/vocab/cpsv#PublicService> .`);
            expect(serviceUri).toEqual(instance.id.value);

        });

    });

    describe('validateForms', () => {

        const conceptRepository = new ConceptSparqlRepository(TEST_SPARQL_ENDPOINT);
        const instanceRepository = new InstanceSparqlRepository(TEST_SPARQL_ENDPOINT);
        const formDefinitionRepository = new FormDefinitionFileRepository();
        const codeRepository = new CodeSparqlRepository(TEST_SPARQL_ENDPOINT);
        const formalInformalChoiceRepository = new FormalInformalChoiceSparqlRepository(TEST_SPARQL_ENDPOINT);
        const selectFormLanguageDomainService = new SelectFormLanguageDomainService(formalInformalChoiceRepository);
        const semanticFormsMapper = new SemanticFormsMapperImpl();

        const formApplicationService = new FormApplicationService(conceptRepository, instanceRepository, formDefinitionRepository, codeRepository, selectFormLanguageDomainService, semanticFormsMapper);

        test('valid form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance().build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([]);
        });

        test('no title, error in content form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withTitle(undefined)
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                formUri: "http://data.lblod.info/id/forms/cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no english title when yourEurope, error in content form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withTitle(LanguageString.of(undefined, undefined, 'titel'))
                .withPublicationMedia([PublicationMediumType.YOUREUROPE])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                formUri: "http://data.lblod.info/id/forms/cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no english title when no yourEurope, is valid', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withTitle(LanguageString.of(undefined, undefined, 'titel'))
                .withPublicationMedia([])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([]);
        });

        test('no description, error in content form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withDescription(undefined)
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                formUri: "http://data.lblod.info/id/forms/cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no english description when yourEurope, error in content form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withDescription(LanguageString.of(undefined, undefined, 'beschrijving'))
                .withPublicationMedia([PublicationMediumType.YOUREUROPE])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                formUri: "http://data.lblod.info/id/forms/cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no english description when no yourEurope, is valid', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withDescription(LanguageString.of(undefined, undefined, 'beschrijving'))
                .withPublicationMedia([])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([]);
        });

        test('no requirement title, error in content form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withRequirements([aFullRequirementForInstance().withTitle(undefined).build()])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                formUri: "http://data.lblod.info/id/forms/cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no english requirement title when yourEurope, error in content form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withRequirements([aFullRequirementForInstance().withTitle(LanguageString.of(undefined, undefined, 'titel')).build()])
                .withPublicationMedia([PublicationMediumType.YOUREUROPE])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                formUri: "http://data.lblod.info/id/forms/cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no english requirement title when no yourEurope, is valid', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withRequirements([aFullRequirementForInstance().withTitle(LanguageString.of(undefined, undefined, 'titel')).build()])
                .withPublicationMedia([])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([]);
        });

        test('no requirement description, error in content form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withRequirements([aFullRequirementForInstance().withDescription(undefined).build()])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                formUri: "http://data.lblod.info/id/forms/cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no english requirement description when yourEurope, error in content form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withRequirements([aFullRequirementForInstance().withDescription(LanguageString.of(undefined, undefined, 'beschrijving')).build()])
                .withPublicationMedia([PublicationMediumType.YOUREUROPE])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                formUri: "http://data.lblod.info/id/forms/cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no english requirement description when no yourEurope, is valid', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withRequirements([aFullRequirementForInstance().withDescription(LanguageString.of(undefined, undefined, 'beschrijving')).build()])
                .withPublicationMedia([])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([]);
        });

        test('no evidence title, error in content form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withRequirements([aFullRequirementForInstance().withEvidence(aFullEvidenceForInstance().withTitle(undefined).buildForInstance()).build()])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                formUri: "http://data.lblod.info/id/forms/cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no english requirement evidence title when yourEurope, error in content form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withRequirements([aFullRequirementForInstance().withEvidence(aFullEvidenceForInstance().withTitle(LanguageString.of(undefined, undefined, 'titel')).buildForInstance()).build()])
                .withPublicationMedia([PublicationMediumType.YOUREUROPE])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                formUri: "http://data.lblod.info/id/forms/cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no english requirement evidence title when no yourEurope, is valid', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withRequirements([aFullRequirementForInstance().withEvidence(aFullEvidenceForInstance().withTitle(LanguageString.of(undefined, undefined, 'titel')).buildForInstance()).build()])
                .withPublicationMedia([])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([]);
        });

        test('no evidence description, error in content form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withRequirements([aFullRequirementForInstance().withEvidence(aFullEvidenceForInstance().withDescription(undefined).buildForInstance()).build()])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                formUri: "http://data.lblod.info/id/forms/cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no english requirement evidence description when yourEurope, error in content form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withRequirements([aFullRequirementForInstance().withEvidence(aFullEvidenceForInstance().withDescription(LanguageString.of(undefined, undefined, 'beschrijving')).buildForInstance()).build()])
                .withPublicationMedia([PublicationMediumType.YOUREUROPE])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                formUri: "http://data.lblod.info/id/forms/cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no english requirement evidence description when no yourEurope, is valid', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withRequirements([aFullRequirementForInstance().withEvidence(aFullEvidenceForInstance().withDescription(LanguageString.of(undefined, undefined, 'beschrijving')).buildForInstance()).build()])
                .withPublicationMedia([])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([]);
        });

        test('no procedure title, error in content form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withProcedures([aFullProcedureForInstance().withTitle(undefined).buildForInstance()])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                formUri: "http://data.lblod.info/id/forms/cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no english procedure title when yourEurope, error in content form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withProcedures([aFullProcedureForInstance().withTitle(LanguageString.of(undefined, undefined, 'titel')).buildForInstance()])
                .withPublicationMedia([PublicationMediumType.YOUREUROPE])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                formUri: "http://data.lblod.info/id/forms/cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no english procedure title when no yourEurope, is valid', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withProcedures([aFullProcedureForInstance().withTitle(LanguageString.of(undefined, undefined, 'titel')).buildForInstance()])
                .withPublicationMedia([])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([]);
        });

        test('no procedure description, error in content form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withProcedures([aFullProcedureForInstance().withDescription(undefined).buildForInstance()])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                formUri: "http://data.lblod.info/id/forms/cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no english procedure description when yourEurope, error in content form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withProcedures([aFullProcedureForInstance().withDescription(LanguageString.of(undefined, undefined, 'beschrijving')).buildForInstance()])
                .withPublicationMedia([PublicationMediumType.YOUREUROPE])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                formUri: "http://data.lblod.info/id/forms/cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no english procedure description when no yourEurope, is valid', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withProcedures([aFullProcedureForInstance().withDescription(LanguageString.of(undefined, undefined, 'beschrijving')).buildForInstance()])
                .withPublicationMedia([])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([]);
        });

        test('no procedure website title, error in content form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withProcedures([aFullProcedureForInstance().withWebsites([aFullWebsiteForInstance().withTitle(undefined).buildForInstance()]).buildForInstance()])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                formUri: "http://data.lblod.info/id/forms/cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no english procedure website title when yourEurope, error in content form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withProcedures([aFullProcedureForInstance().withWebsites([aFullWebsiteForInstance().withTitle(LanguageString.of(undefined, undefined, 'titel')).buildForInstance()]).buildForInstance()])
                .withPublicationMedia([PublicationMediumType.YOUREUROPE])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                formUri: "http://data.lblod.info/id/forms/cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no english procedure website title when no yourEurope, is valid', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withProcedures([aFullProcedureForInstance().withWebsites([aFullWebsiteForInstance().withTitle(LanguageString.of(undefined, undefined, 'titel')).buildForInstance()]).buildForInstance()])
                .withPublicationMedia([])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([]);
        });

        test('no procedure website url, error in content form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withProcedures([aFullProcedureForInstance().withWebsites([aFullWebsiteForInstance().withUrl(undefined).buildForInstance()]).buildForInstance()])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                formUri: "http://data.lblod.info/id/forms/cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('invalid procedure website url, error in content form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withProcedures([aFullProcedureForInstance().withWebsites([aFullWebsiteForInstance().withUrl('www.example.com').buildForInstance()]).buildForInstance()])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                formUri: "http://data.lblod.info/id/forms/cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no cost title, error in content form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withCosts([aFullCostForInstance().withTitle(undefined).buildForInstance()])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                formUri: "http://data.lblod.info/id/forms/cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no english cost title when yourEurope, error in content form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withCosts([aFullCostForInstance().withTitle(LanguageString.of(undefined, undefined, 'titel')).buildForInstance()])
                .withPublicationMedia([PublicationMediumType.YOUREUROPE])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                formUri: "http://data.lblod.info/id/forms/cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no english cost title when no yourEurope, is valid', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withCosts([aFullCostForInstance().withTitle(LanguageString.of(undefined, undefined, 'titel')).buildForInstance()])
                .withPublicationMedia([])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([]);
        });

        test('no cost description, error in content form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withCosts([aFullCostForInstance().withDescription(undefined).buildForInstance()])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                formUri: "http://data.lblod.info/id/forms/cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no english cost description when yourEurope, error in content form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withCosts([aFullCostForInstance().withDescription(LanguageString.of(undefined, undefined, 'beschrijving')).buildForInstance()])
                .withPublicationMedia([PublicationMediumType.YOUREUROPE])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                formUri: "http://data.lblod.info/id/forms/cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no english cost description when no yourEurope, is valid', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withCosts([aFullCostForInstance().withDescription(LanguageString.of(undefined, undefined, 'beschrijving')).buildForInstance()])
                .withPublicationMedia([])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([]);
        });

        test('no financialAdvantage title, error in content form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withFinancialAdvantages([aFullFinancialAdvantageForInstance().withTitle(undefined).buildForInstance()])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                formUri: "http://data.lblod.info/id/forms/cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no english financialAdvantage title when yourEurope, error in content form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withFinancialAdvantages([aFullFinancialAdvantageForInstance().withTitle(LanguageString.of(undefined, undefined, 'titel')).buildForInstance()])
                .withPublicationMedia([PublicationMediumType.YOUREUROPE])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                formUri: "http://data.lblod.info/id/forms/cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no english financialAdvantage title when no yourEurope, is valid', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withFinancialAdvantages([aFullFinancialAdvantageForInstance().withTitle(LanguageString.of(undefined, undefined, 'titel')).buildForInstance()])
                .withPublicationMedia([])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([]);
        });

        test('no financialAdvantage description, error in content form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withFinancialAdvantages([aFullFinancialAdvantageForInstance().withDescription(undefined).buildForInstance()])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                formUri: "http://data.lblod.info/id/forms/cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no english financialAdvantage description when yourEurope, error in content form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withFinancialAdvantages([aFullFinancialAdvantageForInstance().withDescription(LanguageString.of(undefined, undefined, 'beschrijving')).buildForInstance()])
                .withPublicationMedia([PublicationMediumType.YOUREUROPE])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                formUri: "http://data.lblod.info/id/forms/cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no english financialAdvantage description when no yourEurope, is valid', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withFinancialAdvantages([aFullFinancialAdvantageForInstance().withDescription(LanguageString.of(undefined, undefined, 'beschrijving')).buildForInstance()])
                .withPublicationMedia([])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([]);
        });

        test('no legalResource url, error in content form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withLegalResources([aFullLegalResourceForInstance().withUrl(undefined).buildForInstance()])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                formUri: "http://data.lblod.info/id/forms/cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('invalid legalResource url, error in content form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withLegalResources([aFullLegalResourceForInstance().withUrl('codex.vlaanderen.be').buildForInstance()])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                formUri: "http://data.lblod.info/id/forms/cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('invalid contactPoint email, error in content form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withContactPoints([aFullContactPointForInstance().withEmail('notValidEmail').build()])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                formUri: "http://data.lblod.info/id/forms/cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('invalid contactPoint phone number, error in content form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withContactPoints([aFullContactPointForInstance().withTelephone('123').build()])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                formUri: "http://data.lblod.info/id/forms/cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('invalid contactPoint website url, error in content form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withContactPoints([aFullContactPointForInstance().withUrl('www.example.com').build()])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                formUri: "http://data.lblod.info/id/forms/cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no website title, error in content form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withWebsites([aFullWebsiteForInstance().withTitle(undefined).buildForInstance()])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                formUri: "http://data.lblod.info/id/forms/cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no english website title when yourEurope, error in content form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withWebsites([aFullWebsiteForInstance().withTitle(LanguageString.of(undefined, undefined, 'titel')).buildForInstance()])
                .withPublicationMedia([PublicationMediumType.YOUREUROPE])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                formUri: "http://data.lblod.info/id/forms/cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no english website title when no yourEurope, is valid', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withWebsites([aFullWebsiteForInstance().withTitle(LanguageString.of(undefined, undefined, 'titel')).buildForInstance()])
                .withPublicationMedia([])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([]);
        });

        test('no website url, error in content form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withWebsites([aFullWebsiteForInstance().withUrl(undefined).buildForInstance()])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                formUri: "http://data.lblod.info/id/forms/cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('invalid website url, error in content form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withWebsites([aFullWebsiteForInstance().withUrl('www.example.com').buildForInstance()])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                formUri: "http://data.lblod.info/id/forms/cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
            }]);
        });

        test('no competentAuthority, error in characteristics form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withCompetentAuthorities([])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "149a7247-0294-44a5-a281-0a4d3782b4fd",
                formUri: "http://data.lblod.info/id/forms/149a7247-0294-44a5-a281-0a4d3782b4fd",
                message: `Er zijn fouten opgetreden in de tab "eigenschappen". Gelieve deze te verbeteren!`
            }]);
        });

        test('no spatial, error in characteristics form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withSpatials([])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "149a7247-0294-44a5-a281-0a4d3782b4fd",
                formUri: "http://data.lblod.info/id/forms/149a7247-0294-44a5-a281-0a4d3782b4fd",
                message: `Er zijn fouten opgetreden in de tab "eigenschappen". Gelieve deze te verbeteren!`
            }]);
        });

        test('no yourEuropeCategory when YourEurope publicationChannel, error in characteristics form', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withPublicationMedia([PublicationMediumType.YOUREUROPE])
                .withYourEuropeCategories([])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errors = await formApplicationService.validateForms(instance.id, bestuurseenheid);
            expect(errors).toEqual([{
                formId: "149a7247-0294-44a5-a281-0a4d3782b4fd",
                formUri: "http://data.lblod.info/id/forms/149a7247-0294-44a5-a281-0a4d3782b4fd",
                message: `Er zijn fouten opgetreden in de tab "eigenschappen". Gelieve deze te verbeteren!`
            }]);
        });

    });
});