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
import { ILogger, profile } from '@imqueue/rpc';
import { user as u, car as c } from '../clients';
import { selectedFields } from './selection';
import { clientOptions } from '../../config';
import { ERROR_USER_FETCH_CRITERIA_INVALID } from '..';

/**
 * Implementation of specific resolvers for  GraphQL schema
 */
export class Resolvers {

    // @ts-ignore
    // noinspection JSUnusedGlobalSymbols
    public static logger: ILogger = clientOptions.logger || console;

    /**
     * Fetches specific node data by a specified identifier
     *
     * @param {any} source
     * @param {{ [name: string]: any }} args
     * @param {any} context
     * @param {GraphQLResolveInfo} info
     * @return {Promise<any>}
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
     * @param {any} source
     * @param {{ [name: string]: any }} args
     * @param {any} context
     * @param {GraphQLResolveInfo} info
     * @return {Promise<Partial<UserObject>>}
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

    /**
     * Fetches exact user by its identifier or email
     *
     * @param {any} source
     * @param {{ id?: string, email?: string }} args
     * @param {any} context
     * @param {GraphQLResolveInfo} info
     * @return {Promise<Partial<UserObject>>}
     */
    @profile()
    public static async fetchUserByIdOrEmail(
        source: any,
        args: { id?: string, email?: string },
        context: any,
        info: GraphQLResolveInfo,
    ): Promise<Partial<u.UserObject>> {
        if (!(args.id || args.email)) {
            throw ERROR_USER_FETCH_CRITERIA_INVALID;
        }

        const criteria = args.id ? fromGlobalId(args.id).id : args.email;

        const user =  await context.user.fetch(
            criteria,
            selectedFields(info, { id: '_id' })
        );

        return user as Partial<u.UserObject>;
    }

    @profile()
    public static async fetchCarById(
        source: any,
        args: { id: string },
        context: any,
        info: GraphQLResolveInfo,
    ): Promise<Partial<c.CarObject>> {
        return context.car.fetch(
            fromGlobalId(args.id).id,
            selectedFields(info)
        );
    }

    @profile()
    public static async fetchCars(
        source: any,
        args: { brand: string },
        context: any,
        info: GraphQLResolveInfo,
    ): Promise<Partial<c.CarObject>[]> {
        return context.car.list(args.brand, selectedFields(info));
    }

    @profile()
    public static async fetchCarBrands(
        source: any,
        args: { brand: string },
        context: any,
        info: GraphQLResolveInfo,
    ): Promise<string[]> {
        return context.car.brands();
    }
}
