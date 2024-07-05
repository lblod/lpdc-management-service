import {FormApplicationService} from "../../../src/core/application/form-application-service";
import {
    ValidateInstanceForPublishApplicationService
} from "../../../src/core/application/validate-instance-for-publish-application-service";
import {ConceptSparqlRepository} from "../../../src/driven/persistence/concept-sparql-repository";
import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {SelectConceptLanguageDomainService} from "../../../src/core/domain/select-concept-language-domain-service";
import {SemanticFormsMapperImpl} from "../../../src/driven/persistence/semantic-forms-mapper-impl";
import {aBestuurseenheid} from "../domain/bestuurseenheid-test-builder";
import {aFullInstance} from "../domain/instance-test-builder";
import {FormDefinitionFileRepository} from "../../../src/driven/persistence/form-definition-file-repository";
import {CodeSparqlRepository} from "../../../src/driven/persistence/code-sparql-repository";
import {aFullContactPointForInstance} from "../domain/contact-point-test-builder";
import {aFullAddressForInstance} from "../domain/address-test-builder";
import {LanguageString} from "../../../src/core/domain/language-string";
import {
    FormalInformalChoiceSparqlRepository
} from "../../../src/driven/persistence/formal-informal-choice-sparql-repository";
import {ConceptSnapshotSparqlRepository} from "../../../src/driven/persistence/concept-snapshot-sparql-repository";
import {InstanceSparqlRepository} from "../../../src/driven/persistence/instance-sparql-repository";


describe('ValidateInstanceForPublishApplicationService', () => {

    describe('validate', () => {

        const conceptRepository = new ConceptSparqlRepository(TEST_SPARQL_ENDPOINT);
        const conceptSnapshotRepository = new ConceptSnapshotSparqlRepository(TEST_SPARQL_ENDPOINT);
        const instanceRepository = new InstanceSparqlRepository(TEST_SPARQL_ENDPOINT);
        const formDefinitionRepository = new FormDefinitionFileRepository();
        const codeRepository = new CodeSparqlRepository(TEST_SPARQL_ENDPOINT);
        const formalInformalChoiceRepository = new FormalInformalChoiceSparqlRepository(TEST_SPARQL_ENDPOINT);
        const selectConceptLanguageDomainService = new SelectConceptLanguageDomainService();
        const semanticFormsMapper = new SemanticFormsMapperImpl();
        const formApplicationService = new FormApplicationService(conceptRepository, conceptSnapshotRepository, instanceRepository, formDefinitionRepository, codeRepository, formalInformalChoiceRepository, selectConceptLanguageDomainService, semanticFormsMapper);

        const validateInstanceForPublishApplicationService = new ValidateInstanceForPublishApplicationService(formApplicationService, instanceRepository);

        test('when valid instance for publish, returns empty array', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance().build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errorList = await validateInstanceForPublishApplicationService.validate(instance.id, bestuurseenheid);
            expect(errorList).toEqual([]);
        });

        test('when one of forms invalid, returns list with error', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance().withTitle(undefined).build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errorList = await validateInstanceForPublishApplicationService.validate(instance.id, bestuurseenheid);
            expect(errorList).toEqual([{
                "formId": "inhoud",
                "message": "Er zijn fouten opgetreden in de tab \"inhoud\". Gelieve deze te verbeteren!",
            }]);
        });

        test('when both forms invalid, returns list with both error', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withTitle(undefined)
                .withSpatials([])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errorList = await validateInstanceForPublishApplicationService.validate(instance.id, bestuurseenheid);
            expect(errorList).toEqual([{
                "formId": "inhoud",
                "message": "Er zijn fouten opgetreden in de tab \"inhoud\". Gelieve deze te verbeteren!",
            }, {
                "formId": "eigenschappen",
                "message": "Er zijn fouten opgetreden in de tab \"eigenschappen\". Gelieve deze te verbeteren!",
            }]);
        });

        test('when one of forms is invalid and adres is invalid, only form error is returned in errorlist', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withTitle(undefined)
                .withContactPoints([aFullContactPointForInstance().withAddress(aFullAddressForInstance().withVerwijstNaar(undefined).build()).build()])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errorList = await validateInstanceForPublishApplicationService.validate(instance.id, bestuurseenheid);
            expect(errorList).toEqual([{
                "formId": "inhoud",
                "message": "Er zijn fouten opgetreden in de tab \"inhoud\". Gelieve deze te verbeteren!",
            }]);
        });

        test('when form is valid and and adres is invalid, adres error is returned in errorlist', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withContactPoints([aFullContactPointForInstance().withAddress(aFullAddressForInstance().withVerwijstNaar(undefined).build()).build()])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errorList = await validateInstanceForPublishApplicationService.validate(instance.id, bestuurseenheid);
            expect(errorList).toEqual([{
                "message": "Minstens één van de adresgegevens is niet geldig",
            }]);
        });

        test('when form is valid and languages for description is blank wile titel is not, language error is returned in errorlist', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withTitle(LanguageString.of(undefined, 'titel'))
                .withDescription(LanguageString.of(undefined, ' '))
                .withPublicationMedia([])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errorList = await validateInstanceForPublishApplicationService.validate(instance.id, bestuurseenheid);
            expect(errorList).toEqual([{
                "message": "Binnen eenzelfde taal moeten titel en beschrijving beide ingevuld (of leeg) zijn",
            }]);
        });

        test('when form is valid and languages for description nl is blank, language error is returned in errorlist', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withTitle(LanguageString.of(undefined, 'titel'))
                .withDescription(LanguageString.of(undefined, ''))
                .withPublicationMedia([])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errorList = await validateInstanceForPublishApplicationService.validate(instance.id, bestuurseenheid);
            expect(errorList).toEqual([{
                "formId": "inhoud",
                "message": "Er zijn fouten opgetreden in de tab \"inhoud\". Gelieve deze te verbeteren!"
            }]);
        });

        test('when form is valid and languages for title nl is blank, language error is returned in errorlist', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withTitle(LanguageString.of(undefined, ''))
                .withDescription(LanguageString.of(undefined, 'description'))
                .withPublicationMedia([])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errorList = await validateInstanceForPublishApplicationService.validate(instance.id, bestuurseenheid);
            expect(errorList).toEqual([{
                "formId": "inhoud",
                "message": "Er zijn fouten opgetreden in de tab \"inhoud\". Gelieve deze te verbeteren!"
            }]);
        });

        test('when form is valid and languages for description is blank and title is not, language error is returned in errorlist', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withTitle(LanguageString.of(undefined, 'title'))
                .withDescription(LanguageString.of(undefined, ' '))
                .withPublicationMedia([])
                .build();
            await instanceRepository.save(bestuurseenheid, instance);

            const errorList = await validateInstanceForPublishApplicationService.validate(instance.id, bestuurseenheid);
            expect(errorList).toEqual([{
                "message": "Binnen eenzelfde taal moeten titel en beschrijving beide ingevuld (of leeg) zijn",
            }]);
        });

    });
});
