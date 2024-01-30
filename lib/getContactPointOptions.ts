import {loadContactPointOption} from "./commonQueries";

//TODO LPDC-1014: move to ContactPoint application service
export async function getContactPointOptions(fieldName: string): Promise<any> {
    const fieldNames = ['telephone', 'email', 'url', 'openingHours'];
    if (fieldNames.includes(fieldName)) {
        return loadContactPointOption(fieldName);
    } else {
        throw new Error('Invalid request: not a valid field name');
    }
}