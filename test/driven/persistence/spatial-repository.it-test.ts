import { NotFoundError } from "../../../src/core/domain/shared/lpdc-error";
import { aSpatial } from "../../core/domain/spatial-test-builder";
import { TEST_SPARQL_ENDPOINT } from "../../test.config";
import { SpatialSparqlTestRepository } from "./spatial-sparql-test-repository";
import { Iri } from "../../../src/core/domain/shared/iri";

describe("SpatialRepository", () => {
  const repository = new SpatialSparqlTestRepository(TEST_SPARQL_ENDPOINT);

  describe("findById", () => {
    test("it finds a stored spatial given its id", async () => {
      const spatial = aSpatial().build();
      await repository.save(spatial);

      const foundSpatial = await repository.findById(spatial.id);
      expect(foundSpatial).toEqual(spatial);
    });

    test("it finds the correct stored spatial among others given its id", async () => {
      const spatial = aSpatial().build();
      await repository.save(spatial);

      await repository.save(aSpatial().build());
      await repository.save(aSpatial().build());
      await repository.save(aSpatial().build());

      const foundSpatial = await repository.findById(spatial.id);
      expect(foundSpatial).toEqual(spatial);
    });

    test("it finds a stored spatial without end date based on its id", async () => {
      const spatial = aSpatial().withEndDate(undefined).build();
      await repository.save(spatial);

      const foundSpatial = await repository.findById(spatial.id);
      expect(foundSpatial).toEqual(spatial);
    });

    test("it throws an error when an id for a non existing spatial is given", async () => {
      const invalidSpatialId = new Iri("http://SpatialIdThatDoesNotExist");
      await repository.save(aSpatial().build());
      await repository.save(aSpatial().build());
      await repository.save(aSpatial().build());

      await expect(
        repository.findById(invalidSpatialId),
      ).rejects.toThrowWithMessage(
        NotFoundError,
        `No spatial resource found with URI: ${invalidSpatialId}`,
      );
    });
  });
});
