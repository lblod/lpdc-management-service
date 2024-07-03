import {InstanceSparqlRepository} from "../../../src/driven/persistence/instance-sparql-repository";
import {DirectDatabaseAccess} from "./direct-database-access";
import {Bestuurseenheid} from "../../../src/core/domain/bestuurseenheid";
import {Instance} from "../../../src/core/domain/instance";
import {sparqlEscapeUri} from "../../../mu-helper";
import {DoubleQuadReporter} from "../../../src/driven/shared/quads-to-domain-mapper";
import {InstanceStatusType} from "../../../src/core/domain/types";
import {FormatPreservingDate} from "../../../src/core/domain/format-preserving-date";
import {Iri} from "../../../src/core/domain/shared/iri";
import {NS} from "../../../src/driven/persistence/namespaces";

export class InstanceSparqlTestRepository extends InstanceSparqlRepository {

    private readonly directDatabaseAccess: DirectDatabaseAccess;

    constructor(endpoint?: string, doubleQuadReporter?: DoubleQuadReporter) {
        super(endpoint, doubleQuadReporter);
        this.directDatabaseAccess = new DirectDatabaseAccess(endpoint);
    }

    async save(bestuurseenheid: Bestuurseenheid, instance: Instance, published: boolean = true): Promise<void> {
        await super.save(bestuurseenheid, instance);

        if (instance.status === InstanceStatusType.VERZONDEN && published) {
            const publishedInstanceSnapshotId = (await this.findPublishedInstanceSnapshotIdsForInstance(bestuurseenheid, instance))[0];

            const query = `
            INSERT DATA { 
                GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                    <${publishedInstanceSnapshotId}> <http://schema.org/datePublished> """${FormatPreservingDate.now()}"""^^<http://www.w3.org/2001/XMLSchema#dateTime> .
                }
            }
        `;
            await this.querying.insert(query);
        }
    }

    async findPublishedInstanceSnapshotIdsForInstance(bestuurseenheid: Bestuurseenheid, instance: Instance): Promise<Iri[]> {
        const query = `
            SELECT ?publishedInstanceSnapshotIri WHERE {
                GRAPH <${bestuurseenheid.userGraph()}> {
                    ?publishedInstanceSnapshotIri a ${NS.lpdcExt('PublishedInstancePublicServiceSnapshot')} .
                    ?publishedInstanceSnapshotIri ${NS.lpdcExt('isPublishedVersionOf')} <${instance.id}> .
                    ?publishedInstanceSnapshotIri ${NS.prov('generatedAtTime')} "${instance.dateSent.value}"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
                }
            }
        `;
        const ids = (await this.querying.list(query)).map(item => item['publishedInstanceSnapshotIri'].value);
        return ids.map(id => new Iri(id));
    }

    async findPublishedInstanceSnapshot(bestuurseenheid: Bestuurseenheid, publishedSnapshotId: Iri) {
        return this.fetcher.fetch(
            bestuurseenheid.userGraph(),
            publishedSnapshotId,
            [],
            [
                NS.pav('createdBy').value,
                NS.dct("type").value,
                NS.lpdcExt('targetAudience').value,
                NS.m8g('thematicArea').value,
                NS.lpdcExt('competentAuthorityLevel').value,
                NS.m8g('hasCompetentAuthority').value,
                NS.lpdcExt('executingAuthorityLevel').value,
                NS.lpdcExt('hasExecutingAuthority').value,
                NS.lpdcExt('publicationMedium').value,
                NS.lpdcExt('yourEuropeCategory').value,
                NS.dct('language').value,
                NS.dct('isVersionOf').value,
                NS.dct('spatial').value,
                NS.lpdcExt("conceptTag").value,
                NS.adms('status').value,
                NS.ext('hasVersionedSource').value,
                NS.dct('source').value,
                NS.lpdcExt('isPublishedVersionOf').value,
            ],
            [
                NS.skos('Concept').value,
                NS.lpdcExt('ConceptDisplayConfiguration').value,
                NS.besluit('Bestuurseenheid').value,
                NS.m8g('PublicOrganisation').value,
                NS.lpdcExt('ConceptualPublicService').value,
                NS.lpdcExt('ConceptualPublicServiceSnapshot').value,
            ]);
    }


}