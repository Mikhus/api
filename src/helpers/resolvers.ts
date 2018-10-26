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
import { fieldsList, fieldsMap } from 'graphql-fields-list';
import { user as u, car as c, car } from '../clients';
import { clientOptions } from '../../config';
import CarObject = car.CarObject;

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
                id, fieldsList(info, { transform: { id: '_id' } }));
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
            fieldsList(info, { transform: { id: '_id' }, path: 'edges.node' }),
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
     * @return {Promise<Partial<UserObject> | null>}
     */
    @profile()
    public static async fetchUserByIdOrEmail(
        source: any,
        args: { idOrEmail?: string },
        context: any,
        info: GraphQLResolveInfo,
    ): Promise<Partial<u.UserObject> | null> {
        if (!args.idOrEmail) {
            const authUser = (info.rootValue as any).authUser;

            if (!authUser) {
                return null;
            }

            args.idOrEmail = authUser.email;
        }

        if (!args.idOrEmail) {
            return null;
        }

        const criteria = /@/.test(args.idOrEmail)
            ? args.idOrEmail
            : fromGlobalId(args.idOrEmail).id
        ;

        try {
            const user = await context.user.fetch(
                criteria,
                fieldsList(info, { transform: { id: '_id' } })
            );

            return user as Partial<u.UserObject>;
        } catch (err) {
            Resolvers.logger.error(err);

            return null;
        }
    }

    /**
     * Fetches car entity by its identifier
     *
     * @param {any} source
     * @param {{ id: string }} args
     * @param {any} context
     * @param {GraphQLResolveInfo} info
     * @return {Promise<Partial<c.CarObject> | null>}
     */
    @profile()
    public static async fetchCarById(
        source: any,
        args: { id: string },
        context: any,
        info: GraphQLResolveInfo,
    ): Promise<Partial<c.CarObject> | null> {
        try {
            return context.car.fetch(
                fromGlobalId(args.id).id,
                fieldsList(info)
            );
        } catch(err) {
            Resolvers.logger.error(err);
            return null;
        }
    }

    /**
     * Fetches list of cars entities for a given brand
     *
     * @param {any} source
     * @param {{ brand: string }} args
     * @param {any} context
     * @param {GraphQLResolveInfo} info
     * @return {Promise<Partial<c.CarObject>[]>>}
     */
    @profile()
    public static async fetchCars(
        source: any,
        args: { brand: string },
        context: any,
        info: GraphQLResolveInfo,
    ): Promise<Partial<c.CarObject>[]> {
        try {
            return context.car.list(args.brand, fieldsList(info));
        } catch (err) {
            Resolvers.logger.error(err);
            return [];
        }
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
        try {
            return context.car.brands();
        } catch (err) {
            Resolvers.logger.error(err);
            return [];
        }
    }

    @profile()
    public static async carsCount(
        user: u.UserObject,
        args: any,
        context: any,
    ): Promise<number> {
        return user.cars !== undefined
            ? user.cars.length
            : await context.user.carsCount(user._id);
    }

    /**
     * Resolves nested cars collection on user entity
     *
     * @param {u.UserObject} user
     * @param {any} args
     * @param {any} context
     * @return {Promise<Array<Partial<c.CarObject> | null>>}
     * @param {GraphQLResolveInfo} info
     */
    @profile()
    public static async carsCollection(
        user: u.UserObject,
        args: any,
        context: any,
        info: GraphQLResolveInfo
    ): Promise<Array<Partial<c.CarObject> | null>> {
        try {
            const userCarsMap = (user.cars || [])
                .reduce((res, next: u.UserCarObject) => {
                    res[next.carId] = next;
                    return res;
                }, {} as { [id: string]: u.UserCarObject });
            const ids = Object.keys(userCarsMap);

            if (!(ids && ids.length)) {
                return [];
            }

            const fields = fieldsList(info);
            const cars = (await context.car.fetch(ids, [...fields, 'id']))
                .map((car: Partial<CarObject> | null) => {
                    if (!(car && car.id)) {
                        return null;
                    }

                    const userCar = userCarsMap[car.id];

                    if (~fields.indexOf('carId')) {
                        (car as any).carId = car.id;
                    }

                    if (~fields.indexOf('id')) {
                        car.id = userCar._id;
                    }

                    else {
                        delete car.id;
                    }

                    (car as any).regNumber = userCar.regNumber;

                    return car;
                });

            return cars;
        } catch (err) {
            Resolvers.logger.error(err);

            return [];
        }
    }
}
