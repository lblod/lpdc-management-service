import {AddressDto, AddressFetcher} from "../../../src/core/port/driven/external/address-fetcher";
import {InvariantError} from "../../../src/core/domain/shared/lpdc-error";
import {AddressTestBuilder} from "../../../test/core/domain/address-test-builder";

export class AdressenRegisterFetcherStub implements AddressFetcher {
    public static readonly INCORRECT_STREETNAME = "incorrect streetname";

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async fetchMunicipalities(searchString: string): Promise<string[]> {
        throw new Error("Method not implemented.");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async fetchStreets(municipality: string, searchString: string): Promise<string[]> {
        throw new Error("Method not implemented.");
    }

    async findAddressMatch(municipality: string, street: string, houseNumber: string, busNumber: string): Promise<NonNullable<unknown> | AddressDto> {
        if (!municipality || !street || !houseNumber) {
            throw new InvariantError('Gemeente, straat and huisnummer zijn verplicht');
        }
        if (street != AdressenRegisterFetcherStub.INCORRECT_STREETNAME) {
            return {
                gemeente: municipality,
                postcode: AddressTestBuilder.POSTCODE,
                straat: street,
                huisnummer: houseNumber,
                busnummer: busNumber,
                adressenRegisterId: AddressTestBuilder.VERWIJST_NAAR.value
            };
        }
        return {};
    }
}
