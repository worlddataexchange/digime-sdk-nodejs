/*!
 * © World Data Exchange. All rights reserved.
 */

import {
    isNonEmptyString,
    addTrailingSlash,
    addLeadingSlash,
    addLeadingAndTrailingSlash,
    areNonEmptyStrings,
    isNumber,
    isFunction,
    isString,
    isPlainObject,
    getValueByPath,
} from "./basic-utils";

describe("isNonEmptyString: Returns false when non empty string is passed", () => {
    test.each([true, false, null, undefined, [], 0, Number.NaN, "", () => null, Symbol("test")])(
        "%p",
        (testValue: unknown) => {
            const isActual = isNonEmptyString(testValue);

            expect(isActual).toBe(false);
        }
    );
});

describe("addTrailingSlash", () => {
    it("should return the URL with a trailing slash if it does not have one", () => {
        expect(addTrailingSlash("https://example.com")).toBe("https://example.com/");
    });

    it("should return the same URL if it already has a trailing slash", () => {
        expect(addTrailingSlash("https://example.com/")).toBe("https://example.com/");
    });

    it("should return undefined for non-string or empty inputs", () => {
        expect(addTrailingSlash(null)).toBeUndefined();
        expect(addTrailingSlash("")).toBeUndefined();
    });
});

describe("addLeadingSlash", () => {
    it("should return the URL with a leading slash if it does not have one", () => {
        expect(addLeadingSlash("example.com")).toBe("/example.com");
    });

    it("should return the same URL if it already has a leading slash", () => {
        expect(addLeadingSlash("/example.com")).toBe("/example.com");
    });

    it("should return undefined for non-string or empty inputs", () => {
        expect(addLeadingSlash(null)).toBeUndefined();
        expect(addLeadingSlash("")).toBeUndefined();
    });
});

describe("addLeadingAndTrailingSlash", () => {
    it("should add both leading and trailing slashes to a URL", () => {
        expect(addLeadingAndTrailingSlash("example.com")).toBe("/example.com/");
    });

    it("should return the same URL if it already has leading and trailing slashes", () => {
        expect(addLeadingAndTrailingSlash("/example.com/")).toBe("/example.com/");
    });

    it('should return "/" for non-string or empty inputs', () => {
        expect(addLeadingAndTrailingSlash(null)).toBe("/");
        expect(addLeadingAndTrailingSlash("")).toBe("/");
    });
});

describe("areNonEmptyStrings", () => {
    it("should return true for an array of non-empty strings", () => {
        expect(areNonEmptyStrings(["hello", "world"])).toBe(true);
    });

    it("should return false if any value in the array is not a non-empty string", () => {
        expect(areNonEmptyStrings(["hello", ""])).toBe(false);
        expect(areNonEmptyStrings([123, "world"])).toBe(false);
    });
});

describe("isNumber", () => {
    it("should return true for numbers", () => {
        expect(isNumber(123)).toBe(true);
    });

    it("should return false for non-number values", () => {
        expect(isNumber("123")).toBe(false);
        expect(isNumber(null)).toBe(false);
    });
});

describe("isFunction", () => {
    it("should return true for a regular function", () => {
        expect(isFunction(() => {})).toBe(true);
    });

    it("should return true for a function with parameters", () => {
        expect(isFunction((a: number, b: number) => a + b)).toBe(true);
    });

    it("should return false for a string", () => {
        expect(isFunction("hello")).toBe(false);
    });

    it("should return false for a number", () => {
        expect(isFunction(123)).toBe(false);
    });

    it("should return false for null", () => {
        expect(isFunction(null)).toBe(false);
    });

    it("should return false for an object", () => {
        expect(isFunction({})).toBe(false);
    });

    it("should return false for an array", () => {
        expect(isFunction([])).toBe(false);
    });
});

describe("isString", () => {
    test.each([
        ["regular string", "hello", true],
        ["empty string", "", true],
        ["string via String constructor", "test", true],
        ["number", 42, false],
        ["boolean", true, false],
        ["null", null, false],
        ["undefined", undefined, false],
        ["object", {}, false],
        ["array", [], false],
        ["function", () => {}, false],
    ])("should return %s -> %s", (_desc, input, expected) => {
        expect(isString(input)).toBe(expected);
    });
});

