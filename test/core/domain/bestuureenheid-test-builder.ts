import {Iri} from "../../../src/core/domain/shared/iri";
import {Bestuurseenheid, BestuurseenheidClassificatieCode} from "../../../src/core/domain/bestuurseenheid";
import {uuid} from "../../../mu-helper";
import {buildBestuurseenheidIri} from "./iri-test-builder";

export function aBestuurseenheid(): BestuurseenheidTestBuilder {
    const bestuurseenheidUuid = uuid();
    return new BestuurseenheidTestBuilder()
        .withId(buildBestuurseenheidIri(bestuurseenheidUuid))
        .withUuid(bestuurseenheidUuid)
        .withPrefLabel('Aarschot')
        .withClassificatieCode(BestuurseenheidClassificatieCode.GEMEENTE);
}

export function pepingenBestuurseenheid(): Bestuurseenheid {
    return new BestuurseenheidTestBuilder()
        .withId(BestuurseenheidTestBuilder.PEPINGEN_IRI)
        .withUuid("73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589")
        .withPrefLabel('Pepingen')
        .withClassificatieCode(BestuurseenheidClassificatieCode.GEMEENTE)
        .build();
}
export class BestuurseenheidTestBuilder {
    public static readonly PEPINGEN_IRI = buildBestuurseenheidIri('73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589');
    public static readonly HOUTHALEN_HELCHTEREN_IRI = buildBestuurseenheidIri('d760812063231cc45ced3fa65a7cd54920329178c8df7e891aa12db442e6606a');
    public static readonly BORGLOON_IRI = buildBestuurseenheidIri('05441122597e0b20b61a8968ea1247c07f9014aad1f1f0709d0b1234e3dfbc2f');
    public static readonly OUD_HEVERLEE_IRI = buildBestuurseenheidIri('319db6e275f281d0280da90d6f6aba3462f4e47b6f53a34639feb91015a5822b');
    public static readonly ASSENEDE_IRI = buildBestuurseenheidIri('e971816acb021c37576835e6a96922442628956fd029d885fd849c9f07414469');

    private id: Iri;
    private uuid: string;
    private prefLabel: string;
    private classificatieCode: BestuurseenheidClassificatieCode;

    public withId(id: Iri): BestuurseenheidTestBuilder {
        this.id = id;
        return this;
    }

    public withUuid(uuid: string): BestuurseenheidTestBuilder {
        this.uuid = uuid;
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
        return new Bestuurseenheid(this.id, this.uuid, this.prefLabel, this.classificatieCode);
    }
}