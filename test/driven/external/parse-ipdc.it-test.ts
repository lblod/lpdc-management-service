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
            .withRegulation((LanguageString.of(
                    undefined,
                    undefined,
                    "<p data-indentation-level=\"0\">Dit zijn de regelgevingen voor een volledig ingevulde test zodat u het contract tussen ipdc en lpdc kan testen</p>"
                ))
            )
            .withException((LanguageString.of(
                    '<p data-indentation-level="0">uitzonderingen en</p>',
                    undefined,
                    "<p data-indentation-level=\"0\">Dit zijn de uitzonderingen voor een volledig ingevulde test zodat u het contract tussen ipdc en lpdc kan testen</p>"
                ))
            )
            .withStartDate(FormatPreservingDate.of("2024-03-12T12:00:00Z"))
            .withEndDate(FormatPreservingDate.of("2024-09-21T12:00:00Z"))
            .withRequirements([
                new RequirementBuilder()
                    .withId(new Iri("http://data.lblod.info/id/requirement/2e24c02e-0de5-4460-8366-1a76514e0407"))
                    .withUuid("2e24c02e-0de5-4460-8366-1a76514e0407")
                    .withTitle((LanguageString.of(
                            undefined,
                            undefined,
                            "Voorwaarden"
                        ))
                    )
                    .withDescription((LanguageString.of(
                            undefined,
                            undefined,
                            "<p data-indentation-level=\"0\">Dit zijn de bewijsstukken een volledig ingevulde test zodat u het contract tussen ipdc en lpdc kan testen</p>"
                        ))
                    )
                    .withEvidence(
                        new EvidenceBuilder()
                            .withId(new Iri("http://data.lblod.info/id/evidence/d3ec32ba-4ed5-4072-af39-591b5c232974"))
                            .withUuid("d3ec32ba-4ed5-4072-af39-591b5c232974")
                            .withTitle((LanguageString.of(
                                    undefined,
                                    undefined,
                                    "Bewijs"
                                ))
                            )
                            .withDescription((LanguageString.of(
                                    undefined,
                                    undefined,
                                    "<p data-indentation-level=\"0\">Dit zijn de bewijsstukken een volledig ingevulde test zodat u het contract tussen ipdc en lpdc kan testen</p>"
                                ))
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
                    .withTitle((LanguageString.of(
                            undefined,
                            undefined,
                            "Procedure"
                        ))
                    )
                    .withDescription((LanguageString.of(
                            undefined,
                            undefined,
                            "<p data-indentation-level=\"0\">Dit is de procedure voor een volledig ingevulde test om zodat u het contract tussen ipdc en lpdc kan testen</p>"
                        ))
                    )
                    .withOrder(0)
                    .withWebsites([
                        new WebsiteBuilder()
                            .withId(new Iri("http://data.lblod.info/id/website/b99e8207-7af5-420e-9d46-d66d7f0a401c"))
                            .withUuid("b99e8207-7af5-420e-9d46-d66d7f0a401c")
                            .withTitle((LanguageString.of(
                                    undefined,
                                    undefined,
                                    "Subsidiereglement Stad Gent voor de financiële ondersteuning van projecten in kunst, cultuur en cultureel erfgoed voor periode 2021-2025"
                                ))
                            )
                            .withDescription(undefined)
                            .withUrl("https://stad.gent/nl/reglementen/subsidiereglement-voor-de-financiele-ondersteuning-van-projecten-kunst-cultuur-en-cultureel-erfgoed")
                            .withOrder(0)
                            .build()
                        ,
                        new WebsiteBuilder()
                            .withId(new Iri("http://data.lblod.info/id/website/a411b281-70b7-42ab-acf4-32e4f1341c53"))
                            .withUuid("a411b281-70b7-42ab-acf4-32e4f1341c53")
                            .withTitle((LanguageString.of(
                                    undefined,
                                    undefined,
                                    "Subsidie verfraaing handelspanden"
                                ))
                            )
                            .withDescription(undefined)
                            .withUrl("https://stad.gent/nl/ondernemen/ondersteuning-en-premies-voor-ondernemers/sectoroverschrijdend/subsidie-verfraaiing-handelspand/subsidie-verfraaiing-handelspanden")
                            .withOrder(1)
                            .build()
                    ])
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

        expect(instance).toEqual(mappedInstance);
        expect(mappedInstance.id).toEqual(id);

    });
});
