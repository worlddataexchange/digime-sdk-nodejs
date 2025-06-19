/*!
 * © World Data Exchange. All rights reserved.
 */

import { UserAccessToken } from "../types/user-access-token";
import { UserAuthorizationPayload } from "../exchange-code-for-token";

const formatToken = (token: UserAuthorizationPayload): UserAccessToken => {
    return {
        accessToken: {
            value: token.access_token.value,
            expiry: token.access_token.expires_on,
        },
        refreshToken: {
            value: token.refresh_token.value,
            expiry: token.refresh_token.expires_on,
        },
        user: {
            id: token.sub,
        },
        consentid: token.consentid,
    };
};

export { formatToken };
