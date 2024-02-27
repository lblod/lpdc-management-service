import {LegalResourceBuilder} from "../../../src/core/domain/legal-resource";
import {uuid} from "../../../mu-helper";


export function aLegalResourceForConcept(): LegalResourceBuilder {
    return new LegalResourceBuilder()
        .withId(LegalResourceBuilder.buildIri(uuid()))
        .withUuid(uuid())
        .withUrl(LegalResourceTestBuilder.URL)
        .withOrder(1);
}

export function anotherLegalResourceForConcept(): LegalResourceBuilder {
    return new LegalResourceBuilder()
        .withId(LegalResourceBuilder.buildIri(uuid()))
        .withUuid(uuid())
        .withUrl(LegalResourceTestBuilder.ANOTHER_URL)
        .withOrder(1);
}

export class LegalResourceTestBuilder {
    public static readonly URL = 'https://codex.vlaanderen.be/some-codex-page';
    public static readonly ANOTHER_URL = 'https://codex.vlaanderen.be/another-codex-page';
}