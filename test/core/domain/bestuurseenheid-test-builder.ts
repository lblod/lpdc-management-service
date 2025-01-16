import { Iri } from "../../../src/core/domain/shared/iri";
import {
  Bestuurseenheid,
  BestuurseenheidClassificatieCode,
  BestuurseenheidStatusCode,
} from "../../../src/core/domain/bestuurseenheid";
import { uuid } from "../../../mu-helper";
import {
  buildBestuurseenheidIri,
  buildNutsCodeIri,
  randomNumber,
} from "./iri-test-builder";

export function aBestuurseenheid(): BestuurseenheidTestBuilder {
  const bestuurseenheidUuid = uuid();
  return new BestuurseenheidTestBuilder()
    .withId(buildBestuurseenheidIri(bestuurseenheidUuid))
    .withUuid(bestuurseenheidUuid)
    .withPrefLabel("Aarschot")
    .withClassificatieCode(BestuurseenheidClassificatieCode.GEMEENTE)
    .withStatus(BestuurseenheidStatusCode.ACTIVE)
    .withSpatials([
      BestuurseenheidTestBuilder.SPATIAL_1_IRI,
      BestuurseenheidTestBuilder.SPATIAL_2_IRI,
    ]);
}

export function someCompetentAuthorities(): BestuurseenheidTestBuilder[] {
  const pepingen = new BestuurseenheidTestBuilder()
    .withId(BestuurseenheidTestBuilder.PEPINGEN_IRI)
    .withUuid(BestuurseenheidTestBuilder.PEPINGEN_UUID)
    .withPrefLabel("Pepingen")
    .withClassificatieCode(BestuurseenheidClassificatieCode.GEMEENTE)
    .withStatus(BestuurseenheidStatusCode.ACTIVE)
    .withSpatials([
      BestuurseenheidTestBuilder.SPATIAL_1_IRI,
      BestuurseenheidTestBuilder.SPATIAL_2_IRI,
    ]);

  const houthalenHelchteren = new BestuurseenheidTestBuilder()
    .withId(BestuurseenheidTestBuilder.HOUTHALEN_HELCHTEREN_IRI)
    .withUuid(BestuurseenheidTestBuilder.HOUTHALEN_HELCHTEREN_UUID)
    .withPrefLabel("Houthalen-Helchteren")
    .withClassificatieCode(BestuurseenheidClassificatieCode.GEMEENTE)
    .withStatus(BestuurseenheidStatusCode.ACTIVE)
    .withSpatials([
      BestuurseenheidTestBuilder.SPATIAL_1_IRI,
      BestuurseenheidTestBuilder.SPATIAL_2_IRI,
    ]);

  const borgloon = new BestuurseenheidTestBuilder()
    .withId(BestuurseenheidTestBuilder.BORGLOON_IRI)
    .withUuid(BestuurseenheidTestBuilder.BORGLOON_UUID)
    .withPrefLabel("Borgloon")
    .withClassificatieCode(BestuurseenheidClassificatieCode.GEMEENTE)
    .withStatus(BestuurseenheidStatusCode.ACTIVE)
    .withSpatials([
      BestuurseenheidTestBuilder.SPATIAL_1_IRI,
      BestuurseenheidTestBuilder.SPATIAL_2_IRI,
    ]);

  return [pepingen, houthalenHelchteren, borgloon];
}

export function someExecutingAuthorities(): BestuurseenheidTestBuilder[] {
  const pepingen = new BestuurseenheidTestBuilder()
    .withId(BestuurseenheidTestBuilder.PEPINGEN_IRI)
    .withUuid(BestuurseenheidTestBuilder.PEPINGEN_UUID)
    .withPrefLabel("Pepingen")
    .withClassificatieCode(BestuurseenheidClassificatieCode.GEMEENTE)
    .withStatus(BestuurseenheidStatusCode.ACTIVE)
    .withSpatials([
      BestuurseenheidTestBuilder.SPATIAL_1_IRI,
      BestuurseenheidTestBuilder.SPATIAL_2_IRI,
    ]);

  const oudHeverlee = new BestuurseenheidTestBuilder()
    .withId(BestuurseenheidTestBuilder.OUD_HEVERLEE_IRI)
    .withUuid(BestuurseenheidTestBuilder.OUD_HEVERLEE_UUID)
    .withPrefLabel("Oud-Heverlee")
    .withClassificatieCode(BestuurseenheidClassificatieCode.GEMEENTE)
    .withStatus(BestuurseenheidStatusCode.ACTIVE)
    .withSpatials([
      BestuurseenheidTestBuilder.SPATIAL_1_IRI,
      BestuurseenheidTestBuilder.SPATIAL_2_IRI,
    ]);

  return [pepingen, oudHeverlee];
}

export class BestuurseenheidTestBuilder {
  public static readonly PEPINGEN_UUID =
    "73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589";
  public static readonly PEPINGEN_IRI = buildBestuurseenheidIri(
    BestuurseenheidTestBuilder.PEPINGEN_UUID,
  );

  public static readonly HOUTHALEN_HELCHTEREN_UUID =
    "d760812063231cc45ced3fa65a7cd54920329178c8df7e891aa12db442e6606a";
  public static readonly HOUTHALEN_HELCHTEREN_IRI = buildBestuurseenheidIri(
    BestuurseenheidTestBuilder.HOUTHALEN_HELCHTEREN_UUID,
  );

  public static readonly BORGLOON_UUID =
    "05441122597e0b20b61a8968ea1247c07f9014aad1f1f0709d0b1234e3dfbc2f";
  public static readonly BORGLOON_IRI = buildBestuurseenheidIri(
    BestuurseenheidTestBuilder.BORGLOON_UUID,
  );

  public static readonly OUD_HEVERLEE_UUID =
    "319db6e275f281d0280da90d6f6aba3462f4e47b6f53a34639feb91015a5822b";
  public static readonly OUD_HEVERLEE_IRI = buildBestuurseenheidIri(
    BestuurseenheidTestBuilder.OUD_HEVERLEE_UUID,
  );

  public static readonly ASSENEDE_UUID =
    "e971816acb021c37576835e6a96922442628956fd029d885fd849c9f07414469";
  public static readonly ASSENEDE_IRI = buildBestuurseenheidIri(
    BestuurseenheidTestBuilder.ASSENEDE_UUID,
  );

  public static readonly SPATIAL_1_IRI = buildNutsCodeIri(
    randomNumber(10000, 50000),
  );
  public static readonly SPATIAL_2_IRI = buildNutsCodeIri(
    randomNumber(50001, 99999),
  );

  private id: Iri;
  private uuid: string;
  private prefLabel: string;
  private classificatieCode: BestuurseenheidClassificatieCode;
  private status: BestuurseenheidStatusCode;
  private spatials: Iri[];

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

  public withClassificatieCode(
    classificatieCode: BestuurseenheidClassificatieCode,
  ): BestuurseenheidTestBuilder {
    this.classificatieCode = classificatieCode;
    return this;
  }

  public withStatus(
    status: BestuurseenheidStatusCode,
  ): BestuurseenheidTestBuilder {
    this.status = status;
    return this;
  }

  public withSpatials(spatials: Iri[]): BestuurseenheidTestBuilder {
    this.spatials = spatials;
    return this;
  }

  public build(): Bestuurseenheid {
    return new Bestuurseenheid(
      this.id,
      this.uuid,
      this.prefLabel,
      this.classificatieCode,
      this.status,
      this.spatials,
    );
  }
}
