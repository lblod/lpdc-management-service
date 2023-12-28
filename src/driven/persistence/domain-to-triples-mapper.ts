import {ConceptVersie} from "../../core/domain/concept-versie";
import {Iri} from "../../core/domain/shared/iri";
import {TaalString} from "../../core/domain/taal-string";
import {Evidence} from "../../core/domain/evidence";
import {Website} from "../../core/domain/website";
import {literal, NamedNode, namedNode, quad, Statement} from "rdflib";
import {NS} from "./namespaces";

export class DomainToTriplesMapper {

    public conceptVersieToTriples(conceptVersie: ConceptVersie): Statement[] {
        return [
            quad(namedNode(conceptVersie.id), NS.rdf('type'), NS.lpdcExt('ConceptualPublicService')),
            conceptVersie.startDate ? quad(namedNode(conceptVersie.id), NS.schema('startDate'), literal(conceptVersie.startDate.toISOString(), NS.xsd('dateTime'))) : undefined,
            conceptVersie.endDate ? quad(namedNode(conceptVersie.id), NS.schema('endDate'), literal(conceptVersie.endDate.toISOString(), NS.xsd('dateTime'))) : undefined,
            conceptVersie.type ? quad(namedNode(conceptVersie.id), NS.dct('type'), namedNode(conceptVersie.type)) : undefined,
            ...this.taalStringToTriples(namedNode(conceptVersie.id), namedNode(NS.dct('title').value), conceptVersie.title),
            ...this.taalStringToTriples(namedNode(conceptVersie.id), namedNode(NS.dct('description').value), conceptVersie.description),
            ...this.taalStringToTriples(namedNode(conceptVersie.id), namedNode(NS.lpdcExt('additionalDescription').value), conceptVersie.additionalDescription),
            ...this.taalStringToTriples(namedNode(conceptVersie.id), namedNode(NS.lpdcExt('exception').value), conceptVersie.exception),
            ...this.taalStringToTriples(namedNode(conceptVersie.id), namedNode(NS.lpdcExt('regulation').value), conceptVersie.regulation),
            ...this.irisToTriples(namedNode(conceptVersie.id), namedNode(NS.lpdcExt('targetAudience').value), conceptVersie.targetAudiences),
            ...this.irisToTriples(namedNode(conceptVersie.id), namedNode(NS.m8g('thematicArea').value), conceptVersie.themes),
            ...this.irisToTriples(namedNode(conceptVersie.id), namedNode(NS.lpdcExt('competentAuthorityLevel').value), conceptVersie.competentAuthorityLevels),
            ...this.irisToTriples(namedNode(conceptVersie.id), namedNode(NS.m8g('hasCompetentAuthority').value), conceptVersie.competentAuthorities),
            ...this.irisToTriples(namedNode(conceptVersie.id), namedNode(NS.lpdcExt('executingAuthorityLevel').value), conceptVersie.executingAuthorityLevels),
            ...this.irisToTriples(namedNode(conceptVersie.id), namedNode(NS.lpdcExt('hasExecutingAuthority').value), conceptVersie.executingAuthorities),
            ...this.irisToTriples(namedNode(conceptVersie.id), namedNode(NS.lpdcExt('publicationMedium').value), conceptVersie.publicationMedia),
            ...this.irisToTriples(namedNode(conceptVersie.id), namedNode(NS.lpdcExt('yourEuropeCategory').value), conceptVersie.yourEuropeCategories),
            ...conceptVersie.keywords.flatMap(keyword => this.taalStringToTriples(namedNode(conceptVersie.id), namedNode(NS.dcat('keyword').value), keyword)),
            ...this.requirementsToTriples(conceptVersie),
            ...this.proceduresToTriples(conceptVersie),
            ...this.websitesToTriples(conceptVersie.id, namedNode(NS.rdfs('seeAlso').value), conceptVersie.websites),
            ...this.costsToTriples(conceptVersie),
            ...this.financialAdvantagesToTriples(conceptVersie),
            conceptVersie.isVersionOfConcept ? quad(namedNode(conceptVersie.id), NS.dct('isVersionOf'), namedNode(conceptVersie.isVersionOfConcept)) : undefined,
            conceptVersie.dateCreated ? quad(namedNode(conceptVersie.id), NS.schema('dateCreated'), literal(conceptVersie.dateCreated.toISOString(), NS.xsd('dateTime'))) : undefined,
            conceptVersie.dateModified ? quad(namedNode(conceptVersie.id), NS.schema('dateModified'), literal(conceptVersie.dateModified.toISOString(), NS.xsd('dateTime'))) : undefined,
            conceptVersie.generatedAtTime ? quad(namedNode(conceptVersie.id), NS.prov('generatedAtTime'), literal(conceptVersie.generatedAtTime.toISOString(), NS.xsd('dateTime'))) : undefined,
            quad(namedNode(conceptVersie.id), NS.schema('identifier'), literal(conceptVersie.identifier)),
            conceptVersie.productId ? quad(namedNode(conceptVersie.id), NS.schema('productID'), literal(conceptVersie.productId)) : undefined,
            conceptVersie.snapshotType ? quad(namedNode(conceptVersie.id), NS.lpdcExt('snapshotType'), namedNode(conceptVersie.snapshotType)) : undefined,
            ...this.irisToTriples(namedNode(conceptVersie.id), namedNode(NS.lpdcExt('conceptTag').value), conceptVersie.conceptTags),
        ].filter(t => t !== undefined);
    }

