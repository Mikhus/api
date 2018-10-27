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
import { user as u, car as c } from '../clients';

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

/**
 * Extracts list of unique car identifiers form a given user car objects
 *
 * @param {u.UserCarObject[]} cars
 */
function extractCarIds(cars: u.UserCarObject[]): string[] {
    return cars.reduce((ids, car) => {
        car && !~ids.indexOf(car.carId as never) && ids.push(car.carId as never);

        return ids;
    }, []);
}

/**
 * Converts array to map, using as a hash key given field (by default
 * will tread field = 'id')
 *
 * @param {any[]} arr - array of objects
 * @param {string} [field] - field to use as a hash key
 * @return {{ [field: string]: any }} - map representation of the input array
 */
export function toMap(arr: any[], field: string = 'id') {
    return arr.reduce((map, item) => {
        map[item[field]] = item;
        return map;
    }, {});
}

/**
 * Maps given list of user car objects data to a valid list of requested
 * via graphql car objects
 *
 * @param {u.UserCarObject} userCars
 * @param {string[]} fields
 * @param {any} context
 * @return Promise<Array<Partial<c.CarObject> | null>>
 */
export async function toRequestedCarsList(
    userCars: any[],
    fields: string[],
    context: any,
):  Promise<Array<Partial<c.CarObject> | null>> {
    if (!(userCars && userCars.length)) {
        return [];
    }

    const carIds = extractCarIds(userCars);
    const cars = toMap(await context.car.fetch(carIds, [...fields, 'id']));

    return userCars.map(userCar => {
        if (!cars[userCar.carId]) {
            return null;
        }

        Object.assign(userCar, cars[userCar.carId]);
        userCar.id = userCar._id;
        delete userCar._id;

        if (!~fields.indexOf('carId')) {
            delete userCar.carId;
        }

        if (!~fields.indexOf('id')) {
            delete userCar.id;
        }

        return userCar as Partial<c.CarObject>;
    });
}
