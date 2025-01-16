import { END2END_TEST_SPARQL_ENDPOINT } from "../test.config";
import { DirectDatabaseAccess } from "../driven/persistence/direct-database-access";
import { PREFIX, PUBLIC_GRAPH } from "../../config";
import { sparqlEscapeUri } from "../../mu-helper";
import { BestuurseenheidSparqlTestRepository } from "../driven/persistence/bestuurseenheid-sparql-test-repository";
import { Iri } from "../../src/core/domain/shared/iri";
import { Bestuurseenheid } from "../../src/core/domain/bestuurseenheid";
import fs from "fs";
import { sortedUniq } from "lodash";
import { ValidateInstanceForPublishApplicationService } from "../../src/core/application/validate-instance-for-publish-application-service";
import { FormApplicationService } from "../../src/core/application/form-application-service";
import { ConceptSparqlRepository } from "../../src/driven/persistence/concept-sparql-repository";
import { FormalInformalChoiceSparqlRepository } from "../../src/driven/persistence/formal-informal-choice-sparql-repository";
import { SelectConceptLanguageDomainService } from "../../src/core/domain/select-concept-language-domain-service";
import { SemanticFormsMapperImpl } from "../../src/driven/persistence/semantic-forms-mapper-impl";
import { FormDefinitionFileRepository } from "../../src/driven/persistence/form-definition-file-repository";
import { CodeSparqlRepository } from "../../src/driven/persistence/code-sparql-repository";
import { ConceptSnapshotSparqlRepository } from "../../src/driven/persistence/concept-snapshot-sparql-repository";
import { InstanceSparqlRepository } from "../../src/driven/persistence/instance-sparql-repository";

const endPoint = END2END_TEST_SPARQL_ENDPOINT;
const directDatabaseAccess = new DirectDatabaseAccess(endPoint);
const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(
  endPoint,
);
const conceptRepository = new ConceptSparqlRepository(endPoint);
const conceptSnapshotRepository = new ConceptSnapshotSparqlRepository(endPoint);
const instanceRepository = new InstanceSparqlRepository(endPoint);
const formDefinitionRepository = new FormDefinitionFileRepository();
const codeRepository = new CodeSparqlRepository(endPoint);
const formalInformalChoiceRepository = new FormalInformalChoiceSparqlRepository(
  endPoint,
);
const selectFormLanguageDomainService =
  new SelectConceptLanguageDomainService();
const semanticFormsMapper = new SemanticFormsMapperImpl();
const formApplicationService = new FormApplicationService(
  conceptRepository,
  conceptSnapshotRepository,
  instanceRepository,
  formDefinitionRepository,
  codeRepository,
  formalInformalChoiceRepository,
  selectFormLanguageDomainService,
  semanticFormsMapper,
);
const validateInstanceForPublishApplicationService =
  new ValidateInstanceForPublishApplicationService(
    formApplicationService,
    instanceRepository,
  );

describe("Instance publish validation", () => {
  test.skip(
    "Load all published instances; and verify validations",
    async () => {
      const bestuurseenhedenIds: string[] = await getBestuurseenhedenIds();
      let errors: string[] = [];
      let totalInstances = 0;

      console.log(
        `Total amount of bestuurseenheden: ${bestuurseenhedenIds.length} `,
      );

      if (!fs.existsSync(`/tmp/failing-published`)) {
        fs.mkdirSync(`/tmp/failing-published`);
      }

      for (const bestuurseenheidId of bestuurseenhedenIds) {
        const bestuurseenheid: Bestuurseenheid =
          await bestuurseenheidRepository.findById(new Iri(bestuurseenheidId));
        const instanceIds: string[] =
          await getPublishedInstancesForBestuurseenheid(bestuurseenheid);
        console.log(
          `Verifying bestuurseenheid ${bestuurseenheidId} with ${instanceIds.length} published instances`,
        );

        const instanceErrors = [];
        for (const instanceId of instanceIds) {
          console.log(`${new Date().toISOString()} - ${instanceId}`);
          try {
            const errorList =
              await validateInstanceForPublishApplicationService.validate(
                new Iri(instanceId),
                bestuurseenheid,
              );
            expect(errorList).toEqual([]);
          } catch (e) {
            errors = [
              ...errors,
              `Bestuurseenheid: ${bestuurseenheid.id.value} and instance ${instanceId}`,
            ];
            console.error(e);
            instanceErrors.push(`${e} for instance ${instanceId}`);
          }
        }
        if (instanceErrors.length != 0) {
          fs.writeFileSync(
            `/tmp/failing-published/${bestuurseenheid.uuid}.txt`,
            sortedUniq(instanceErrors).join("\n"),
          );
        }
        totalInstances += instanceIds.length;
        console.log(`Verified ${totalInstances} instances`);
      }
      expect(errors.length).toEqual(0);
    },
    60000 * 15 * 100,
  );
});

