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
import { GraphQLResolveInfo } from 'graphql';
import { fromGlobalId } from 'graphql-relay';
import { profile } from '@imqueue/rpc';
import { user as u } from '../clients';
import { selectedFields } from '.';

/**
 * Implementation of specific resolvers for  GraphQL schema
 */
export class Resolvers {

    public static logger = console;

    /**
     * Fetches specific node data by a specified identifier
     *
     * @param globalId
     * @param context
     * @param info
     */
    @profile()
    public static async fetchNodeById(
        globalId: string,
        context: any,
        info: GraphQLResolveInfo
    ) {
        const { type, id } = fromGlobalId(globalId);
        let node: any = null;

        if (type === 'User') {
            node =  await context.user.fetch(
                id, selectedFields(info, { id: '_id' }));
        }

        return node;
    }

    /**
     * Fetches users collection from remote service
     *
     * @param source
     * @param args
     * @param context
     * @param info
     */
    @profile()
    public static async fetchUsers(
        source: any,
        args: { [name: string]: any },
        context: any,
        info: GraphQLResolveInfo,
    ): Promise<Partial<u.UserObject>[]> {
        const users = await context.user.find(
            null, selectedFields(info, { id: '_id' }));

        return users as Partial<u.UserObject>[];
    }
}
