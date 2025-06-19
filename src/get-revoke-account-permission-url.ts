/*!
 * © World Data Exchange. All rights reserved.
 */

import { getRandomAlphaNumeric } from "./crypto";
import { sign } from "jsonwebtoken";
import { net, handleServerResponse } from "./net";
import { SDKConfiguration } from "./types/sdk-configuration";
import { ContractDetailsSchema } from "./types/common";
import { z } from "zod/v4";
import { UserAccessTokenSchema } from "./types/user-access-token-new";
import { parseWithSchema } from "./utils/parse-with-schema";

export const GetRevokeAccountPermissionUrlOptions = z.object({
    contractDetails: ContractDetailsSchema,
    userAccessToken: UserAccessTokenSchema,
    accountId: z.string(),
    redirectUri: z.string(),
});

export type GetRevokeAccountPermissionUrlOptionsInput = z.input<typeof GetRevokeAccountPermissionUrlOptions>;
export type GetRevokeAccountPermissionUrlOptions = z.infer<typeof GetRevokeAccountPermissionUrlOptions>;

export const GetRevokeAccountPermissionUrlResponse = z.object({
    location: z.string(),
});

export type GetRevokeAccountPermissionUrlResponse = z.infer<typeof GetRevokeAccountPermissionUrlResponse>;

const getRevokeAccountPermissionUrl = async (
    options: GetRevokeAccountPermissionUrlOptionsInput,
    sdkConfig: SDKConfiguration
): Promise<GetRevokeAccountPermissionUrlResponse> => {
    const { userAccessToken, contractDetails, accountId, redirectUri } = parseWithSchema(
        GetRevokeAccountPermissionUrlOptions,
        options
    );
    const { contractId, privateKey } = contractDetails;

    const url = `${String(sdkConfig.baseUrl)}permission-access/revoke/h:accountId`;

    try {
        const response = await net.get(url, {
            headers: {
                accept: "application/json",
                accountId,
                redirectUri,
            },
            retry: sdkConfig.retryOptions,
            responseType: "json",
            hooks: {
                beforeRequest: [
                    (options) => {
                        const jwt: string = sign(
                            {
                                access_token: userAccessToken.accessToken.value,
                                client_id: `${sdkConfig.applicationId}_${contractId}`,
                                nonce: getRandomAlphaNumeric(32),
                                timestamp: Date.now(),
                            },
                            privateKey.toString(),
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

        return parseWithSchema(GetRevokeAccountPermissionUrlResponse, response.body);
    } catch (error) {
        handleServerResponse(error);
        throw error;
    }
};

export { getRevokeAccountPermissionUrl };
