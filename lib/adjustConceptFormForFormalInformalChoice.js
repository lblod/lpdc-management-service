export function adjustConceptFormForFormalInformalChoice(form, chosenForm, conceptLanguages) {
    if (chosenForm === 'informal') {
        if (conceptLanguages.includes('nl-be-x-informal')) {
            return form.replaceAll(`form:language "nl"`, `form:language "nl-be-x-informal"`);
        } else if (conceptLanguages.includes('nl-be-x-generated-informal')) {
            return form.replaceAll(`form:language "nl"`, `form:language "nl-be-x-generated-informal"`);
        } else {
            return form;
        }
    } else {
        if (conceptLanguages.includes('nl-be-x-formal')) {
            return form.replaceAll(`form:language "nl"`, `form:language "nl-be-x-formal"`);
        } else if (conceptLanguages.includes('nl-be-x-generated-formal')) {
            return form.replaceAll(`form:language "nl"`, `form:language "nl-be-x-generated-formal"`);
        } else {
            return form;
        }
    }
}