/*!
 * © World Data Exchange. All rights reserved.
 */

import { sleep } from "./sleep";

describe("sleep", () => {
    jest.useFakeTimers();

    it("should return a Promise", () => {
        const result = sleep(1000);
        expect(result).toBeInstanceOf(Promise);
    });

    it("should resolve after the specified time", async () => {
        const mockFunction = jest.fn();

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        sleep(1000).then(mockFunction);

        expect(mockFunction).not.toHaveBeenCalled();

        jest.advanceTimersByTime(1000);
        await Promise.resolve();

        expect(mockFunction).toHaveBeenCalled();
    });

    it("should not resolve before the specified time", async () => {
        const mockFunction = jest.fn();

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        sleep(2000).then(mockFunction);

        jest.advanceTimersByTime(1000);
        await Promise.resolve();

        expect(mockFunction).not.toHaveBeenCalled();

        jest.advanceTimersByTime(1000);
        await Promise.resolve();

        expect(mockFunction).toHaveBeenCalled();
    });
});
