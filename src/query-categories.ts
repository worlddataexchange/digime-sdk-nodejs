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

export const CategoryResource = z.object({
    mimetype: z.string().optional(),
    resize: z.string().optional(),
    type: z.number().optional(),
    url: z.string().optional(),
});

export type CategoryResource = z.infer<typeof CategoryResource>;

export const Category = z
    .object({
        id: z.number(),
        categoryTypeId: z.number().optional(),
        name: z.string().optional(),
        reference: z.string().optional(),
        resource: CategoryResource.optional(),
        subTitle: z.string().optional(),
        title: z.string().optional(),
        expandedTitle: z.string().optional(),
        expandedSubTitle: z.string().optional(),
    })
    .loose();

export type Category = z.infer<typeof Category>;

export const QueryCategoriesResponse = z.object({
    data: z.array(Category),
});

export type QueryCategoriesResponse = z.infer<typeof QueryCategoriesResponse>;

export const CategoriesIncludeFieldList = z.union([
    z.literal("id"),
    z.literal("name"),
    z.literal("reference"),
    z.literal("json"),
    z.literal("resource.mimetype"),
    z.literal("resource.url"),
]);

export type CategoriesIncludeFieldList = z.infer<typeof CategoriesIncludeFieldList>;

export const CategoriesBodyParams = z
    .object({
        query: z
            .object({
                include: z.array(CategoriesIncludeFieldList).optional(),
                filter: z
                    .object({
                        id: z.array(z.number()).optional(),
                    })
                    .optional(),
            })
            .optional(),
    })
    .loose();

export type CategoriesBodyParams = z.infer<typeof CategoriesBodyParams>;

export const QueryCategoriesOptions = z.object({
    contractDetails: ContractDetailsSchema,
    categoriesBodyParams: CategoriesBodyParams.optional(),
});

export type QueryCategoriesOptions = z.infer<typeof QueryCategoriesOptions>;

const queryCategories = async (
    options: QueryCategoriesOptions,
    sdkConfig: SDKConfiguration
): Promise<QueryCategoriesResponse> => {
    const { contractDetails, categoriesBodyParams } = parseWithSchema(QueryCategoriesOptions, options);

    const { contractId, privateKey } = contractDetails;

    try {
        const response = await net.post(`${String(sdkConfig.baseUrl)}discovery/categories`, {
            headers: {
                "Content-Type": "application/json",
            },
            json: categoriesBodyParams,
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

        return parseWithSchema(QueryCategoriesResponse, response.body);
    } catch (error) {
        handleServerResponse(error);
        throw error;
    }
};

export { queryCategories };
