/*!
 * © World Data Exchange. All rights reserved.
 */

import { isCAAccount, assertIsCAAccount } from "./ca-account";
import { TypeValidationError } from "../../errors";

describe("isCAAccount", () => {
    it("Returns true when given an object", () => {
        expect(isCAAccount({})).toBe(true);
    });

    describe("Returns false when given a non-object", () => {
        it.each([true, false, null, undefined, [], 0, Number.NaN, "", () => null, Symbol("test")])("%p", (value) => {
            expect(isCAAccount(value)).toBe(false);
        });
    });
});

describe("assertIsCAAccount", () => {
    it("Does not throw when given an object", () => {
        expect(() => assertIsCAAccount({})).not.toThrow();
    });

    describe("Throws TypeValidationError when given a non-object", () => {
        it.each([true, false, null, undefined, [], 0, Number.NaN, "", () => null, Symbol("test")])("%p", (value) => {
            const actual = () => assertIsCAAccount(value);
            expect(actual).toThrow(TypeValidationError);
        });
    });
});
