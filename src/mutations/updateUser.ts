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
    GraphQLResolveInfo,
    GraphQLString,
    GraphQLNonNull,
    GraphQLID,
} from 'graphql';
import {
    fromGlobalId,
    mutationWithClientMutationId,
    toGlobalId
} from 'graphql-relay';
import { fieldsList } from 'graphql-fields-list';
import { FieldValidationDefinitions } from 'graphql-validity/lib';
import {
    ERROR_UNAUTHORIZED,
    ResponseError,
    USER_DATA_EMPTY,
    USER_EMAIL_EMPTY,
    USER_FIRST_NAME_EMPTY,
    USER_LAST_NAME_EMPTY,
    USER_PASSWORD_EMPTY,
} from '../ResponseError';
import { userType } from '../entities';
import {
    validateOwner,
    verifyRequestForAdmin, verifyRequestForOwner,
} from '../validators';
import { toInputFields } from '../helpers';

FieldValidationDefinitions['Mutation:updateUser'] = [validateOwner];

const inputFields: any = toInputFields(userType);
delete inputFields.cars;
delete inputFields.id;

inputFields.id = {
    type: GraphQLID,
    description: 'User identifier. If provided will perform update, if ' +
        'not provided - will attempt to create new user'
};

inputFields.cars = {
    type: new GraphQLList(new GraphQLInputObjectType({
        name: 'UserCar',
        description: 'User car association object',
        fields: {
            carId: {
                type: new GraphQLNonNull(GraphQLString),
                description: 'Identifier of car object from cars database',
            },
            regNumber: {
                type: new GraphQLNonNull(GraphQLString),
                description: 'Car registration number',
            },
        },
    })),
    description: 'List of cars associated with the user',
};

const outputFields: any = {
    user: {
        type: userType,
        description: 'Created or updated user data object'
    },
};

/**
 * Checks if a given args valid user input
 *
 * @param {any} args
 * @param {GraphQLResolveInfo} info
 * @throws {ResponseError}
 */
function validateUserArgs(args: any, info: GraphQLResolveInfo) {
    if (args.id) {
        args._id = fromGlobalId(args.id).id;
        delete args.id;

        if (!info.rootValue.authUser ||
            info.rootValue.authUser._id !== args._id
        ) {
            throw ERROR_UNAUTHORIZED;
        }

        if (Object.keys(args).length <= 1) {
            throw USER_DATA_EMPTY;
        }
    }

    for (let option of [
        { field: 'firstName', error: USER_FIRST_NAME_EMPTY},
        { field: 'lastName', error: USER_FIRST_NAME_EMPTY},
        { field: 'email', error: USER_FIRST_NAME_EMPTY},
        { field: 'password', error: USER_FIRST_NAME_EMPTY},
    ]) {
        if (args[option.field] !== undefined && !args[option.field]) {
            throw option.error;
        }
    }
}

/**
 * GraphQL Mutation: updateUser - modifies user data
 */
export const updateUser = mutationWithClientMutationId({
    name: 'updateUser',
    description: 'Updates given user data fields with a given values',
    inputFields,
    outputFields,
    async mutateAndGetPayload(
        args: any,
        context: any,
        info: GraphQLResolveInfo,
    ) {
        if (typeof args.isAdmin === 'boolean' ||
            typeof args.isActive === 'boolean'
        ) {
            verifyRequestForAdmin(info);
        } else {
            verifyRequestForOwner(info);
        }

        validateUserArgs(args, info);

        try {
            for (let car of args.cars || []) {
                car.carId = fromGlobalId(car.carId).id;
            }

            const user = await context.user.update(
                args,
                fieldsList(info, {
                    transform: { id: '_id' },
                    path: 'user'
                }),
            );

            return { user };
        } catch (err) {
            throw new ResponseError(
                err.message,
                /duplicate/i.test(err.message)
                    ? 'USER_EMAIL_ERROR'
                    : 'UPDATE_USER_ERROR'
            );
        }
    }
});