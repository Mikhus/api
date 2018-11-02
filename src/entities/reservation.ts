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
import { globalIdField } from 'graphql-relay';
import {
    GraphQLObjectType,
    GraphQLString,
} from 'graphql';
import { timeTable } from '../clients';
import { nodeInterface, carType, userType } from '.';
import { Resolvers } from '../helpers';

/**
 * GraphQL Types: User
 */
export const reservationType = new GraphQLObjectType({
    name: 'Reservation',
    description: 'Reservation record entity',
    interfaces: [nodeInterface],
    fields: {
        id: globalIdField(
            'Reservation',
            (reservation: timeTable.Reservation) => String(reservation.id),
        ),
        car: {
            type: carType,
            description: 'User\'s car associated with reservation',
            resolve: Resolvers.fetchReservationCar,
        },
        user: {
            type: userType,
            description: 'User associated with reservation',
            resolve: Resolvers.fetchReservationUser,
        },
        type: {
            type: GraphQLString,
            description: 'Reservation type, which was initially requested',
            resolve: (reservation: timeTable.Reservation) =>
                reservation.type,
        },
        start: {
            type: GraphQLString,
            description: 'Reservation start time (ISO date/time string)',
            resolve: (reservation: timeTable.Reservation) =>
                reservation.duration[0],
        },
        end: {
            type: GraphQLString,
            description: 'Reservation end time (ISO date/time string)',
            resolve: (reservation: timeTable.Reservation) =>
                reservation.duration[1],
        },
    },
});
