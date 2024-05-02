import {aBestuurseenheid} from "../../core/domain/bestuurseenheid-test-builder";
import {Iri} from "../../../src/core/domain/shared/iri";
import {
    InstanceInformalLanguageStringsFetcherIpdc
} from "../../../src/driven/external/instance-informal-language-strings-fetcher-ipdc";
import {LanguageString} from "../../../src/core/domain/language-string";
import {InstanceBuilder} from "../../../src/core/domain/instance";
import {Language} from "../../../src/core/domain/language";
import {FormatPreservingDate} from "../../../src/core/domain/format-preserving-date";
import {InstancePublicationStatusType, InstanceStatusType} from "../../../src/core/domain/types";
import {RequirementBuilder} from "../../../src/core/domain/requirement";
import {EvidenceBuilder} from "../../../src/core/domain/evidence";
import {ProcedureBuilder} from "../../../src/core/domain/procedure";
import {WebsiteBuilder} from "../../../src/core/domain/website";
import {CostBuilder} from "../../../src/core/domain/cost";
import {FinancialAdvantageBuilder} from "../../../src/core/domain/financial-advantage";
import {LegalResourceBuilder} from "../../../src/core/domain/legal-resource";
import {SystemError} from "../../../src/core/domain/shared/lpdc-error";
import {aMinimalWebsiteForInstance} from "../../core/domain/website-test-builder";
import {aMinimalRequirementForInstance} from "../../core/domain/requirement-test-builder";
import {aMinimalProcedureForInstance} from "../../core/domain/procedure-test-builder";
import {aMinimalCostForInstance} from "../../core/domain/cost-test-builder";
import {aMinimalFinancialAdvantageForInstance} from "../../core/domain/financial-advantage-test-builder";
import {aMinimalLegalResourceForConcept} from "../../core/domain/legal-resource-test-builder";
import {aFullInstance} from "../../core/domain/instance-test-builder";
import {TNI_IPDC_AUTHENTICATION_KEY, TNI_IPDC_ENDPOINT} from "../../test.config";
import {graph, isLiteral, literal, Literal, parse, quad, Statement} from "rdflib";
import * as jsonld from 'jsonld';
import {GraphType, ObjectType, PredicateType, SubjectType} from "rdflib/lib/types";

