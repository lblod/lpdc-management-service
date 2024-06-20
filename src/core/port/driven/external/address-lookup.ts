
export interface AddressLookup {

    fetchMunicipalities(searchString: string): Promise<string[]>;

    fetchStreets(municipality: string, searchString: string): Promise<string[]>;

    findAddressMatch(municipality: string, street: string, houseNumber: string, busNumber: string): Promise<AddressDto | NonNullable<unknown>>;

}

export type AddressDto = {
    gemeente: string;
    postcode: string;
    straat: string;
    huisnummer: string;
    busnummer?: string;
    adressenRegisterId: string;
}