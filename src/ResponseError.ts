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
/**
 * Class ResponseError.
 * Implements generic custom GraphQL response error interface
 */
export class ResponseError extends Error {
    public extensions: { [name:string]: any } = {};

    constructor(message: string, code: string | number) {
        super(message);
        this.extensions.code = code;
    }
}

export const ERROR_UNAUTHORIZED = new ResponseError('Unauthorized', 401);
export const ERROR_USER_FETCH_CRITERIA_INVALID = new ResponseError(
    'Either user identifier or email required', 400
);
export const USER_DATA_EMPTY = new ResponseError(
    'No data provided to update user',
    'USER_DATA_EMPTY'
);
export const USER_EMAIL_EMPTY = new ResponseError(
    'Email is missing',
    'USER_EMAIL_EMPTY'
);
export const USER_PASSWORD_EMPTY = new ResponseError(
    'Password is missing',
    'USER_PASSWORD_EMPTY'
);
export const USER_FIRST_NAME_EMPTY = new ResponseError(
    'User\'s first (given) name is missing',
    'USER_FIRST_NAME_EMPTY'
);
export const USER_LAST_NAME_EMPTY = new ResponseError(
    'User\'s last (family) name is missing',
    'USER_LAST_NAME_EMPTY'
);