const bestuurseenheid = aBestuurseenheid().build();
const uuid = 'e8843fda-b3a8-4334-905c-8e49eb12203b';
const otherUuid = 'e769dd18-375e-481c-bb3e-436cbfecbac1';
const id = new Iri(`http://data.lblod.info/id/public-service/${uuid}`);
export const instancePublishedOnIpdcTni = new InstanceBuilder()
    .withId(id)
    .withUuid(otherUuid)
    .withCreatedBy(bestuurseenheid.id)
    .withTitle(LanguageString.of(
        "titel en",
        undefined,
        "Volledig ingevulde test om contract tussen ipdc en lpdc te testen"))
    .withDescription(LanguageString.of(
        "<p data-indentation-level=\"0\">beschrijving en</p>",
        undefined,
        "<p data-indentation-level=\"0\">Dit is de hoofding voor een volledig ingevulde test zodat u het contract tussen ipdc en lpdc kan testen</p>"
    ))
    .withAdditionalDescription(LanguageString.of(
        '<p data-indentation-level="0">aanvullende beschrijving en</p>',
        undefined,
        "<p data-indentation-level=\"0\">Dit is de verdere beschrijving voor een volledig ingevulde test zodat u het contract tussen ipdc en lpdc kan testen</p>"
    ))
    .withRegulation(LanguageString.of(
            undefined,
            undefined,
            "<p data-indentation-level=\"0\">Dit zijn de regelgevingen voor een volledig ingevulde test zodat u het contract tussen ipdc en lpdc kan testen</p>"
        )
    )
    .withException(LanguageString.of(
            '<p data-indentation-level="0">uitzonderingen en</p>',
            undefined,
            "<p data-indentation-level=\"0\">Dit zijn de uitzonderingen voor een volledig ingevulde test zodat u het contract tussen ipdc en lpdc kan testen</p>"
        )
    )
    .withStartDate(FormatPreservingDate.of("2024-03-12T12:00:00Z"))
    .withEndDate(FormatPreservingDate.of("2024-09-21T12:00:00Z"))
    .withRequirements([
        new RequirementBuilder()
            .withId(new Iri("http://data.lblod.info/id/requirement/2e24c02e-0de5-4460-8366-1a76514e0407"))
            .withUuid("2e24c02e-0de5-4460-8366-1a76514e0407")
            .withTitle(LanguageString.of(
                    undefined,
                    undefined,
                    "Voorwaarden"
                )
            )
            .withDescription(LanguageString.of(
                    undefined,
                    undefined,
                    "<p data-indentation-level=\"0\">Dit zijn de voorwaarden voor een volledig ingevulde test zodat u het contract tussen ipdc en lpdc kan testen</p>"
                )
            )
            .withEvidence(
                new EvidenceBuilder()
                    .withId(new Iri("http://data.lblod.info/id/evidence/d3ec32ba-4ed5-4072-af39-591b5c232974"))
                    .withUuid("d3ec32ba-4ed5-4072-af39-591b5c232974")
                    .withTitle(LanguageString.of(
                            undefined,
                            undefined,
                            "Bewijs"
                        )
                    )
                    .withDescription(LanguageString.of(
                            undefined,
                            undefined,
                            "<p data-indentation-level=\"0\">Dit zijn de bewijsstukken een volledig ingevulde test zodat u het contract tussen ipdc en lpdc kan testen</p>"
                        )
                    )
                    .build()
            )
            .withOrder(0.0)
            .build()

    ])
    .withProcedures([
        new ProcedureBuilder()
            .withId(new Iri("http://data.lblod.info/id/rule/91e7e795-6d19-4cdd-b039-cc94fb1ccc8f"))
            .withUuid("91e7e795-6d19-4cdd-b039-cc94fb1ccc8f")
            .withTitle(LanguageString.of(
                    undefined,
                    undefined,
                    "Procedure"
                )
            )
            .withDescription(LanguageString.of(
                    undefined,
                    undefined,
                    "<p data-indentation-level=\"0\">Dit is de procedure voor een volledig ingevulde test om zodat u het contract tussen ipdc en lpdc kan testen</p>"
                )
            )
            .withOrder(0)
            .withWebsites([
                new WebsiteBuilder()
                    .withId(new Iri("http://data.lblod.info/id/website/b99e8207-7af5-420e-9d46-d66d7f0a401c"))
                    .withUuid("b99e8207-7af5-420e-9d46-d66d7f0a401c")
                    .withTitle(LanguageString.of(
                            undefined,
                            undefined,
                            "Subsidiereglement Stad Gent voor de financiële ondersteuning van projecten in kunst, cultuur en cultureel erfgoed voor periode 2021-2025"
                        )
                    )
                    .withDescription(undefined)
                    .withUrl("https://stad.gent/nl/reglementen/subsidiereglement-voor-de-financiele-ondersteuning-van-projecten-kunst-cultuur-en-cultureel-erfgoed")
                    .withOrder(0)
                    .build()
                ,
                new WebsiteBuilder()
                    .withId(new Iri("http://data.lblod.info/id/website/a411b281-70b7-42ab-acf4-32e4f1341c53"))
                    .withUuid("a411b281-70b7-42ab-acf4-32e4f1341c53")
                    .withTitle(LanguageString.of(
                            undefined,
                            undefined,
                            "Subsidie verfraaing handelspanden"
                        )
                    )
                    .withDescription(undefined)
                    .withUrl("https://stad.gent/nl/ondernemen/ondersteuning-en-premies-voor-ondernemers/sectoroverschrijdend/subsidie-verfraaiing-handelspand/subsidie-verfraaiing-handelspanden")
                    .withOrder(1)
                    .build()
            ])
            .build()
    ])
    .withWebsites([
        new WebsiteBuilder()
            .withId(new Iri("http://data.lblod.info/id/website/494dee06-d193-422b-9578-c14c2cecd6aa"))
            .withUuid("494dee06-d193-422b-9578-c14c2cecd6aa")
            .withTitle(LanguageString.of(
                    undefined,
                    undefined,
                    "website 1"
                )
            )
            .withDescription(LanguageString.of(
                    undefined,
                    undefined,
                    "<p data-indentation-level=\"0\">website 1 beschrijving</p>"
                )
            )
            .withUrl("https://www.kunlabora.be")
            .withOrder(0)
            .build()
        ,
        new WebsiteBuilder()
            .withId(new Iri("http://data.lblod.info/id/website/16711870-514c-4d64-bc9a-45663d4a6b1d"))
            .withUuid("16711870-514c-4d64-bc9a-45663d4a6b1d")
            .withTitle(LanguageString.of(
                    undefined,
                    undefined,
                    "Starterscontract"
                )
            )
            .withDescription(undefined)
            .withUrl("https://stad.gent/nl/ondernemen/een-onderneming-starten-gent/starterscontract")
            .withOrder(1)
            .build()
    ])
    .withCosts([
        new CostBuilder()
            .withId(new Iri("http://data.lblod.info/id/cost/45a39cc3-2201-4661-9759-9d12dff6065b"))
            .withUuid("45a39cc3-2201-4661-9759-9d12dff6065b")
            .withTitle(LanguageString.of(
                    undefined,
                    undefined,
                    "Dit is de eerste kost voor een volledig ingevulde test zodat u het contract tussen ipdc en lpdc kan testen"
                )
            )
            .withDescription(LanguageString.of(
                    undefined,
                    undefined,
                    "<p data-indentation-level=\"0\">Dit is de beschrijving van de eerste kost voor een volledig ingevulde test zodat u het contract tussen ipdc en lpdc kan testen</p>"
                )
            )
            .withOrder(0)
            .build()
        ,
        new CostBuilder()
            .withId(new Iri("http://data.lblod.info/id/cost/e120e5df-cb2d-4d72-bf9d-48854fd2c748"))
            .withUuid("e120e5df-cb2d-4d72-bf9d-48854fd2c748")
            .withTitle(LanguageString.of(
                    undefined,
                    undefined,
                    "Dit is de tweede kost voor een volledig ingevulde test zodat u het contract tussen ipdc en lpdc kan testen"
                )
            )
            .withDescription(LanguageString.of(
                    undefined,
                    undefined,
                    "<p data-indentation-level=\"0\">Dit is de beschrijving van de tweede kost voor een volledig ingevulde test zodat u het contract tussen ipdc en lpdc kan testen</p>"
                )
            )
            .withOrder(1)
            .build()
    ])
    .withFinancialAdvantages([
        new FinancialAdvantageBuilder()
            .withId(new Iri("http://data.lblod.info/id/financial-advantage/9feda2ec-6bc0-479e-ae8a-2bf73c143bbe"))
            .withUuid("9feda2ec-6bc0-479e-ae8a-2bf73c143bbe")
            .withTitle(LanguageString.of(
                    undefined,
                    undefined,
                    "Dit is het eerste financieel voordeel voor een volledig ingevulde test zodat u het contract tussen ipdc en lpdc kan testen"
                )
            )
            .withDescription(LanguageString.of(
                    undefined,
                    undefined,
                    "<p data-indentation-level=\"0\">Dit is de beschrijving voor de eerste financiele voordelen voor een volledig ingevulde test zodat u het contract tussen ipdc en lpdc kan testen</p>"
                )
            )
            .withOrder(0)
            .build()
        ,
        new FinancialAdvantageBuilder()
            .withId(new Iri("http://data.lblod.info/id/financial-advantage/d97330de-8110-4fd3-ab68-76e22d71dd39"))
            .withUuid("d97330de-8110-4fd3-ab68-76e22d71dd39")
            .withTitle(LanguageString.of(
                    undefined,
                    undefined,
                    "Dit is het tweede financieel voordeel voor een volledig ingevulde test zodat u het contract tussen ipdc en lpdc kan testen"
                )
            )
            .withDescription(LanguageString.of(
                    undefined,
                    undefined,
                    "<p data-indentation-level=\"0\">Dit is de beschrijving voor de tweede financiele voordelen voor een volledig ingevulde test zodat u het contract tussen ipdc en lpdc kan testen</p>"
                )
            )
            .withOrder(1)
            .build()

    ])
    .withLegalResources([
        new LegalResourceBuilder()
            .withId(new Iri("http://data.lblod.info/id/public-service/17f01e3a-3d4a-4492-8989-b0c9e17ff990"))
            .withUuid("17f01e3a-3d4a-4492-8989-b0c9e17ff990")
            .withTitle(LanguageString.of(
                    undefined,
                    undefined,
                    "regelgeving titel"
                )
            )
            .withDescription(LanguageString.of(
                    undefined,
                    undefined,
                    "<p data-indentation-level=\"0\">regelgeving titel</p>"
                )
            )
            .withUrl("https://codex.vlaanderen.be/Zoeken/Document.aspx?DID=1026320&param=informatie&ref=search&AVIDS=1281445")
            .withOrder(0)
            .build()
        ,
        new LegalResourceBuilder()
            .withId(new Iri("http://data.lblod.info/id/public-service/75d1ef7f-d31c-4432-8f64-7a5bd4756db3"))
            .withUuid("75d1ef7f-d31c-4432-8f64-7a5bd4756db3")
            .withTitle(LanguageString.of(
                    undefined,
                    undefined,
                    "regelgeving 2"
                )
            )
            .withDescription(LanguageString.of(
                    undefined,
                    undefined,
                    "<p data-indentation-level=\"0\">regelgeving 2 bescrhijving</p>"
                )
            )
            .withUrl("https://codex.vlaanderen.be/Zoeken/Document.aspx?DID=1039211&param=informatie&ref=search&AVIDS=")
            .withOrder(1)
            .build()
    ])
    .withDutchLanguageVariant(Language.FORMAL)
    .withNeedsConversionFromFormalToInformal(true)
    .withDateCreated(FormatPreservingDate.of("2024-04-24T14:01:09.807Z"))
    .withDateModified(FormatPreservingDate.of("2024-04-24T14:09:32.778Z"))
    .withDateSent(FormatPreservingDate.of("2024-04-24T14:09:45.773Z"))
    .withDatePublished(FormatPreservingDate.of("2024-04-24T14:10:00.72350311Z"))
    .withStatus(InstanceStatusType.VERSTUURD)
    .withPublicationStatus(InstancePublicationStatusType.GEPUBLICEERD).build();

