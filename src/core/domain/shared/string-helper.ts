import {trim} from "lodash";

export function isNotBlank(str: string): boolean {
    return trim(str).length > 0;
}

export function lastPartAfter(str: string | undefined, separator: string): string | undefined {
    if(str) {
        const segmented = str.split(separator);
        if(segmented.length === 1) {
            return undefined;
        }
        return segmented[segmented.length - 1];
    }
    return undefined;
}