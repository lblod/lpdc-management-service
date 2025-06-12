import { SparqlQuerying } from "../../../src/driven/persistence/sparql-querying";
import { Iri } from "../../../src/core/domain/shared/iri";
import { sparqlEscapeUri } from "../../../mu-helper";
import { DomainToQuadsMapper } from "../../../src/driven/persistence/domain-to-quads-mapper";
import { Instance } from "../../../src/core/domain/instance";
import { NamedNode, Statement } from "rdflib";
import { ConceptSnapshot } from "../../../src/core/domain/concept-snapshot";
import { Concept } from "../../../src/core/domain/concept";
import { InstanceSnapshot } from "../../../src/core/domain/instance-snapshot";

export class ConceptCodeValidator {
  private sparqlQuerying: SparqlQuerying;
  private cachedResults: Map<string, boolean>;

  constructor(sparqlQuerying: SparqlQuerying) {
    this.sparqlQuerying = sparqlQuerying;
    this.cachedResults = new Map<string, boolean>();
  }

  async validateConceptCodes(conceptCodes: Iri[]) {
    for (const conceptCode of conceptCodes) {
      await this.validateConceptCode(conceptCode);
    }
  }

  private async validateConceptCode(conceptCode: Iri): Promise<void> {
    //console.log(`Validating Concept Code <${conceptCode}>`);

    const isValid = await this.isValidCode(conceptCode);

    try {
      expect(isValid).toBeTrue();
    } catch (e) {
      throw new Error(`Concept Code ${conceptCode} not found`);
    }
  }

  private async isValidCode(conceptCode: Iri): Promise<boolean> {
    if (this.cachedResults.has(conceptCode.value)) {
      //console.log(`return cached result`);
      return this.cachedResults.get(conceptCode.value);
    }
    const query = `
            ASK {
                ${sparqlEscapeUri(conceptCode)} a <http://www.w3.org/2004/02/skos/core#Concept>.
                ${sparqlEscapeUri(conceptCode)} <http://mu.semte.ch/vocabularies/core/uuid> ?uuid.
                ${sparqlEscapeUri(conceptCode)} <http://www.w3.org/2004/02/skos/core#prefLabel> ?prefLabel.
            }
        `;
    const result = await this.sparqlQuerying.ask(query);
    this.cachedResults.set(conceptCode.value, result);
    return result;
  }
}

export function extractAllConceptCodesForInstance(
  domainToQuadsMapper: DomainToQuadsMapper,
  instance: Instance,
): Iri[] {
  return [
    ...extractAllConceptCodes(domainToQuadsMapper, instance),
    ...domainToQuadsMapper
      .languages(instance.id, instance.languages)
      .map(objectAsIri),
    ...[domainToQuadsMapper.instanceStatus(instance.id, instance.status)].map(
      objectAsIri,
    ),
    ...(instance.reviewStatus
      ? [
          domainToQuadsMapper.reviewStatus(instance.id, instance.reviewStatus),
        ].map(objectAsIri)
      : []),
    ...instance.spatials,
  ];
}

export function extractAllConceptCodesForInstanceSnapshot(
  domainToQuadsMapper: DomainToQuadsMapper,
  instanceSnapshot: InstanceSnapshot,
): Iri[] {
  return [
    ...extractAllConceptCodes(domainToQuadsMapper, instanceSnapshot),
    ...domainToQuadsMapper
      .languages(instanceSnapshot.id, instanceSnapshot.languages)
      .map(objectAsIri),
    ...instanceSnapshot.spatials,
  ];
}

export function extractAllConceptCodesForConceptSnapshot(
  domainToQuadsMapper: DomainToQuadsMapper,
  conceptSnapshot: ConceptSnapshot,
): Iri[] {
  return [
    ...extractAllConceptCodes(domainToQuadsMapper, conceptSnapshot),
    ...domainToQuadsMapper
      .conceptTags(conceptSnapshot.id, conceptSnapshot.conceptTags)
      .map(objectAsIri),
  ];
}

export function extractAllConceptCodesForConcept(
  domainToQuadsMapper: DomainToQuadsMapper,
  concept: Concept,
): Iri[] {
  return [
    ...extractAllConceptCodes(domainToQuadsMapper, concept),
    ...domainToQuadsMapper
      .conceptTags(concept.id, concept.conceptTags)
      .map(objectAsIri),
  ];
}

function extractAllConceptCodes(
  domainToQuadsMapper: DomainToQuadsMapper,
  value: Instance | ConceptSnapshot | Concept | InstanceSnapshot,
): Iri[] {
  return [
    ...(value.type
      ? [domainToQuadsMapper.type(value.id, value.type)].map(objectAsIri)
      : []),
    ...domainToQuadsMapper
      .targetAudiences(value.id, value.targetAudiences)
      .map(objectAsIri),
    ...domainToQuadsMapper.themes(value.id, value.themes).map(objectAsIri),
    ...domainToQuadsMapper
      .competentAuthorityLevels(value.id, value.competentAuthorityLevels)
      .map(objectAsIri),
    ...domainToQuadsMapper
      .executingAuthorityLevels(value.id, value.executingAuthorityLevels)
      .map(objectAsIri),
    ...domainToQuadsMapper
      .publicationMedia(value.id, value.publicationMedia)
      .map(objectAsIri),
    ...domainToQuadsMapper
      .yourEuropeCategories(value.id, value.yourEuropeCategories)
      .map(objectAsIri),
  ];
}

export function objectAsIri(statement: Statement): Iri {
  return new Iri((statement.object as NamedNode).value);
}
