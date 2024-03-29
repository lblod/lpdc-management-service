import {FormDefinitionFileRepository} from "../../../src/driven/persistence/form-definition-file-repository";
import {Language} from "../../../src/core/domain/language";
import {FormType} from "../../../src/core/domain/types";

describe('form definition file repository it tests', () => {

    const repo = new FormDefinitionFileRepository();

    for(const language of Object.values(Language).filter(l => l !== Language.EN)){
        test(`loads inhoud form in language ${language}`, () => {
            const result = repo.loadFormDefinition(FormType.INHOUD, language, false);
            expect(result).toContain('@prefix form: <http://lblod.data.gift/vocabularies/forms/> .');
            expect(result).toContain(`form:language "${language}";`);
            expect(result).toContain('form:includes ext:titleF;');
            expect(result).not.toContain('<FORMAL_INFORMAL_LANGUAGE>');
        });

        test(`loads inhoud form in language ${language} with english requirement`, () => {
            const result = repo.loadFormDefinition(FormType.INHOUD, language, true);
            expect(result).toContain('@prefix form: <http://lblod.data.gift/vocabularies/forms/> .');
            expect(result).toContain(`form:language "${language}";`);
            expect(result).toContain('form:includes ext:titleF;');
            expect(result).toContain('extEng:titleF \n' +
                '    form:validations');
            expect(result).not.toContain('<FORMAL_INFORMAL_LANGUAGE>');
        });

        test(`loads eigenschappen form in language ${language}`, () => {
            const result = repo.loadFormDefinition(FormType.EIGENSCHAPPEN, language, false);
            expect(result).toContain('@prefix form: <http://lblod.data.gift/vocabularies/forms/> .');
            expect(result).toContain('form:includes ext:productTypeF');
            expect(result).not.toContain('<FORMAL_INFORMAL_LANGUAGE>');
        });
    }

});