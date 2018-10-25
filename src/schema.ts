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
import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import { wrapResolvers } from 'graphql-validity/lib';
import { nodeField } from './entities';
import { updateUser, login, logout } from './mutations';
import { user, users, car, cars, brands } from './queries';

/**
 * Defining Query type for GraphQL schema
 */
const Query: GraphQLObjectType = new GraphQLObjectType({
    name: 'Query',
    fields: {
        node: nodeField,
        users,
        user,
        cars,
        car,
        brands,
    },
});

/**
 * Defining Mutation type for GraphL schema
 */
const Mutation: GraphQLObjectType = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        updateUser,
        login,
        logout,
    },
});

// const Subscription = new GraphQLObjectType({
//     name: 'Subscription',
//     fields: {},
// });

export const schema = new GraphQLSchema({
    query: Query,
    mutation: Mutation,
    // subscription: Subscription,
});

wrapResolvers(schema);
