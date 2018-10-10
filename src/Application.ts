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

import {
    portOpen,
    schema,
    clientOptions,
    user
} from '.';

export class Application {

    public static env = process.env['NODE_ENV'] || 'development';
    public static host = os.hostname();
    public static port = Number(process.env['API_PORT']) || 8888;
    public static key = process.env["API_SSL_KEY"] || '';
    public static cert = process.env['API_SSL_CERT'] || '';
    public static isSecure = !!(~process.argv.indexOf('--SECURED') &&
        Application.key && Application.cert
    );

    public static async run() {
        let port = Application.port;
        const app = express();
        const context = {
            user: new user.UserClient(clientOptions),
        };

        await context.user.start();

        app.use(compression());
        app.use(bodyParser.json({
            type(req: express.Request) {
                return /application\/.*?\bjson\b.*?$/.test(
                    String(req.header('content-type'))
                );
            },
            // keep rawBody with request
            verify(req: any, res: any, buf: any, encoding: string) {
                if (buf && buf.length) {
                    req.rawBody = buf.toString(encoding || 'utf8');
                }
            },
            limit: '20mb',
        }));
        app.use(helmet());
        app.use('/', expressGraphql(request =>({
            schema: schema,
            rootValue: request,
            graphiql: process.env['NODE_ENV'] === 'development',
            context,
        })));

        while (!await portOpen(port)) {
            port++;
        }

        Application.port = port;

        if (Application.isSecure) {
            https.createServer({
                key: fs.readFileSync(Application.key),
                cert: fs.readFileSync(Application.cert)
            }, app).listen(port, async () => {
                console.log(`Listening at https://${Application.host}:${port}`);
                console.log(`Environment: ${Application.env}`);
            });
        }

        else {
            http.createServer(app).listen(port, async() => {
                console.log(`Listening at http://${Application.host}:${port}`);
                console.log(`Environment: ${Application.env}`);
            });
        }
    }
}
