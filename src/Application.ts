/*!
 * ISC License
 *
 * Copyright (c) 2018, Imqueue Sandbox
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 */
import 'core-js/modules/es7.symbol.async-iterator';
import * as bodyParser from 'body-parser';
import * as helmet from 'helmet';
import * as express from 'express';
import * as expressGraphql from 'express-graphql';
import * as compression from 'compression';
import * as fs from 'fs';
import * as os from 'os';
import * as https from 'https';
import * as http from 'http';
import { graphQLValidityExpressMiddleware } from 'graphql-validity/lib';
import {
    requestUser,
    clientOptions,
    portOpen,
    schema,
    user,
    auth,
    car
} from '.';

/**
 * Class Application.
 * Implements express/graphql application bootstrap and execution.
 */
export class Application {

    /**
     * Runtime environment name
     * @type {string}
     */
    public static env: string = process.env['NODE_ENV'] || 'development';

    /**
     * Application runtime hostname
     * @type {string}
     */
    public static host: string = os.hostname();

    /**
     * Application runtime port
     * @type {number}
     */
    public static port: number = Number(process.env['API_PORT']) || 8888;

    /**
     * Path to SSL .key file for secure connections
     * @type {string}
     */
    public static key: string = process.env["API_SSL_KEY"] || '';

    /**
     * Path to SSL .cert file for secure connections
     * @type {string}
     */
    public static cert: string = process.env['API_SSL_CERT'] || '';

    /**
     * Runtime secure flag
     * @type {boolean}
     */
    public static isSecure: boolean = !!(
        ~process.argv.indexOf('--SECURED') &&
        Application.key &&
        Application.cert
    );

    /**
     * Starts-up an application
     */
    public static async run() {
        const app: express.Application = express();
        const context: any = await Application.bootstrapContext();

        Application.initMiddleware(app, context);
        Application.initRoutes(app, context);
        return Application.startServer(app);
    }

    /**
     * Initializes application's http routes
     *
     * @param {express.Application} app
     * @param {any} context
     */
    private static initRoutes(app: express.Application, context: any) {
        app.use('/', expressGraphql(request =>({
            schema: schema,
            rootValue: request,
            graphiql: Application.env === 'development',
            context,
            formatError(err: Error) {
                let extensions: any = null;

                if ((err as any).extensions) {
                    extensions = (err as any).extensions;
                }

                return {
                    message: err.message,
                    extensions,
                    locations: (err as any).locations,
                    path: (err as any).path
                };
            }
        })));
    }

    /**
     * Initializes all required express middlewares
     *
     * @param {express.Application} app
     */
    private static initMiddleware(app: express.Application, context: any) {
        app.use(compression());
        app.use(bodyParser.json({
            type(req: express.Request) {
                return /application\/.*?\bjson\b.*?$/.test(
                    String(req.header('content-type'))
                );
            },
            // keep rawBody with request
            verify(
                req: express.Request,
                res: express.Response,
                buf: Buffer,
                encoding: string
            ) {
                if (buf && buf.length) {
                    (req as any).rawBody = buf.toString(encoding || 'utf8');
                }
            },
            limit: '20mb',
        }));
        app.use(helmet());
        app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header(
                'Access-Control-Allow-Headers',
                'Origin, X-Requested-With, Content-Type, Accept, X-Auth-User'
            );

            if ('OPTIONS' === req.method) {
                res.sendStatus(200);
            }

            else {
                next();
            }
        });
        app.use(requestUser(context));
        app.use(graphQLValidityExpressMiddleware);
    }

    /**
     * Initializes runtime context for graphql application
     *
     * @return {any} - initialized context
     */
    private static async bootstrapContext(): Promise<any> {
        const context: any = {
            user: new user.UserClient(clientOptions),
            auth: new auth.AuthClient(clientOptions),
            car: new car.CarClient(clientOptions),
        };

        await context.user.start();
        await context.auth.start();
        await context.car.start();

        return context;
    }

    /**
     * Starts HTTP server and binds express application
     *
     * @param {express.Application} app
     */
    private static async startServer(app: express.Application) {
        let port: number = Application.port;

        while (!await portOpen(port)) {
            port++;
        }

        Application.port = port;

        if (Application.isSecure) {
            https.createServer({
                key: fs.readFileSync(Application.key),
                cert: fs.readFileSync(Application.cert)
            }, app).listen(port, async () => {
                const logger = clientOptions.logger || console;

                logger.log(`Listening at https://${Application.host}:${port}`);
                logger.log(`Environment: ${Application.env}`);
            });
        }

        else {
            http.createServer(app).listen(port, async() => {
                const logger = clientOptions.logger || console;

                logger.log(`Listening at http://${Application.host}:${port}`);
                logger.log(`Environment: ${Application.env}`);
            });
        }
    }
}
