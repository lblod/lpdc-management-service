import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {NewInstanceDomainService} from "../../../src/core/domain/new-instance-domain-service";
import {
    ConceptDisplayConfigurationSparqlTestRepository
} from "../../driven/persistence/concept-display-configuration-sparql-test-repository";
import {BestuurseenheidSparqlTestRepository} from "../../driven/persistence/bestuurseenheid-sparql-test-repository";
import {aBestuurseenheid} from "../domain/bestuurseenheid-test-builder";
import {UpdateInstanceApplicationService} from "../../../src/core/application/update-instance-application-service";
import {InstanceBuilder} from "../../../src/core/domain/instance";
import {LanguageString} from "../../../src/core/domain/language-string";
import {restoreRealTime, setFixedTime} from "../../fixed-time";
import {FormatPreservingDate} from "../../../src/core/domain/format-preserving-date";
import {ProcedureBuilder} from "../../../src/core/domain/procedure";
import {Iri} from "../../../src/core/domain/shared/iri";
import {SemanticFormsMapperImpl} from "../../../src/driven/persistence/semantic-forms-mapper-impl";
import {
    FormalInformalChoiceSparqlRepository
} from "../../../src/driven/persistence/formal-informal-choice-sparql-repository";
import {ConcurrentUpdateError} from "../../../src/core/domain/shared/lpdc-error";
import {SelectConceptLanguageDomainService} from "../../../src/core/domain/select-concept-language-domain-service";
import {InstanceSparqlRepository} from "../../../src/driven/persistence/instance-sparql-repository";