describe("Form validation of published instances", () => {
  beforeEach(() => {
    if (!fs.existsSync(`/tmp/failing-form`)) {
      fs.mkdirSync(`/tmp/failing-form`);
    }
  });

  test.skip(
    "basisinformatie",
    async () => {
      const errors: RapportBasisInformatieType[] =
        await formValidationBasisInformatie();

      if (errors.length != 0) {
        const fileStream = fs.createWriteStream(
          `/tmp/failing-form/basisinformatie.csv`,
        );
        fileStream.write("CreatedBy,Instance\n");

        errors.forEach((entry) => {
          fileStream.write(`${entry.bestuurseenheid},${entry.instance}\n`);
        });

        fileStream.end();
      }
      expect(errors.length).toEqual(0);
    },
    60000 * 15 * 100,
  );

  describe("Requirement validations", () => {
    test.skip(
      "Requirement",
      async () => {
        const errors: RapportErrorType[] = await formValidationRequirement();

        if (errors.length != 0) {
          const fileStream = fs.createWriteStream(
            `/tmp/failing-form/requirement.csv`,
          );
          fileStream.write("CreatedBy,Instance,Field\n");

          errors.forEach((entry) => {
            fileStream.write(
              `${entry.bestuurseenheid},${entry.instance},${entry.field}\n`,
            );
          });

          fileStream.end();
        }
        expect(errors.length).toEqual(0);
      },
      60000 * 15 * 100,
    );

    test.skip(
      "evidence",
      async () => {
        const errors: RapportErrorType[] =
          await formValidationRequirementEvidence();

        if (errors.length != 0) {
          const fileStream = fs.createWriteStream(
            `/tmp/failing-form/evidence.csv`,
          );
          fileStream.write("CreatedBy,Instance,Field\n");

          errors.forEach((entry) => {
            fileStream.write(
              `${entry.bestuurseenheid},${entry.instance},${entry.field}\n`,
            );
          });

          fileStream.end();
        }
        expect(errors.length).toEqual(0);
      },
      60000 * 15 * 100,
    );
  });

  describe("Procedure validations", () => {
    test.skip(
      "prodedure",
      async () => {
        const errors: RapportErrorType[] = await formValidationProcedure();

        if (errors.length != 0) {
          const fileStream = fs.createWriteStream(
            `/tmp/failing-form/procedure.csv`,
          );
          fileStream.write("CreatedBy,Instance,Field\n");

          errors.forEach((entry) => {
            fileStream.write(
              `${entry.bestuurseenheid},${entry.instance},${entry.field}\n`,
            );
          });

          fileStream.end();
        }
        expect(errors.length).toEqual(0);
      },
      60000 * 15 * 100,
    );

    test.skip(
      "website",
      async () => {
        const errors: RapportErrorType[] =
          await formValidationProcedureWebsite();

        if (errors.length != 0) {
          const fileStream = fs.createWriteStream(
            `/tmp/failing-form/procedureWebsite.csv`,
          );
          fileStream.write("CreatedBy,Instance,Field\n");

          errors.forEach((entry) => {
            fileStream.write(
              `${entry.bestuurseenheid},${entry.instance},${entry.field}\n`,
            );
          });

          fileStream.end();
        }
        expect(errors.length).toEqual(0);
      },
      60000 * 15 * 100,
    );
  });

  test.skip(
    "website",
    async () => {
      const errors: RapportErrorType[] = await formValidationWebsite();

      if (errors.length != 0) {
        const fileStream = fs.createWriteStream(
          `/tmp/failing-form/website.csv`,
        );
        fileStream.write("CreatedBy,Instance,Field\n");

        errors.forEach((entry) => {
          fileStream.write(
            `${entry.bestuurseenheid},${entry.instance},${entry.field}\n`,
          );
        });

        fileStream.end();
      }
      expect(errors.length).toEqual(0);
    },
    60000 * 15 * 100,
  );

  test.skip(
    "cost",
    async () => {
      const errors: RapportErrorType[] = await formValidationCost();

      if (errors.length != 0) {
        const fileStream = fs.createWriteStream(`/tmp/failing-form/cost.csv`);
        fileStream.write("CreatedBy,Instance,Field\n");

        errors.forEach((entry) => {
          fileStream.write(
            `${entry.bestuurseenheid},${entry.instance},${entry.field}\n`,
          );
        });

        fileStream.end();
      }
      expect(errors.length).toEqual(0);
    },
    60000 * 15 * 100,
  );

  test.skip(
    "financialAdvantage",
    async () => {
      const errors: RapportErrorType[] =
        await formValidationFinancialAdvantage();

      if (errors.length != 0) {
        const fileStream = fs.createWriteStream(
          `/tmp/failing-form/financialAdvantage.csv`,
        );
        fileStream.write("CreatedBy,Instance,Field\n");

        errors.forEach((entry) => {
          fileStream.write(
            `${entry.bestuurseenheid},${entry.instance},${entry.field}\n`,
          );
        });

        fileStream.end();
      }
      expect(errors.length).toEqual(0);
    },
    60000 * 15 * 100,
  );

  test.skip(
    "contactPoint",
    async () => {
      const errors: RapportErrorType[] = await formValidationContactPoint();

      if (errors.length != 0) {
        const fileStream = fs.createWriteStream(
          `/tmp/failing-form/contactPoint.csv`,
        );
        fileStream.write("CreatedBy,Instance,Field\n");

        errors.forEach((entry) => {
          fileStream.write(
            `${entry.bestuurseenheid},${entry.instance},${entry.field}\n`,
          );
        });

        fileStream.end();
      }
      expect(errors.length).toEqual(0);
    },
    60000 * 15 * 100,
  );
});

