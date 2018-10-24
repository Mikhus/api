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
import { carType } from '../entities';
import { GraphQLString, GraphQLNonNull, GraphQLList } from 'graphql';
import { Resolvers } from '../helpers';

/**
 * GraphQL Queries: user - query for a user data by id or email
 */
export const car: any = {
    description: 'Fetches car data by its identifier',
    type: carType,
    args: {
        id: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'User identifier. Optional. ' +
                'Either this identifier or email required' ,
        },
    },
    resolve: Resolvers.fetchCarById,
};

/**
 * GraphQL Queries: users - query for list of users
 */
export const cars: any = {
    description: 'Fetches list of cars for a given brand',
    type: new GraphQLList(carType),
    args: {
        brand: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'Car\'s manufacturer (brand) name' ,
        },
    },
    resolve: Resolvers.fetchCars,
};

/**
 * GraphQL Queries: brands - query for listing car brands
 */
export const brands: any = {
    description: 'Fetches list of car brands',
    type: new GraphQLList(GraphQLString),
    resolve: Resolvers.fetchCarBrands,
};
