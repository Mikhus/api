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
} from 'graphql';
import { fromGlobalId, mutationWithClientMutationId } from 'graphql-relay';
import { fieldsList } from 'graphql-fields-list';
import { userType } from '../entities';
import { ERROR_UNAUTHORIZED } from '../ResponseError';
import { verifyRequestForOwner } from '../validators';

/**
 * GraphQL Mutation: removeCar - removes car from a user
 */
export const removeCar = mutationWithClientMutationId({
    name: 'removeCar',
    description: 'Removes car from a user',
    inputFields: {
        carId: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'User\'s car identifier',
        },
    },
    outputFields: {
        user: {
            type: userType,
            description: 'Updated user data object',
        },
    },
    async mutateAndGetPayload(
        args: { carId: string },
        context: any,
        info: GraphQLResolveInfo,
    ) {
        if (!info.rootValue.authUser) {
            throw ERROR_UNAUTHORIZED;
        }

        verifyRequestForOwner(info);

        args.carId = fromGlobalId(args.carId).id;

        const user = await context.user.removeCar(args.carId, fieldsList(info, {
            transform: { id: '_id' },
            path: 'user'
        }));

        return { user };
    },
});
