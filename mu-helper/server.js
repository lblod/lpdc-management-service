import httpContext from 'express-http-context';
import express from 'express';
import bodyParser from 'body-parser';

function createApp() {

    const app = express();

    const port = process.env.PORT || '80';
    const hostname = process.env.HOST || '0.0.0.0';
    const bodySizeLimit = process.env.MAX_BODY_SIZE || '100kb';

    // parse JSONAPI content type
    app.use(bodyParser.json({
        type: function (req) {
            return /^application\/vnd\.api\+json/.test(req.get('content-type'));
        },
        limit: bodySizeLimit
    }));
    app.use(bodyParser.urlencoded({extended: false}));

    // set JSONAPI content type
    app.use('/', function (req, res, next) {
        res.type('application/vnd.api+json');
        next();
    });

    app.use(httpContext.middleware);

    app.use(function (req, res, next) {
        httpContext.set('request', req);
        httpContext.set('response', res);
        next();
    });

    // start server
    app.listen(port, hostname, function () {
        console.log(`Starting server on ${hostname}:${port} in ${app.get('env')} mode`);
    });

    return app;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = function (err, req, res, _next) {
    res.status(err.status || 400);
    res.json({
        errors: [{title: err.message}]
    });
};

export {
    createApp,
    errorHandler
};
