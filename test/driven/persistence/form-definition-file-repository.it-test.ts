import {FormDefinitionFileRepository} from "../../../src/driven/persistence/form-definition-file-repository";
import {Language} from "../../../src/core/domain/language";

describe('form definition file repository it tests', () => {

    const repo = new FormDefinitionFileRepository();

    for(const language of Object.values(Language).filter(l => l !== Language.EN)){
        test(`loads content form in language ${language}`, () => {
            const result = repo.loadFormDefinition('cd0b5eba-33c1-45d9-aed9-75194c3728d3', language, false);
            expect(result).toContain('@prefix form: <http://lblod.data.gift/vocabularies/forms/> .');
            expect(result).toContain(`form:language "${language}";`);
            expect(result).toContain('form:includes ext:titleF;');
            expect(result).not.toContain('<FORMAL_INFORMAL_LANGUAGE>');
        });

        test(`loads content form in language ${language} with english requirement`, () => {
            const result = repo.loadFormDefinition('cd0b5eba-33c1-45d9-aed9-75194c3728d3', language, true);
            expect(result).toContain('@prefix form: <http://lblod.data.gift/vocabularies/forms/> .');
            expect(result).toContain(`form:language "${language}";`);
            expect(result).toContain('form:includes ext:titleF;');
            expect(result).toContain('extEng:titleF \n' +
                '    form:validations');
            expect(result).not.toContain('<FORMAL_INFORMAL_LANGUAGE>');
        });

        test(`loads characteristics form in language ${language}`, () => {
            const result = repo.loadFormDefinition('149a7247-0294-44a5-a281-0a4d3782b4fd', language, false);
            expect(result).toContain('@prefix form: <http://lblod.data.gift/vocabularies/forms/> .');
            expect(result).toContain('form:includes ext:productTypeF');
            expect(result).not.toContain('<FORMAL_INFORMAL_LANGUAGE>');
        });
    }

});