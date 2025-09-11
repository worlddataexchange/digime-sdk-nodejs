/*!
 * © World Data Exchange. All rights reserved.
 */

import { handleServerResponse, net } from "./net";
import { SDKConfiguration } from "./types/sdk-configuration";
import { ContractDetailsSchema } from "./types/common";
import { sign } from "jsonwebtoken";
import { getRandomAlphaNumeric } from "./crypto";
import { z } from "zod/v4";
import { parseWithSchema } from "./utils/parse-with-schema";

export const CountryResource = z.object({
    mimetype: z.string().optional(),
    resize: z.string().optional(),
    type: z.number().optional(),
    url: z.string().optional(),
});

export type CountryResource = z.infer<typeof CountryResource>;

export const Country = z.object({
    id: z.number(),
    code: z.string().optional(),
    name: z.string().optional(),
    resource: CountryResource.optional(),
});

export type Country = z.infer<typeof Country>;

export const QueryCountriesResponse = z.object({
    data: z.array(Country),
});

export type QueryCountriesResponse = z.infer<typeof QueryCountriesResponse>;

export const CountriesIncludeFieldList = z.union([
    z.literal("id"),
    z.literal("name"),
    z.literal("code"),
    z.literal("json"),
    z.literal("resource.mimetype"),
    z.literal("resource.url"),
]);

export type CountriesIncludeFieldList = z.infer<typeof CountriesIncludeFieldList>;

export const CountriesBodyParams = z
    .object({
        query: z
            .object({
                include: z.array(CountriesIncludeFieldList).optional(),
                filter: z
                    .object({
                        id: z.array(z.number()).optional(),
                    })
                    .optional(),
            })
            .optional(),
    })
    .loose();

export type CountriesBodyParams = z.infer<typeof CountriesBodyParams>;

export const QueryCountriesOptions = z.object({
    contractDetails: ContractDetailsSchema,
    countriesBodyParams: CountriesBodyParams.optional(),
});

export type QueryCountriesOptions = z.infer<typeof QueryCountriesOptions>;

const queryCountries = async (
    options: QueryCountriesOptions,
    sdkConfig: SDKConfiguration
): Promise<QueryCountriesResponse> => {
    const { contractDetails, countriesBodyParams } = parseWithSchema(QueryCountriesOptions, options);

    const { contractId, privateKey } = contractDetails;

    try {
        const response = await net.post(`${String(sdkConfig.baseUrl)}discovery/countries`, {
            headers: {
                "Content-Type": "application/json",
            },
            json: countriesBodyParams,
            responseType: "json",
            retry: { ...sdkConfig.retryOptions, methods: ["POST"] },
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

        return parseWithSchema(QueryCountriesResponse, response.body);
    } catch (error) {
        handleServerResponse(error);
        throw error;
    }
};

export { queryCountries };
