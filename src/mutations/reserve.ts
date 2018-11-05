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
    GraphQLList,
    GraphQLID, GraphQLObjectType,
} from 'graphql';
import { fromGlobalId, mutationWithClientMutationId } from 'graphql-relay';
import { fieldsList } from 'graphql-fields-list';
import {
    USER_CRITERIA_REQUIRED,
    ResponseError,
    ERROR_UNAUTHORIZED,
} from '../ResponseError';
import { reservationType } from '../entities';
import { verifyRequestForOwner } from "../validators";

/**
 * GraphQL Mutation: addCar - adds a car to a user
 */
export const reserve = mutationWithClientMutationId({
    name: 'reserve',
    description: 'Makes car washing time reservation',
    inputFields: {
        userId: {
            type: GraphQLID,
            description:  'User identifier',
        },
        carId: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'Selected car identifier',
        },
        type: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'Reservation washing type',
        },
        duration: {
            type: new GraphQLNonNull(new GraphQLList(GraphQLString)),
            description: 'Time range as list of two date/time strings in ' +
                'ISO format representing start and end date/time',
        },
    },
    outputFields: {
        reservations: {
            type: new GraphQLList(reservationType),
            description: 'Updated list of reservations',
        },
    },
    async mutateAndGetPayload(
        args: {
            userId?: string,
            carId: string,
            type: string,
            duration: [string, string],
        },
        context: any,
        info: GraphQLResolveInfo,
    ) {
        if (!info.rootValue.authUser) {
            throw ERROR_UNAUTHORIZED;
        }

        verifyRequestForOwner(info);

        if (!args.userId) {
            const user = (info.rootValue as any).authUser;
            args.userId = user && user.id;
        } else if (!args.userId) {
            throw USER_CRITERIA_REQUIRED;
        } else {
            args.userId = fromGlobalId(args.userId).id;
        }

        args.carId = fromGlobalId(args.carId).id;

        try {
            const reservations = await context.timeTable.reserve(
                args,
                fieldsList(info, { path: 'reservations' }),
            );

            return { reservations };
        } catch (err) {
            throw new ResponseError(err.message, 'ADD_RESERVATION_ERROR');
        }

        return [];
    }
});
