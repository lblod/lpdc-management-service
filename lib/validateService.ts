import {ENABLE_ADDRESS_VALIDATION, FORM_ID_TO_TYPE_MAPPING, FORM_MAPPING_TRANSLATIONS} from '../config';
import ForkingStore from "forking-store";
import * as rdflib from 'rdflib';
import {validateForm} from '@lblod/submission-form-helpers';
import {loadContactPointsAddresses} from "./commonQueries";
import {uniq} from "lodash";
import {FormType} from "../src/core/domain/types";
import {Iri} from "../src/core/domain/shared/iri";
import {Bestuurseenheid} from "../src/core/domain/bestuurseenheid";
import {FormApplicationService} from "../src/core/application/form-application-service";

const FORM = rdflib.Namespace('http://lblod.data.gift/vocabularies/forms/');
const RDF = rdflib.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');

export interface ValidationError {
    formId: string,
    formUri: string,
    message: string,
}

export async function validateService(instanceId: Iri, bestuurseenheid: Bestuurseenheid, formApplicationService: FormApplicationService): Promise<ValidationError[]> {
    const formIds = Object.keys(FORM_ID_TO_TYPE_MAPPING);
    const forms = [];

    for (const formId of formIds) {
        const formType = FORM_ID_TO_TYPE_MAPPING[formId];

        const bundle = await formApplicationService.loadInstanceForm(bestuurseenheid, instanceId, formType);

        forms.push({
            type: formType,
            form: bundle,
            id: formId,
            serviceUri: bundle.serviceUri
        });
    }

    const FORM_GRAPHS = {
        formGraph: new rdflib.NamedNode('http://data.lblod.info/form'),
        metaGraph: new rdflib.NamedNode('http://data.lblod.info/metagraph'),
        sourceGraph: new rdflib.NamedNode(`http://data.lblod.info/sourcegraph`),
    };

    const validationErrors: ValidationError[] = [];
    for (const form of forms) {

        const formStore = new ForkingStore();

        formStore.parse(form.form.form, FORM_GRAPHS.formGraph, 'text/turtle');
        formStore.parse(form.form.meta, FORM_GRAPHS.metaGraph, 'text/turtle');
        formStore.parse(form.form.source, FORM_GRAPHS.sourceGraph, 'text/turtle');

        const submittedResource = new rdflib.NamedNode(form.serviceUri);

        const options = {
            ...FORM_GRAPHS,
            store: formStore,
            sourceNode: submittedResource
        };

        const formUri = formStore.any(
            undefined,
            RDF('type'),
            FORM('Form'),
            FORM_GRAPHS.formGraph
        );

        if (ENABLE_ADDRESS_VALIDATION && form.type === FormType.CONTENT) {
            const addressesAreValid = await validateAddresses(form.serviceUri);
            if (!addressesAreValid) {
                validationErrors.push({
                    formId: form.id,
                    formUri: "http://data.lblod.info/id/forms/" + form.id,
                    message: `Minstens één van de adressen is niet geldig, Gelieve deze te verbeteren!`
                });
            }
        }

        form.validation = validateForm(formUri, options);
        if (!form.validation) {
            validationErrors.push({
                formId: form.id,
                formUri: "http://data.lblod.info/id/forms/" + form.id,
                message: `Er zijn fouten opgetreden in de tab "${FORM_MAPPING_TRANSLATIONS[form.id]}". Gelieve deze te verbeteren!`
            });
        }
    }
    return validationErrors;
}

//TODO LPDC-1014: use domain to validate ...
async function validateAddresses(serviceUri: string): Promise<boolean> {
    const addresses = await loadContactPointsAddresses(serviceUri, {type: 'lpdcExt:InstancePublicService', includeUuid: true});
    if (addresses) {
        const addressUris = uniq(addresses.map(triple => triple.s.value));
        const addressValidation = await Promise.all(addressUris.map(async addressUri => {
            const addressRegisterId = addresses.find(triple => triple.s.value === addressUri && triple.p.value === 'https://data.vlaanderen.be/ns/adres#verwijstNaar')?.o?.value;
            return !!addressRegisterId;
        }));
        return addressValidation.every(value => value === true);
    } else {
        return true;
    }
}
