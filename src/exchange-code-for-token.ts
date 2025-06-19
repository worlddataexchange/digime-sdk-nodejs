/*!
 * © World Data Exchange. All rights reserved.
 */

import { sign } from "jsonwebtoken";
import { getRandomAlphaNumeric } from "./crypto";
import { handleServerResponse, net } from "./net";
import get from "lodash.get";
import { UserAccessToken } from "./types/user-access-token";
import { getPayloadFromToken } from "./utils/get-payload-from-token";
import { SDKConfiguration } from "./types/sdk-configuration";
import { z } from "zod/v4";
import { formatToken } from "./utils/format-token";
import { ContractDetailsSchema } from "./types/common";
import { parseWithSchema } from "./utils/parse-with-schema";

export const ExchangeCodeForTokenOptions = z.object({
    contractDetails: ContractDetailsSchema,
    authorizationCode: z.string().nonempty(),
    codeVerifier: z.string().nonempty(),
});

export type ExchangeCodeForTokenOptions = z.infer<typeof ExchangeCodeForTokenOptions>;

/**
 * Tokens contained within the `/oauth/token` JWT payload
 */
export const AccessOrRefreshToken = z.object({
    value: z.string(),
    expires_on: z.number(),
});

/**
 * Expected payload of the JWT provided by `/oauth/token`
 */
export const UserAuthorizationPayload = z
    .object({
        /**
         * Access token returned in original API format
         */
        access_token: AccessOrRefreshToken,
        /**
         * Refresh token returned in original API format
         */
        refresh_token: AccessOrRefreshToken,
        sub: z.string().optional(),
        consentid: z.string().optional(),
    })
    .loose();

export type UserAuthorizationPayload = z.infer<typeof UserAuthorizationPayload>;

const exchangeCodeForToken = async (
    options: ExchangeCodeForTokenOptions,
    sdkConfig: SDKConfiguration
): Promise<UserAccessToken> => {
    const { authorizationCode, codeVerifier, contractDetails } = parseWithSchema(ExchangeCodeForTokenOptions, options);
    const { contractId, privateKey } = contractDetails;

    try {
        const response = await net.post(`${String(sdkConfig.baseUrl)}oauth/token`, {
            responseType: "json",
            retry: sdkConfig.retryOptions,
            hooks: {
                beforeRequest: [
                    (options) => {
                        const jwt: string = sign(
                            {
                                client_id: `${sdkConfig.applicationId}_${contractId}`,
                                code: authorizationCode,
                                code_verifier: codeVerifier,
                                grant_type: "authorization_code",
                                nonce: getRandomAlphaNumeric(32),
                                timestamp: Date.now(),
                            },
                            privateKey,
                            {
                                algorithm: "PS512",
                                noTimestamp: true,
                            }
                        );
                        options.headers["Authorization"] = `Bearer ${jwt}`;
                    },
                ],
            },
        });

        const payload = await getPayloadFromToken(get(response.body, "token"), sdkConfig);

        const parsedPayload = parseWithSchema(UserAuthorizationPayload, payload);

        return formatToken(parsedPayload);
    } catch (error) {
        handleServerResponse(error);
        throw error;
    }
};

export { exchangeCodeForToken };
