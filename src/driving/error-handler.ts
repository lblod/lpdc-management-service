import {NextFunction, Request, Response} from "express";
import {HttpError, InternalServerError} from "./http-error";


class ErrorHandler {
    handleError(
        error: Error | HttpError,
        req: Request,
        res: Response
    ): Response {
        const httpError: HttpError =
            error instanceof HttpError ? error : new InternalServerError();
        if (httpError.is4xx()) {
            console.warn("Client error occurred", httpError);
        } else {
            console.error("Server error occurred:", {...httpError, error});
        }
        return res.status(httpError.status).json(httpError);
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