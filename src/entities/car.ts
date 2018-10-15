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
import { connectionDefinitions, globalIdField } from 'graphql-relay';
import { GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';
import { car as c } from '../clients';
import { nodeInterface } from '.';

/**
 * GraphQL Types: User
 */
export const carType = new GraphQLObjectType({
    name: 'Car',
    description: 'Car entity',
    interfaces: [nodeInterface],
    fields: {
        id: globalIdField('Car', (car: c.CarObject) => car.id),
        make: {
            type: GraphQLString,
            description: 'Car\'s manufacturer',
            resolve: (car: c.CarObject) => car.make,
        },
        model: {
            type: GraphQLString,
            description: 'Car\'s model name',
            resolve: (car: c.CarObject) => car.model,
        },
        type: {
            type: GraphQLString,
            description: 'Car type (vehicle class)',
            resolve: (car: c.CarObject) => car.type,
        },
        years: {
            type: new GraphQLList(GraphQLString),
            description: 'Car manufacturing years',
            resolve: (car: c.CarObject) => car.years,
        },
    },
});

export const { connectionType: carConnection } =
    connectionDefinitions({ nodeType: carType });