    private taalStringToTriples(subject: NamedNode, predicate: NamedNode, object: TaalString | undefined): Statement[] {
        return object ?
            [
                ["en", object.en],
                ["nl", object.nl],
                ["nl-be-x-formal", object.nlFormal],
                ["nl-be-x-informal", object.nlInformal],
                ["nl-be-x-generated-formal", object.nlGeneratedFormal],
                ["nl-be-x-generated-informal", object.nlGeneratedInformal]]
                .filter(tuple => tuple[1] !== undefined)
                .map(tuple => quad(subject, predicate, literal(tuple[1], tuple[0]))) : [];
    }

    private irisToTriples(subject: NamedNode, predicate: NamedNode, enumValues: Set<any>): Statement[] {
        return Array.from(enumValues)
            .map(e => quad(subject, predicate, namedNode(e)));
    }

    private requirementsToTriples(conceptVersie: ConceptVersie): Statement[] {
        return conceptVersie.requirements.flatMap((requirement, index) =>
            [
                quad(namedNode(conceptVersie.id), NS.ps('hasRequirement'), namedNode(requirement.id)),
                quad(namedNode(requirement.id), NS.rdf('type'), NS.m8g('Requirement')),
                ...this.taalStringToTriples(namedNode(requirement.id), namedNode(NS.dct(`title`).value), requirement.title),
                ...this.taalStringToTriples(namedNode(requirement.id), namedNode(NS.dct(`description`).value), requirement.description),
                quad(namedNode(requirement.id), NS.sh('order'), literal(`${index}`, NS.xsd('integer'))),
                ...this.evidenceToTriples(requirement.id, requirement.evidence),
            ]
        );
    }

    private evidenceToTriples(requirementId: Iri, evidence: Evidence | undefined): Statement[] {
        return evidence ? [
            quad(namedNode(requirementId), NS.m8g('hasSupportingEvidence'), namedNode(evidence.id)),
            quad(namedNode(evidence.id), NS.rdf('type'), NS.m8g('Evidence')),
            ...this.taalStringToTriples(namedNode(evidence.id), namedNode(NS.dct(`title`).value), evidence.title),
            ...this.taalStringToTriples(namedNode(evidence.id), namedNode(NS.dct(`description`).value), evidence.description),
        ] : [];
    }

    private proceduresToTriples(conceptVersie: ConceptVersie): Statement[] {
        return conceptVersie.procedures.flatMap((procedure, index) =>
            [
                quad(namedNode(conceptVersie.id), NS.cpsv('follows'), namedNode(procedure.id)),
                quad(namedNode(procedure.id), NS.rdf('type'), NS.cpsv('Rule')),
                ...this.taalStringToTriples(namedNode(procedure.id), namedNode(NS.dct(`title`).value), procedure.title),
                ...this.taalStringToTriples(namedNode(procedure.id), namedNode(NS.dct(`description`).value), procedure.description),
                quad(namedNode(procedure.id), NS.sh('order'), literal(`${index}`, NS.xsd('integer'))),
                ...this.websitesToTriples(procedure.id, namedNode(NS.lpdcExt('hasWebsite').value), procedure.websites)
            ]
        );
    }

    private websitesToTriples(subjectId: Iri, predicate: NamedNode, websites: Website[]): Statement [] {
        return websites.flatMap((website, index) => {
                return [
                    quad(namedNode(subjectId), predicate, namedNode(website.id)),
                    quad(namedNode(website.id), NS.rdf('type'), NS.schema('WebSite')),
                    ...this.taalStringToTriples(namedNode(website.id), namedNode(NS.dct(`title`).value), website.title),
                    ...this.taalStringToTriples(namedNode(website.id), namedNode(NS.dct(`description`).value), website.description),
                    website.url ? quad(namedNode(website.id), NS.schema('url'), literal(website.url)) : undefined,
                    quad(namedNode(website.id), NS.sh('order'), literal(`${index}`, NS.xsd('integer'))),
                ];
            }
        ).filter(t => t != undefined);
    }

    private costsToTriples(conceptVersie: ConceptVersie): Statement[] {
        return conceptVersie.costs.flatMap((cost, index) => {
            return [
                quad(namedNode(conceptVersie.id), NS.m8g('hasCost'), namedNode(cost.id)),
                quad(namedNode(cost.id), NS.rdf('type'), NS.m8g('Cost')),
                ...this.taalStringToTriples(namedNode(cost.id), namedNode(NS.dct(`title`).value), cost.title),
                ...this.taalStringToTriples(namedNode(cost.id), namedNode(NS.dct(`description`).value), cost.description),
                quad(namedNode(cost.id), NS.sh('order'), literal(`${index}`, NS.xsd('integer'))),
            ];
        });
    }

    private financialAdvantagesToTriples(conceptVersie: ConceptVersie): Statement[] {
        return conceptVersie.financialAdvantages
            .flatMap((financialAdvantage, index) => {
                return [
                    quad(namedNode(conceptVersie.id), NS.cpsv('produces'), namedNode(financialAdvantage.id)),
                    quad(namedNode(financialAdvantage.id), NS.rdf('type'), NS.lpdcExt('FinancialAdvantage')),
                    ...this.taalStringToTriples(namedNode(financialAdvantage.id), namedNode(NS.dct(`title`).value), financialAdvantage.title),
                    ...this.taalStringToTriples(namedNode(financialAdvantage.id), namedNode(NS.dct(`description`).value), financialAdvantage.description),
                    quad(namedNode(financialAdvantage.id), NS.sh('order'), literal(`${index}`, NS.xsd('integer'))),
                ];
            });
    }


}