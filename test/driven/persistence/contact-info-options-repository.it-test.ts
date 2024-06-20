import {aBestuurseenheid} from "../../core/domain/bestuurseenheid-test-builder";
import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {BestuurseenheidSparqlTestRepository} from "./bestuurseenheid-sparql-test-repository";
import {aFullInstance} from "../../core/domain/instance-test-builder";
import {
    aFullContactPointForInstance,
    aMinimalContactPointForInstance,
    anotherFullContactPointForInstance
} from "../../core/domain/contact-point-test-builder";
import {InstanceSparqlRepository} from "../../../src/driven/persistence/instance-sparql-repository";
import {
    ContactInfoOptionsSparqlRepository
} from "../../../src/driven/persistence/contact-info-options-sparql-repository";
import {InvariantError} from "../../../src/core/domain/shared/lpdc-error";

describe('contact info options repository', () => {

    const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const instanceRepository = new InstanceSparqlRepository(TEST_SPARQL_ENDPOINT);
    const repository = new ContactInfoOptionsSparqlRepository(TEST_SPARQL_ENDPOINT);

    test('can query contact info options', async () => {
        const bestuurseenheid = aBestuurseenheid().build();
        const anInstance =
            aFullInstance()
                .withContactPoints([
                    aFullContactPointForInstance().build(),
                    anotherFullContactPointForInstance().build()])
                .withCreatedBy(bestuurseenheid.id)
                .build();
        const anotherInstance = aFullInstance()
            .withCreatedBy(bestuurseenheid.id)
            .withContactPoints([
                aMinimalContactPointForInstance()
                    .withUrl("https://uz.be")
                    .withEmail("test@uz.be")
                    .withTelephone("012456456")
                    .withOpeningHours("24/7")
                    .build()])
            .build();
        await bestuurseenheidRepository.save(bestuurseenheid);
        await instanceRepository.save(bestuurseenheid, anInstance);
        await instanceRepository.save(bestuurseenheid, anotherInstance);

        const anotherBestuurseenheid = aBestuurseenheid().build();
        const instanceFromOtherBestuurseenheid = aFullInstance()
            .withCreatedBy(anotherBestuurseenheid.id)
            .withContactPoints([
                aMinimalContactPointForInstance()
                    .withUrl("https://jette.be")
                    .withEmail("test@jette.be")
                    .withTelephone("018456456")
                    .withOpeningHours("alle dagen")
                    .build(),
                aMinimalContactPointForInstance()
                    .withUrl("https://jette.be")
                    .withEmail("test@jette.be")
                    .withTelephone("018456456")
                    .withOpeningHours("alle dagen")
                    .withOrder(2)
                    .build()])
            .build();

        await bestuurseenheidRepository.save(anotherBestuurseenheid);
        await instanceRepository.save(anotherBestuurseenheid, instanceFromOtherBestuurseenheid);

        const telephones = await repository.contactPointOptions(bestuurseenheid, 'telephone');
        expect(telephones).toEqual(["012456456", "016123123", "016456456"]);

        const emails = await repository.contactPointOptions(bestuurseenheid, 'email');
        expect(emails).toEqual(["test@gent.com", "test@leuven.com", "test@uz.be"]);

        const urls = await repository.contactPointOptions(bestuurseenheid, 'url');
        expect(urls).toEqual(["https://gent.be", "https://leuven.be", "https://uz.be"]);

        const openingHours = await repository.contactPointOptions(bestuurseenheid, 'openingHours');
        expect(openingHours).toEqual(["24/7", "Everyday from 09:00 - 17:00", "Everyday from 09:00 - 19:00"]);
    });

    test('invalid field name throws invariant error', async () => {
        const bestuurseenheid = aBestuurseenheid().build();

        await expect(repository.contactPointOptions(bestuurseenheid, 'invalidfieldhandmd')).rejects.toThrowWithMessage(InvariantError, 'Geen geldige veldnaam');
    });

    test('bestuurseenheid is required', async () => {
        await expect(repository.contactPointOptions(undefined, 'telephone')).rejects.toThrowWithMessage(InvariantError, 'bestuurseenheid mag niet ontbreken');
    });
});