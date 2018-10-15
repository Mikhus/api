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
 */
import { userType } from '../entities';
import { GraphQLString } from 'graphql';
import { Resolvers } from '../helpers';

/**
 * GraphQL Queries: user - query for a user data by id or email
 */
export const user = {
    description: 'Fetches user data by user id or email',
    type: userType,
    args: {
        id: {
            type: GraphQLString,
            description: 'User identifier. Optional. ' +
                'Either this identifier or email required' ,
        },
        email: {
            type: GraphQLString,
            description: 'User email address. Optional. ' +
                'Either this email or identifier required',
        },
    },
    resolve: Resolvers.fetchUserByIdOrEmail,
};