describe("getValueByPath", () => {
    describe("real call-site shapes used across the SDK", () => {
        it('resolves a single-segment string path (e.g. get(body, "token"))', () => {
            expect(getValueByPath({ token: "abc" }, "token")).toBe("abc");
        });

        it('resolves a dot-separated string path (e.g. get(response, "body.session"))', () => {
            expect(getValueByPath({ body: { session: { id: 1 } } }, "body.session")).toEqual({ id: 1 });
        });

        it('resolves a single-segment array path (e.g. get(payload, ["reference_code"]))', () => {
            expect(getValueByPath({ reference_code: "xyz" }, ["reference_code"])).toBe("xyz");
        });

        it('resolves a two-segment array path (e.g. get(token, ["access_token", "value"]))', () => {
            expect(getValueByPath({ access_token: { value: "v", expires_on: 123 } }, ["access_token", "value"])).toBe(
                "v"
            );
        });

        it("returns the provided default when an intermediate object is missing entirely", () => {
            expect(getValueByPath({ access_token: {} }, ["access_token", "value"], "")).toBe("");
        });
    });

    describe("default value handling", () => {
        it("returns the default when the root object is undefined", () => {
            expect(getValueByPath(undefined, ["a", "b"], "fallback")).toBe("fallback");
        });

        it("returns the default when the root object is null", () => {
            expect(getValueByPath(null, "body.session", "fallback")).toBe("fallback");
        });

        it("returns the default when the key is missing", () => {
            expect(getValueByPath({}, ["reference_code"], "")).toBe("");
        });

        it("returns undefined (not a made-up default) when no default is passed and the key is missing", () => {
            expect(getValueByPath({}, ["sub"])).toBeUndefined();
        });
    });

    describe("null vs undefined semantics (the easy thing to get wrong)", () => {
        it("returns null as-is when it is the final resolved value, without substituting the default", () => {
            expect(getValueByPath({ a: null }, ["a"], "fallback")).toBeNull();
        });

        it("returns the default when null is encountered mid-path (can't traverse further into it)", () => {
            expect(getValueByPath({ a: null }, ["a", "b"], "fallback")).toBe("fallback");
        });
    });

    describe("falsy-but-defined values must not be replaced by the default", () => {
        it.each([
            ["0", { a: { b: 0 } }, 99, 0],
            ["false", { a: { b: false } }, true, false],
            ['""', { a: { b: "" } }, "fallback", ""],
        ])("preserves %s", (_desc, obj, defaultValue, expected) => {
            expect(getValueByPath(obj, ["a", "b"], defaultValue)).toBe(expected);
        });
    });

    describe("edge cases", () => {
        it("allows property access on a primitive (string) value mid-path", () => {
            expect(getValueByPath("hello", ["length"])).toBe(5);
        });

        it("resolves headers-style nested access (e.g. x-metadata.compression)", () => {
            expect(getValueByPath({ "x-metadata": { compression: "gzip" } }, ["x-metadata", "compression"])).toBe(
                "gzip"
            );
        });

        it("returns undefined for a missing nested header key with no default", () => {
            expect(getValueByPath({}, ["x-metadata", "compression"])).toBeUndefined();
        });
    });
});

describe("isPlainObject", () => {
    test.each([
        ["empty object literal", {}, true],
        ["object with properties", { a: 1, b: 2 }, true],
        ["object created with Object.create(null)", Object.create(null), true],
        ["array", [], false],
        ["null", null, false],
        ["Date instance", new Date(), false],
        ["function", () => {}, false],
        ["number", 123, false],
        ["string", "test", false],
        ["boolean", true, false],
        ["Map instance", new Map(), false],
        ["Set instance", new Set(), false],
        // eslint-disable-next-line @typescript-eslint/no-extraneous-class
        ["class instance", new (class A {})(), false],
    ])("should return %s -> %s", (_desc, input, expected) => {
        expect(isPlainObject(input)).toBe(expected);
    });
});
