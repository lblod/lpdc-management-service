import {Iri} from "./shared/iri";
import {TaalString} from "./taal-string";
import _ from 'lodash';


export class ConceptVersie {

    private readonly _id: Iri;
    private readonly _title: TaalString | undefined;
    private readonly _description: TaalString | undefined;
    private readonly _additionalDescription: TaalString | undefined;
    private readonly _exception: TaalString | undefined;
    private readonly _regulation: TaalString | undefined;
    private readonly _startDate: Date | undefined;
    private readonly _endDate: Date | undefined;
    private readonly _type: ProductType | undefined;
    private readonly _targetAudiences: Set<TargetAudienceType>;
    private readonly _themes: Set<ThemeType>;
    private readonly _competentAuthorityLevels: Set<CompetentAuthorityLevelType>;
    private readonly _competentAuthorities: Set<Iri>;
    private readonly _executingAuthorityLevels: Set<ExecutingAuthorityLevelType>;

    //TODO LPDC-916: extract into shared helper ... or use lodash?
    private sortSet<T>(aSet: Set<T>) : Set<T> {
        const arr = Array.from(aSet);
        arr.sort();
        return new Set(arr);
    }

    constructor(id: Iri,
                title: TaalString | undefined,
                description: TaalString | undefined,
                additionalDescription: TaalString | undefined,
                exception: TaalString | undefined,
                regulation: TaalString | undefined,
                startDate: Date | undefined,
                endDate: Date | undefined,
                type: ProductType | undefined,
                targetAudiences: Set<TargetAudienceType>,
                themes: Set<ThemeType>,
                competentAuthorityLevels: Set<CompetentAuthorityLevelType>,
                competentAuthorities: Set<Iri>,
                executingAuthorityLevels: Set<ExecutingAuthorityLevelType>) {
        //TODO LPDC-916: enforce invariants ? + do safe copies ?
        this._id = id;
        this._title = title;
        this._description = description;
        this._additionalDescription = additionalDescription;
        this._exception = exception;
        this._regulation = regulation;
        this._startDate = startDate;
        this._endDate = endDate;
        this._type = type;
        this._targetAudiences = this.sortSet(targetAudiences);
        this._themes = this.sortSet(themes);
        this._competentAuthorityLevels = this.sortSet(competentAuthorityLevels);
        this._competentAuthorities = this.sortSet(competentAuthorities);
        this._executingAuthorityLevels = this.sortSet(executingAuthorityLevels);
    }

    get id(): Iri {
        return this._id;
    }

    get title(): TaalString | undefined {
        return this._title;
    }

    get description(): TaalString | undefined {
        return this._description;
    }

    get additionalDescription(): TaalString | undefined {
        return this._additionalDescription;
    }

    get exception(): TaalString | undefined {
        return this._exception;
    }

    get regulation(): TaalString | undefined {
        return this._regulation;
    }

    get startDate(): Date | undefined {
        return this._startDate;
    }

    get endDate(): Date | undefined {
        return this._endDate;
    }

    get type(): ProductType | undefined {
        return this._type;
    }

    get targetAudiences(): Set<TargetAudienceType> {
        return this._targetAudiences;
    }

    get themes(): Set<ThemeType> {
        return this._themes;
    }

    get competentAuthorityLevels(): Set<CompetentAuthorityLevelType> {
        return this._competentAuthorityLevels;
    }

    get competentAuthorities(): Set<Iri> {
        return this._competentAuthorities;
    }

    get executingAuthorityLevels(): Set<ExecutingAuthorityLevelType> {
        return this._executingAuthorityLevels;
    }

    static isFunctionallyChanged(aConceptVersie: ConceptVersie, anotherConceptVersie: ConceptVersie): boolean {
        return TaalString.isFunctionallyChanged(aConceptVersie.title, anotherConceptVersie.title)
            || TaalString.isFunctionallyChanged(aConceptVersie.description, anotherConceptVersie.description)
            || TaalString.isFunctionallyChanged(aConceptVersie.additionalDescription, anotherConceptVersie.additionalDescription)
            || TaalString.isFunctionallyChanged(aConceptVersie.exception, anotherConceptVersie.exception)
            || TaalString.isFunctionallyChanged(aConceptVersie.regulation, anotherConceptVersie.regulation)
            || aConceptVersie.startDate?.getTime() !== anotherConceptVersie.startDate?.getTime()
            || aConceptVersie.endDate?.getTime() !== anotherConceptVersie.endDate?.getTime()
            || aConceptVersie.type !== anotherConceptVersie.type
            || !_.isEqual(aConceptVersie.targetAudiences, anotherConceptVersie.targetAudiences)
            || !_.isEqual(aConceptVersie.themes, anotherConceptVersie.themes)
            || !_.isEqual(aConceptVersie.competentAuthorityLevels, anotherConceptVersie.competentAuthorityLevels)
            || !_.isEqual(aConceptVersie.competentAuthorities, anotherConceptVersie.competentAuthorities)
            || !_.isEqual(aConceptVersie.executingAuthorityLevels, anotherConceptVersie.executingAuthorityLevels);
    }

}

export enum ProductType { //TODO LPDC-916: ok to compromise and put an uri in here ?
    FINANCIELEVERPLICHTING = 'https://productencatalogus.data.vlaanderen.be/id/concept/Type/FinancieleVerplichting',
    TOELATING = 'https://productencatalogus.data.vlaanderen.be/id/concept/Type/Toelating',
    BEWIJS = 'https://productencatalogus.data.vlaanderen.be/id/concept/Type/Bewijs',
    VOORWERP = 'https://productencatalogus.data.vlaanderen.be/id/concept/Type/Voorwerp',
    ADVIESBEGELEIDING = 'https://productencatalogus.data.vlaanderen.be/id/concept/Type/AdviesBegeleiding',
    INFRASTRUCTUURMATERIAAL = 'https://productencatalogus.data.vlaanderen.be/id/concept/Type/InfrastructuurMateriaal',
    FINANCIEELVOORDEEL = 'https://productencatalogus.data.vlaanderen.be/id/concept/Type/FinancieelVoordeel',
}

export enum TargetAudienceType { //TODO LPDC-916: ok to compromise and put an uri in here ?
    BURGER = 'https://productencatalogus.data.vlaanderen.be/id/concept/Doelgroep/Burger',
    ONDERNEMING = 'https://productencatalogus.data.vlaanderen.be/id/concept/Doelgroep/Onderneming',
    ORGANISATIE = 'https://productencatalogus.data.vlaanderen.be/id/concept/Doelgroep/Organisatie',
    VLAAMSEOVERHEID = 'https://productencatalogus.data.vlaanderen.be/id/concept/Doelgroep/VlaamseOverheid',
    LOKAALBESTUUR = 'https://productencatalogus.data.vlaanderen.be/id/concept/Doelgroep/LokaalBestuur',
    VERENIGING = 'https://productencatalogus.data.vlaanderen.be/id/concept/Doelgroep/Vereniging',
}

export enum ThemeType { //TODO LPDC-916: ok to compromise and put an uri in here ?
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