describe('Instance informal language strings fetcher ipdc', () => {

    const ipdcFetcher = new InstanceInformalLanguageStringsFetcherIpdc(TNI_IPDC_ENDPOINT, TNI_IPDC_AUTHENTICATION_KEY);

    const expectedInstance = InstanceBuilder.from(instancePublishedOnIpdcTni)
        .withTitle(LanguageString.of(
            "titel en",
            undefined,
            "Volledig ingevulde test om contract tussen ipdc en lpdc te testen"))
        .withDescription(LanguageString.of(
            "<p data-indentation-level=\"0\">beschrijving en</p>",
            undefined,
            "<p data-indentation-level=\"0\">Dit is de hoofding voor een volledig ingevulde test zodat je het contract tussen ipdc en lpdc kan testen</p>"
        ))
        .withAdditionalDescription(LanguageString.of(
            '<p data-indentation-level="0">aanvullende beschrijving en</p>',
            undefined,

            "<p data-indentation-level=\"0\">Dit is de verdere beschrijving voor een volledig ingevulde test zodat je het contract tussen ipdc en lpdc kan testen</p>"
        ))
        .withRegulation(LanguageString.of(
                undefined,
                undefined,
                "<p data-indentation-level=\"0\">Dit zijn de regelgevingen voor een volledig ingevulde test zodat je het contract tussen ipdc en lpdc kan testen</p>"
            )
        )
        .withException(LanguageString.of(
                '<p data-indentation-level="0">uitzonderingen en</p>',
                undefined,
                "<p data-indentation-level=\"0\">Dit zijn de uitzonderingen voor een volledig ingevulde test zodat je het contract tussen ipdc en lpdc kan testen</p>"
            )
        )
        .withRequirements([
            new RequirementBuilder()
                .withId(new Iri("http://data.lblod.info/id/requirement/2e24c02e-0de5-4460-8366-1a76514e0407"))
                .withUuid("2e24c02e-0de5-4460-8366-1a76514e0407")
                .withTitle(LanguageString.of(
                        undefined,
                        undefined,
                        "Voorwaarden"
                    )
                )
                .withDescription(LanguageString.of(
                        undefined,
                        undefined,
                        "<p data-indentation-level=\"0\">Dit zijn de voorwaarden voor een volledig ingevulde test zodat je het contract tussen ipdc en lpdc kan testen</p>"
                    )
                )
                .withEvidence(
                    new EvidenceBuilder()
                        .withId(new Iri("http://data.lblod.info/id/evidence/d3ec32ba-4ed5-4072-af39-591b5c232974"))
                        .withUuid("d3ec32ba-4ed5-4072-af39-591b5c232974")
                        .withTitle(LanguageString.of(
                                undefined,
                                undefined,
                                "Bewijs"
                            )
                        )
                        .withDescription(LanguageString.of(
                                undefined,
                                undefined,
                                "<p data-indentation-level=\"0\">Dit zijn de bewijsstukken een volledig ingevulde test zodat je het contract tussen ipdc en lpdc kan testen</p>"
                            )
                        )
                        .build()
                )
                .withOrder(0.0)
                .build()

        ])
        .withProcedures([
            new ProcedureBuilder()
                .withId(new Iri("http://data.lblod.info/id/rule/91e7e795-6d19-4cdd-b039-cc94fb1ccc8f"))
                .withUuid("91e7e795-6d19-4cdd-b039-cc94fb1ccc8f")
                .withTitle(LanguageString.of(
                        undefined,
                        undefined,
                        "Procedure"
                    )
                )
                .withDescription(LanguageString.of(
                        undefined,
                        undefined,
                        "<p data-indentation-level=\"0\">Dit is de procedure voor een volledig ingevulde test om zodat je het contract tussen ipdc en lpdc kan testen</p>"
                    )
                )
                .withOrder(0)
                .withWebsites([
                    new WebsiteBuilder()
                        .withId(new Iri("http://data.lblod.info/id/website/b99e8207-7af5-420e-9d46-d66d7f0a401c"))
                        .withUuid("b99e8207-7af5-420e-9d46-d66d7f0a401c")
                        .withTitle(LanguageString.of(
                                undefined,
                                undefined,
                                "Subsidiereglement Stad Gent voor de financiële ondersteuning van projecten in kunst, cultuur en cultureel erfgoed voor periode 2021-2025"
                            )
                        )
                        .withDescription(undefined)
                        .withUrl("https://stad.gent/nl/reglementen/subsidiereglement-voor-de-financiele-ondersteuning-van-projecten-kunst-cultuur-en-cultureel-erfgoed")
                        .withOrder(0)
                        .build()
                    ,
                    new WebsiteBuilder()
                        .withId(new Iri("http://data.lblod.info/id/website/a411b281-70b7-42ab-acf4-32e4f1341c53"))
                        .withUuid("a411b281-70b7-42ab-acf4-32e4f1341c53")
                        .withTitle(LanguageString.of(
                                undefined,
                                undefined,
                                "Subsidie verfraaing handelspanden"
                            )
                        )
                        .withDescription(undefined)
                        .withUrl("https://stad.gent/nl/ondernemen/ondersteuning-en-premies-voor-ondernemers/sectoroverschrijdend/subsidie-verfraaiing-handelspand/subsidie-verfraaiing-handelspanden")
                        .withOrder(1)
                        .build()
                ])
                .build()
        ])
        .withWebsites([
            new WebsiteBuilder()
                .withId(new Iri("http://data.lblod.info/id/website/494dee06-d193-422b-9578-c14c2cecd6aa"))
                .withUuid("494dee06-d193-422b-9578-c14c2cecd6aa")
                .withTitle(LanguageString.of(
                        undefined,
                        undefined,
                        "website 1"
                    )
                )
                .withDescription(LanguageString.of(
                        undefined,
                        undefined,
                        "<p data-indentation-level=\"0\">website 1 beschrijving</p>"
                    )
                )
                .withUrl("https://www.kunlabora.be")
                .withOrder(0)
                .build()
            ,
            new WebsiteBuilder()
                .withId(new Iri("http://data.lblod.info/id/website/16711870-514c-4d64-bc9a-45663d4a6b1d"))
                .withUuid("16711870-514c-4d64-bc9a-45663d4a6b1d")
                .withTitle(LanguageString.of(
                        undefined,
                        undefined,
                        "Starterscontract"
                    )
                )
                .withDescription(undefined)
                .withUrl("https://stad.gent/nl/ondernemen/een-onderneming-starten-gent/starterscontract")
                .withOrder(1)
                .build()
        ])
        .withCosts([
            new CostBuilder()
                .withId(new Iri("http://data.lblod.info/id/cost/45a39cc3-2201-4661-9759-9d12dff6065b"))
                .withUuid("45a39cc3-2201-4661-9759-9d12dff6065b")
                .withTitle(LanguageString.of(
                        undefined,
                        undefined,
                        "Dit is de eerste kost voor een volledig ingevulde test zodat je het contract tussen ipdc en lpdc kan testen"
                    )
                )
                .withDescription(LanguageString.of(
                        undefined,
                        undefined,
                        "<p data-indentation-level=\"0\">Dit is de beschrijving van de eerste kost voor een volledig ingevulde test zodat je het contract tussen ipdc en lpdc kan testen</p>"
                    )
                )
                .withOrder(0)
                .build()
            ,
            new CostBuilder()
                .withId(new Iri("http://data.lblod.info/id/cost/e120e5df-cb2d-4d72-bf9d-48854fd2c748"))
                .withUuid("e120e5df-cb2d-4d72-bf9d-48854fd2c748")
                .withTitle(LanguageString.of(
                        undefined,
                        undefined,
                        "Dit is de tweede kost voor een volledig ingevulde test zodat je het contract tussen ipdc en lpdc kan testen"
                    )
                )
                .withDescription(LanguageString.of(
                        undefined,
                        undefined,
                        "<p data-indentation-level=\"0\">Dit is de beschrijving van de tweede kost voor een volledig ingevulde test zodat je het contract tussen ipdc en lpdc kan testen</p>"
                    )
                )
                .withOrder(1)
                .build()
        ])
        .withFinancialAdvantages([
            new FinancialAdvantageBuilder()
                .withId(new Iri("http://data.lblod.info/id/financial-advantage/9feda2ec-6bc0-479e-ae8a-2bf73c143bbe"))
                .withUuid("9feda2ec-6bc0-479e-ae8a-2bf73c143bbe")
                .withTitle(LanguageString.of(
                        undefined,
                        undefined,
                        "Dit is het eerste financieel voordeel voor een volledig ingevulde test zodat je het contract tussen ipdc en lpdc kan testen"
                    )
                )
                .withDescription(LanguageString.of(
                        undefined,
                        undefined,
                        "<p data-indentation-level=\"0\">Dit is de beschrijving voor de eerste financiele voordelen voor een volledig ingevulde test zodat je het contract tussen ipdc en lpdc kan testen</p>"
                    )
                )
                .withOrder(0)
                .build()
            ,
            new FinancialAdvantageBuilder()
                .withId(new Iri("http://data.lblod.info/id/financial-advantage/d97330de-8110-4fd3-ab68-76e22d71dd39"))
                .withUuid("d97330de-8110-4fd3-ab68-76e22d71dd39")
                .withTitle(LanguageString.of(
                        undefined,
                        undefined,
                        "Dit is het tweede financieel voordeel voor een volledig ingevulde test zodat je het contract tussen ipdc en lpdc kan testen"
                    )
                )
                .withDescription(LanguageString.of(
                        undefined,
                        undefined,
                        "<p data-indentation-level=\"0\">Dit is de beschrijving voor de tweede financiele voordelen voor een volledig ingevulde test zodat je het contract tussen ipdc en lpdc kan testen</p>"
                    )
                )
                .withOrder(1)
                .build()

        ])
        .withLegalResources([
            new LegalResourceBuilder()
                .withId(new Iri("http://data.lblod.info/id/public-service/17f01e3a-3d4a-4492-8989-b0c9e17ff990"))
                .withUuid("17f01e3a-3d4a-4492-8989-b0c9e17ff990")
                .withTitle(LanguageString.of(
                        undefined,
                        undefined,
                        "regelgeving titel"
                    )
                )
                .withDescription(LanguageString.of(
                        undefined,
                        undefined,
                        "<p data-indentation-level=\"0\">regelgeving titel</p>"
                    )
                )
                .withUrl("https://codex.vlaanderen.be/Zoeken/Document.aspx?DID=1026320&param=informatie&ref=search&AVIDS=1281445")
                .withOrder(0)
                .build()
            ,
            new LegalResourceBuilder()
                .withId(new Iri("http://data.lblod.info/id/public-service/75d1ef7f-d31c-4432-8f64-7a5bd4756db3"))
                .withUuid("75d1ef7f-d31c-4432-8f64-7a5bd4756db3")
                .withTitle(LanguageString.of(
                        undefined,
                        undefined,
                        "regelgeving 2"
                    )
                )
                .withDescription(LanguageString.of(
                        undefined,
                        undefined,
                        "<p data-indentation-level=\"0\">regelgeving 2 bescrhijving</p>"
                    )
                )
                .withUrl("https://codex.vlaanderen.be/Zoeken/Document.aspx?DID=1039211&param=informatie&ref=search&AVIDS=")
                .withOrder(1)
                .build()
        ]).build();


    test('informal values are parsed into the original dutchLanguage variant', async () => {
        const mappedInstance = await ipdcFetcher.fetchInstanceAndMap(bestuurseenheid, instancePublishedOnIpdcTni);

        expect(mappedInstance).toEqual(expectedInstance);
    });

    test('when receiving an instance with a missing value, throw error', async () => {
        const instance = InstanceBuilder.from(instancePublishedOnIpdcTni).withDescription(undefined).build();
        await expect(ipdcFetcher.fetchInstanceAndMap(bestuurseenheid, instance)).rejects.toThrowWithMessage(SystemError, `De nieuwe en initiële waarde moeten beiden aanwezig of afwezig zijn nieuw[{"_en":"<p data-indentation-level=\\"0\\">beschrijving en</p>","_nl":"<p data-indentation-level=\\"0\\">Dit is de hoofding voor een volledig ingevulde test zodat u het contract tussen ipdc en lpdc kan testen</p>","_nlFormal":"<p data-indentation-level=\\"0\\">Dit is de hoofding voor een volledig ingevulde test zodat u het contract tussen ipdc en lpdc kan testen</p>","_nlGeneratedInformal":"<p data-indentation-level=\\"0\\">Dit is de hoofding voor een volledig ingevulde test zodat je het contract tussen ipdc en lpdc kan testen</p>"}], initial[undefined], dutchLanguage[nl-be-x-formal]`);
    });

    test('when instance is not found, throw error', async () => {
        const unexistingInstance = aFullInstance().withCreatedBy(bestuurseenheid.id).build();
        await expect(ipdcFetcher.fetchInstanceAndMap(bestuurseenheid, unexistingInstance)).rejects.toThrowWithMessage(SystemError, `Instantie ${unexistingInstance.id} niet gevonden bij ipdc`);
    });

    describe('Requirement', () => {
        test('When receiving a missing requirement, throw error', async () => {
            const instance = InstanceBuilder.from(instancePublishedOnIpdcTni).withRequirements([]).build();

            await expect(ipdcFetcher.fetchInstanceAndMap(bestuurseenheid, instance)).rejects.toThrowWithMessage(SystemError, "Het aantal voorwaarden van ipdc is niet gelijk aan het aantal originele voorwaarden");
        });

        test('When receiving an additional requirement, throw error', async () => {
            const additionalRequirement = aMinimalRequirementForInstance().withOrder(1).build();
            const newRequirements = [...instancePublishedOnIpdcTni.requirements, additionalRequirement];

            const instance = InstanceBuilder.from(instancePublishedOnIpdcTni).withRequirements(newRequirements).build();

            await expect(ipdcFetcher.fetchInstanceAndMap(bestuurseenheid, instance)).rejects.toThrowWithMessage(SystemError, "Het aantal voorwaarden van ipdc is niet gelijk aan het aantal originele voorwaarden");
        });

        test('when receiving a missing evidence in a requirement, throw error', async () => {
            const requirements = instancePublishedOnIpdcTni.requirements;
            requirements[0] = RequirementBuilder.from(requirements[0]).withEvidence(undefined).build();

            const instance = InstanceBuilder.from(instancePublishedOnIpdcTni).withRequirements(requirements).build();
            await expect(ipdcFetcher.fetchInstanceAndMap(bestuurseenheid, instance)).rejects.toThrowWithMessage(SystemError, "Het bewijs van ipdc is niet gelijk aan het originele bewijs");
        });

    });

    describe('Procedure', () => {
        test('When receiving a missing procedure, throw error', async () => {
            const instance = InstanceBuilder.from(instancePublishedOnIpdcTni).withProcedures([]).build();

            await expect(ipdcFetcher.fetchInstanceAndMap(bestuurseenheid, instance)).rejects.toThrowWithMessage(SystemError, "Het aantal procedures van ipdc is niet gelijk aan het aantal originele procedures");
        });

        test('When receiving an additional procedure, throw error', async () => {
            const additionalProcedure = aMinimalProcedureForInstance().withOrder(1).build();
            const newProcedures = [...instancePublishedOnIpdcTni.procedures, additionalProcedure];

            const instance = InstanceBuilder.from(instancePublishedOnIpdcTni).withProcedures(newProcedures).build();

            await expect(ipdcFetcher.fetchInstanceAndMap(bestuurseenheid, instance)).rejects.toThrowWithMessage(SystemError, "Het aantal procedures van ipdc is niet gelijk aan het aantal originele procedures");
        });

        test('when receiving a missing website in a procedure, throw error', async () => {
            const procedures = instancePublishedOnIpdcTni.procedures;
            procedures[0] = ProcedureBuilder.from(procedures[0]).withWebsites([new WebsiteBuilder()
                .withId(new Iri("http://data.lblod.info/id/website/b99e8207-7af5-420e-9d46-d66d7f0a401c"))
                .withUuid("b99e8207-7af5-420e-9d46-d66d7f0a401c")
                .withTitle(LanguageString.of(
                        undefined,
                        undefined,
                        "Subsidiereglement Stad Gent voor de financiële ondersteuning van projecten in kunst, cultuur en cultureel erfgoed voor periode 2021-2025"
                    )
                )
                .withDescription(undefined)
                .withUrl("https://stad.gent/nl/reglementen/subsidiereglement-voor-de-financiele-ondersteuning-van-projecten-kunst-cultuur-en-cultureel-erfgoed")
                .withOrder(0)
                .build()]).build();

            const instance = InstanceBuilder.from(instancePublishedOnIpdcTni).withProcedures(procedures).build();
            await expect(ipdcFetcher.fetchInstanceAndMap(bestuurseenheid, instance)).rejects.toThrowWithMessage(SystemError, "Het aantal websites van ipdc is niet gelijk aan het aantal originele websites");
        });

        test('when receiving an additional website in a procedure, throw error', async () => {
            const procedures = instancePublishedOnIpdcTni.procedures;
            const additionalWebsite = aMinimalWebsiteForInstance().withOrder(2).build();
            procedures[0] = ProcedureBuilder.from(procedures[0]).withWebsites([...procedures[0].websites, additionalWebsite]).build();

            const instance = InstanceBuilder.from(instancePublishedOnIpdcTni).withProcedures(procedures).build();
            await expect(ipdcFetcher.fetchInstanceAndMap(bestuurseenheid, instance)).rejects.toThrowWithMessage(SystemError, "Het aantal websites van ipdc is niet gelijk aan het aantal originele websites");
        });
    });

    describe('Websites', () => {
        test('When receiving a missing website, throw error', async () => {
            const instance = InstanceBuilder.from(instancePublishedOnIpdcTni).withWebsites([]).build();

            await expect(ipdcFetcher.fetchInstanceAndMap(bestuurseenheid, instance)).rejects.toThrowWithMessage(SystemError, "Het aantal websites van ipdc is niet gelijk aan het aantal originele websites");
        });
        test('when receiving an additional website, throw error', async () => {
            const additionalWebsite = aMinimalWebsiteForInstance().withOrder(2).build();

            const newWebsites = [...instancePublishedOnIpdcTni.websites, additionalWebsite];

            const instance = InstanceBuilder.from(instancePublishedOnIpdcTni).withWebsites(newWebsites).build();
            await expect(ipdcFetcher.fetchInstanceAndMap(bestuurseenheid, instance)).rejects.toThrowWithMessage(SystemError, "Het aantal websites van ipdc is niet gelijk aan het aantal originele websites");
        });
    });

    describe('Costs', () => {
        test('When receiving a missing cost, throw error', async () => {
            const instance = InstanceBuilder.from(instancePublishedOnIpdcTni).withCosts([]).build();

            await expect(ipdcFetcher.fetchInstanceAndMap(bestuurseenheid, instance)).rejects.toThrowWithMessage(SystemError, "Het aantal kosten van ipdc is niet gelijk aan het aantal originele kosten");
        });

        test('when receiving an additional cost, throw error', async () => {
            const additionalCost = aMinimalCostForInstance().withOrder(2).build();

            const newCosts = [...instancePublishedOnIpdcTni.costs, additionalCost];

            const instance = InstanceBuilder.from(instancePublishedOnIpdcTni).withCosts(newCosts).build();
            await expect(ipdcFetcher.fetchInstanceAndMap(bestuurseenheid, instance)).rejects.toThrowWithMessage(SystemError, "Het aantal kosten van ipdc is niet gelijk aan het aantal originele kosten");
        });
    });

    describe('Financial advantages', () => {
        test('When receiving a missing financial advantage, throw error', async () => {
            const instance = InstanceBuilder.from(instancePublishedOnIpdcTni).withFinancialAdvantages([]).build();

            await expect(ipdcFetcher.fetchInstanceAndMap(bestuurseenheid, instance)).rejects.toThrowWithMessage(SystemError, "Het aantal financiele voordelen van ipdc is niet gelijk aan het aantal originele financiele voordelen");
        });

        test('when receiving an additional financial advantage, throw error', async () => {
            const additionalFinancialAdvantage = aMinimalFinancialAdvantageForInstance().withOrder(2).build();

            const newFinancialAdvantages = [...instancePublishedOnIpdcTni.financialAdvantages, additionalFinancialAdvantage];

            const instance = InstanceBuilder.from(instancePublishedOnIpdcTni).withFinancialAdvantages(newFinancialAdvantages).build();
            await expect(ipdcFetcher.fetchInstanceAndMap(bestuurseenheid, instance)).rejects.toThrowWithMessage(SystemError, "Het aantal financiele voordelen van ipdc is niet gelijk aan het aantal originele financiele voordelen");
        });
    });

    describe('Legal resources', () => {
        test('When receiving a missing legal resource, throw error', async () => {
            const instance = InstanceBuilder.from(instancePublishedOnIpdcTni).withLegalResources([]).build();

            await expect(ipdcFetcher.fetchInstanceAndMap(bestuurseenheid, instance)).rejects.toThrowWithMessage(SystemError, "Het aantal regelgevingen van ipdc is niet gelijk aan het aantal originele regelgevingen");
        });

        test('when receiving an additional legal resource, throw error', async () => {
            const additionalLegalResource = aMinimalLegalResourceForConcept().withOrder(2).build();

            const newLegalResources = [...instancePublishedOnIpdcTni.legalResources, additionalLegalResource];

            const instance = InstanceBuilder.from(instancePublishedOnIpdcTni).withLegalResources(newLegalResources).build();
            await expect(ipdcFetcher.fetchInstanceAndMap(bestuurseenheid, instance)).rejects.toThrowWithMessage(SystemError, "Het aantal regelgevingen van ipdc is niet gelijk aan het aantal originele regelgevingen");
        });
    });

    test('parse to quads and compact using json-ld context', async () => {
        const jsonLdData = `[
  {
    "@id": "http://data.lblod.info/id/public-service/b87f3578-4dea-4425-a737-6374d49a4b3a",
    "@type": [
      "https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService"
    ],
    "http://data.europa.eu/m8g/hasCompetentAuthority": [
      {
        "@id": "http://data.lblod.info/id/bestuurseenheden/0855d794d31887234a3edfede8cc68dbe7a177c9beba03c884d443177e9d5287"
      }
    ],
    "http://mu.semte.ch/vocabularies/core/uuid": [
      {
        "@value": "b87f3578-4dea-4425-a737-6374d49a4b3a"
      }
    ],
    "http://purl.org/dc/terms/description": [
      {
        "@language": "nl-be-x-formal",
        "@value": "<p data-indentation-level=\\"0\\">b</p>"
      }
    ],
    "http://purl.org/dc/terms/spatial": [
      {
        "@id": "http://data.europa.eu/nuts/code/BE21"
      }
    ],
    "http://purl.org/dc/terms/title": [
      {
        "@language": "nl-be-x-formal",
        "@value": "a"
      }
    ],
    "http://purl.org/pav/createdBy": [
      {
        "@id": "http://data.lblod.info/id/bestuurseenheden/0855d794d31887234a3edfede8cc68dbe7a177c9beba03c884d443177e9d5287"
      }
    ],
    "http://schema.org/dateCreated": [
      {
        "@type": "http://www.w3.org/2001/XMLSchema#dateTime",
        "@value": "2024-04-30T11:02:38.043Z"
      }
    ],
    "http://schema.org/dateModified": [
      {
        "@type": "http://www.w3.org/2001/XMLSchema#dateTime",
        "@value": "2024-04-30T11:02:44.701Z"
      }
    ],
    "http://schema.org/dateSent": [
      {
        "@type": "http://www.w3.org/2001/XMLSchema#dateTime",
        "@value": "2024-04-30T11:02:44.699Z"
      }
    ],
    "http://www.w3.org/ns/adms#status": [
      {
        "@id": "http://lblod.data.gift/concepts/instance-status/verstuurd"
      }
    ],
    "https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#dutchLanguageVariant": [
      {
        "@value": "nl-be-x-formal"
      }
    ],
    "https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasExecutingAuthority": [
      {
        "@id": "http://data.lblod.info/id/bestuurseenheden/0855d794d31887234a3edfede8cc68dbe7a177c9beba03c884d443177e9d5287"
      }
    ],
    "https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#needsConversionFromFormalToInformal": [
      {
        "@type": "http://www.w3.org/2001/XMLSchema#boolean",
        "@value": "0"
      }
    ]
  }
]`;

        const context = JSON.parse(`{
  "@context": {
    "instantieNs": "https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#",
    "dct": "http://purl.org/dc/terms/",
    "purlCpsv": "http://purl.org/vocab/cpsv#",
    "prov": "http://www.w3.org/ns/prov#",
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "deu": "http://data.europa.eu/m8g/",
    "deuOntology": "http://data.europa.eu/eli/ontology#",
    "locn": "http://www.w3.org/ns/locn#",
    "sch": "http://schema.org/",
    "ldes": "https://w3id.org/ldes#",
    "tree": "https://w3id.org/tree#",
    "hydra": "http://www.w3.org/ns/hydra/core#",
    "sh": "http://www.w3.org/ns/shacl#",
    "InstancePublicService": "instantieNs:InstancePublicService",
    "InstancePublicServiceSnapshot": "instantieNs:InstancePublicServiceSnapshot",
    "dtv": "https://data.vlaanderen.be/ns/",
    "order": {
      "@id": "sh:order"
    },
    "productnummer": {
      "@id": "sch:productID",
      "@type": "xsd:string"
    },
    "generatedAtTime": {
      "@id": "prov:generatedAtTime",
      "@type": "xsd:dateTime"
    },
    "isVersionOf": {
      "@id": "dct:isVersionOf",
      "@type": "@id"
    },
    "snapshotType": {
      "@id": "instantieNs:snapshotType",
      "@type": "@id",
      "@context": {
        "@base": "https://productencatalogus.data.vlaanderen.be/id/concept/SnapshotType/"
      }
    },
    "bevoegdBestuursniveaus": {
      "@id": "instantieNs:competentAuthorityLevel",
      "@container": "@set",
      "@type": "@id",
      "@context": {
        "@base": "https://productencatalogus.data.vlaanderen.be/id/concept/BevoegdBestuursniveau/"
      }
    },
    "uitvoerendBestuursniveaus": {
      "@id": "instantieNs:executingAuthorityLevel",
      "@container": "@set",
      "@type": "@id",
      "@context": {
        "@base": "https://productencatalogus.data.vlaanderen.be/id/concept/UitvoerendBestuursniveau/"
      }
    },
    "naam": {
      "@id": "dct:title",
      "@container": "@language"
    },
    "verdereBeschrijving": {
      "@id": "instantieNs:additionalDescription",
      "@container": "@language"
    },
    "beschrijving": {
      "@id": "dct:description",
      "@container": "@language"
    },
    "eindeDienstVerlening": {
      "@id": "sch:endDate",
      "@type": "xsd:dateTime"
    },
    "uitzonderingen": {
      "@id": "instantieNs:exception",
      "@container": "@language"
    },
    "url": {
      "@id": "sch:url"
    },
    "procedures": {
      "@id": "http://purl.org/vocab/cpsv#follows",
      "@container": "@set",
      "@context": {
        "websites": {
          "@id": "instantieNs:hasWebsite",
          "@container": "@set"
        }
      }
    },
    "procedure": {
      "@id": "purlCpsv:Rule"
    },
    "bevoegdeOverheden": {
      "@id": "deu:hasCompetentAuthority",
      "@container": "@set",
      "@context": {
        "id": "@id",
        "@base": "https://data.vlaanderen.be/id/organisatie/"
      }
    },
    "contactgegevens": {
      "@container": "@set",
      "@id": "deu:hasContactPoint"
    },
    "contact": {
      "@id": "sch:ContactPoint"
    },
    "kosten": {
      "@id": "deu:hasCost",
      "@container": "@set"
    },
    "kost": {
      "@id": "deu:Cost"
    },
    "uitvoerendeOverheden": {
      "@id": "instantieNs:hasExecutingAuthority",
      "@container": "@set",
      "@context": {
        "id": "@id",
        "@base": "https://data.vlaanderen.be/id/organisatie/"
      }
    },
    "regelgeving": {
      "@container": "@set",
      "@id": "deu:hasLegalResource",
      "@context": {
        "id": "sch:url"
      }
    },
    "regel": {
      "@id": "deuOntology:LegalResource"
    },
    "websites": {
      "@container": "@set",
      "@id": "http://www.w3.org/2000/01/rdf-schema#seeAlso"
    },
    "website": {
      "@id": "sch:WebSite"
    },
    "voorwaarden": {
      "@id": "http://vocab.belgif.be/ns/publicservice#hasRequirement",
      "@container": "@set",
      "@context": {
        "bewijs": {
          "@id": "deu:hasSupportingEvidence"
        }
      }
    },
    "voorwaarde": {
      "@id": "deu:Requirement"
    },
    "bewijsType": {
      "@id": "deu:Evidence"
    },
    "zoektermen": {
      "@container": [
        "@language",
        "@set"
      ],
      "@id": "http://www.w3.org/ns/dcat#keyword"
    },
    "talen": {
      "@container": "@set",
      "@id": "dct:language",
      "@type": "@id",
      "@context": {
        "@base": "http://publications.europa.eu/resource/authority/language/"
      }
    },
    "financieleVoordelen": {
      "@container": "@set",
      "@id": "http://purl.org/vocab/cpsv#produces"
    },
    "financieelVoordeel": {
      "@id": "instantieNs:FinancialAdvantage"
    },
    "publicatiekanalen": {
      "@container": "@set",
      "@id": "instantieNs:publicationMedium",
      "@type": "@id",
      "@context": {
        "@base": "https://productencatalogus.data.vlaanderen.be/id/concept/PublicatieKanaal/"
      }
    },
    "regelgevingTekst": {
      "@id": "instantieNs:regulation",
      "@container": "@language"
    },
    "geografischToepassingsgebieden": {
      "@container": "@set",
      "@id": "dct:spatial",
      "@type": "@id",
      "@context": {
        "@base": "http://data.europa.eu/nuts/code/"
      }
    },
    "startDienstVerlening": {
      "@id": "sch:startDate",
      "@type": "xsd:dateTime"
    },
    "tags": {
      "@container": "@set",
      "@id": "instantieNs:instantieTag",
      "@type": "@id",
      "@context": {
        "@base": "https://productencatalogus.data.vlaanderen.be/id/concept/InstantieTag/"
      }
    },
    "doelgroepen": {
      "@container": "@set",
      "@id": "instantieNs:targetAudience",
      "@type": "@id",
      "@context": {
        "@base": "https://productencatalogus.data.vlaanderen.be/id/concept/Doelgroep/"
      }
    },
    "themas": {
      "@container": "@set",
      "@id": "deu:thematicArea",
      "@type": "@id",
      "@context": {
        "@base": "https://productencatalogus.data.vlaanderen.be/id/concept/Thema/"
      }
    },
    "type": {
      "@id": "dct:type",
      "@type": "@id",
      "@context": {
        "@base": "https://productencatalogus.data.vlaanderen.be/id/concept/Type/"
      }
    },
    "yourEuropeCategorieen": {
      "@container": "@set",
      "@id": "instantieNs:yourEuropeCategory",
      "@type": "@id",
      "@context": {
        "@base": "https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/"
      }
    },
    "email": {
      "@id": "sch:email",
      "@type": "xsd:string"
    },
    "telefoonnummer": {
      "@id": "sch:telephone",
      "@type": "xsd:string"
    },
    "openingsuren": {
      "@id": "sch:openingHours",
      "@type": "xsd:string"
    },
    "gearchiveerd": {
      "@id": "instantieNs:isArchived",
      "@type": "xsd:boolean"
    },
    "creatie": {
      "@id": "sch:dateCreated",
      "@type": "xsd:dateTime"
    },
    "laatstGewijzigd": {
      "@id": "sch:dateModified",
      "@type": "xsd:dateTime"
    },
    "linkedConcept": {
      "@id": "dct:source",
      "@type": "@id"
    },
    "adres": {
      "@id": "instantieNs:address",
      "@context": {
        "land": {
          "@id": "dtv:adres#land",
          "@container": "@language"
        },
        "huisnummer": {
          "@id": "dtv:adres#Adresvoorstelling.huisnummer",
          "@type": "xsd:string"
        },
        "busnummer": {
          "@id": "dtv:adres#Adresvoorstelling.busnummer",
          "@type": "xsd:string"
        },
        "postcode": {
          "@id": "dtv:adres#postcode",
          "@type": "xsd:string"
        },
        "gemeentenaam": {
          "@id": "dtv:adres#gemeentenaam",
          "@container": "@language"
        },
        "straatnaam": {
          "@id": "dtv:adres#Straatnaam",
          "@container": "@language"
        }
      }
    },
    "EventStream": "ldes:EventStream",
    "Node": "tree:Node",
    "relation": {
      "@container": "@set",
      "@id": "tree:relation"
    },
    "view": "tree:view",
    "shape": "tree:shape",
    "member": {
      "@id": "tree:member",
      "@container": "@set"
    },
    "GreaterThanOrEqualToRelation": "tree:GreaterThanOrEqualToRelation",
    "LessThanOrEqualToRelation": "tree:LessThanOrEqualToRelation",
    "LessThanRelation": "tree:LessThanRelation",
    "versionOfPath": {
      "@id": "ldes:versionOfPath",
      "@type": "@id"
    },
    "timestampPath": {
      "@id": "ldes:timestampPath",
      "@type": "@id"
    },
    "node": {
      "@id": "tree:node",
      "@type": "@id"
    },
    "path": {
      "@id": "tree:path",
      "@type": "@id"
    },
    "value": {
      "@id": "tree:value",
      "@type": "xsd:dateTime"
    },
    "hydraMember": {
      "@id": "hydra:member",
      "@type": "@id"
    },
    "hydraLimit": {
      "@id": "hydra:limit",
      "@type": "xsd:nonNegativeInteger"
    },
    "hydraPageIndex": {
      "@id": "hydra:pageIndex",
      "@type": "xsd:nonNegativeInteger"
    },
    "hydraView": {
      "@id": "hydra:view",
      "@type": "@id"
    },
    "hydraTotalItems": "hydra:totalItems",
    "hydraFirst": {
      "@id": "hydra:first",
      "@type": "@id"
    },
    "hydraLast": {
      "@id": "hydra:last",
      "@type": "@id"
    },
    "hydraNext": {
      "@id": "hydra:next",
      "@type": "@id"
    },
    "hydraPrevious": {
      "@id": "hydra:previous",
      "@type": "@id"
    }
  }
}`);

        const store = graph();

        const quads = await new Promise<Statement<SubjectType, PredicateType, ObjectType, GraphType>[]>((resolve, reject) => {

            parse(jsonLdData, store, bestuurseenheid.userGraph().value, 'application/ld+json', (error: any, kb: any) => {
                if (error) {
                    reject(error);
                    return;
                }

                const originalQuads: Statement[] = kb.statementsMatching();

                if (originalQuads.length < 5) {
                    reject(new SystemError(`Er is een fout opgetreden bij het bevragen van Ipdc voor instance ${instancePublishedOnIpdcTni.id}`));
                }

                //'translate' all formal to informal (by adding the same keys again, with informal)

                const allInformalQuads =
                    originalQuads.filter(
                        q =>
                            isLiteral(q.object)
                            && (q.object as Literal).language === 'nl-be-x-formal'
                    ).map(q =>
                        quad(q.subject, q.predicate, literal(`${q.object.value} - informal`, 'nl-be-x-informal'), q.graph)
                    );

                resolve([...originalQuads, ...allInformalQuads]);
            });
        });

        //console.log(quads);

        const jsonLdDocument = await jsonld.fromRDF(quads.map(q => quad(q.subject, q.predicate, q.object, null)));

        const compactedJsonLdDocument = await jsonld.compact(jsonLdDocument, context);

        const expectedCompactedDocument = JSON.parse(`{"@context": {"EventStream": "ldes:EventStream", "GreaterThanOrEqualToRelation": "tree:GreaterThanOrEqualToRelation", "InstancePublicService": "instantieNs:InstancePublicService", "InstancePublicServiceSnapshot": "instantieNs:InstancePublicServiceSnapshot", "LessThanOrEqualToRelation": "tree:LessThanOrEqualToRelation", "LessThanRelation": "tree:LessThanRelation", "Node": "tree:Node", "adres": {"@context": {"busnummer": {"@id": "dtv:adres#Adresvoorstelling.busnummer", "@type": "xsd:string"}, "gemeentenaam": {"@container": "@language", "@id": "dtv:adres#gemeentenaam"}, "huisnummer": {"@id": "dtv:adres#Adresvoorstelling.huisnummer", "@type": "xsd:string"}, "land": {"@container": "@language", "@id": "dtv:adres#land"}, "postcode": {"@id": "dtv:adres#postcode", "@type": "xsd:string"}, "straatnaam": {"@container": "@language", "@id": "dtv:adres#Straatnaam"}}, "@id": "instantieNs:address"}, "beschrijving": {"@container": "@language", "@id": "dct:description"}, "bevoegdBestuursniveaus": {"@container": "@set", "@context": {"@base": "https://productencatalogus.data.vlaanderen.be/id/concept/BevoegdBestuursniveau/"}, "@id": "instantieNs:competentAuthorityLevel", "@type": "@id"}, "bevoegdeOverheden": {"@container": "@set", "@context": {"@base": "https://data.vlaanderen.be/id/organisatie/", "id": "@id"}, "@id": "deu:hasCompetentAuthority"}, "bewijsType": {"@id": "deu:Evidence"}, "contact": {"@id": "sch:ContactPoint"}, "contactgegevens": {"@container": "@set", "@id": "deu:hasContactPoint"}, "creatie": {"@id": "sch:dateCreated", "@type": "xsd:dateTime"}, "dct": "http://purl.org/dc/terms/", "deu": "http://data.europa.eu/m8g/", "deuOntology": "http://data.europa.eu/eli/ontology#", "doelgroepen": {"@container": "@set", "@context": {"@base": "https://productencatalogus.data.vlaanderen.be/id/concept/Doelgroep/"}, "@id": "instantieNs:targetAudience", "@type": "@id"}, "dtv": "https://data.vlaanderen.be/ns/", "eindeDienstVerlening": {"@id": "sch:endDate", "@type": "xsd:dateTime"}, "email": {"@id": "sch:email", "@type": "xsd:string"}, "financieelVoordeel": {"@id": "instantieNs:FinancialAdvantage"}, "financieleVoordelen": {"@container": "@set", "@id": "http://purl.org/vocab/cpsv#produces"}, "gearchiveerd": {"@id": "instantieNs:isArchived", "@type": "xsd:boolean"}, "generatedAtTime": {"@id": "prov:generatedAtTime", "@type": "xsd:dateTime"}, "geografischToepassingsgebieden": {"@container": "@set", "@context": {"@base": "http://data.europa.eu/nuts/code/"}, "@id": "dct:spatial", "@type": "@id"}, "hydra": "http://www.w3.org/ns/hydra/core#", "hydraFirst": {"@id": "hydra:first", "@type": "@id"}, "hydraLast": {"@id": "hydra:last", "@type": "@id"}, "hydraLimit": {"@id": "hydra:limit", "@type": "xsd:nonNegativeInteger"}, "hydraMember": {"@id": "hydra:member", "@type": "@id"}, "hydraNext": {"@id": "hydra:next", "@type": "@id"}, "hydraPageIndex": {"@id": "hydra:pageIndex", "@type": "xsd:nonNegativeInteger"}, "hydraPrevious": {"@id": "hydra:previous", "@type": "@id"}, "hydraTotalItems": "hydra:totalItems", "hydraView": {"@id": "hydra:view", "@type": "@id"}, "instantieNs": "https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#", "isVersionOf": {"@id": "dct:isVersionOf", "@type": "@id"}, "kost": {"@id": "deu:Cost"}, "kosten": {"@container": "@set", "@id": "deu:hasCost"}, "laatstGewijzigd": {"@id": "sch:dateModified", "@type": "xsd:dateTime"}, "ldes": "https://w3id.org/ldes#", "linkedConcept": {"@id": "dct:source", "@type": "@id"}, "locn": "http://www.w3.org/ns/locn#", "member": {"@container": "@set", "@id": "tree:member"}, "naam": {"@container": "@language", "@id": "dct:title"}, "node": {"@id": "tree:node", "@type": "@id"}, "openingsuren": {"@id": "sch:openingHours", "@type": "xsd:string"}, "order": {"@id": "sh:order"}, "path": {"@id": "tree:path", "@type": "@id"}, "procedure": {"@id": "purlCpsv:Rule"}, "procedures": {"@container": "@set", "@context": {"websites": {"@container": "@set", "@id": "instantieNs:hasWebsite"}}, "@id": "http://purl.org/vocab/cpsv#follows"}, "productnummer": {"@id": "sch:productID", "@type": "xsd:string"}, "prov": "http://www.w3.org/ns/prov#", "publicatiekanalen": {"@container": "@set", "@context": {"@base": "https://productencatalogus.data.vlaanderen.be/id/concept/PublicatieKanaal/"}, "@id": "instantieNs:publicationMedium", "@type": "@id"}, "purlCpsv": "http://purl.org/vocab/cpsv#", "regel": {"@id": "deuOntology:LegalResource"}, "regelgeving": {"@container": "@set", "@context": {"id": "sch:url"}, "@id": "deu:hasLegalResource"}, "regelgevingTekst": {"@container": "@language", "@id": "instantieNs:regulation"}, "relation": {"@container": "@set", "@id": "tree:relation"}, "sch": "http://schema.org/", "sh": "http://www.w3.org/ns/shacl#", "shape": "tree:shape", "snapshotType": {"@context": {"@base": "https://productencatalogus.data.vlaanderen.be/id/concept/SnapshotType/"}, "@id": "instantieNs:snapshotType", "@type": "@id"}, "startDienstVerlening": {"@id": "sch:startDate", "@type": "xsd:dateTime"}, "tags": {"@container": "@set", "@context": {"@base": "https://productencatalogus.data.vlaanderen.be/id/concept/InstantieTag/"}, "@id": "instantieNs:instantieTag", "@type": "@id"}, "talen": {"@container": "@set", "@context": {"@base": "http://publications.europa.eu/resource/authority/language/"}, "@id": "dct:language", "@type": "@id"}, "telefoonnummer": {"@id": "sch:telephone", "@type": "xsd:string"}, "themas": {"@container": "@set", "@context": {"@base": "https://productencatalogus.data.vlaanderen.be/id/concept/Thema/"}, "@id": "deu:thematicArea", "@type": "@id"}, "timestampPath": {"@id": "ldes:timestampPath", "@type": "@id"}, "tree": "https://w3id.org/tree#", "type": {"@context": {"@base": "https://productencatalogus.data.vlaanderen.be/id/concept/Type/"}, "@id": "dct:type", "@type": "@id"}, "uitvoerendBestuursniveaus": {"@container": "@set", "@context": {"@base": "https://productencatalogus.data.vlaanderen.be/id/concept/UitvoerendBestuursniveau/"}, "@id": "instantieNs:executingAuthorityLevel", "@type": "@id"}, "uitvoerendeOverheden": {"@container": "@set", "@context": {"@base": "https://data.vlaanderen.be/id/organisatie/", "id": "@id"}, "@id": "instantieNs:hasExecutingAuthority"}, "uitzonderingen": {"@container": "@language", "@id": "instantieNs:exception"}, "url": {"@id": "sch:url"}, "value": {"@id": "tree:value", "@type": "xsd:dateTime"}, "verdereBeschrijving": {"@container": "@language", "@id": "instantieNs:additionalDescription"}, "versionOfPath": {"@id": "ldes:versionOfPath", "@type": "@id"}, "view": "tree:view", "voorwaarde": {"@id": "deu:Requirement"}, "voorwaarden": {"@container": "@set", "@context": {"bewijs": {"@id": "deu:hasSupportingEvidence"}}, "@id": "http://vocab.belgif.be/ns/publicservice#hasRequirement"}, "website": {"@id": "sch:WebSite"}, "websites": {"@container": "@set", "@id": "http://www.w3.org/2000/01/rdf-schema#seeAlso"}, "xsd": "http://www.w3.org/2001/XMLSchema#", "yourEuropeCategorieen": {"@container": "@set", "@context": {"@base": "https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/"}, "@id": "instantieNs:yourEuropeCategory", "@type": "@id"}, "zoektermen": {"@container": ["@language", "@set"], "@id": "http://www.w3.org/ns/dcat#keyword"}}, "@id": "http://data.lblod.info/id/public-service/b87f3578-4dea-4425-a737-6374d49a4b3a", "@type": "InstancePublicService", "beschrijving": {"nl-be-x-formal": "<p data-indentation-level=\\"0\\">b</p>", "nl-be-x-informal": "<p data-indentation-level=\\"0\\">b</p> - informal"}, "bevoegdeOverheden": [{"id": "http://data.lblod.info/id/bestuurseenheden/0855d794d31887234a3edfede8cc68dbe7a177c9beba03c884d443177e9d5287"}], "creatie": "2024-04-30T11:02:38.043Z", "geografischToepassingsgebieden": ["BE21"], "http://mu.semte.ch/vocabularies/core/uuid": "b87f3578-4dea-4425-a737-6374d49a4b3a", "http://purl.org/pav/createdBy": {"@id": "http://data.lblod.info/id/bestuurseenheden/0855d794d31887234a3edfede8cc68dbe7a177c9beba03c884d443177e9d5287"}, "http://www.w3.org/ns/adms#status": {"@id": "http://lblod.data.gift/concepts/instance-status/verstuurd"}, "instantieNs:dutchLanguageVariant": "nl-be-x-formal", "instantieNs:needsConversionFromFormalToInformal": {"@type": "xsd:boolean", "@value": "0"}, "laatstGewijzigd": "2024-04-30T11:02:44.701Z", "naam": {"nl-be-x-formal": "a", "nl-be-x-informal": "a - informal"}, "sch:dateSent": {"@type": "xsd:dateTime", "@value": "2024-04-30T11:02:44.699Z"}, "uitvoerendeOverheden": [{"id": "http://data.lblod.info/id/bestuurseenheden/0855d794d31887234a3edfede8cc68dbe7a177c9beba03c884d443177e9d5287"}]}`);

        expect(compactedJsonLdDocument).toEqual(expectedCompactedDocument);




    });
});
