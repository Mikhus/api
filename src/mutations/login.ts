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
import { GraphQLString, GraphQLNonNull } from 'graphql';
import { mutationWithClientMutationId } from 'graphql-relay';
import { userType } from '../entities';

const fields = userType.getFields();

export const login = mutationWithClientMutationId({
    name: 'login',
    description: 'Logs user in and returns valid auth jwt token',
    inputFields: {
        email: {
            type: new GraphQLNonNull(GraphQLString),
            description: fields.email.description
        },
        password: {
            type: new GraphQLNonNull(GraphQLString),
            description: fields.password.description
        },
    },
    outputFields: {
        token: {
            type: GraphQLString,
            description: 'User\'s JWT authentication token'
        },
    },
    mutateAndGetPayload: async (args: any, context: any) => {
        return { token: await context.auth.login(args.email, args.password) };
    }
});