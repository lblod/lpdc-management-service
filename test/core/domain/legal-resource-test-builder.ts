import {LegalResourceBuilder} from "../../../src/core/domain/legal-resource";
import {uuid} from "../../../mu-helper";

export function aMinimalLegalResource(): LegalResourceBuilder {
    return new LegalResourceBuilder()
        .withId(LegalResourceBuilder.buildIri(uuid()))
        .withUuid(uuid())
        .withUrl(undefined)
        .withOrder(1);
}

export function aFullLegalResource(): LegalResourceBuilder {
    return new LegalResourceBuilder()
        .withId(LegalResourceBuilder.buildIri(uuid()))
        .withUuid(uuid())
        .withUrl(LegalResourceTestBuilder.URL)
        .withOrder(1);
}

export function anotherFullLegalResource(): LegalResourceBuilder {
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