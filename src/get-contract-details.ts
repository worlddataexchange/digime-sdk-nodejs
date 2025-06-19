/*!
 * © World Data Exchange. All rights reserved.
 */

import { handleServerResponse, net } from "./net";
import { SDKConfiguration } from "./types/sdk-configuration";
import { ContractDetails, ContractDetailsSchema } from "./types/common";
import { sign } from "jsonwebtoken";
import { getRandomAlphaNumeric } from "./crypto";
import { z } from "zod/v4";
import { parseWithSchema } from "./utils/parse-with-schema";

export type ContractAccessType = "r" | "w";

export interface ContractApplication {
    id: string;
    name: string;
    resources: Record<string, unknown>;
    status: number;
}

export const ContractApplication = z.object({
    id: z.string(),
    name: z.string(),
    resources: z.record(z.string(), z.unknown()),
    status: z.number(),
});

export interface GetContractDetailsResponse {
    accessType: ContractAccessType;
    application: ContractApplication;
    certificate: string;
    certificateContractSchemaVersion: string;
    expirationDate: number;
    id: string;
    partnerId: string;
    type: string;
}

export const GetContractDetailsResponse = z.object({
    accessType: z.union([z.literal("r"), z.literal("w")]),
    application: ContractApplication,
    certificate: z.string(),
    certificateContractSchemaVersion: z.string(),
    expirationDate: z.number(),
    id: z.string(),
    partnerId: z.string(),
    type: z.string(),
});

export interface GetContractDetailsOptions {
    /**
     * Contract details here.
     */
    contractDetails: ContractDetails;
}

export const GetContractDetailsOptions = z.object({
    contractDetails: ContractDetailsSchema,
});

export interface GetContractDetailsOptions {
    /**
     * Contract details here.
     */
    contractDetails: z.infer<typeof ContractDetailsSchema>;
}

const getContractDetails = async (
    options: GetContractDetailsOptions,
    sdkConfig: SDKConfiguration
): Promise<GetContractDetailsResponse> => {
    const { contractDetails } = parseWithSchema(GetContractDetailsOptions, options);

    const { contractId, privateKey } = contractDetails;

    try {
        const response = await net.get(`${String(sdkConfig.baseUrl)}permission-access/contract`, {
            headers: {
                "Content-Type": "application/json",
            },
            responseType: "json",
            hooks: {
                beforeRequest: [
                    (options) => {
                        const jwt: string = sign(
                            {
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

        return parseWithSchema(GetContractDetailsResponse, response.body);
    } catch (error) {
        handleServerResponse(error);
        throw error;
    }
};

export { getContractDetails };
