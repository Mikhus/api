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

import { schema, clientOptions, user } from '.';

export class Application {
    public static async run() {
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
        app.use('/graphql', expressGraphql(request =>({
            schema: schema,
            rootValue: request,
            graphiql: process.env['NODE_ENV'] === 'development',
            context,
        })));
    }
}
