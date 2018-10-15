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
import { GraphQLResolveInfo } from 'graphql';
import { clientOptions } from '../../config';

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
    transform: { [name: string]: string | undefined } = {},
    sub?: string
): string[] {
    const rootNode: any = info.operation.selectionSet.selections[0];
    let selection = rootNode.selectionSet.selections;

    if (sub) {
        const child: any = selection.find(
            (item: any) => item.name.value === sub
        );

        if (!child) {
            const logger = clientOptions.logger || console;
            logger.error(
                `Fields selection sub-pattern given, but does not exist!`
            );
        } else {
            selection = child.selectionSet.selections;
        }
    }

    const fields: string[] = selection
        .map((o: any) => transform[o.name.value] || o.name.value || '')
        .filter((field: string) => !!field);

    return fields;
}
