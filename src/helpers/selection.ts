/*!
 * ISC License
 *
 * Copyright (c) 2018-present, Mykhailo Stadnyk <mikhus@gmail.com>
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
    FieldNode,
    FragmentDefinitionNode,
    GraphQLInputObjectType,
    GraphQLList,
    GraphQLObjectType,
    GraphQLOutputType,
    GraphQLResolveInfo,
    SelectionNode,
} from 'graphql';

/**
 * Look-ups for a nested selection in a given using provided
 * selection path. Selection path is dot-notated string, like:
 * 'user.cars', etc...
 *
 * @param { SelectionNode[]} selection
 * @param {string} path
 * @access private
 */
function selectPath(selection: SelectionNode[], path: string) {
    const nodes = path.split('.');

    if (nodes && nodes.length) {
        for (let i = 0; i < nodes.length; i++) {
            const child: any = selection.find(
                (node: FieldNode) => node.name.value === nodes[i]
            );

            if (!child) {
                return [];
            }

            selection = child.selectionSet.selections;
        }
    }

    return selection;
}

/**
 * Performs selection recursive parsing, taking into account possible
 * fragments within the query
 *
 * @param {SelectionNode[]} selection
 * @param {GraphQLResolveInfo} info - GraphQL resolver info object
 * @param {FieldNamesMap} [transform] - object describing field names mapping
 * @param {string} [path] - path to nested selection if required
 * @return {string[]} - array of field names
 * @access private
 */
function parseSelection(
    selection: SelectionNode[],
    { returnType, fragments }: Partial<InfoTypes>,
    transform: { [name: string]: string | undefined } = {},
    path?: string,
): string[] {
    if (!selection) {
        // request is broken, handle it carefully
        // usually this piece of code should never be executed
        // we just need to make sure that if it happen for some
        // unpredictable reason, our request will not be broken
        let type: any;

        if (returnType instanceof GraphQLList) {
            type = (returnType as any).ofType;
        }

        else { // noinspection SuspiciousInstanceOfGuard
            if (returnType instanceof GraphQLObjectType ||
                returnType instanceof GraphQLInputObjectType
            ) {
                type = returnType;
            }
        }

        if (!(type && type.getFields)) {
            return [];
        }

        return Object.keys(type.getFields());
    }

    if (path) {
        selection = selectPath(selection, path);
    }

    let fields: string[] = selection
        .map((o: any) => transform[o.name.value] || o.name.value);

    if (fragments) {
        fields = fields.reduce((res: string[], field: string) => {
            const fragment: FragmentDefinitionNode = fragments[field];

            if (fragment) {
                // selected field is the fragment!
                res = [
                    ...res,
                    ...parseSelection(
                        fragment.selectionSet.selections as SelectionNode[],
                        { returnType, fragments }, transform, path
                    )
                ];
            }

            else {
                // not a fragment!
                res.push(field);
            }

            return res;
        }, []);
    }

    return fields;
}

/**
 * Focus group of properties required for internal use to extract
 * fields data from GraphQLResolveInfo object
 *
 * @access private
 */
interface InfoTypes {
    fieldName: string,
    fieldNodes: ReadonlyArray<FieldNode>,
    returnType: GraphQLOutputType,
    fragments: {
        [name: string]: FragmentDefinitionNode,
    },
}

/**
 * Field names transformation map interface
 *
 * @access public
 */
export interface FieldNamesMap {
    [name: string]: string;
}

/**
 * fieldsList options argument interface
 *
 * @access public
 */
export interface FieldsListOptions {
    path?: string;
    transform?: FieldNamesMap;
}

// noinspection JSUnusedGlobalSymbols
/**
 * Extracts list of selected fields from a given GraphQL resolver info
 * argument and returns them as an array of strings, using the given
 * extraction options.
 *
 * <example>
 * const fieldsList = require('graphql-fields-list');
 *
 * // assuming there will be resolver definition in the code:
 * {
 *     // ...
 *     resolve(info, args, context) {
 *         const fields = fieldsList(info);
 *         // or
 *         const fields = fieldsList(info, { path: 'edges.node' })
 *         // or
 *         const fields = fieldList(info, { transform: { id: '_id' } });
 *         // or
 *         const fields = fieldsList(info, {
 *             // this will select all fields for an object nested
 *             // under specified path in th request fields object tree
 *             path: 'edges.node',
 *             // this will transform field names from request to
 *             // a desired values. For example in graphql you may want to
 *             // have field named 'id', but would like to retrieve a value
 *             // from mongodb associated with this field, which is stored
 *             // under database field named '_id'
 *             transform: { id: '_id' }
 *         });
 *
 *         // now we can bypass list of fields to some
 *         // service or database query, etc. whatever we need
 *     }
 * }
 *
 * //
 * </example>
 *
 * @param {GraphQLResolveInfo} info - GraphQL resolver info object
 * @param {FieldsListOptions} [options] - fields list extraction options
 * @return {string[]} - array of field names
 * @access public
 */
export function fieldsList(
    info: GraphQLResolveInfo,
    options: FieldsListOptions = {},
): string[] {
    const { fieldName, fieldNodes, returnType, fragments }: InfoTypes = info;
    let selection: SelectionNode[] = (fieldNodes.find(
        (node: any) => node.name.value === fieldName
    ) as any || { selectionSet: {} }).selectionSet.selections;

    return parseSelection(
        selection,
        { returnType, fragments },
        options.transform,
        options.path
    );
}
