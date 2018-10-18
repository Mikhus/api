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
import { GraphQLString, GraphQLNonNull, GraphQLResolveInfo } from 'graphql';
import { mutationWithClientMutationId } from 'graphql-relay';
import { userType } from '../entities';
import { selectedFields } from '../helpers';
import {
    INVALID_CREDENTIALS,
    USER_EMAIL_EMPTY,
    USER_PASSWORD_EMPTY,
    USER_ACCOUNT_BLOCKED,
} from '../ResponseError';

const fields: any = userType.getFields();

/**
 * GraphQL Mutation: login - logs user in using given credentials
 */
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
            description: 'User\'s authentication token'
        },
        user: {
            type: userType,
            description: 'Authenticated user'
        },
    },
    async mutateAndGetPayload(
        args: any,
        context: any,
        info: GraphQLResolveInfo,
    ) {
        if (!args.email) {
            throw USER_EMAIL_EMPTY;
        }

        if (!args.password) {
            throw USER_PASSWORD_EMPTY;
        }

        const [ token, user ]: any = await Promise.all([
            context.auth.login(args.email, args.password),
            context.user.fetch(
                args.email,
                selectedFields(info, { id: '_id' }, 'user')
            )
        ]).catch((err: Error) => {
            if (/blocked/i.test(err.message)) {
                throw USER_ACCOUNT_BLOCKED;
            }
        });

        if (!(token && user)) {
            throw INVALID_CREDENTIALS;
        }

        if (!user.isActive) {
            throw USER_ACCOUNT_BLOCKED;
        }

        return { user, token };
    }
});
