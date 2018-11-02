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
import { fieldsList } from 'graphql-fields-list';
import { Context } from '../types';
import { user as u, car as c, timeTable } from '../clients';
import { clientOptions } from '../../config';
import { toRequestedCarsList } from './converters';

/**
 * Implementation of specific resolvers for  GraphQL schema
 */
export class Resolvers {

    // noinspection JSUnusedGlobalSymbols
    public static logger: ILogger = clientOptions.logger || console;

    /**
     * Fetches specific node data by a specified identifier
     *
     * @param {any} source
     * @param {{ [name: string]: any }} args
     * @param {Context} context
     * @param {GraphQLResolveInfo} info
     * @return {Promise<any>}
     */
    @profile()
    public static async fetchNodeById(
        globalId: string,
        context: Context,
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
     * @param {Context} context
     * @param {GraphQLResolveInfo} info
     * @return {Promise<Partial<UserObject>>}
     */
    @profile()
    public static async fetchUsers(
        source: any,
        args: { [name: string]: any },
        context: Context,
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
     * @param {Context} context
     * @param {GraphQLResolveInfo} info
     * @return {Promise<Partial<UserObject> | null>}
     */
    @profile()
    public static async fetchUserByIdOrEmail(
        source: any,
        args: { idOrEmail?: string },
        context: Context,
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
     * @param {Context} context
     * @param {GraphQLResolveInfo} info
     * @return {Promise<Partial<c.CarObject> | null>}
     */
    @profile()
    public static async fetchCarById(
        source: any,
        args: { id: string },
        context: Context,
        info: GraphQLResolveInfo,
    ): Promise<Partial<c.CarObject> | null> {
        try {
            return await context.car.fetch(
                fromGlobalId(args.id).id,
                fieldsList(info)
            ) as Partial<c.CarObject> | null;
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
     * @param {Context} context
     * @param {GraphQLResolveInfo} info
     * @return {Promise<Partial<c.CarObject>[]>>}
     */
    @profile()
    public static async fetchCars(
        source: any,
        args: { brand: string },
        context: Context,
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
     * @param {Context} context
     * @param {GraphQLResolveInfo} info
     * @return {Promise<string[]>}
     */
    @profile()
    public static async fetchCarBrands(
        source: any,
        args: { brand: string },
        context: Context,
        info: GraphQLResolveInfo,
    ): Promise<string[]> {
        try {
            return context.car.brands();
        } catch (err) {
            Resolvers.logger.error(err);
            return [];
        }
    }

    /**
     * Returns number of cars in garage for a given user
     *
     * @param {u.UserObject} user
     * @param {any} args
     * @param {Context} context
     * @return {Promise<number>}
     */
    @profile()
    public static async carsCount(
        user: u.UserObject,
        args: any,
        context: Context,
    ): Promise<number> {
        try {
            let id: any = fromGlobalId(String(user._id));

            id = id.type === 'User' ? id.id : user._id;

            return user.cars !== undefined
                ? user.cars.length
                : await context.user.carsCount(id);
        } catch (err) {
            Resolvers.logger.error(err);
        }

        return 0;
    }

    /**
     * Resolves nested cars collection on user entity
     *
     * @param {u.UserObject} user
     * @param {any} args
     * @param {Context} context
     * @param {GraphQLResolveInfo} info
     * @return {Promise<Array<Partial<c.CarObject> | null>>}
     */
    @profile()
    public static async carsCollection(
        user: u.UserObject,
        args: any,
        context: Context,
        info: GraphQLResolveInfo,
    ): Promise<Array<Partial<c.CarObject> | null>> {
        try {
            return toRequestedCarsList(
                user.cars,
                fieldsList(info),
                context,
            );
        } catch (err) {
            Resolvers.logger.error(err);
        }

        return [];
    }

    /**
     * Returns reservation time table options defined by remote service
     *
     * @param {timeTable.TimeTableOptions} options
     * @param {any} args
     * @param {Context} context
     */
    @profile()
    public static async fetchOptions(
        options: timeTable.TimeTableOptions,
        args: any,
        context: Context,
    ): Promise<timeTable.TimeTableOptions> {
        return await context.timeTable.config();
    }

    /**
     * Fetches user object for a given reservation record object
     *
     * @param {timeTable.Reservation} reservation
     * @param {any} args
     * @param {Context} context
     * @param {GraphQLResolveInfo} info
     */
    @profile()
    public static async fetchReservationUser(
        reservation: timeTable.Reservation,
        args: any,
        context: Context,
        info: GraphQLResolveInfo,
    ): Promise<u.UserObject | null> {
        return await context.user.fetch(
            reservation.userId,
            fieldsList(info, { path: 'user' }),
        );
    }

    /**
     * Fetches car object for a given reservation record object
     *
     * @param {timeTable.Reservation} reservation
     * @param {any} args
     * @param {Context} context
     * @param {GraphQLResolveInfo} info
     */
    public static async fetchReservationCar(
        reservation: timeTable.Reservation,
        args: any,
        context: Context,
        info: GraphQLResolveInfo,
    ): Promise<Partial<c.CarObject> | null> {
        const userCar = await context.user.getCar(
            reservation.userId,
            reservation.carId
        );

        if (!userCar) {
            return null;
        }

        const car = await context.car.fetch(userCar.carId);

        (userCar as any).id = userCar._id;
        delete userCar._id;

        return Object.assign(car, userCar) as Partial<c.CarObject>;
    }
}