async function getBestuurseenhedenIds(): Promise<string[]> {
  const query = `
            ${PREFIX.besluit}
            SELECT ?id WHERE {
                GRAPH ${sparqlEscapeUri(PUBLIC_GRAPH)} {
                    ?id a besluit:Bestuurseenheid .
                }
            }
        `;

  const ids = await directDatabaseAccess.list(query);
  return ids.map((id) => id["id"].value);
}

async function getPublishedInstancesForBestuurseenheid(
  bestuurseenheid: Bestuurseenheid,
): Promise<string[]> {
  const query = `
            ${PREFIX.lpdcExt}
            SELECT ?id WHERE {
                GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                    ?id a lpdcExt:InstancePublicService .
                    ?id <http://schema.org/publication> ?status.
                    FILTER (?status IN (<http://lblod.data.gift/concepts/publication-status/gepubliceerd>, <http://lblod.data.gift/concepts/publication-status/te-herpubliceren>))
                }
            }
            `;
  const ids = await directDatabaseAccess.list(query);
  return ids.map((id) => id["id"].value);
}

async function formValidationBasisInformatie(): Promise<
  RapportBasisInformatieType[]
> {
  const query = `
        SELECT  ?instance ?createdBy WHERE {
            ?instance a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>.
            ?instance <http://schema.org/publication> ?publicationStatus.
            ?instance <http://purl.org/pav/createdBy> ?createdBy.
        
            OPTIONAL{
                ?instance <http://purl.org/dc/terms/title> ?title.
                BIND(REPLACE(?title, "^\\\\s+|\\\\s+$", "") AS ?trimmedTitle)

            }
            OPTIONAL{
                ?instance <http://purl.org/dc/terms/description> ?description.
                BIND(REPLACE(?description, "^\\\\s+|\\\\s+$", "") AS ?trimmedDescription)
            }  
        
            FILTER (?publicationStatus IN (
                <http://lblod.data.gift/concepts/publication-status/gepubliceerd>,
                <http://lblod.data.gift/concepts/publication-status/te-herpubliceren>
            ))
        
            FILTER (
                (!bound(?trimmedTitle) || ?trimmedTitle = "") ||
                (!bound(?trimmedDescription) || ?trimmedDescription = "") 
            )
        }
    `;
  const results = await directDatabaseAccess.list(query);
  const resultMap: RapportBasisInformatieType[] = [];
  results.forEach((result) => {
    const bestuurseenheid = result["createdBy"].value;
    const instance = result["instance"].value;

    resultMap.push({ instance, bestuurseenheid });
  });
  return resultMap;
}

