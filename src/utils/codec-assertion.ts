/*!
 * © World Data Exchange. All rights reserved.
 */

import * as t from "io-ts";
import { ThrowReporter } from "io-ts/lib/ThrowReporter";
import { TypeValidationError } from "../errors";

export const codecAssertion = <T extends t.Mixed>(codec: T) => {
    return (value: unknown): asserts value is t.TypeOf<T> => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            ThrowReporter.report(codec.decode(value));
        } catch (error) {
            if (!(error instanceof Error)) {
                throw error;
            }
            throw new TypeValidationError(error.message);
        }
    };
};

export type CodecAssertion<T> = (value: unknown) => asserts value is T;
