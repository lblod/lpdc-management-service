import fetch from "node-fetch";
import {ADRESSEN_REGISTER_API_KEY} from "../config";


export async function fetchMunicipalities(searchString: string): Promise<string[]> {
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
        console.error(await response.json())
        throw Error(`An error occurred when querying the geopunt vlaanderen api, status code: ${response.status}`);
    }
}

export async function fetchStreets(municipality: string, searchString: string): Promise<string[]> {
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
        return result.adresMatches
            .map(match => match?.straatnaam?.straatnaam?.geografischeNaam?.spelling)
            .filter(match => !!match);
    } else {
        console.error(await response.json())
        throw Error(`An error occurred when querying the address register, status code: ${response.status}`);
    }
}

export async function findAddressMatch(municipality: string, street: string, houseNumber: string, busNumber: string): Promise<AddressDto | {}> {
    if (!municipality || !street || !houseNumber) {
        throw new Error('Invalid request: municipality, street and houseNumber are required');
    }

    const postcode = await findPostcode(municipality);
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
            return {};
        }
    } else {
        console.error(await response.json())
        throw Error(`An error occurred when querying the address register, status code: ${response.status}`);
    }
}

export async function findPostcode(municipality: string): Promise<string> {
    const response = await fetch(
        `https://api.basisregisters.vlaanderen.be/v2/postinfo?gemeentenaam=${municipality}`,
        {headers: {'x-api-key': ADRESSEN_REGISTER_API_KEY}}
    );
    if (response.ok) {
        const result = await response.json();
        if (result.postInfoObjecten.length) {
            return result.postInfoObjecten[0].identificator.objectId;
        } else {
            throw Error(`Can not find postcode for municipality ${municipality}`);
        }
    } else {
        console.error(await response.json())
        throw Error(`An error occurred when querying the address register, status code: ${response.status}`);
    }

}

type AddressDto = {
    gemeente: string;
    postcode: string;
    straat: string;
    huisnummer: string;
    busnummer?: string;
    adressenRegisterId: string;
}