async function formValidationRequirement(): Promise<RapportErrorType[]> {
  const query = `
        SELECT  ?instance ?createdBy ?requirement WHERE {
            ?instance a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>.
            ?instance <http://schema.org/publication> ?publicationStatus.
            ?instance <http://purl.org/pav/createdBy> ?createdBy.
        
            ?instance <http://vocab.belgif.be/ns/publicservice#hasRequirement> ?requirement.
            
            OPTIONAL{
                ?requirement <http://purl.org/dc/terms/title> ?title.
                BIND(REPLACE(?title, "^\\\\s+|\\\\s+$", "") AS ?trimmedTitle)
            }
            OPTIONAL{
                ?requirement <http://purl.org/dc/terms/description> ?description.
                BIND(REPLACE(?description, "^\\\\s+|\\\\s+$", "") AS ?trimmedDescription)
            }
            
            FILTER (?publicationStatus IN (
                <http://lblod.data.gift/concepts/publication-status/gepubliceerd>,
                <http://lblod.data.gift/concepts/publication-status/te-herpubliceren>
            ))
        
            FILTER (
                (!bound(?trimmedTitle) || ?trimmedTitle = "") ||
                (!bound(?trimmedDescription) || ?trimmedDescription = "") 
            )
        }
    `;

  const results = await directDatabaseAccess.list(query);
  const resultMap: RapportErrorType[] = [];
  results.forEach((result) => {
    const bestuurseenheid = result["createdBy"].value;
    const instance = result["instance"].value;
    const field = result["requirement"].value;

    resultMap.push({ instance, bestuurseenheid, field });
  });
  return resultMap;
}

async function formValidationRequirementEvidence(): Promise<
  RapportErrorType[]
> {
  const query = `
        SELECT  ?instance ?createdBy ?requirement WHERE {
            ?instance a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>.
            ?instance <http://schema.org/publication> ?publicationStatus.
            ?instance <http://purl.org/pav/createdBy> ?createdBy.
        
            ?instance <http://vocab.belgif.be/ns/publicservice#hasRequirement> ?requirement.
            ?requirement <http://data.europa.eu/m8g/hasSupportingEvidence> ?evidence.
            
            OPTIONAL{
                ?evidence <http://purl.org/dc/terms/title> ?title.
                BIND(REPLACE(?title, "^\\\\s+|\\\\s+$", "") AS ?trimmedTitle)
            }
            OPTIONAL{
                ?evidence <http://purl.org/dc/terms/description> ?description.
                BIND(REPLACE(?description, "^\\\\s+|\\\\s+$", "") AS ?trimmedDescription)
            }
            
            FILTER (?publicationStatus IN (
                <http://lblod.data.gift/concepts/publication-status/gepubliceerd>,
                <http://lblod.data.gift/concepts/publication-status/te-herpubliceren>
            ))
        
            FILTER (
                (!bound(?trimmedTitle) || ?trimmedTitle = "") ||
                (!bound(?trimmedDescription) || ?trimmedDescription = "") 
            )
        }
    `;

  const results = await directDatabaseAccess.list(query);
  const resultMap: RapportErrorType[] = [];
  results.forEach((result) => {
    const bestuurseenheid = result["createdBy"].value;
    const instance = result["instance"].value;
    const field = result["evidence"].value;

    resultMap.push({ instance, bestuurseenheid, field });
  });
  return resultMap;
}

async function formValidationProcedure(): Promise<RapportErrorType[]> {
  const query = `
        SELECT  ?instance ?createdBy ?procedure WHERE {
            ?instance a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>.
            ?instance <http://schema.org/publication> ?publicationStatus.
            ?instance <http://purl.org/pav/createdBy> ?createdBy.
        
            ?instance <http://purl.org/vocab/cpsv#follows> ?procedure.
            
            OPTIONAL{
                ?procedure <http://purl.org/dc/terms/title> ?title.
                BIND(REPLACE(?title, "^\\\\s+|\\\\s+$", "") AS ?trimmedTitle)
            }
            OPTIONAL{
                ?procedure <http://purl.org/dc/terms/description> ?description.
                BIND(REPLACE(?description, "^\\\\s+|\\\\s+$", "") AS ?trimmedDescription)
            }
            
            FILTER (?publicationStatus IN (
                <http://lblod.data.gift/concepts/publication-status/gepubliceerd>,
                <http://lblod.data.gift/concepts/publication-status/te-herpubliceren>
            ))
        
            FILTER (
                (!bound(?trimmedTitle) || ?trimmedTitle = "") ||
                (!bound(?trimmedDescription) || ?trimmedDescription = "") 
            )
        }
    `;

  const results = await directDatabaseAccess.list(query);
  const resultMap: RapportErrorType[] = [];
  results.forEach((result) => {
    const bestuurseenheid = result["createdBy"].value;
    const instance = result["instance"].value;
    const field = result["procedure"].value;

    resultMap.push({ instance, bestuurseenheid, field });
  });
  return resultMap;
}

