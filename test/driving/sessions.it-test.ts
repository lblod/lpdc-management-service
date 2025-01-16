import { authenticateAndAuthorizeRequest } from "../../src/driving/sessions";
import { SessionSparqlTestRepository } from "../driven/persistence/session-sparql-test-repository";
import { TEST_SPARQL_ENDPOINT } from "../test.config";
import { buildSessionIri } from "../core/domain/iri-test-builder";
import { uuid } from "../../mu-helper";
import { aSession } from "../core/domain/session-test-builder";
import { Forbidden, Unauthorized } from "../../src/driving/http-error";

describe("authenticateAndAuthorizeRequest", () => {
  const sessionRepository = new SessionSparqlTestRepository(
    TEST_SPARQL_ENDPOINT,
  );

  test("Missing mu-session-id header ,throws Unauthorized error", async () => {
    const req = { headers: {} };
    const next = jest.fn();
    await expect(() =>
      authenticateAndAuthorizeRequest(req, next, sessionRepository),
    ).rejects.toBeInstanceOf(Unauthorized);
  });

  test("When referenced session id in mu-session-id does not exist, throws Unauthorized error", async () => {
    const req = { headers: { "mu-session-id": buildSessionIri(uuid()).value } };
    const next = jest.fn();

    await expect(() =>
      authenticateAndAuthorizeRequest(req, next, sessionRepository),
    ).rejects.toBeInstanceOf(Unauthorized);
  });

  test("When referenced session mu-session-id has no lpdc rights, throws Forbidden error", async () => {
    const sessionWithNoLpdcRights = aSession().withSessionRoles([]).build();
    await sessionRepository.save(sessionWithNoLpdcRights);

    const req = {
      headers: { "mu-session-id": sessionWithNoLpdcRights.id.value },
    };
    const next = jest.fn();

    await expect(() =>
      authenticateAndAuthorizeRequest(req, next, sessionRepository),
    ).rejects.toBeInstanceOf(Forbidden);
    expect(next).not.toHaveBeenCalled();
  });

  test("When referenced session mu-session-id has lpdc rights, dont throw error", async () => {
    const session = aSession().build();
    await sessionRepository.save(session);

    const req = { headers: { "mu-session-id": session.id.value } };
    const next = jest.fn();

    await authenticateAndAuthorizeRequest(req, next, sessionRepository);

    expect(next).toHaveBeenCalled();
  });
});
