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
import {InstanceSparqlTestRepository} from "../../driven/persistence/instance-sparql-test-repository";
import {aFullInstance, aMinimalInstance} from "../domain/instance-test-builder";

describe('Form application service tests', () => {

    describe('loadConceptForm', () => {

        const conceptRepository = new ConceptSparqlRepository(TEST_SPARQL_ENDPOINT);
        const instanceRepository = new InstanceSparqlTestRepository(TEST_SPARQL_ENDPOINT);
        const formDefinitionRepository = mock<FormDefinitionRepository>();
        const codeRepository = mock<CodeRepository>();
        const formalInformalChoiceRepository = new FormalInformalChoiceSparqlTestRepository(TEST_SPARQL_ENDPOINT);
        const selectFormLanguageDomainService = new SelectFormLanguageDomainService(formalInformalChoiceRepository);
        const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(TEST_SPARQL_ENDPOINT);

        const formApplicationService = new FormApplicationService(conceptRepository, instanceRepository, formDefinitionRepository, codeRepository, selectFormLanguageDomainService);

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
            expect(source).toEqual(conceptRepository.asTurtleFormat(concept).join("\r\n"));
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
            expect(source).toEqual(conceptRepository.asTurtleFormat(concept).join("\r\n"));
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
            expect(source).toEqual(conceptRepository.asTurtleFormat(concept).join("\r\n"));
            expect(source).toContain(`<${concept.id}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService> .`);
            expect(serviceUri).toEqual(concept.id.value);

        });

    });

    describe('loadInstanceForm', () => {

        const conceptRepository = new ConceptSparqlRepository(TEST_SPARQL_ENDPOINT);
        const instanceRepository = new InstanceSparqlTestRepository(TEST_SPARQL_ENDPOINT);
        const formDefinitionRepository = mock<FormDefinitionRepository>();
        const codeRepository = mock<CodeRepository>();
        const formalInformalChoiceRepository = new FormalInformalChoiceSparqlTestRepository(TEST_SPARQL_ENDPOINT);
        const selectFormLanguageDomainService = new SelectFormLanguageDomainService(formalInformalChoiceRepository);
        const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(TEST_SPARQL_ENDPOINT);

        const formApplicationService = new FormApplicationService(conceptRepository, instanceRepository, formDefinitionRepository, codeRepository, selectFormLanguageDomainService);

        test('can load a content form for an instance in correct language', async () => {
            const bestuurseenheid =
                aBestuurseenheid()
                    .build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const instance =
                aFullInstance()
                    .withTitle(
                        LanguageString.of(undefined, undefined, undefined, 'nl informal')
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

            formDefinitionRepository.loadFormDefinition.calledWith(FormType.CONTENT, Language.INFORMAL, false).mockReturnValue('formdefinition');

            const {
                form,
                meta,
                source,
                serviceUri
            } = await formApplicationService.loadInstanceForm(bestuurseenheid, instance.id, FormType.CONTENT);

            expect(form).toEqual('formdefinition');
            expect(meta).toEqual('');
            expect(source).toEqual(instanceRepository.asTurtleFormat(bestuurseenheid, instance).join("\r\n"));
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
            expect(source).toEqual(instanceRepository.asTurtleFormat(bestuurseenheid, instance).join("\r\n"));
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
            expect(source).toEqual(instanceRepository.asTurtleFormat(bestuurseenheid, instance).join("\r\n"));
            expect(source).toContain(`<${instance.id}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/vocab/cpsv#PublicService> .`);
            expect(serviceUri).toEqual(instance.id.value);

        });

    });

});