async function formValidationProcedureWebsite(): Promise<RapportErrorType[]> {
  const query = `
        SELECT  ?instance ?createdBy ?website WHERE {
            ?instance a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>.
            ?instance <http://schema.org/publication> ?publicationStatus.
            ?instance <http://purl.org/pav/createdBy> ?createdBy.
        
            ?instance <http://purl.org/vocab/cpsv#follows> ?procedure.
            ?procedure <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite> ?website.
            
            OPTIONAL{
                ?website <http://purl.org/dc/terms/title> ?title.
                BIND(REPLACE(?title, "^\\\\s+|\\\\s+$", "") AS ?trimmedTitle)
            }
            OPTIONAL{
                ?website <http://schema.org/url> ?url.
            }
            
            FILTER (?publicationStatus IN (
                <http://lblod.data.gift/concepts/publication-status/gepubliceerd>,
                <http://lblod.data.gift/concepts/publication-status/te-herpubliceren>
            ))
        
            FILTER (
                (bound(?url) && !(
                    STRSTARTS(?url, "http://") || 
                    STRSTARTS(?url, "https://") || 
                    STRSTARTS(?url, "ftp://") || 
                    STRSTARTS(?url, "sftp://")
                    )
                )||
                (!bound(?trimmedTitle) || ?trimmedTitle = "")
            )
        }
    `;

  const results = await directDatabaseAccess.list(query);
  const resultMap: RapportErrorType[] = [];
  results.forEach((result) => {
    const bestuurseenheid = result["createdBy"].value;
    const instance = result["instance"].value;
    const field = result["website"].value;

    resultMap.push({ instance, bestuurseenheid, field });
  });
  return resultMap;
}

async function formValidationWebsite(): Promise<RapportErrorType[]> {
  const query = `
        SELECT  ?instance ?createdBy ?website WHERE {
            ?instance a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>.
            ?instance <http://schema.org/publication> ?publicationStatus.
            ?instance <http://purl.org/pav/createdBy> ?createdBy.
        
            ?instance <http://www.w3.org/2000/01/rdf-schema#seeAlso> ?website.

            
            OPTIONAL{
                ?website <http://purl.org/dc/terms/title> ?title.
                BIND(REPLACE(?title, "^\\\\s+|\\\\s+$", "") AS ?trimmedTitle)
            }
            OPTIONAL{
                ?website <http://schema.org/url> ?url.
            }
            
            FILTER (?publicationStatus IN (
                <http://lblod.data.gift/concepts/publication-status/gepubliceerd>,
                <http://lblod.data.gift/concepts/publication-status/te-herpubliceren>
            ))
        
            FILTER (
                (bound(?url) && !(
                    STRSTARTS(?url, "http://") || 
                    STRSTARTS(?url, "https://") || 
                    STRSTARTS(?url, "ftp://") || 
                    STRSTARTS(?url, "sftp://")
                    )
                )||
                (!bound(?trimmedTitle) || ?trimmedTitle = "")
            )
        }
    `;

  const results = await directDatabaseAccess.list(query);
  const resultMap: RapportErrorType[] = [];
  results.forEach((result) => {
    const bestuurseenheid = result["createdBy"].value;
    const instance = result["instance"].value;
    const field = result["website"].value;

    resultMap.push({ instance, bestuurseenheid, field });
  });
  return resultMap;
}

async function formValidationCost(): Promise<RapportErrorType[]> {
  const query = `
        SELECT  ?instance ?createdBy ?cost WHERE {
            ?instance a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>.
            ?instance <http://schema.org/publication> ?publicationStatus.
            ?instance <http://purl.org/pav/createdBy> ?createdBy.
        
            ?instance <http://data.europa.eu/m8g/hasCost> ?cost

            
            OPTIONAL{
                ?cost <http://purl.org/dc/terms/title> ?title.
                BIND(REPLACE(?title, "^\\\\s+|\\\\s+$", "") AS ?trimmedTitle)
            }
            OPTIONAL{
                ?cost <http://purl.org/dc/terms/description> ?description.
                BIND(REPLACE(?description, "^\\\\s+|\\\\s+$", "") AS ?trimmedDescription)
            }
            
            FILTER (?publicationStatus IN (
                <http://lblod.data.gift/concepts/publication-status/gepubliceerd>,
                <http://lblod.data.gift/concepts/publication-status/te-herpubliceren>
            ))
        
            FILTER (
                (!bound(?trimmedTitle) || ?trimmedTitle = "") ||
                (!bound(?trimmedDescription) || ?trimmedDescription = "") 
            )
        }
    `;

  const results = await directDatabaseAccess.list(query);
  const resultMap: RapportErrorType[] = [];
  results.forEach((result) => {
    const bestuurseenheid = result["createdBy"].value;
    const instance = result["instance"].value;
    const field = result["cost"].value;

    resultMap.push({ instance, bestuurseenheid, field });
  });
  return resultMap;
}