describe('Update Instance Application Service tests', () => {

    beforeAll(() => setFixedTime());

    afterAll(() => restoreRealTime());

    //Note: the update instance application service is directly tied to semantic forms ... so the tests use low level turtle format ...

    const instanceRepository = new InstanceSparqlRepository(TEST_SPARQL_ENDPOINT);
    const formalInformalChoiceRepository = new FormalInformalChoiceSparqlRepository(TEST_SPARQL_ENDPOINT);
    const conceptDisplayConfigurationRepository = new ConceptDisplayConfigurationSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const selectConceptLanguageDomainService = new SelectConceptLanguageDomainService();
    const newInstanceDomainService = new NewInstanceDomainService(instanceRepository, formalInformalChoiceRepository, selectConceptLanguageDomainService, conceptDisplayConfigurationRepository);
    const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const semanticFormsMapper = new SemanticFormsMapperImpl();

    const updateInstanceApplicationService = new UpdateInstanceApplicationService(instanceRepository, semanticFormsMapper);

    test('Can update an instance by setting an initial title, and updating that title in a second update using a turtle input', async () => {
        const bestuurseenheid =
            aBestuurseenheid()
                .build();
        await bestuurseenheidRepository.save(bestuurseenheid);

        const instance = await newInstanceDomainService.createNewEmpty(bestuurseenheid);

        await updateInstanceApplicationService.update(
            bestuurseenheid,
            instance.id,
            instance.dateModified,
            '@prefix : <#>.\n\n',
            `
            @prefix : <#>.\n@prefix dct: <http://purl.org/dc/terms/>.\n
            @prefix pub: <http://data.lblod.info/id/public-service/>.\n\n
            pub:${instance.uuid} dct:title "initial title"@nl-be-x-formal.\n\n`);


        let updatedInstance = await instanceRepository.findById(bestuurseenheid, instance.id);

        expect(updatedInstance).toEqual(
            InstanceBuilder.from(instance)
                .withTitle(LanguageString.of(undefined, 'initial title'))
                .withDateModified(FormatPreservingDate.now())
                .build());

        await updateInstanceApplicationService.update(
            bestuurseenheid,
            instance.id,
            instance.dateModified,
            `        @prefix : <#>\n.
@prefix dct: <http://purl.org/dc/terms/>\n.
@prefix pub: <http://data.lblod.info/id/public-service/>\n\n.

pub:${instance.uuid} dct:title "initial title"@nl-be-x-formal.\n\n`,
            `
            @prefix : <#>.\n@prefix dct: <http://purl.org/dc/terms/>.\n
            @prefix pub: <http://data.lblod.info/id/public-service/>.\n\n
            pub:${instance.uuid} dct:title "updated title"@nl-be-x-formal.\n\n`);

        updatedInstance = await instanceRepository.findById(bestuurseenheid, instance.id);

        expect(updatedInstance).toEqual(
            InstanceBuilder.from(instance)
                .withTitle(LanguageString.of(undefined, 'updated title'))
                .withDateModified(FormatPreservingDate.now())
                .build());

    });

    test('Can update an instance by adding a procedure, and removing that procedure in a second update using a turtle input', async () => {

        const bestuurseenheid =
            aBestuurseenheid()
                .build();
        await bestuurseenheidRepository.save(bestuurseenheid);

        const instance = await newInstanceDomainService.createNewEmpty(bestuurseenheid);

        await updateInstanceApplicationService.update(
            bestuurseenheid,
            instance.id,
            instance.dateModified,
            '@prefix : <#>.\n\n',
            `
            @prefix : <#>.\n
@prefix dct: <http://purl.org/dc/terms/>.\n
@prefix sh: <http://www.w3.org/ns/shacl#>.\n
@prefix mu: <http://mu.semte.ch/vocabularies/core/>.\n
@prefix cpsv: <http://purl.org/vocab/cpsv#>.\n
@prefix nodes: <http://data.lblod.info/form-data/nodes/>.\n
@prefix pub: <http://data.lblod.info/id/public-service/>.\n\n

nodes:02c296ca-d194-4971-9325-e17809afe087\n
    a cpsv:Rule;\n
    mu:uuid "dc4bd8fb-87a9-4257-9ab9-86f93a2f7ed8";\n
    dct:description\n
            """<p data-indentation-level="0">beschrijving procedure</p>"""@nl-be-x-formal;\n
    dct:title "titel procedure"@nl-be-x-formal;\n
    sh:order 1 .\n
pub:${instance.uuid}\n
    cpsv:follows nodes:02c296ca-d194-4971-9325-e17809afe087 .\n\n`);

        let updatedInstance = await instanceRepository.findById(bestuurseenheid, instance.id);

        expect(updatedInstance).toEqual(
            InstanceBuilder.from(instance)
                .withProcedures([
                    new ProcedureBuilder()
                        .withId(new Iri('http://data.lblod.info/form-data/nodes/02c296ca-d194-4971-9325-e17809afe087'))
                        .withUuid('dc4bd8fb-87a9-4257-9ab9-86f93a2f7ed8')
                        .withTitle(LanguageString.of(undefined, 'titel procedure'))
                        .withDescription(LanguageString.of(undefined, `<p data-indentation-level="0">beschrijving procedure</p>`))
                        .withWebsites([])
                        .withOrder(1)
                        .build()
                ])
                .withDateModified(FormatPreservingDate.now())
                .build());

        //semantic forms does not seem to delete all triples  when deleting a linked 'entity'; so this creates orphan triples in the database

        await updateInstanceApplicationService.update(
            bestuurseenheid,
            instance.id,
            instance.dateModified,
            `
            @prefix : <#>.\n
@prefix dct: <http://purl.org/dc/terms/>.\n
@prefix cpsv: <http://purl.org/vocab/cpsv#>.\n
@prefix nodes: <http://data.lblod.info/form-data/nodes/>.\n
@prefix pub: <http://data.lblod.info/id/public-service/>.\n\n

nodes:02c296ca-d194-4971-9325-e17809afe087\n
    dct:description\n
            """<p data-indentation-level="0">beschrijving procedure</p>"""@nl-be-x-formal,\n
            nodes:232c92c4-094a-4775-892d-0eb1c84d9b01;\n
    dct:title\n
            "titel procedure"@nl-be-x-formal,\n
            nodes:f17a330b-2d2b-491b-a6ce-0afd95c42bfb.\n
pub:${instance.uuid}\n
    cpsv:follows nodes:02c296ca-d194-4971-9325-e17809afe087 .\n\n`,
            '@prefix : <#>.\n\n');

        updatedInstance = await instanceRepository.findById(bestuurseenheid, instance.id);

        expect(updatedInstance).toEqual(
            InstanceBuilder.from(instance)
                .withDateModified(FormatPreservingDate.now())
                .build());


    });

    test('Can update an instance with boolean value', async () => {
        const bestuurseenheid = aBestuurseenheid().build();
        await bestuurseenheidRepository.save(bestuurseenheid);

        const instance = await newInstanceDomainService.createNewEmpty(bestuurseenheid);

        await updateInstanceApplicationService.update(
            bestuurseenheid,
            instance.id,
            instance.dateModified,
            `@prefix : <#>.
             @prefix lpdcExt: <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#>.
             @prefix pub: <http://data.lblod.info/id/public-service/>.
             pub:${instance.uuid} lpdcExt:forMunicipalityMerger false.`,
            `@prefix : <#>.
             @prefix lpdcExt: <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#>.
             @prefix pub: <http://data.lblod.info/id/public-service/>.
             pub:${instance.uuid} lpdcExt:forMunicipalityMerger true.`,
        );

        const updatedInstance = await instanceRepository.findById(bestuurseenheid, instance.id);

        expect(updatedInstance.forMunicipalityMerger).toBeTrue();
    });

    test('should throw ConcurrentUpdateError, when not updating the latest instance version', async () => {
        const bestuurseenheid =
            aBestuurseenheid()
                .build();
        await bestuurseenheidRepository.save(bestuurseenheid);

        const emptyInstance = await newInstanceDomainService.createNewEmpty(bestuurseenheid);
        const instanceAfterCreate = await instanceRepository.findById(bestuurseenheid, emptyInstance.id);


        await updateInstanceApplicationService.update(
            bestuurseenheid,
            instanceAfterCreate.id,
            instanceAfterCreate.dateModified,
            '@prefix : <#>.\n\n',
            `
            @prefix : <#>.\n@prefix dct: <http://purl.org/dc/terms/>.\n
            @prefix pub: <http://data.lblod.info/id/public-service/>.\n\n
            pub:${instanceAfterCreate.uuid} dct:title "initial title"@nl-be-x-formal.\n\n`);


        await expect(() => updateInstanceApplicationService.update(
            bestuurseenheid,
            instanceAfterCreate.id,
            FormatPreservingDate.of('2024-01-15T00:00:00.672Z'),
            `        @prefix : <#>\n.
@prefix dct: <http://purl.org/dc/terms/>\n.
@prefix pub: <http://data.lblod.info/id/public-service/>\n\n.

pub:${instanceAfterCreate.uuid} dct:title "initial title"@nl-be-x-formal.\n\n`,
            `
            @prefix : <#>.\n@prefix dct: <http://purl.org/dc/terms/>.\n
            @prefix pub: <http://data.lblod.info/id/public-service/>.\n\n
            pub:${instanceAfterCreate.uuid} dct:title "updated title"@nl-be-x-formal.\n\n`)
        ).rejects.toThrowWithMessage(ConcurrentUpdateError, 'De productfiche is gelijktijdig aangepast door een andere gebruiker. Herlaad de pagina en geef je aanpassingen opnieuw in');
    });
});
