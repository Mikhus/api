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

/**
 * Validates if given GraphQL request is called by admin user
 *
 * @param {...any[]} args - request arguments
 * @throws {RequestError}
 */
export function validateAdmin(...args: any[]) {
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
    const authUser: any = args[3].rootValue.authUser;
    const data: any = args[0];
    const isAdmin = authUser && authUser.isActive && authUser.isAdmin;
    const isOwner = (data && authUser && authUser.isActive && (
        (data._id && data._id === authUser._id) ||
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