async function formValidationFinancialAdvantage(): Promise<RapportErrorType[]> {
  const query = `
        SELECT  ?instance ?createdBy ?cost WHERE {
            ?instance a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>.
            ?instance <http://schema.org/publication> ?publicationStatus.
            ?instance <http://purl.org/pav/createdBy> ?createdBy.
        
        ?instance <http://purl.org/vocab/cpsv#produces> ?financialAdvantage.

            
            OPTIONAL{
                ?financialAdvantage <http://purl.org/dc/terms/title> ?title.
                BIND(REPLACE(?title, "^\\\\s+|\\\\s+$", "") AS ?trimmedTitle)
            }
            OPTIONAL{
                ?financialAdvantage <http://purl.org/dc/terms/description> ?description.
                BIND(REPLACE(?description, "^\\\\s+|\\\\s+$", "") AS ?trimmedDescription)
            }
            
            FILTER (?publicationStatus IN (
                <http://lblod.data.gift/concepts/publication-status/gepubliceerd>,
                <http://lblod.data.gift/concepts/publication-status/te-herpubliceren>
            ))
        
            FILTER (
                (!bound(?trimmedTitle) || ?trimmedTitle = "") ||
                (!bound(?trimmedDescription) || ?trimmedDescription = "") 
            )
        }
    `;

  const results = await directDatabaseAccess.list(query);
  const resultMap: RapportErrorType[] = [];
  results.forEach((result) => {
    const bestuurseenheid = result["createdBy"].value;
    const instance = result["instance"].value;
    const field = result["cost"].value;

    resultMap.push({ instance, bestuurseenheid, field });
  });
  return resultMap;
}

async function formValidationContactPoint(): Promise<RapportErrorType[]> {
  //Check that telephone just contains digits
  const query = `
        SELECT  ?instance ?createdBy ?contactPoint
        WHERE {
            ?instance a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>.
            ?instance <http://schema.org/publication> ?publicationStatus.
            ?instance <http://purl.org/pav/createdBy> ?createdBy.
        
            ?instance <http://data.europa.eu/m8g/hasContactPoint> ?contactPoint.
            
            OPTIONAL{
                ?contactPoint <http://schema.org/email> ?email.
            }
            OPTIONAL {
                ?contactPoint <http://schema.org/telephone> ?telephone.
            }
            OPTIONAL {
                ?contactPoint <http://schema.org/url> ?url.
            }
            

            
            FILTER (?publicationStatus IN (
                <http://lblod.data.gift/concepts/publication-status/gepubliceerd>,
                <http://lblod.data.gift/concepts/publication-status/te-herpubliceren>
            ))
        
            FILTER (
                (bound(?email) && !REGEX(?email, "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,}$")) ||
                (bound(?telephone) && !REGEX(STRDT(STR(REPLACE(?telephone, "[^0-9+/\\\\-]", "")), xsd:string), "^[+\\\\-]?[0-9/\\\\-]*$")) ||
                (bound(?url) && !(
                    STRSTARTS(?url, "http://") || 
                    STRSTARTS(?url, "https://") || 
                    STRSTARTS(?url, "ftp://") || 
                    STRSTARTS(?url, "sftp://")
                    )
                )
           )
        }
    `;

  const results = await directDatabaseAccess.list(query);
  const resultMap: RapportErrorType[] = [];
  results.forEach((result) => {
    const bestuurseenheid = result["createdBy"].value;
    const instance = result["instance"].value;
    const field = result["contactPoint"].value;

    resultMap.push({ instance, bestuurseenheid, field });
  });
  return resultMap;
}

type RapportErrorType = {
  instance: string;
  bestuurseenheid: string;
  field: string;
};
type RapportBasisInformatieType = {
  instance: string;
  bestuurseenheid: string;
};
