import {NextFunction, Request, Response} from "express";
import {BadRequest, Conflict, Forbidden, HttpError, InternalServerError, NotFound} from "./http-error";
import {
    ConcurrentUpdateError,
    ForbiddenError,
    InvariantError,
    LpdcError,
    NotFoundError,
    SystemError
} from "../core/domain/shared/lpdc-error";

class ErrorHandler {

    handleError(
        error: Error | LpdcError,
        req: Request,
        res: Response
    ): Response {

        const httpError = error instanceof LpdcError ?
            this.mapToHttpError(error) : (error instanceof HttpError ? error : new InternalServerError(error));

        if (httpError.is4xx()) {
            console.warn("Client error occurred", {...httpError, 'request': req.url});
        }
        if (httpError.is5xx()) {
            console.error("Server error occurred:", {...httpError, 'request': req.url});
        }

        return res.status(httpError.status).json({
            'correlationId': httpError.correlationId,
            'message': httpError.message
        });
    }

    private mapToHttpError(error: LpdcError): HttpError {
        if (error instanceof InvariantError) {
            return new BadRequest(undefined, error);
        }
        if (error instanceof NotFoundError) {
            return new NotFound(undefined, error);
        }
        if (error instanceof ConcurrentUpdateError) {
            return new Conflict(error);
        }
        if(error instanceof ForbiddenError) {
            return new Forbidden(undefined, error);
        }
        if (error instanceof SystemError) {
            return new InternalServerError(error);
        }
        return new InternalServerError(error);
    }
}

const errorHandler = (
    error: Error,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction
): Response => {
    return new ErrorHandler().handleError(error, req, res);
};
export default errorHandler;