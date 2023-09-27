import fetch from "node-fetch";
import {ADRESSEN_REGISTER_API_KEY} from "../config";


export async function fetchMunicipalities(searchString) {
    const queryParams = new URLSearchParams({
        q: searchString,
        c: 5, // limit (max = 5)
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

export async function fetchStreets(municipality, searchString) {
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