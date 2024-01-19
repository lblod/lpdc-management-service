import {NewInstanceDomainService} from "../../../src/core/domain/new-instance-domain-service";
import {InstanceSparqlRepository} from "../../../src/driven/persistence/instance-sparql-repository";
import {aBestuurseenheid} from "./bestuurseenheid-test-builder";
import {buildBestuurseenheidIri, buildSpatialRefNis2019Iri} from "./iri-test-builder";
import {uuid} from "../../../mu-helper";
import {InstanceStatusType} from "../../../src/core/domain/types";
import {InstanceTestBuilder} from "./instance-test-builder";
import {FormatPreservingDate} from "../../../src/core/domain/format-preserving-date";
import {TEST_SPARQL_ENDPOINT} from "../../test.config";

describe('Creating a new Instance domain service', () => {

    const instanceRepository = new InstanceSparqlRepository(TEST_SPARQL_ENDPOINT);
    const newInstanceDomainService = new NewInstanceDomainService(instanceRepository);
    const fixedToday = '2023-12-13T14:23:54.768Z';

    beforeEach(() => {
        jest.useFakeTimers();
        const fixedTodayAsDate = new Date(fixedToday);
        jest.spyOn(global, 'Date').mockImplementation(() => fixedTodayAsDate);
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    test('Create new empty', async () => {
        const spatial1 = buildSpatialRefNis2019Iri(12345);
        const spatial2 = buildSpatialRefNis2019Iri(67890);
        const bestuurseenheid =
            aBestuurseenheid()
                .withId(buildBestuurseenheidIri(uuid()))
                .withSpatials([spatial1, spatial2])
                .build();

        const createdInstance = await newInstanceDomainService.createNewEmpty(bestuurseenheid);

        const reloadedInstance = await instanceRepository.findById(bestuurseenheid, createdInstance.id);

        expect(createdInstance).toEqual(reloadedInstance);
        expect(createdInstance.id).not.toBeUndefined();
        expect(createdInstance.uuid).not.toBeUndefined();

        const expectedInstance =
            new InstanceTestBuilder()
                .withId(createdInstance.id)
                .withUuid(createdInstance.uuid)
                .withCreatedBy(bestuurseenheid.id)
                .withDateCreated(FormatPreservingDate.of(fixedToday))
                .withDateModified(FormatPreservingDate.of(fixedToday))
                .withStatus(InstanceStatusType.ONTWERP)
                .withSpatials([spatial1, spatial2])
                .withCompetentAuthorities([bestuurseenheid.id])
                .withExecutingAuthorities([bestuurseenheid.id])
                .build();
        expect(createdInstance).toEqual(expectedInstance);
        expect(reloadedInstance).toEqual(expectedInstance);
    });

});