/*!
 * © World Data Exchange. All rights reserved.
 */

import { codecAssertion } from "./codec-assertion";
import * as t from "io-ts";
import { ThrowReporter } from "io-ts/lib/ThrowReporter";
import { TypeValidationError } from "../errors";

describe("codecAssertion", () => {
    const mockCodec = t.string;
    const assertWithCodec = codecAssertion(mockCodec);

    let reportSpy: jest.SpyInstance;

    beforeEach(() => {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        reportSpy = jest.spyOn(ThrowReporter, "report") as jest.SpyInstance;
        reportSpy.mockImplementation(() => {});
    });

    afterEach(() => {
        reportSpy.mockRestore();
        jest.restoreAllMocks();
    });

    it("should assert the value if it matches the codec type", () => {
        reportSpy.mockReturnValue("");

        expect(() => assertWithCodec("hello")).not.toThrow();
    });

    it("should throw TypeValidationError if the value does not match the codec type", () => {
        reportSpy.mockImplementation(() => {
            throw new Error("Invalid type");
        });

        expect(() => assertWithCodec(123)).toThrow(TypeValidationError);
        expect(() => assertWithCodec(123)).toThrow("Invalid type");
    });

    it("should throw a non-error if something unexpected happens during validation", () => {
        reportSpy.mockImplementation(() => {
            // eslint-disable-next-line @typescript-eslint/only-throw-error
            throw "Some unexpected error";
        });

        expect(() => assertWithCodec(123)).toThrow("Some unexpected error");
    });
});
