import {uuid} from "../../mu-helper";

export enum ErrorLevel {
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR"
}

export class HttpError {

    constructor(private _status: number,
                private _message: string,
                private _level: ErrorLevel,
    ) {
        this._correlationId = uuid();
    }

    private _correlationId: string;

    get correlationId(): string {
        return this._correlationId;
    }

    get status(): number {
        return this._status;
    }

    get message(): string {
        return this._message;
    }

    get level(): ErrorLevel {
        return this._level;
    }

    is4xx(): boolean {
        return this._status >= 400 && this._status <= 499;
    }

    is5xx(): boolean {
        return this._status >= 500 && this._status <= 599;
    }
}

export class BadRequest extends HttpError {
    constructor(message = 'Bad request for this request') {
        super(400, message, ErrorLevel.WARN);
    }
}

export class Unauthorized extends HttpError {
    constructor(message = 'Not authenticated for this request') {
        super(401, message, ErrorLevel.WARN);
    }
}

export class Forbidden extends HttpError {
    constructor(message = 'Je hebt niet voldoende rechten om deze actie uit te voeren') {
        super(403, message, ErrorLevel.WARN);
    }
}

export class InternalServerError extends HttpError {
    constructor(message = 'Oeps, er ging iets mis') {
        super(500, message, ErrorLevel.ERROR);
    }
}