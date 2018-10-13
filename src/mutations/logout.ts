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
import {
    GraphQLString,
    GraphQLNonNull,
    GraphQLBoolean,
    GraphQLResolveInfo
} from 'graphql';
import { mutationWithClientMutationId } from 'graphql-relay';
import { ERROR_UNAUTHORIZED } from '../ResponseError';

export const logout = mutationWithClientMutationId({
    name: 'logout',
    description: 'Logs user out and invalidates token',
    inputFields: {
        token: {
            type: new GraphQLNonNull(GraphQLString),
            description:  'Valid auth jwt token which should be invalidated'
        },
    },
    outputFields: {
        success: {
            type: GraphQLBoolean,
            description: 'Logout operation success result'
        },
    },
    async mutateAndGetPayload(
        args: any,
        context: any,
        info: GraphQLResolveInfo,
    ) {
        const { isAdmin, isActive, email } = info.rootValue;
        let currentUser = undefined;

        if (!(isAdmin && isActive)) {
            currentUser = email;
        }

        if (!await context.auth.logout(args.token, currentUser)) {
            throw ERROR_UNAUTHORIZED;
        }

        return { success: true };
    }
});
