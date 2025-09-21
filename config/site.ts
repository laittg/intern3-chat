export const siteConfig = {
    name: "intern3.chat",
    displayName: "Intern3 Chat",
    shortName: "intern3.chat",
    description: "intern3.chat",
    siteDescription: "Powerful AI chatbot. By interns, for interns.",
    domain: "intern3.chat",
    liveUrl: "https://intern3.chat",
    docsUrl: "https://docs.intern3.chat",
    supportEmail: "hi@intern3.chat",
    social: {
        github: "https://github.com/intern3-chat/intern3-chat",
        x: "https://x.com/intern3chat"
    },
    branding: {
        chatbotName: "intern3-chat",
        connectorsPrefix: "intern3-chat",
        organization: "intern3"
    },
    auth: {
        applicationId: "intern3",
        audience: "intern3",
        allowedOrigins: [
            "https://intern3.vercel.app",
            "https://intern3.chat",
            "https://www.intern3.chat"
        ],
        allowedDomainGlobs: ["*.intern3.chat"]
    },
    email: {
        fromAddress: "noreply@intern3.chat"
    }
} as const

export type SiteConfig = typeof siteConfig
