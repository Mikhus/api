/*!
 * IMQ-RPC Service Client: User
 *
 * Copyright (c) 2018, imqueue.com <support@imqueue.com>
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 * REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
 * AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 * LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 * OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 * PERFORMANCE OF THIS SOFTWARE.
 */
import { IMQClient, IMQDelay, remote, profile } from '@imqueue/rpc';

export namespace user {
    export interface UserCarObject {
        _id: string;
        carId: string;
        regNumber: string;
    }

    export interface UserObject {
        _id?: string;
        email: string;
        password: string;
        isActive: boolean;
        isAdmin: boolean;
        firstName: string;
        lastName: string;
        cars: UserCarObject[];
    }

    export interface UserFilters {
        email?: string;
        isActive?: boolean;
        isAdmin?: boolean;
        firstName?: string;
        lastName?: string;
    }

    export class UserClient extends IMQClient {

        /**
         * Creates or updates existing user with the new data set
         *
         * @param {UserObject} data - user data fields
         * @param {string[]} [fields] - fields to return on success
         * @param {IMQDelay} [delay] - if passed the method will be called with the specified delay over message queue
         * @return {Promise<UserObject>}
         */
        @profile()
        @remote()
        public async update(data: UserObject, fields?: string[], delay?: IMQDelay): Promise<UserObject> {
            return await this.remoteCall<UserObject>(...arguments);
        }

        /**
         * Returns number of cars registered for the user having given id or email
         *
         * @param {string} idOrEmail
         * @param {IMQDelay} [delay] - if passed the method will be called with the specified delay over message queue
         * @return {Promise<number>}
         */
        @profile()
        @remote()
        public async carsCount(idOrEmail: string, delay?: IMQDelay): Promise<number> {
            return await this.remoteCall<number>(...arguments);
        }

        /**
         * Look-ups and returns user data by either user e-mail or by user object
         * identifier
         *
         * @param {string} criteria - user identifier or e-mail string
         * @param {string[]} [fields] - fields to select and return
         * @param {IMQDelay} [delay] - if passed the method will be called with the specified delay over message queue
         * @return {Promise<UserObject | null>}
         */
        @profile()
        @remote()
        public async fetch(criteria: string, fields?: string[], delay?: IMQDelay): Promise<UserObject | null> {
            return await this.remoteCall<UserObject | null>(...arguments);
        }

        /**
         * Returns number of users stored in the system and matching given criteria
         *
         * @param {UserFilters} [filters] - filter by is active criteria
         * @param {IMQDelay} [delay] - if passed the method will be called with the specified delay over message queue
         * @return {Promise<number>}
         */
        @profile()
        @remote()
        public async count(filters?: UserFilters, delay?: IMQDelay): Promise<number> {
            return await this.remoteCall<number>(...arguments);
        }

        /**
         * Returns collection of users matched is active criteria. Records
         * can be fetched skipping given number of records and having max length
         * of a given limit argument
         *
         * @param {UserFilters} [filters] - is active criteria to filter user list
         * @param {string[]} [fields] - list of fields to be selected and returned for each found user object
         * @param {number} [skip] - record to start fetching from
         * @param {number} [limit] - selected collection max length from a starting position
         * @param {IMQDelay} [delay] - if passed the method will be called with the specified delay over message queue
         * @return {Promise<UserObject[]>}
         */
        @profile()
        @remote()
        public async find(filters?: UserFilters, fields?: string[], skip?: number, limit?: number, delay?: IMQDelay): Promise<UserObject[]> {
            return await this.remoteCall<UserObject[]>(...arguments);
        }

    }
}
