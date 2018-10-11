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
    GraphQLBoolean,
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLString,
    GraphQLList
} from 'graphql';
import {
    nodeDefinitions,
    globalIdField,
    connectionDefinitions,
} from 'graphql-relay';
import {
    FieldValidationDefinitions,
    wrapResolvers
} from 'graphql-validity/lib';
import { user as u } from './clients';
import { Resolvers } from './helpers';
import { validateAdmin } from './validators';

FieldValidationDefinitions['User:password'] = [validateAdmin];
FieldValidationDefinitions['User:email'] = [validateAdmin];

const { nodeInterface, nodeField } = nodeDefinitions(Resolvers.fetchNodeById);

/**
 * User type definition for GraphQL schema
 */
const userType = new GraphQLObjectType({
    name: 'User',
    description: 'User entity',
    interfaces: [nodeInterface],
    fields: () => ({
        id: globalIdField('User', (user: u.UserObject) => String(user._id)),
        firstName: {
            type: GraphQLString,
            description: 'User\'s first (given) name',
            resolve: (user: u.UserObject) => user.firstName,
        },
        lastName: {
            type: GraphQLString,
            description: 'User\'s last (family) name',
            resolve: (user: u.UserObject) => user.lastName,
        },
        email: {
            type: GraphQLString,
            description: 'User\'s contact email (unique)',
            resolve: (user: u.UserObject) => user.email,
        },
        password: {
            type: GraphQLString,
            description: 'User\'s password',
            resolve: (user: u.UserObject) => user.password,
        },
        isActive: {
            type: GraphQLBoolean,
            description: 'User\'s active state flag',
            resolve: (user: u.UserObject) => !!user.isActive,
        },
        isAdmin: {
            type: GraphQLBoolean,
            description: 'User\'s admin role flag',
            resolve: (user: u.UserObject) => !!user.isAdmin,
        },
    }),
});

const { connectionType: userConnection } =
    connectionDefinitions({ nodeType: userType });

const Query: GraphQLObjectType = new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
        users: {
            type: new GraphQLList(userType),
            resolve: Resolvers.fetchUsers
        },
        node: nodeField
    }),
});

// const Mutation: GraphQLObjectType = new GraphQLObjectType({
//     name: 'Mutation',
//     fields: {},
// });

// const Subscription = new GraphQLObjectType({
//     name: 'Subscription',
//     fields: {},
// });

export const schema = new GraphQLSchema({
    query: Query,
    // mutation: Mutation,
    // subscription: Subscription,
});

wrapResolvers(schema);
