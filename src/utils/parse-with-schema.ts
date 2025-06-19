/*!
 * © World Data Exchange. All rights reserved.
 */

import { z } from "zod/v4";
import { TypeValidationError } from "../errors";

export const parseWithSchema = <T extends z.ZodType>(schema: T, data: Parameters<T["parse"]>[0]): z.infer<T> => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return schema.parse(data);
    } catch (error: unknown) {
        if (!(error instanceof z.ZodError)) {
            throw error;
        }
        throw new TypeValidationError(z.prettifyError(error), { cause: error });
    }
};
