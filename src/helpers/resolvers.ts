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
import {
    Connection,
    connectionFromArraySlice,
    fromGlobalId,
} from 'graphql-relay';
import { ILogger, profile } from '@imqueue/rpc';
import { user as u, car as c } from '../clients';
import { selectedFields } from './selection';
import { clientOptions } from '../../config';
import { INVALID_CREDENTIALS } from '..';

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
    ): Promise<Connection<Partial<u.UserObject>>> {
        const authUser = (info.rootValue as any).authUser;
        const { first, last, before, after, filter } = args;
        const cursor = before || after;
        const skip: number = cursor ? Number(fromGlobalId(cursor).id) + 1 : 0;
        let limit: number = Number(first || last) || 10;

        if (!(authUser && authUser.isAdmin) && limit > 100) {
            limit = 100;
        }

        const count = await context.user.count(filter || null);
        const users = await context.user.find(
            filter || null,
            selectedFields(info, { id: '_id' }, 'edges.node'),
            skip,
            limit,
        );

        return connectionFromArraySlice<Partial<u.UserObject>>(users, args, {
            sliceStart: skip,
            arrayLength: count
        });
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
        const authUser = (info.rootValue as any).authUser;

        if (!(args.id || args.email)) {
            if (authUser) {
                args.email = authUser.email;
            } else {
                throw INVALID_CREDENTIALS;
            }
        }

        const criteria = args.id ? fromGlobalId(args.id).id : args.email;
        const user =  await context.user.fetch(
            criteria,
            selectedFields(info, { id: '_id' })
        );

        return user as Partial<u.UserObject>;
    }

    /**
     * Fetches car entity by its identifier
     *
     * @param {any} source
     * @param {{ id: string }} args
     * @param {any} context
     * @param {GraphQLResolveInfo} info
     * @return {Promise<Partial<c.CarObject>>}
     */
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

    /**
     * Fetches list of cars entities for a given brand
     *
     * @param {any} source
     * @param {{ brand: string }} args
     * @param {any} context
     * @param {GraphQLResolveInfo} info
     * @return {Promise<Partial<c.CarObject>[]>}
     */
    @profile()
    public static async fetchCars(
        source: any,
        args: { brand: string },
        context: any,
        info: GraphQLResolveInfo,
    ): Promise<Partial<c.CarObject>[]> {
        return context.car.list(args.brand, selectedFields(info));
    }

    /**
     * Fetches car brand (manufacturer) names
     *
     * @param {any} source
     * @param {{ id?: string, email?: string }} args
     * @param {any} context
     * @param {GraphQLResolveInfo} info
     * @return {Promise<string[]>}
     */
    @profile()
    public static async fetchCarBrands(
        source: any,
        args: { brand: string },
        context: any,
        info: GraphQLResolveInfo,
    ): Promise<string[]> {
        return context.car.brands();
    }

    /**
     * Resolves nested cars collection on user entity
     *
     * @param {u.UserObject} user
     * @param {any} args
     * @param {any} context
     * @param {GraphQLResolveInfo} info
     */
    @profile()
    public static async carsCollection(
        user: u.UserObject,
        args: any,
        context: any,
        info: GraphQLResolveInfo
    ) {
        return (user.cars || []).map(async (car: u.UserCarObject) => {
            const fields = selectedFields(info);
            const obj: c.CarObject = await context.car.fetch(
                car.carId, fields);

            if (~fields.indexOf('carId')) {
                (obj as any).carId = obj.id;
            }

            if (~fields.indexOf('id')) {
                obj.id = car._id;
            } else {
                delete obj.id;
            }

            (obj as any).regNumber = car.regNumber;

            return obj;
        })
    }
}
