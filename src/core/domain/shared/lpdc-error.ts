export abstract class LpdcError extends Error {

    private readonly _stackTrace: string;

    protected constructor(readonly message: string) {
        super(message);
        this._stackTrace = this.stack;
    }

    get stackTrace(): string {
        return this._stackTrace;
    }
}

export class InvariantError extends LpdcError {
    constructor(message: string = 'Validatie mislukt. Controleer de ingevoerde gegevens en probeer opnieuw.') {
        super(message);
    }
}

export class NotFoundError extends LpdcError {
    constructor(message: string = 'De opgevraagde gegevens werden niet gevonden.') {
        super(message);
    }
}

export class ConcurrentUpdateError extends LpdcError {
    constructor(message: string = 'De gegevens zijn gelijktijdig aangepast door een andere gebruiker. Herlaad de pagina en geef je aanpassingen opnieuw in.') {
        super(message);
    }
}

export class ForbiddenError extends LpdcError {
    constructor(message: string = 'Toegang geweigerd. U heeft geen rechten voor deze actie.') {
        super(message);
    }
}

export class SystemError extends LpdcError {
    constructor(message: string = 'Er is een serverfout opgetreden. Probeer het later opnieuw of neem contact op indien het probleem aanhoudt. Onze excuses voor het ongemak.') {
        super(message);
    }
}