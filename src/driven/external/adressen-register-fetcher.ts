import {AddressDto, AddressFetcher} from "../../core/port/driven/external/address-fetcher";
import {InvariantError, NotFoundError, SystemError} from "../../core/domain/shared/lpdc-error";
import {ADRESSEN_REGISTER_API_KEY} from "../../../config";
import {uniq} from "lodash";

export class AdressenRegisterFetcher implements AddressFetcher {

    async fetchMunicipalities(searchString: string): Promise<string[]> {
        const queryParams = new URLSearchParams({
            q: searchString,
            c: '5', // limit (max = 5)
            type: 'Municipality'
        });
        const response = await fetch(`https://geo.api.vlaanderen.be/geolocation/v4/Location?${queryParams}`);
        if (response.ok) {
            const result = await response.json();
            return result?.LocationResult?.map(result => result.Municipality) ?? [];
        } else {
            console.error(await response.text());
            throw new SystemError(`Er is een fout opgetreden bij het bevragen van de Geopunt Vlaanderen API`);
        }
    }

    async fetchStreets(municipality: string, searchString: string): Promise<string[]> {
        const queryParams = new URLSearchParams({
            gemeentenaam: municipality,
            straatnaam: searchString
        });
        const response = await fetch(
            `https://api.basisregisters.vlaanderen.be/v2/adresmatch?${queryParams}`,
            {headers: {'x-api-key': ADRESSEN_REGISTER_API_KEY}}
        );

        if (response.ok) {
            const result = await response.json();
            return uniq(result.adresMatches
                .map(match => match?.straatnaam?.straatnaam?.geografischeNaam?.spelling)
                .filter(match => !!match));
        } else {
            console.error(await response.text());
            throw new SystemError('Er is een fout opgetreden bij het bevragen van het adresregister');
        }
    }

    async findAddressMatch(municipality: string, street: string, houseNumber: string, busNumber: string): Promise<AddressDto | NonNullable<unknown>> {
        if (!municipality || !street || !houseNumber) {
            throw new InvariantError('Gemeente, straat and huisnummer zijn verplicht');
        }

        const postcodes = await this.findPostcodesForMunicipalityAndSubMunicipalities(municipality);
        for (const postcode of postcodes) {
            const addressMatch = await this.tryAddressMatch(municipality, postcode, street, houseNumber, busNumber);
            if (addressMatch) {
                return addressMatch;
            }
        }
        return {};
    }

    private async tryAddressMatch(municipality: string, postcode: string, street: string, houseNumber: string, busNumber?: string) {
        const queryParams = new URLSearchParams({
            gemeentenaam: municipality,
            postcode: postcode,
            straatnaam: street,
            huisnummer: houseNumber,
        });
        if (busNumber) {
            queryParams.set('busnummer', busNumber);
        }
        const response = await fetch(
            `https://api.basisregisters.vlaanderen.be/v2/adresmatch?${queryParams}`,
            {headers: {'x-api-key': ADRESSEN_REGISTER_API_KEY}}
        );

        if (response.ok) {
            const result = await response.json();
            if (result.adresMatches.length && result.adresMatches[0].score === 100) {
                return {
                    gemeente: result.adresMatches[0].gemeente.gemeentenaam.geografischeNaam.spelling,
                    postcode: result.adresMatches[0].postinfo.objectId,
                    straat: result.adresMatches[0].straatnaam.straatnaam.geografischeNaam.spelling,
                    huisnummer: result.adresMatches[0].huisnummer,
                    busnummer: result.adresMatches[0].busnummer,
                    adressenRegisterId: result.adresMatches[0].identificator.id
                };
            } else {
                return undefined;
            }
        } else {
            console.error(await response.text());
            throw new SystemError('Er is een fout opgetreden bij het bevragen van het adresregister');
        }
    }

    private async findPostcodesForMunicipalityAndSubMunicipalities(municipality: string): Promise<string[]> {
        const response = await fetch(
            `https://api.basisregisters.vlaanderen.be/v2/postinfo?gemeentenaam=${municipality}`,
            {headers: {'x-api-key': ADRESSEN_REGISTER_API_KEY}}
        );
        if (response.ok) {
            const result = await response.json();
            if (result.postInfoObjecten.length) {
                return result.postInfoObjecten.map(postInfo => postInfo.identificator.objectId);
            } else {
                throw new NotFoundError(`Kan geen postcode vinden voor de gemeente ${municipality}`);
            }
        } else {
            console.error(await response.text());
            throw new SystemError(('Er is een fout opgetreden bij het bevragen van het adresregister'));
        }

    }

}
