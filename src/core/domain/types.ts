export enum ProductType { //TODO LPDC-916: ok to compromise and put an uri in here ?
    FINANCIELEVERPLICHTING = 'https://productencatalogus.data.vlaanderen.be/id/concept/Type/FinancieleVerplichting',
    TOELATING = 'https://productencatalogus.data.vlaanderen.be/id/concept/Type/Toelating',
    BEWIJS = 'https://productencatalogus.data.vlaanderen.be/id/concept/Type/Bewijs',
    VOORWERP = 'https://productencatalogus.data.vlaanderen.be/id/concept/Type/Voorwerp',
    ADVIESBEGELEIDING = 'https://productencatalogus.data.vlaanderen.be/id/concept/Type/AdviesBegeleiding',
    INFRASTRUCTUURMATERIAAL = 'https://productencatalogus.data.vlaanderen.be/id/concept/Type/InfrastructuurMateriaal',
    FINANCIEELVOORDEEL = 'https://productencatalogus.data.vlaanderen.be/id/concept/Type/FinancieelVoordeel',
}

export enum TargetAudienceType {
    BURGER = 'https://productencatalogus.data.vlaanderen.be/id/concept/Doelgroep/Burger',
    ONDERNEMING = 'https://productencatalogus.data.vlaanderen.be/id/concept/Doelgroep/Onderneming',
    ORGANISATIE = 'https://productencatalogus.data.vlaanderen.be/id/concept/Doelgroep/Organisatie',
    VLAAMSEOVERHEID = 'https://productencatalogus.data.vlaanderen.be/id/concept/Doelgroep/VlaamseOverheid',
    LOKAALBESTUUR = 'https://productencatalogus.data.vlaanderen.be/id/concept/Doelgroep/LokaalBestuur',
    VERENIGING = 'https://productencatalogus.data.vlaanderen.be/id/concept/Doelgroep/Vereniging',
}

export enum ThemeType {
    BURGEROVERHEID = 'https://productencatalogus.data.vlaanderen.be/id/concept/Thema/BurgerOverheid',
    CULTUURSPORTVRIJETIJD = 'https://productencatalogus.data.vlaanderen.be/id/concept/Thema/CultuurSportVrijeTijd',
    ECONOMIEWERK = 'https://productencatalogus.data.vlaanderen.be/id/concept/Thema/EconomieWerk',
    MILIEUENERGIE = 'https://productencatalogus.data.vlaanderen.be/id/concept/Thema/MilieuEnergie',
    MOBILITEITOPENBAREWERKEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/Thema/MobiliteitOpenbareWerken',
    ONDERWIJSWETENSCHAP = 'https://productencatalogus.data.vlaanderen.be/id/concept/Thema/OnderwijsWetenschap',
    WELZIJNGEZONDHEID = 'https://productencatalogus.data.vlaanderen.be/id/concept/Thema/WelzijnGezondheid',
    BOUWENWONEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/Thema/BouwenWonen',
}

export enum CompetentAuthorityLevelType {
    EUROPEES = 'https://productencatalogus.data.vlaanderen.be/id/concept/BevoegdBestuursniveau/Europees',
    FEDERAAL = 'https://productencatalogus.data.vlaanderen.be/id/concept/BevoegdBestuursniveau/Federaal',
    VLAAMS = 'https://productencatalogus.data.vlaanderen.be/id/concept/BevoegdBestuursniveau/Vlaams',
    PROVINCIAAL = 'https://productencatalogus.data.vlaanderen.be/id/concept/BevoegdBestuursniveau/Provinciaal',
    LOKAAL = 'https://productencatalogus.data.vlaanderen.be/id/concept/BevoegdBestuursniveau/Lokaal',
}

export enum ExecutingAuthorityLevelType {
    EUROPEES = 'https://productencatalogus.data.vlaanderen.be/id/concept/UitvoerendBestuursniveau/Europees',
    FEDERAAL = 'https://productencatalogus.data.vlaanderen.be/id/concept/UitvoerendBestuursniveau/Federaal',
    VLAAMS = 'https://productencatalogus.data.vlaanderen.be/id/concept/UitvoerendBestuursniveau/Vlaams',
    PROVINCIAAL = 'https://productencatalogus.data.vlaanderen.be/id/concept/UitvoerendBestuursniveau/Provinciaal',
    LOKAAL = 'https://productencatalogus.data.vlaanderen.be/id/concept/UitvoerendBestuursniveau/Lokaal',
    DERDEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/UitvoerendBestuursniveau/Derden',
}

