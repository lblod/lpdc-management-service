import {loadContactPointOption} from "./commonQueries";

export async function getContactPointOptions(fieldName): Promise<any> {
    const fieldNames = ['telephone', 'email', 'url', 'openingHours'];
    if (fieldNames.includes(fieldName)) {
        return loadContactPointOption(fieldName);
    } else {
        throw new Error('Invalid request: not a valid field name');
    }
}