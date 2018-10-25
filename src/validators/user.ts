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
import { ResponseError, ERROR_UNAUTHORIZED } from '..';
import { fromGlobalId } from 'graphql-relay';
import { GraphQLResolveInfo } from 'graphql';

export const RX_LOGIN_MUTATION: RegExp =
    /mutation\s[\s\S]*\{\s*login\s*\(/;
export const RX_UPDATE_MUTATION: RegExp =
    /mutation\s[\s\S]*\{\s*updateUser\s*\(/;
export const RX_UPDATE_USER_ID: RegExp =
    /input:[\s\S]*?\bid[^:]*:[^"]*(".*?)"/

/**
 * Checks if a given request is a login mutation
 *
 * @param {GraphQLResolveInfo} info
 * @return {boolean}
 */
export function isOwnMutation(info: GraphQLResolveInfo) {
    const query =
        (((info || {} as any).rootValue || {} as any).body as any).query;

    if (RX_LOGIN_MUTATION.test(query)) {
        return true;
    }

    if (!RX_UPDATE_MUTATION) {
        return false;
    }

    const [_, id] = query.match(RX_UPDATE_USER_ID);
    const authUser: any = info.rootValue.authUser;

    if (!(authUser && authUser.id === fromGlobalId(id).id)) {
        return false;
    }

    return true;
}

/**
 * Validates if given GraphQL request is called by admin user
 *
 * @param {...any[]} args - request arguments
 * @throws {RequestError}
 */
export function validateAdmin(...args: any[]) {
    if (isOwnMutation(args[3])) {
        return;
    }

    const user: any = args[3].rootValue.authUser;

    if (!(user && user.isActive && user.isAdmin)) {
        throw ERROR_UNAUTHORIZED;
    }
}

/**
 * Verifies if a fetched request data
 *
 *  @param {...any[]} args - request arguments
 *  @throws {ResponseError}
 */
export function validateOwner(...args: any[]) {
    if (isOwnMutation(args[3])) {
        return;
    }

    const authUser: any = args[3].rootValue.authUser;
    let data: any = args[0].authUser ? args[1] : args[0];
    if (data.input) data = data.input;
    const isAdmin = authUser && authUser.isActive && authUser.isAdmin;
    const isOwner = (data && authUser && authUser.isActive && (
        (data._id && data._id === authUser._id) ||
        (data.id && (
            data.id === authUser._id ||
            fromGlobalId(data.id).id === authUser._id)) ||
        (data.email && data.email === authUser.email) ||
        (data.user && (
            (data.user._id && data.user._id === authUser.__id) ||
            (data.user.email && data.user.email === authUser.email)
        ))
    ));

    if (!(isOwner || isAdmin)) {
        throw ERROR_UNAUTHORIZED;
    }
}

/**
 * Alias for validateOwner but with a single argument to provide
 *
 * @param {GraphQLResolveInfo} requestInfo
 */
export function verifyRequestForOwner(requestInfo: GraphQLResolveInfo) {
    return validateOwner(null, null, null, requestInfo);
}
