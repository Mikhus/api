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
    GraphQLInt,
    GraphQLList,
    GraphQLObjectType,
    GraphQLString,
} from 'graphql';
import { nodeInterface } from '.';
import { timeTable } from '..';
import TimeTableOptions = timeTable.TimeTableOptions;
import BaseTimeOption = timeTable.BaseTimeOption;

export const baseTimeOption = new GraphQLObjectType({
    name: 'BaseTimeOption',
    description: 'Base time option item entity',
    fields: {
        key: {
            type: GraphQLString,
            description: 'Option key',
            resolve: (option: BaseTimeOption) => option.key,
        },
        title: {
            type: GraphQLString,
            description: 'Option title',
            resolve: (option: BaseTimeOption) => option.title,
        },
        duration: {
            type: GraphQLInt,
            description: 'Option title',
            resolve: (option: BaseTimeOption) => option.duration,
        },
    },
});

/**
 * GraphQL Types: User
 */
export const optionsType = new GraphQLObjectType({
    name: 'Options',
    description: 'Time-table options entity',
    interfaces: [nodeInterface],
    fields: {
        id: globalIdField('Options', () => 'time-table-options'),
        start: {
            type: GraphQLString,
            description: 'Start working time, should be a string in ' +
                'form of "HH:MM"',
            resolve: (options: TimeTableOptions) => options.start,
        },
        end: {
            type: GraphQLString,
            description: 'End working time, should be a string in ' +
                'form of "HH:MM"',
            resolve: (options: TimeTableOptions) => options.start,
        },
        boxes: {
            type: GraphQLInt,
            description: 'Number of boxes available on washing station',
            resolve: (options: TimeTableOptions) => options.boxes,
        },
        baseTime: {
            type: new GraphQLList(baseTimeOption),
            description: 'Washing time options defined by a service',
            resolve: (options: TimeTableOptions) => options.baseTime,
        },
    },
});
