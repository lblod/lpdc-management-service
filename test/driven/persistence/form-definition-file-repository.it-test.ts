import {FormDefinitionFileRepository} from "../../../src/driven/persistence/form-definition-file-repository";
import {Language} from "../../../src/core/domain/language";
import {FormType} from "../../../src/core/domain/types";

describe('form definition file repository it tests', () => {

    const repo = new FormDefinitionFileRepository();

    describe('InstanceFormDefinition', () => {

        test('contactpoint is present', () => {
            const result = repo.loadInstanceFormDefinition(FormType.INHOUD, Language.INFORMAL);
            expect(result).toContain('form:includes ext:contactpointsL');
            expect(result).not.toContain('<CONTACTPOINT>');
        });
        test('municipality merger toggle is present', () => {
            const result = repo.loadInstanceFormDefinition(FormType.EIGENSCHAPPEN, Language.INFORMAL);
            expect(result).toContain('form:includes ext:forMunicipalityMergerF');
            expect(result).not.toContain('<MUNICIPALITY_MERGER_FILTER>');
        });

        for (const language of Object.values(Language)) {
        test(`loads inhoud form in language ${language}`, () => {
            const result = repo.loadInstanceFormDefinition(FormType.INHOUD, language);
            expect(result).toContain('@prefix form: <http://lblod.data.gift/vocabularies/forms/> .');
            expect(result).toContain(`form:language "${language}";`);
            expect(result).toContain('form:includes ext:titleF;');
            expect(result).not.toContain('<FORMAL_INFORMAL_LANGUAGE>');
        });

        test(`loads eigenschappen form in language ${language}`, () => {
            const result = repo.loadInstanceFormDefinition(FormType.EIGENSCHAPPEN, language);
            expect(result).toContain('@prefix form: <http://lblod.data.gift/vocabularies/forms/> .');
            expect(result).toContain('form:includes ext:productTypeF');
            expect(result).not.toContain('<FORMAL_INFORMAL_LANGUAGE>');
        });
    }

    });
    describe('ConceptFormDefinition', () => {

        test('contactpoint is not present', () => {
            const result = repo.loadConceptFormDefinition(FormType.INHOUD, Language.INFORMAL);
            expect(result).not.toContain('form:includes ext:contactpointsL');
            expect(result).not.toContain('<CONTACTPOINT>');
        });
        test('municipality merger toggle is not present', () => {
            const result = repo.loadConceptFormDefinition(FormType.EIGENSCHAPPEN, Language.INFORMAL);
            expect(result).not.toContain('form:includes ext:forMunicipalityMergerF');
            expect(result).not.toContain('<MUNICIPALITY_MERGER_FILTER>');
        });
        for (const language of Object.values(Language)) {
            test(`loads inhoud form in language ${language}`, () => {
                const result = repo.loadConceptFormDefinition(FormType.INHOUD, language);
                expect(result).toContain('@prefix form: <http://lblod.data.gift/vocabularies/forms/> .');
                expect(result).toContain(`form:language "${language}";`);
                expect(result).toContain('form:includes ext:titleF;');
                expect(result).not.toContain('<FORMAL_INFORMAL_LANGUAGE>');
            });

            test(`loads eigenschappen form in language ${language}`, () => {
                const result = repo.loadConceptFormDefinition(FormType.EIGENSCHAPPEN, language);
                expect(result).toContain('@prefix form: <http://lblod.data.gift/vocabularies/forms/> .');
                expect(result).toContain('form:includes ext:productTypeF');
                expect(result).not.toContain('<FORMAL_INFORMAL_LANGUAGE>');
            });
        }

    });
});
