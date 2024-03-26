import {InstanceSparqlRepository} from "../../../src/driven/persistence/instance-sparql-repository";
import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {NewInstanceDomainService} from "../../../src/core/domain/new-instance-domain-service";
import {
    FormalInformalChoiceSparqlTestRepository
} from "../../driven/persistence/formal-informal-choice-sparql-test-repository";
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

describe('Update Instance Application Service tests', () => {

    beforeAll(() => setFixedTime());

    afterAll(() => restoreRealTime());

    //Note: the update instance application service is directly tied to semantic forms ... so the tests use low level turtle format ...

    const prefixes = `@prefix : <#>.
@prefix dct: <http://purl.org/dc/terms/>.
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.
@prefix mu: <http://mu.semte.ch/vocabularies/core/>.
@prefix cpsv: <http://purl.org/vocab/cpsv#>.
@prefix lpdcExt: <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#>.
@prefix m8g: <http://data.europa.eu/m8g/>.
@prefix pub: <http://data.lblod.info/id/public-service/>.
@prefix bes: <http://data.lblod.info/id/bestuurseenheden/>.
@prefix ref: <http://vocab.belgif.be/auth/refnis2019/>.
@prefix schema: <http://schema.org/>.
@prefix p: <http://purl.org/pav/>.
@prefix n0: <http://www.w3.org/ns/adms#>.
@prefix inst: <http://lblod.data.gift/concepts/instance-status/>.
@prefix nodes: <http://data.lblod.info/form-data/nodes/>.
@prefix sh: <http://www.w3.org/ns/shacl#>.`;

    const instanceRepository = new InstanceSparqlRepository(TEST_SPARQL_ENDPOINT);
    const formalInformalChoiceRepository = new FormalInformalChoiceSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const conceptDisplayConfigurationRepository = new ConceptDisplayConfigurationSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const newInstanceDomainService = new NewInstanceDomainService(instanceRepository, formalInformalChoiceRepository, conceptDisplayConfigurationRepository);
    const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const semanticFormsMapper = new SemanticFormsMapperImpl();

    const updateInstanceApplicationService = new UpdateInstanceApplicationService(instanceRepository, semanticFormsMapper);

    test('Can update an instance by setting an initial title, and updating that title in a second update using a turtle input', async () => {
        const bestuurseenheid =
            aBestuurseenheid()
                .build();
        await bestuurseenheidRepository.save(bestuurseenheid);

        const instance = await newInstanceDomainService.createNewEmpty(bestuurseenheid);

        let instanceAsTurtleFormat = `
        ${prefixes}
        
pub:${instance.uuid}
    a lpdcExt:InstancePublicService;
    m8g:hasCompetentAuthority
      bes:${bestuurseenheid.uuid};
    mu:uuid "${instance.uuid}";
    schema:dateCreated "2024-02-05T09:59:53.541Z"^^xsd:dateTime;
    schema:dateModified "${instance.dateModified.value}"^^xsd:dateTime;
    dct:spatial ref:24038;
    p:createdBy
            bes:${bestuurseenheid.uuid};
    n0:status inst:ontwerp;
    lpdcExt:hasExecutingAuthority
            bes:${bestuurseenheid.uuid} .
        `;

        await updateInstanceApplicationService.update(
            bestuurseenheid,
            instance.id,
            instanceAsTurtleFormat,
            '@prefix : <#>.\n\n',
            `
            @prefix : <#>.\n@prefix dct: <http://purl.org/dc/terms/>.\n
            @prefix pub: <http://data.lblod.info/id/public-service/>.\n\n
            pub:${instance.uuid} dct:title "initial title"@nl-be-x-formal, "initial title en"@en.\n\n`);


        let updatedInstance = await instanceRepository.findById(bestuurseenheid, instance.id);

        expect(updatedInstance).toEqual(
            InstanceBuilder.from(instance)
                .withTitle(LanguageString.of('initial title en', undefined, 'initial title'))
                .withDateModified(FormatPreservingDate.now())
                .build());

        instanceAsTurtleFormat = `
        ${prefixes}
        
pub:${instance.uuid}
    a lpdcExt:InstancePublicService;
    m8g:hasCompetentAuthority
      bes:${bestuurseenheid.uuid};
    mu:uuid "${instance.uuid}";
    schema:dateCreated "2024-02-05T09:59:53.541Z"^^xsd:dateTime;
    schema:dateModified "${instance.dateModified.value}"^^xsd:dateTime;
    dct:spatial ref:24038;
    dct:title "initial title"@nl-be-x-formal, "initial title en"@en;
    p:createdBy
            bes:${bestuurseenheid.uuid};
    n0:status inst:ontwerp;
    
    lpdcExt:hasExecutingAuthority
            bes:${bestuurseenheid.uuid} .
        `;

        await updateInstanceApplicationService.update(
            bestuurseenheid,
            instance.id,
            instanceAsTurtleFormat,
            `        @prefix : <#>\n.
@prefix dct: <http://purl.org/dc/terms/>\n.
@prefix pub: <http://data.lblod.info/id/public-service/>\n\n.

pub:${instance.uuid} dct:title "initial title"@nl-be-x-formal, "initial title en"@en.\n\n`,
            `
            @prefix : <#>.\n@prefix dct: <http://purl.org/dc/terms/>.\n
            @prefix pub: <http://data.lblod.info/id/public-service/>.\n\n
            pub:${instance.uuid} dct:title "updated title"@nl-be-x-formal, "updated title en"@en.\n\n`);

        updatedInstance = await instanceRepository.findById(bestuurseenheid, instance.id);

        expect(updatedInstance).toEqual(
            InstanceBuilder.from(instance)
                .withTitle(LanguageString.of('updated title en', undefined, 'updated title'))
                .withDateModified(FormatPreservingDate.now())
                .build());

    });

    test('Can update an instance by adding a procedure, and removing that procedure in a second update using a turtle input', async () => {

        const bestuurseenheid =
            aBestuurseenheid()
                .build();
        await bestuurseenheidRepository.save(bestuurseenheid);

        const instance = await newInstanceDomainService.createNewEmpty(bestuurseenheid);

        let instanceAsTurtleFormat = `
        ${prefixes}
        
pub:${instance.uuid}
    a lpdcExt:InstancePublicService;
    m8g:hasCompetentAuthority
      bes:${bestuurseenheid.uuid};
    mu:uuid "${instance.uuid}";
    schema:dateCreated "2024-02-05T09:59:53.541Z"^^xsd:dateTime;
    schema:dateModified "${instance.dateModified.value}"^^xsd:dateTime;
    dct:spatial ref:24038;
    p:createdBy
            bes:${bestuurseenheid.uuid};
    n0:status inst:ontwerp;
    lpdcExt:hasExecutingAuthority
            bes:${bestuurseenheid.uuid} .
        `;


        await updateInstanceApplicationService.update(
            bestuurseenheid,
            instance.id,
            instanceAsTurtleFormat,
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
            """<p data-indentation-level="0">beschrijving procedure</p>"""@nl-be-x-formal,\n
            """<p data-indentation-level="0">engelse beschrijving procedure</p>"""@en;\n
    dct:title "engelse titel procedure"@en, "titel procedure"@nl-be-x-formal;\n
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
                        .withTitle(LanguageString.of('engelse titel procedure', undefined, 'titel procedure'))
                        .withDescription(LanguageString.of(`<p data-indentation-level="0">engelse beschrijving procedure</p>`, undefined, `<p data-indentation-level="0">beschrijving procedure</p>`))
                        .withWebsites([])
                        .withConceptProcedureId(undefined)
                        .withOrder(1)
                        .build()
                ])
                .withDateModified(FormatPreservingDate.now())
                .build());

        //semantic forms does not seem to delete all triples  when deleting a linked 'entity'; so this creates orphan triples in the database

        instanceAsTurtleFormat = `
        ${prefixes}

nodes:02c296ca-d194-4971-9325-e17809afe087\n
    a cpsv:Rule;\n
    mu:uuid "dc4bd8fb-87a9-4257-9ab9-86f93a2f7ed8";\n
    dct:description\n
            """<p data-indentation-level="0">beschrijving procedure</p>"""@nl-be-x-formal,\n
            """<p data-indentation-level="0">engelse beschrijving procedure</p>"""@en;\n
    dct:title "engelse titel procedure"@en, "titel procedure"@nl-be-x-formal;\n
    sh:order 1 .\n\n
    
pub:${instance.uuid}
    a lpdcExt:InstancePublicService;
    m8g:hasCompetentAuthority
      bes:${bestuurseenheid.uuid};
    mu:uuid "${instance.uuid}";
    schema:dateCreated "2024-02-05T09:59:53.541Z"^^xsd:dateTime;
    schema:dateModified "${instance.dateModified.value}"^^xsd:dateTime;
    dct:spatial ref:24038;
    p:createdBy
            bes:${bestuurseenheid.uuid};
    n0:status inst:ontwerp;
    lpdcExt:hasExecutingAuthority
            bes:${bestuurseenheid.uuid};
    cpsv:follows nodes:02c296ca-d194-4971-9325-e17809afe087 .\n\n            
        `;

        await updateInstanceApplicationService.update(
            bestuurseenheid,
            instance.id,
            instanceAsTurtleFormat,
            `
            @prefix : <#>.\n
@prefix dct: <http://purl.org/dc/terms/>.\n
@prefix cpsv: <http://purl.org/vocab/cpsv#>.\n
@prefix nodes: <http://data.lblod.info/form-data/nodes/>.\n
@prefix pub: <http://data.lblod.info/id/public-service/>.\n\n

nodes:02c296ca-d194-4971-9325-e17809afe087\n
    dct:description\n
            """<p data-indentation-level="0">beschrijving procedure</p>"""@nl-be-x-formal,\n
            """<p data-indentation-level="0">engelse beschrijving procedure</p>"""@en,\n
            nodes:232c92c4-094a-4775-892d-0eb1c84d9b01;\n
    dct:title\n
            "engelse titel procedure"@en, "titel procedure"@nl-be-x-formal,\n
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
});