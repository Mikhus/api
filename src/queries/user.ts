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
import {
    GraphQLString
} from 'graphql';
import { connectionArgs } from 'graphql-relay';
import { userType, userConnection } from '../entities';
import { userFilterType } from '../filters';
import { Resolvers } from '../helpers';

/**
 * GraphQL Queries: user - query for a user data by id or email
 */
export const user: any = {
    description: 'Fetches user data by user id or email',
    type: userType,
    args: {
        id: {
            type: GraphQLString,
            description: 'User identifier. Optional. ' +
                'Either this identifier argument or email required' ,
        },
        email: {
            type: GraphQLString,
            description: 'User email address. Optional. ' +
                'Either this email argument or identifier required',
        },
    },
    resolve: Resolvers.fetchUserByIdOrEmail,
};

/**
 * GraphQL Queries: users - query for list of users
 */
export const users: any = {
    description: 'Fetches list of users applying given filters and ' +
        'selecting given number of records before or after a specified ' +
        'record in the selection list. If the data is requested not by ' +
        'admin user the max number of records to fetch is limited to ' +
        '100 (as first or last arguments define). Without a first or last ' +
        'args defined it will return first 10 users matching given filters',
    type: userConnection,
    args: {
        filter: {
            type: userFilterType,
            description: 'Optional argument, allowing to define filtering ' +
                'criteria for user list selection',
        },
        ...connectionArgs,
    },
    resolve: Resolvers.fetchUsers,
};
