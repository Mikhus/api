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
    GraphQLString,
    GraphQLNonNull,
    GraphQLResolveInfo,
    GraphQLID,
} from 'graphql';
import { fromGlobalId, mutationWithClientMutationId } from 'graphql-relay';
import { fieldsList } from 'graphql-fields-list';
import {
    USER_CRITERIA_REQUIRED,
} from '../ResponseError';
import { userType } from '../entities';

/**
 * GraphQL Mutation: addCar - adds a car to a user
 */
export const addCar = mutationWithClientMutationId({
    name: 'addCar',
    description: 'Adds a car to a user',
    inputFields: {
        idOrEmail: {
            type: GraphQLID,
            description:  'User identifier or email address. Optional. ' +
                'If not passed user must be authenticated.'
        },
        carId: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'Selected car identifier',
        },
        regNumber: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'User\'s car registration number',
        },
    },
    outputFields: {
        user: {
            type: userType,
            description: 'Updated user data object'
        },
    },
    async mutateAndGetPayload(
        args: { idOrEmail?: string, carId: string, regNumber: string },
        context: any,
        info: GraphQLResolveInfo,
    ) {
        if (!args.idOrEmail) {
            const user = (info.rootValue as any).authUser;
            args.idOrEmail = user && user.id;
        } else if (!args.idOrEmail) {
            throw USER_CRITERIA_REQUIRED;
        } else {
            args.idOrEmail = fromGlobalId(args.idOrEmail).id;
        }

        const user = await context.user.addCar(
            args.idOrEmail,
            fromGlobalId(args.carId).id,
            args.regNumber,
            fieldsList(info, {
                transform: { id: '_id' },
                path: 'user'
            }),
        );

        return { user };
    }
});
