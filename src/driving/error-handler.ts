import {NextFunction, Request, Response} from "express";
import {BadRequest, Conflict, HttpError, InternalServerError, NotFound} from "./http-error";
import {ConcurrentUpdateError, InvariantError, LpdcError, NotFoundError} from "../core/domain/shared/lpdc-error";


class ErrorHandler {

    handleError(
        error: Error | LpdcError,
        req: Request,
        res: Response
    ): Response {

        const httpError = error instanceof LpdcError ?
            this.mapToHttpError(error) : (error instanceof HttpError ? error : new InternalServerError());

        if (httpError.is4xx()) {
            console.warn("Client error occurred", httpError);
        } else {
            console.error("Server error occurred:", {...httpError, error});
        }
        return res.status(httpError.status).json(httpError);

    }

    private mapToHttpError(error: LpdcError): HttpError {
        if (error instanceof InvariantError) {
            return new BadRequest(error.message);
        }
        if (error instanceof NotFoundError) {
            return new NotFound(error.message);
        }
        if (error instanceof ConcurrentUpdateError) {
            return new Conflict(error.message);
        }
        console.error("Missing error mapping", error);
        return new InternalServerError();
    }
}

const errorHandler = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
): Response => {
    return new ErrorHandler().handleError(error, req, res);
};
export default errorHandler;