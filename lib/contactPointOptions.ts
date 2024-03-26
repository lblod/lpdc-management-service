import {loadContactPointOption} from "./commonQueries";
import {BadRequest} from "../src/driving/http-error";

//TODO LPDC-1014: move to ContactPoint application service
export async function contactPointOptions(fieldName: string): Promise<any> {
    const fieldNames = ['telephone', 'email', 'url', 'openingHours'];
    if (fieldNames.includes(fieldName)) {
        return loadContactPointOption(fieldName);
    } else {
        throw new BadRequest('Geen geldig veldnaam');
    }
}