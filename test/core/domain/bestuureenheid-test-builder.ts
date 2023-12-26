import {Iri} from "../../../src/core/domain/shared/iri";
import {Bestuurseenheid, BestuurseenheidClassificatieCode} from "../../../src/core/domain/bestuurseenheid";
import {uuid} from "../../../mu-helper";

export function aBestuurseenheid(): BestuurseenheidTestBuilder {
    return new BestuurseenheidTestBuilder()
        .withId(BestuurseenheidTestBuilder.buildIri(uuid()))
        .withPrefLabel('Aarschot')
        .withClassificatieCode(BestuurseenheidClassificatieCode.GEMEENTE);
}

export function pepingenBestuurseenheid(): Bestuurseenheid {
    return new BestuurseenheidTestBuilder()
        .withId(BestuurseenheidTestBuilder.PEPINGEN_IRI)
        .withPrefLabel('Pepingen')
        .withClassificatieCode(BestuurseenheidClassificatieCode.GEMEENTE)
        .build();
}
export class BestuurseenheidTestBuilder {
    public static readonly PEPINGEN_IRI = BestuurseenheidTestBuilder.buildIri('73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589');
    public static readonly HOUTHALEN_HELCHTEREN_IRI = BestuurseenheidTestBuilder.buildIri('d760812063231cc45ced3fa65a7cd54920329178c8df7e891aa12db442e6606a');
    public static readonly BORGLOON_IRI = BestuurseenheidTestBuilder.buildIri('05441122597e0b20b61a8968ea1247c07f9014aad1f1f0709d0b1234e3dfbc2f');
    public static readonly OUD_HEVERLEE_IRI = BestuurseenheidTestBuilder.buildIri('319db6e275f281d0280da90d6f6aba3462f4e47b6f53a34639feb91015a5822b');
    public static readonly ASSENEDE_IRI = BestuurseenheidTestBuilder.buildIri('e971816acb021c37576835e6a96922442628956fd029d885fd849c9f07414469');

    private id: Iri;
    private prefLabel: string;
    private classificatieCode: BestuurseenheidClassificatieCode;

    static buildIri(uniqueId: string): Iri {
        return `http://data.lblod.info/id/bestuurseenheden/${uniqueId}`;
    }

    public withId(id: Iri): BestuurseenheidTestBuilder {
        this.id = id;
        return this;
    }

    public withPrefLabel(prefLabel: string): BestuurseenheidTestBuilder {
        this.prefLabel = prefLabel;
        return this;
    }

    public withClassificatieCode(classificatieCode: BestuurseenheidClassificatieCode): BestuurseenheidTestBuilder {
        this.classificatieCode = classificatieCode;
        return this;
    }

    public build(): Bestuurseenheid {
        return new Bestuurseenheid(this.id, this.prefLabel, this.classificatieCode);
    }
}