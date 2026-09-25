/*!
 * © World Data Exchange. All rights reserved.
 */

import { getValueByPath } from "./basic-utils";
import { UserAccessToken } from "../types/user-access-token";

const formatToken = (token: unknown): UserAccessToken => {
    return {
        accessToken: {
            value: getValueByPath(token, ["access_token", "value"], ""),
            expiry: getValueByPath(token, ["access_token", "expires_on"], 0),
        },
        refreshToken: {
            value: getValueByPath(token, ["refresh_token", "value"], ""),
            expiry: getValueByPath(token, ["refresh_token", "expires_on"], 0),
        },
        user: {
            id: getValueByPath(token, ["sub"]) as string | undefined,
        },
        consentid: getValueByPath(token, ["consentid"]) as string | undefined,
    };
};

export { formatToken };
