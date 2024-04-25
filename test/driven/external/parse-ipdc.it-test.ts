import {aBestuurseenheid} from "../../core/domain/bestuurseenheid-test-builder";
import {Iri} from "../../../src/core/domain/shared/iri";
import {IpdcMapper} from "../../../src/driven/external/ipdc-mapper";
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

describe('Parse ipdc', () => {
    const ipdcFetcher = new IpdcMapper();

    test.skip('parse ipdc example', async () => {
        const bestuurseenheid = aBestuurseenheid().build();
        const uuid = 'e8843fda-b3a8-4334-905c-8e49eb12203b';
        const id = new Iri(`http://data.lblod.info/id/public-service/${uuid}`);
        const instance = new InstanceBuilder()
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
                            "<p data-indentation-level=\"0\">Dit zijn de bewijsstukken een volledig ingevulde test zodat u het contract tussen ipdc en lpdc kan testen</p>"
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
                    .withId(new Iri("http://data.lblod.info/id/public-service/e8843fda-b3a8-4334-905c-8e49eb12203b"))
                    .withUuid("e8843fda-b3a8-4334-905c-8e49eb12203b")
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
                    .withId(new Iri("http://data.lblod.info/id/public-service/e8843fda-b3a8-4334-905c-8e49eb12203b"))
                    .withUuid("e8843fda-b3a8-4334-905c-8e49eb12203b")
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
            .withPublicationStatus(InstancePublicationStatusType.GEPUBLICEERD)

            .build();

        const mappedInstance = await ipdcFetcher.fetchIpdcInstanceAndMap(bestuurseenheid, instance);

        expect(instance).toEqual(mappedInstance.transformToInformal());
        expect(mappedInstance.id).toEqual(id);

    });
});
