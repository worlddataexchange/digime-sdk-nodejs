/*!
 * © World Data Exchange. All rights reserved.
 */

import { getRandomAlphaNumeric } from "./crypto";
import { net } from "./net";
import { sign } from "jsonwebtoken";
import { SDKConfiguration } from "./types/sdk-configuration";
import { ContractDetailsSchema } from "./types/common";
import { z } from "zod/v4";
import { UserAccessTokenSchema } from "./types/user-access-token-new";
import { parseWithSchema } from "./utils/parse-with-schema";

export const Format = z.literal("xml");
export type Format = z.infer<typeof Format>;

export const ServiceType = z.literal("medmij");
export type ServiceType = z.infer<typeof ServiceType>;

export const GetPortabilityReportOptions = z.object({
    /** File format to be returned. Currently only XML is supported. */
    format: Format,
    /** Service type medmij is only supported for now. */
    serviceType: ServiceType,
    /**  Any contract related details here. */
    contractDetails: ContractDetailsSchema,
    /** User access token you may already have for this user from this or from another contract. */
    userAccessToken: UserAccessTokenSchema,
    /** From timestamp in seconds */
    from: z.number().optional(),
    /* To timestamp in seconds */
    to: z.number().optional(),
});

export type GetPortabilityReportOptions = z.infer<typeof GetPortabilityReportOptions>;
export type GetPortabilityReportOptionsInput = z.input<typeof GetPortabilityReportOptions>;

export const GetPortabilityReportResponse = z.object({
    file: z.string(),
});

export type GetPortabilityReportResponse = z.infer<typeof GetPortabilityReportResponse>;

const getPortabilityReport = async (
    props: GetPortabilityReportOptionsInput,
    sdkConfig: SDKConfiguration
): Promise<GetPortabilityReportResponse> => {
    const { to, from, contractDetails, userAccessToken, serviceType, format } = parseWithSchema(
        GetPortabilityReportOptions,
        props
    );
    const { contractId, privateKey } = contractDetails;

    const response = await net.get(
        `${String(sdkConfig.baseUrl)}export/${serviceType}/report?format=${format}&from=${String(from)}&to=${String(to)}`,
        {
            headers: {
                accept: "application/octet-stream",
            },
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
        }
    );

    return parseWithSchema(GetPortabilityReportResponse, { file: response.body });
};

export { getPortabilityReport };
