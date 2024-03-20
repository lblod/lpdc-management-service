import {trim} from "lodash";

export function isNotBlank(str: string): boolean {
    return trim(str).length > 0;
}