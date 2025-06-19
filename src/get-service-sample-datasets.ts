/*!
 * © World Data Exchange. All rights reserved.
 */

import { handleServerResponse, net } from "./net";
import { sign } from "jsonwebtoken";
import { getRandomAlphaNumeric } from "./crypto";
import { SDKConfiguration } from "./types/sdk-configuration";
import { ContractDetailsSchema } from "./types/common";
import { z } from "zod/v4";
import { parseWithSchema } from "./utils/parse-with-schema";

export const GetServiceSampleDataSetsOptions = z.object({
    contractDetails: ContractDetailsSchema,
    sourceId: z.number(),
});

export type GetServiceSampleDataSetsOptions = z.infer<typeof GetServiceSampleDataSetsOptions>;

export const DataSet = z.object({
    description: z.string(),
    name: z.string(),
});

export type DataSet = z.infer<typeof DataSet>;

export const GetServiceSampleDataSetsResponse = z.record(z.string(), DataSet);

export type GetServiceSampleDataSetsResponse = z.infer<typeof GetServiceSampleDataSetsResponse>;

const getServiceSampleDataSets = async (
    options: GetServiceSampleDataSetsOptions,
    sdkConfig: SDKConfiguration
): Promise<GetServiceSampleDataSetsResponse> => {
    const { contractDetails, sourceId } = parseWithSchema(GetServiceSampleDataSetsOptions, options);

    const { contractId, privateKey } = contractDetails;

    try {
        const url = `${String(sdkConfig.baseUrl)}permission-access/sample/datasets/${String(sourceId)}`;

        const response = await net.get(url, {
            responseType: "json",
            retry: sdkConfig.retryOptions,
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

        return parseWithSchema(GetServiceSampleDataSetsResponse, response.body);
    } catch (error) {
        handleServerResponse(error);
        throw error;
    }
};

export { getServiceSampleDataSets };