export enum PublicationMediumType {
    YOUREUROPE = 'https://productencatalogus.data.vlaanderen.be/id/concept/PublicatieKanaal/YourEurope',
    RECHTENVERKENNER = 'https://productencatalogus.data.vlaanderen.be/id/concept/PublicatieKanaal/Rechtenverkenner',
}

export enum YourEuropeCategoryType {
    BEDRIJF = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/Bedrijf',
    BEDRIJFAANSPRAKELIJKHEIDBESTUURDERS = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/BedrijfAansprakelijkheidBestuurders',
    BEDRIJFFUSIEVERKOOP = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/BedrijfFusieVerkoop',
    BEDRIJFINSOLVENTIELIQUIDATIE = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/BedrijfInsolventieLiquidatie',
    BEDRIJFINTELLECTUELEEIGENDOMSRECHTEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/BedrijfIntellectueleEigendomsrechten',
    BEDRIJFKREDIETVERZEKERING = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/BedrijfKredietVerzekering',
    BEDRIJFONLINEBETAALFUNCTIES = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/BedrijfOnlineBetaalFuncties',
    BEDRIJFOVEREENKOMSTENRECHT = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/BedrijfOvereenkomstenrecht',
    BEDRIJFPERSOONSGEGEVENS = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/BedrijfPersoonsgegevens',
    BEDRIJFREGISTRATIEPROCEDURESRECHTSVORMEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/BedrijfRegistratieproceduresRechtsvormen',
    BEDRIJFTRANSPARANTIE = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/BedrijfTransparantie',
    BEDRIJFVERPLAATSING = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/BedrijfVerplaatsing',
    BEDRIJFSFINANCIERING = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/Bedrijfsfinanciering',
    BEDRIJFSFINANCIERINGFINANCIERINGNATIONAAL = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/BedrijfsfinancieringFinancieringNationaal',
    BEDRIJFSFINANCIERINGFINANCIERINGUNIE = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/BedrijfsfinancieringFinancieringUnie',
    BEDRIJFSFINANCIERINGONDERNEMERSINITIATIEVEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/BedrijfsfinancieringOndernemersInitiatieven',
    BELASTINGEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/Belastingen',
    BELASTINGENACCIJNZEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/BelastingenAccijnzen',
    BELASTINGENBTW = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/BelastingenBTW',
    BELASTINGENDOUANEPROCEDURES = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/BelastingenDouaneprocedures',
    BELASTINGENDOUANERECHTEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/BelastingenDouanerechten',
    BELASTINGENOVERIGEBELASTINGEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/BelastingenOverigeBelastingen',
    BESCHERMINGPERSOONSGEGEVENS = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/BeschermingPersoonsgegevens',
    BESCHERMINGPERSOONSGEGEVENSUITOEFENINGRECHTEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/BeschermingPersoonsgegevensUitoefeningRechten',
    BURGERENFAMILIERECHTEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/BurgerEnFamilieRechten',
    BURGERENFAMILIERECHTENERFRECHTENENPLICHTEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/BurgerEnFamilieRechtenErfrechtenEnPlichten',
    BURGERENFAMILIERECHTENGENDERIDENTITEIT = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/BurgerEnFamilieRechtenGenderIdentiteit',
    BURGERENFAMILIERECHTENKINDEREN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/BurgerEnFamilieRechtenKinderen',
    BURGERENFAMILIERECHTENONTVOERINGKINDEREN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/BurgerEnFamilieRechtenOntvoeringKinderen',
    BURGERENFAMILIERECHTENPARTNERS = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/BurgerEnFamilieRechtenPartners',
    CONSUMENTENRECHTEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/Consumentenrechten',
    CONSUMENTENRECHTENAANKOOP = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/ConsumentenrechtenAankoop',
    CONSUMENTENRECHTENBANKREKENING = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/ConsumentenrechtenBankrekening',
    CONSUMENTENRECHTENBETALINGEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/ConsumentenrechtenBetalingen',
    CONSUMENTENRECHTENCONSUMENTENRECHTEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/ConsumentenrechtenConsumentenrechten',
    CONSUMENTENRECHTENHUURMOTORVOERTUIGEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/ConsumentenrechtenHuurMotorvoertuigen',
    CONSUMENTENRECHTENNUTSVOORZIENINGEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/ConsumentenrechtenNutsvoorzieningen',
    CONSUMENTENRECHTENVEILIGHEID = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/ConsumentenrechtenVeiligheid',
    DIENSTEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/Diensten',
    DIENSTENERKENNINGBEROEPSKWALIFICATIES = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/DienstenErkenningBeroepskwalificaties',
    DIENSTENKENNISGEVINGGRENSOVERSCHRIJDENDEACTIVITEITEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/DienstenKennisgevingGrensoverschrijdendeActiviteiten',
    DIENSTENLICENTIESVERGUNNINGEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/DienstenLicentiesVergunningen',
    GEZONDHEIDVEILIGHEIDWERK = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/GezondheidVeiligheidWerk',
    GEZONDHEIDVEILIGHEIDWERKVERPLICHTINGEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/GezondheidVeiligheidWerkVerplichtingen',
    GEZONDHEIDSZORG = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/Gezondheidszorg',
    GEZONDHEIDSZORGGENEESMIDDELENKOPEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/GezondheidszorgGeneesmiddelenKopen',
    GEZONDHEIDSZORGMEDISCHEBEHANDELING = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/GezondheidszorgMedischeBehandeling',
    GEZONDHEIDSZORGNOODNUMMERS = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/GezondheidszorgNoodnummers',
    GEZONDHEIDSZORGPREVENTIEVEOPENBAREGEZONDHEIDSMAATREGELEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/GezondheidszorgPreventieveOpenbareGezondheidsmaatregelen',
    GEZONDHEIDSZORGWOONZORGCENTRUM = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/GezondheidszorgWoonzorgcentrum',
    GEZONDHEIDSZORGZIEKTEVERZEKERING = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/GezondheidszorgZiekteverzekering',
    GOEDEREN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/Goederen',
    GOEDERENCEMARKERING = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/GoederenCEMarkering',
    GOEDERENERKENNINGZONDERSPECIFICATIES = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/GoederenErkenningZonderSpecificaties',
    GOEDERENGEVAARLIJKESTOFFEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/GoederenGevaarlijkeStoffen',
    GOEDERENKEURMERKEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/GoederenKeurmerken',
    GOEDERENNORMENSPECIFICATIESCERTIFICERING = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/GoederenNormenSpecificatiesCertificering',
    GOEDERENPRODUCTENMETGEBREKEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/GoederenProductenMetGebreken',
    GOEDERENRECYCLAGE = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/GoederenRecyclage',
    GOEDERENVERKOOPOPAFSTAND = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/GoederenVerkoopOpAfstand',
    GOEDERENVOORSCHRIFTENVEREISTEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/GoederenVoorschriftenVereisten',
    ONDERWIJSOFSTAGE = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/OnderwijsOfStage',
    ONDERWIJSOFSTAGEONDERWIJSSTELSEL = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/OnderwijsOfStageOnderwijsstelsel',
    ONDERWIJSOFSTAGEONDERZOEK = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/OnderwijsOfStageOnderzoek',
    ONDERWIJSOFSTAGESTAGE = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/OnderwijsOfStageStage',
    ONDERWIJSOFSTAGEVRIJWILLIGERSWERK = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/OnderwijsOfStageVrijwilligerswerk',
    OVERHEIDSOPDRACHTEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/Overheidsopdrachten',
    OVERHEIDSOPDRACHTENDEELNAME = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/OverheidsopdrachtenDeelname',
    OVERHEIDSOPDRACHTENMELDINGONREGELMATIGHEDEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/OverheidsopdrachtenMeldingOnregelmatigheden',
    OVERHEIDSOPDRACHTENONLINEINSCHRIJVING = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/OverheidsopdrachtenOnlineInschrijving',
    PROCEDUREGEBOORTE = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/ProcedureGeboorte',
    PROCEDUREGEBOORTEBEWIJS = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/ProcedureGeboorteBewijs',
    PROCEDUREPENSIONERING = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/ProcedurePensionering',
    PROCEDUREPENSIONERINGAANVRAAGUITKERING = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/ProcedurePensioneringAanvraagUitkering',
    PROCEDUREPENSIONERINGVERZOEKOMINFORMATIE = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/ProcedurePensioneringVerzoekOmInformatie',
    PROCEDURESTARTENEXPLOITERENSLUITENBEDRIJF = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/ProcedureStartenExploiterenSluitenBedrijf',
    PROCEDURESTARTENEXPLOITERENSLUITENBEDRIJFAANGIFTEVENNOOTSCHAPSBELASTING = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/ProcedureStartenExploiterenSluitenBedrijfAangifteVennootschapsbelasting',
    PROCEDURESTARTENEXPLOITERENSLUITENBEDRIJFBEEINDIGINGARBEIDSOVEREENKOMST = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/ProcedureStartenExploiterenSluitenBedrijfBeeindigingArbeidsovereenkomst',
    PROCEDURESTARTENEXPLOITERENSLUITENBEDRIJFBETALINGSOCIALEBIJDRAGEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/ProcedureStartenExploiterenSluitenBedrijfBetalingSocialeBijdragen',
    PROCEDURESTARTENEXPLOITERENSLUITENBEDRIJFKENNISGEVING = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/ProcedureStartenExploiterenSluitenBedrijfKennisgeving',
    PROCEDURESTARTENEXPLOITERENSLUITENBEDRIJFPENSIOENENVERZEKERINGSREGELINGENWERKGEVER = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/ProcedureStartenExploiterenSluitenBedrijfPensioenEnVerzekeringsregelingenWerkgever',
    PROCEDURESTARTENEXPLOITERENSLUITENBEDRIJFPENSIOENENVERZEKERINGSREGELINGENWERKNEMER = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/ProcedureStartenExploiterenSluitenBedrijfPensioenEnVerzekeringsregelingenWerknemer',
    PROCEDURESTUDIE = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/ProcedureStudie',
    PROCEDURESTUDIEAANVRAAGTERTIAIRONDERWIJS = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/ProcedureStudieAanvraagTertiairOnderwijs',
    PROCEDURESTUDIEVERZOEKERKENNINGDIPLOMA = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/ProcedureStudieVerzoekErkenningDiploma',
    PROCEDURESTUDIEVERZOEKTOELATINGTERTIAIRONDERWIJS = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/ProcedureStudieVerzoekToelatingTertiairOnderwijs',
    PROCEDUREVERBLIJF = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/ProcedureVerblijf',
    PROCEDUREVERBLIJFBEWIJS = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/ProcedureVerblijfBewijs',
    PROCEDUREVERHUIZING = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/ProcedureVerhuizing',
    PROCEDUREVERHUIZINGADRESWIJZIGING = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/ProcedureVerhuizingAdreswijziging',
    PROCEDUREVERHUIZINGEMISSIESTICKERS = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/ProcedureVerhuizingEmissiestickers',
    PROCEDUREVERHUIZINGINSCHRIJVINGMOTORVOERTUIG = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/ProcedureVerhuizingInschrijvingMotorvoertuig',
    PROCEDUREVERHUIZINGSTICKERSWEGENINFRASTRUCTUUR = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/ProcedureVerhuizingStickersWegeninfrastructuur',
    PROCEDUREWERK = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/ProcedureWerk',
    PROCEDUREWERKAANGIFTEINKOMSTENBELASTING = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/ProcedureWerkAangifteInkomstenbelasting',
    PROCEDUREWERKAANVRAAGZIEKTEVERZEKERINGSKAART = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/ProcedureWerkAanvraagZiekteverzekeringskaart',
    PROCEDUREWERKVERZOEK = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/ProcedureWerkVerzoek',
    PROCEDUREWERKWIJZIGINGBEROEPSSITUATIE = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/ProcedureWerkWijzigingBeroepssituatie',
    REIZEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/Reizen',
    REIZENDOCUMENTEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/ReizenDocumenten',
    REIZENELEKTRONISCHEGEGEVENS = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/ReizenElektronischeGegevens',
    REIZENGOEDEREN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/ReizenGoederen',
    REIZENONDERSTEUNINGBEPERKTEMOBILITEIT = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/ReizenOndersteuningBeperkteMobiliteit',
    REIZENRECHTENVERPLICHTINGEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/ReizenRechtenVerplichtingen',
    VERBLIJF = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/Verblijf',
    VERBLIJFKOOPVERKOOP = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/VerblijfKoopVerkoop',
    VERBLIJFNATURALISATIE = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/VerblijfNaturalisatie',
    VERBLIJFOVERLIJDEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/VerblijfOverlijden',
    VERBLIJFVERBLIJFSKAARTEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/VerblijfVerblijfskaarten',
    VERBLIJFVERHUIZING = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/VerblijfVerhuizing',
    VERBLIJFVERKIEZINGEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/VerblijfVerkiezingen',
    VOERTUIGEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/Voertuigen',
    VOERTUIGENKOOPVERKOOP = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/VoertuigenKoopVerkoop',
    VOERTUIGENVERKEERSREGELS = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/VoertuigenVerkeersregels',
    VOERTUIGENVERLENINGRIJBEWIJZEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/VoertuigenVerleningRijbewijzen',
    VOERTUIGENVERPLAATSING = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/VoertuigenVerplaatsing',
    VOERTUIGENVERPLICHTEVERZEKERING = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/VoertuigenVerplichteVerzekering',
    WERKENPENSIONERING = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/WerkEnPensionering',
    WERKENPENSIONERINGAANSPRAKELIJKHEIDENVERZEKERINGEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/WerkEnPensioneringAansprakelijkheidEnVerzekeringen',
    WERKENPENSIONERINGARBEIDSVOORWAARDEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/WerkEnPensioneringArbeidsvoorwaarden',
    WERKENPENSIONERINGBELASTINGHEFFING = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/WerkEnPensioneringBelastingheffing',
    WERKENPENSIONERINGERKENNINGKWALIFICATIES = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/WerkEnPensioneringErkenningKwalificaties',
    WERKENPENSIONERINGGAANWERKEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/WerkEnPensioneringGaanWerken',
    WERKENPENSIONERINGGELIJKEBEHANDELING = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/WerkEnPensioneringGelijkeBehandeling',
    WERKENPENSIONERINGGEZONDHEIDENVEILIGHEID = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/WerkEnPensioneringGezondheidEnVeiligheid',
    WERKENPENSIONERINGSOCIALEZEKERHEIDSRECHTEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/WerkEnPensioneringSocialezekerheidsrechten',
    WERKENPENSIONERINGWERKZOEKEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/WerkEnPensioneringWerkZoeken',
    WERKNEMERS = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/Werknemers',
    WERKNEMERSARBEIDSVOORWAARDEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/WerknemersArbeidsvoorwaarden',
    WERKNEMERSGELIJKEBEHANDELING = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/WerknemersGelijkeBehandeling',
    WERKNEMERSPERSONEELSVERTEGENWOORDIGING = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/WerknemersPersoneelsvertegenwoordiging',
    WERKNEMERSSOCIALEZEKERHEID = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/WerknemersSocialezekerheid',
    WERKNEMERSTEWERKSTELLING = 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/WerknemersTewerkstelling',
}

export enum SnapshotType {
    CREATE = 'https://productencatalogus.data.vlaanderen.be/id/concept/SnapshotType/Create',
    UPDATE = 'https://productencatalogus.data.vlaanderen.be/id/concept/SnapshotType/Update',
    DELETE = 'https://productencatalogus.data.vlaanderen.be/id/concept/SnapshotType/Delete',
}

export enum ConceptTagType {
    YOUREUROPEVERPLICHT = 'https://productencatalogus.data.vlaanderen.be/id/concept/ConceptTag/YourEuropeVerplicht',
    YOUREUROPEAANBEVOLEN = 'https://productencatalogus.data.vlaanderen.be/id/concept/ConceptTag/YourEuropeAanbevolen',
}