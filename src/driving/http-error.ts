import {uuid} from "../../mu-helper";

export class HttpError extends Error {
    private readonly _correlationId: string;
    private readonly _stackTrace: string;

    constructor(private _status: number,
                private _message: string,
                private _level: ErrorLevel,
    ) {
        super(_message);
        this._correlationId = uuid();
        this._stackTrace = this.stack;

    }
    
    get stackTrace(): string {
        return this._stackTrace;
    }

    get correlationId(): string {
        return this._correlationId;
    }

    is4xx(): boolean {
        return this._status >= 400 && this._status <= 499;
    }

    get status(): number {
        return this._status;
    }

    is5xx(): boolean {
        return this._status >= 500 && this._status <= 599;
    }

    get message(): string {
        return this._message;
    }

    get level(): ErrorLevel {
        return this._level;
    }
}

export enum ErrorLevel {
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR"
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

export class NotFound extends HttpError {
    constructor(message = 'Not found ') {
        super(404, message, ErrorLevel.WARN);
    }
}

export class Conflict extends HttpError {
    constructor(message = 'Concurrent update ') {
        super(409, message, ErrorLevel.WARN);
    }
}

export class InternalServerError extends HttpError {
    constructor(message = 'Oeps, er ging iets mis') {
        super(500, message, ErrorLevel.ERROR);
    }
}
