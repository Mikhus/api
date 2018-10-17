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
    GraphQLInputObjectType,
    GraphQLList,
    GraphQLObjectType,
    GraphQLResolveInfo
} from 'graphql';

/**
 * Extracts list of selected fields from a given GraphQL resolver info
 * argument and returns them as an array of strings, using the given
 * field names transformations.
 *
 * @param {GraphQLResolveInfo} info - GraphQL resolver info object
 * @param {{ [name: string]: string }} transform - object describing field names mapping
 * @return {string[]} - array of field names
 */
export function selectedFields(
    info: GraphQLResolveInfo,
    transform: { [name: string]: string | undefined } = {}
): string[] {
    const { fieldName, fieldNodes, returnType } = info;
    let selection = (fieldNodes.find(
        (node: any) => node.name.value === fieldName
    ) as any || { selectionSet: {} }).selectionSet.selections;

    if (!selection) {
        // request is broken, handle it carefully
        // usually this piece of code should never be executed
        // we just need to make sure that if it happen for some
        // unpredictable reason, our request will not be broken
        let type: any;

        if (returnType instanceof GraphQLList) {
            type = (returnType as any).ofType;
        } else if (
            returnType instanceof GraphQLObjectType ||
            returnType instanceof GraphQLInputObjectType
        ) {
            type = returnType;
        }

        if (!(type && type.getFields)) {
            return [];
        }

        return Object.keys(type.getFields());
    }

    const fields: string[] = selection
        .map((o: any) => transform[o.name.value] || o.name.value || '')
        .filter((field: string) => !!field);

    return fields;
}
