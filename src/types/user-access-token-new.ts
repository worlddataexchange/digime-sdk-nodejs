/*!
 * © World Data Exchange. All rights reserved.
 */

import { z } from "zod/v4";

export const TokenSchema = z.object({
    /**
     * Value in seconds (Unix Epoch Time)
     */
    expiry: z.number(),
    value: z.string(),
});

export const UserSchema = z.object({
    id: z.string().optional(),
});

export const UserAccessTokenSchema = z.object({
    accessToken: TokenSchema,
    refreshToken: TokenSchema,
    user: UserSchema.optional(),
    consentid: z.string().optional(),
});

// Type inference from Zod schemas (optional)
export type Token = z.infer<typeof TokenSchema>;
export type User = z.infer<typeof UserSchema>;
export type UserAccessToken = z.infer<typeof UserAccessTokenSchema>;
