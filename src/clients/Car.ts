/*!
 * IMQ-RPC Service Client: Car
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

export namespace car {
    export interface CarObject {
        id: string;
        make: string;
        model: string;
        type: string;
        years: number[];
    }

    export class CarClient extends IMQClient {

        /**
         * Returns a list of car manufacturers (car brands)
         *
         * @return {Promise<string[]>}
         */
        @profile()
        @remote()
        public async brands(): Promise<string[]> {
            return await this.remoteCall<string[]>(...arguments);
        }

        /**
         * Returns car object by its identifier
         *
         * @param {string} id - car identifier
         * @param {string[]} [selectedFields] - fields to return
         * @param {IMQDelay} [delay] - if passed the method will be called with the specified delay over message queue
         * @return {Promise<Partial<CarObject> | null>}
         */
        @profile()
        @remote()
        public async fetch(id: string, selectedFields?: string[], delay?: IMQDelay): Promise<Partial<CarObject> | null> {
            return await this.remoteCall<Partial<CarObject> | null>(...arguments);
        }

        /**
         * Returns list of known cars for a given brand
         *
         * @param {string} brand - car manufacturer (brand) name
         * @param {string[]} [selectedFields] - fields to return
         * @param {string} [sort] - sort field, by default is 'model'
         * @param {'asc' | 'desc'} [dir] - sort direction, by default is 'asc' - ascending
         * @param {IMQDelay} [delay] - if passed the method will be called with the specified delay over message queue
         * @return {Promise<Partial<CarObject>[]>}
         */
        @profile()
        @remote()
        public async list(brand: string, selectedFields?: string[], sort?: string, dir?: 'asc' | 'desc', delay?: IMQDelay): Promise<Partial<CarObject>[]> {
            return await this.remoteCall<Partial<CarObject>[]>(...arguments);
        }

    }
}
