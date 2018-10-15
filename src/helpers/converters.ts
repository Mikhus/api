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
    GraphQLObjectType,
    GraphQLList,
    GraphQLInputObjectType,
} from 'graphql';

/**
 * Converts given user-defined type to an arguments input type compatible,
 * mapping directly all fields to input args fields
 *
 * @param {any} givenType
 */
export function toInputFields(givenType: any) {
    const givenFields = givenType.getFields();
    const fields: any = {};

    Object.keys(givenFields).forEach(name => {
        fields[name] = fields[name] || {};
        fields[name].type = givenFields[name].type;
        fields[name].description = givenFields[name].description;

        if (givenFields[name].type instanceof GraphQLObjectType) {
            fields[name].type = new GraphQLInputObjectType({
                name: `${fields[name].type.name}Input`,
                description: fields[name].type.description,
                fields: toInputFields(givenFields[name].type),
            });
        }

        else if (givenFields[name].type instanceof GraphQLList) {
            const ofType: any = (givenFields[name].type as any).ofType;

            if (ofType instanceof GraphQLObjectType) {
                fields[name].type = new GraphQLList(new GraphQLInputObjectType({
                    name: `${ofType.name}Input`,
                    description: ofType.description,
                    fields: toInputFields(ofType),
                }));
            }
        }
    });

    return fields;
}

/**
 * Returns fields definition for output (return value) type
 * @param {any} givenType
 */
export function toOutputFields(givenType: any) {
    const givenFields = givenType.getFields();
    const fields: any = {};

    Object.keys(givenFields).forEach(name => {
        fields[name] = fields[name] || {};
        fields[name].type = givenFields[name].type;
        fields[name].description = givenFields[name].description;
        fields[name].resolve = givenFields[name].resolve;
    });

    return fields;
}
