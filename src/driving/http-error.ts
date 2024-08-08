import {uuid} from "mu";
import {
    ConcurrentUpdateError,
    ForbiddenError,
    InvariantError,
    NotFoundError,
    SystemError
} from "../core/domain/shared/lpdc-error";

export abstract class HttpError extends Error {
    public readonly status: number;
    public readonly correlationId: string;
    private readonly stackTrace: string;
    private readonly originalErrorType: string;
    private readonly originalErrorStack: string;

    protected constructor(status: number,
                          message: string,
                          originalError: Error | undefined,
    ) {
        super(message);
        this.status = status;
        this.correlationId = uuid();
        this.stackTrace = this.stack;
        if (originalError) {
            this.originalErrorType = originalError.constructor.name;
            this.originalErrorStack = originalError.stack;
        }
    }

    is4xx(): boolean {
        return this.status >= 400 && this.status <= 499;
    }

    is5xx(): boolean {
        return this.status >= 500 && this.status <= 599;
    }

}

export class BadRequest extends HttpError {
    constructor(message = 'Aanvraag ongeldig. Controleer en probeer opnieuw.', invariantError: InvariantError = undefined) {
        super(400, invariantError?.message ? invariantError.message : message, invariantError);
    }
}

export class Unauthorized extends HttpError {
    constructor(message = 'Autorisatie vereist. Log alstublieft in om toegang te krijgen.') {
        super(401, message, undefined);
    }
}

export class Forbidden extends HttpError {
    constructor(message = 'Toegang geweigerd. U heeft geen rechten voor deze actie.', forbiddenError: ForbiddenError = undefined) {
        super(403, forbiddenError?.message ? forbiddenError.message : message, forbiddenError);
    }
}

export class NotFound extends HttpError {
    constructor(message = `Pagina niet gevonden. Controleer de URL en probeer opnieuw.`, notFoundError: NotFoundError = undefined) {
        super(404, notFoundError?.message ? notFoundError.message : message, notFoundError);
    }
}

export class Conflict extends HttpError {
    constructor(concurrentUpdateError: ConcurrentUpdateError) {
        super(409, concurrentUpdateError.message, concurrentUpdateError);
    }
}

export class InternalServerError extends HttpError {
    constructor(systemError: SystemError | Error = undefined) {
        super(500, 'Er is een serverfout opgetreden. Probeer het later opnieuw of neem contact op indien het probleem aanhoudt. Onze excuses voor het ongemak.', systemError);
    }
}
