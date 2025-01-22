import { uuid } from "../../../mu-helper";
import { Iri } from "../../../src/core/domain/shared/iri";
import { Spatial } from "../../../src/core/domain/spatial";
import { buildNutsCodeIri } from "./iri-test-builder";

export function aSpatial(): SpatialTestBuilder {
  const spatialUuid = uuid();
  return new SpatialTestBuilder()
    .withId(buildNutsCodeIri(spatialUuid))
    .withUuid(spatialUuid)
    .withPrefLabel("A valid spatial without end date")
    .withNotation("0123");
}

export function anExpiredSpatial(): SpatialTestBuilder {
  const spatialUuid = uuid();
  return new SpatialTestBuilder()
    .withId(buildNutsCodeIri(spatialUuid))
    .withUuid(spatialUuid)
    .withPrefLabel("A valid spatial with an end date in the past")
    .withNotation("4567")
    .withEndDate(new Date("2000-01-01"));
}

export function aSpatialWithFutureEndDate(): SpatialTestBuilder {
  const spatialUuid = uuid();
  return new SpatialTestBuilder()
    .withId(buildNutsCodeIri(spatialUuid))
    .withUuid(spatialUuid)
    .withPrefLabel("A valid spatial with an end date in the future")
    .withNotation("8910")
    .withEndDate(new Date("2222-01-01"));
}

export class SpatialTestBuilder {
  public static readonly PEPINGEN_SPATIAL_UUID = 24123064;
  public static readonly PEPINGEN_SPATIAL_IRI = buildNutsCodeIri(
    SpatialTestBuilder.PEPINGEN_SPATIAL_UUID,
  );
  public static readonly OUD_HEVERLEE_SPATIAL_UUID = 24224086;
  public static readonly OUD_HEVERLEE_SPATIAL_IRI = buildNutsCodeIri(
    SpatialTestBuilder.OUD_HEVERLEE_SPATIAL_UUID,
  );

  private id: Iri;
  private uuid: string;
  private prefLabel: string;
  private notation: string;
  private endDate: Date;

  public withId(id: Iri): SpatialTestBuilder {
    this.id = id;
    return this;
  }

  public withUuid(uuid: string): SpatialTestBuilder {
    this.uuid = uuid;
    return this;
  }

  public withPrefLabel(prefLabel: string): SpatialTestBuilder {
    this.prefLabel = prefLabel;
    return this;
  }

  public withNotation(notation: string): SpatialTestBuilder {
    this.notation = notation;
    return this;
  }

  public withEndDate(endDate: Date): SpatialTestBuilder {
    this.endDate = endDate;
    return this;
  }

  public build(): Spatial {
    return new Spatial(
      this.id,
      this.uuid,
      this.prefLabel,
      this.notation,
      this.endDate,
    );
  }
}
