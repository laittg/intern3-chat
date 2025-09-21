import { siteConfig } from "@/config/site"

export default {
    providers: [
        {
            type: "customJwt",
            applicationID: siteConfig.auth.applicationId,
            issuer: process.env.VITE_BETTER_AUTH_URL,
            jwks: `${process.env.VITE_BETTER_AUTH_URL}/api/auth/jwks`,
            algorithm: "RS256"
        }
    ]
}
