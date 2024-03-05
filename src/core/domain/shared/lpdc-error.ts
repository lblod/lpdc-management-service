export class LpdcError {
    constructor(readonly message: string) {
    }
}

export class InvariantError extends LpdcError {
    constructor(message: string = "Invariant error") {
        super(message);
    }
}

export class NotFoundError extends LpdcError {
    constructor(message: string) {
        super(message);
    }
}

export class ConcurrentUpdateError extends LpdcError {
    constructor(message: string) {
        super(message);
    }
}

export class SystemError extends LpdcError {
    constructor(message: string) {
        super(message);
    }
}