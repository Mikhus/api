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
    GraphQLID,
    GraphQLNonNull,
    GraphQLList,
    GraphQLResolveInfo,
} from 'graphql';
import { fromGlobalId, mutationWithClientMutationId } from 'graphql-relay';
import { reservationType } from '../entities';
import { ERROR_UNAUTHORIZED } from '../ResponseError';
import { verifyRequestForOwner } from '../validators';
import { Resolvers } from '../helpers';

/**
 * GraphQL Mutation: removeCar - removes car from a user
 */
export const cancelReservation = mutationWithClientMutationId({
    name: 'cancelReservation',
    description: 'Cancels existing reservation',
    inputFields: {
        id: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'Existing reservation identifier',
        },
    },
    outputFields: {
        reservations: {
            type: new GraphQLList(reservationType),
            description: 'Updated list of reservations',
        },
    },
    async mutateAndGetPayload(
        args: { id: string },
        context: any,
        info: GraphQLResolveInfo,
    ) {
        if (!info.rootValue.authUser) {
            throw ERROR_UNAUTHORIZED;
        }

        verifyRequestForOwner(info);

        const reservationId = fromGlobalId(args.id).id;
        const reservations = await context.timeTable.cancel(
            reservationId,
            Resolvers.reservationFields(info, 'reservations'),
        );

        return { reservations };
    },
});
