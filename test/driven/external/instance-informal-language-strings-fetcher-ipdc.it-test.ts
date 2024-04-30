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
import {InvariantError, SystemError} from "../../../src/core/domain/shared/lpdc-error";
import {aMinimalWebsiteForInstance} from "../../core/domain/website-test-builder";
import {aMinimalRequirementForInstance} from "../../core/domain/requirement-test-builder";
import {aMinimalProcedureForInstance} from "../../core/domain/procedure-test-builder";
import {aMinimalCostForInstance} from "../../core/domain/cost-test-builder";
import {aMinimalFinancialAdvantageForInstance} from "../../core/domain/financial-advantage-test-builder";
import {aMinimalLegalResourceForConcept} from "../../core/domain/legal-resource-test-builder";
import {aFullInstance} from "../../core/domain/instance-test-builder";
import {TNI_IPDC_ENDPOINT} from "../../test.config";


describe('Instance informal language strings fetcher ipdc', () => {

    const ipdcFetcher = new InstanceInformalLanguageStringsFetcherIpdc(TNI_IPDC_ENDPOINT);
    const bestuurseenheid = aBestuurseenheid().build();
    const uuid = 'e8843fda-b3a8-4334-905c-8e49eb12203b';
    const id = new Iri(`http://data.lblod.info/id/public-service/${uuid}`);
    const initialInstance = new InstanceBuilder()
        .withId(id)
        .withUuid(uuid)
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

    const expectedInstance = InstanceBuilder.from(initialInstance)
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
        const mappedInstance = await ipdcFetcher.fetchInstanceAndMap(bestuurseenheid, initialInstance);

        expect(mappedInstance).toEqual(expectedInstance);
    });

    test('when receiving an instance with a missing value, throw error', async () => {
        const instance = InstanceBuilder.from(initialInstance).withDescription(undefined).build();
        await expect(ipdcFetcher.fetchInstanceAndMap(bestuurseenheid, instance)).rejects.toThrowWithMessage(InvariantError, "De nieuwe en initiële waarde moeten beiden aanwezig of afwezig zijn");
    });

    test('when instance is not found, throw error', async () => {
        const unexistingInstance = aFullInstance().withCreatedBy(bestuurseenheid.id).build();
        await expect(ipdcFetcher.fetchInstanceAndMap(bestuurseenheid, unexistingInstance)).rejects.toThrowWithMessage(SystemError, `Instantie ${unexistingInstance.id} niet gevonden bij ipdc`);


    });

    describe('Requirement', () => {
        test('When receiving a missing requirement, throw error', async () => {
            const instance = InstanceBuilder.from(initialInstance).withRequirements([]).build();

            await expect(ipdcFetcher.fetchInstanceAndMap(bestuurseenheid, instance)).rejects.toThrowWithMessage(InvariantError, "Het aantal voorwaarden van ipdc is niet gelijk aan het aantal originele voorwaarden");
        });

        test('When receiving an additional requirement, throw error', async () => {
            const additionalRequirement = aMinimalRequirementForInstance().withOrder(1).build();
            const newRequirements = [...initialInstance.requirements, additionalRequirement];

            const instance = InstanceBuilder.from(initialInstance).withRequirements(newRequirements).build();

            await expect(ipdcFetcher.fetchInstanceAndMap(bestuurseenheid, instance)).rejects.toThrowWithMessage(InvariantError, "Het aantal voorwaarden van ipdc is niet gelijk aan het aantal originele voorwaarden");
        });

        test('when receiving a missing evidence in a requirement, throw error', async () => {
            const requirements = initialInstance.requirements;
            requirements[0] = RequirementBuilder.from(requirements[0]).withEvidence(undefined).build();

            const instance = InstanceBuilder.from(initialInstance).withRequirements(requirements).build();
            await expect(ipdcFetcher.fetchInstanceAndMap(bestuurseenheid, instance)).rejects.toThrowWithMessage(InvariantError, "Het bewijs van ipdc is niet gelijk aan het originele bewijs");
        });

    });

    describe('Procedure', () => {
        test('When receiving a missing procedure, throw error', async () => {
            const instance = InstanceBuilder.from(initialInstance).withProcedures([]).build();

            await expect(ipdcFetcher.fetchInstanceAndMap(bestuurseenheid, instance)).rejects.toThrowWithMessage(InvariantError, "Het aantal procedures van ipdc is niet gelijk aan het aantal originele procedures");
        });

        test('When receiving an additional procedure, throw error', async () => {
            const additionalProcedure = aMinimalProcedureForInstance().withOrder(1).build();
            const newProcedures = [...initialInstance.procedures, additionalProcedure];

            const instance = InstanceBuilder.from(initialInstance).withProcedures(newProcedures).build();

            await expect(ipdcFetcher.fetchInstanceAndMap(bestuurseenheid, instance)).rejects.toThrowWithMessage(InvariantError, "Het aantal procedures van ipdc is niet gelijk aan het aantal originele procedures");
        });

        test('when receiving a missing website in a procedure, throw error', async () => {
            const procedures = initialInstance.procedures;
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

            const instance = InstanceBuilder.from(initialInstance).withProcedures(procedures).build();
            await expect(ipdcFetcher.fetchInstanceAndMap(bestuurseenheid, instance)).rejects.toThrowWithMessage(InvariantError, "Het aantal websites van ipdc is niet gelijk aan het aantal originele websites");
        });

        test('when receiving an additional website in a procedure, throw error', async () => {
            const procedures = initialInstance.procedures;
            const additionalWebsite = aMinimalWebsiteForInstance().withOrder(2).build();
            procedures[0] = ProcedureBuilder.from(procedures[0]).withWebsites([...procedures[0].websites, additionalWebsite]).build();

            const instance = InstanceBuilder.from(initialInstance).withProcedures(procedures).build();
            await expect(ipdcFetcher.fetchInstanceAndMap(bestuurseenheid, instance)).rejects.toThrowWithMessage(InvariantError, "Het aantal websites van ipdc is niet gelijk aan het aantal originele websites");
        });
    });

    describe('Websites', () => {
        test('When receiving a missing website, throw error', async () => {
            const instance = InstanceBuilder.from(initialInstance).withWebsites([]).build();

            await expect(ipdcFetcher.fetchInstanceAndMap(bestuurseenheid, instance)).rejects.toThrowWithMessage(InvariantError, "Het aantal websites van ipdc is niet gelijk aan het aantal originele websites");
        });
        test('when receiving an additional website, throw error', async () => {
            const additionalWebsite = aMinimalWebsiteForInstance().withOrder(2).build();

            const newWebsites = [...initialInstance.websites, additionalWebsite];

            const instance = InstanceBuilder.from(initialInstance).withWebsites(newWebsites).build();
            await expect(ipdcFetcher.fetchInstanceAndMap(bestuurseenheid, instance)).rejects.toThrowWithMessage(InvariantError, "Het aantal websites van ipdc is niet gelijk aan het aantal originele websites");
        });
    });

    describe('Costs', () => {
        test('When receiving a missing cost, throw error', async () => {
            const instance = InstanceBuilder.from(initialInstance).withCosts([]).build();

            await expect(ipdcFetcher.fetchInstanceAndMap(bestuurseenheid, instance)).rejects.toThrowWithMessage(InvariantError, "Het aantal kosten van ipdc is niet gelijk aan het aantal originele kosten");
        });

        test('when receiving an additional cost, throw error', async () => {
            const additionalCost = aMinimalCostForInstance().withOrder(2).build();

            const newCosts = [...initialInstance.costs, additionalCost];

            const instance = InstanceBuilder.from(initialInstance).withCosts(newCosts).build();
            await expect(ipdcFetcher.fetchInstanceAndMap(bestuurseenheid, instance)).rejects.toThrowWithMessage(InvariantError, "Het aantal kosten van ipdc is niet gelijk aan het aantal originele kosten");
        });
    });

    describe('Financial advantages', () => {
        test('When receiving a missing financial advantage, throw error', async () => {
            const instance = InstanceBuilder.from(initialInstance).withFinancialAdvantages([]).build();

            await expect(ipdcFetcher.fetchInstanceAndMap(bestuurseenheid, instance)).rejects.toThrowWithMessage(InvariantError, "Het aantal financiele voordelen van ipdc is niet gelijk aan het aantal originele financiele voordelen");
        });

        test('when receiving an additional financial advantage, throw error', async () => {
            const additionalFinancialAdvantage = aMinimalFinancialAdvantageForInstance().withOrder(2).build();

            const newFinancialAdvantages = [...initialInstance.financialAdvantages, additionalFinancialAdvantage];

            const instance = InstanceBuilder.from(initialInstance).withFinancialAdvantages(newFinancialAdvantages).build();
            await expect(ipdcFetcher.fetchInstanceAndMap(bestuurseenheid, instance)).rejects.toThrowWithMessage(InvariantError, "Het aantal financiele voordelen van ipdc is niet gelijk aan het aantal originele financiele voordelen");
        });
    });

    describe('Legal resources', () => {
        test('When receiving a missing legal resource, throw error', async () => {
            const instance = InstanceBuilder.from(initialInstance).withLegalResources([]).build();

            await expect(ipdcFetcher.fetchInstanceAndMap(bestuurseenheid, instance)).rejects.toThrowWithMessage(InvariantError, "Het aantal regelgevingen van ipdc is niet gelijk aan het aantal originele regelgevingen");
        });

        test('when receiving an additional legal resource, throw error', async () => {
            const additionalLegalResource = aMinimalLegalResourceForConcept().withOrder(2).build();

            const newLegalResources = [...initialInstance.legalResources, additionalLegalResource];

            const instance = InstanceBuilder.from(initialInstance).withLegalResources(newLegalResources).build();
            await expect(ipdcFetcher.fetchInstanceAndMap(bestuurseenheid, instance)).rejects.toThrowWithMessage(InvariantError, "Het aantal regelgevingen van ipdc is niet gelijk aan het aantal originele regelgevingen");
        });
    });
});
