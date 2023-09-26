import fetch from "node-fetch";


export async function fetchMunicipalities(searchString) {
    const queryParams = new URLSearchParams({
        q: searchString,
        c: 5, // limit (max = 5)
        type: 'Municipality'
    });
    const response = await fetch(`https://geo.api.vlaanderen.be/geolocation/v4/Location?${queryParams}`);
    const result = await response.json();
    return result?.LocationResult?.map(result => result.Municipality) ?? [];
}