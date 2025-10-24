import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Define the user management permissions structure
const USER_MANAGEMENT_PERMISSIONS = {
    invites: {
        ceo: [
            "all_departments",
            "can_invite_manager",
            "can_invite_assistant_manager",
            "can_invite_developer",
            "can_invite_intern"
        ],
        manager: [
            "own_department",
            "can_invite_assistant_manager",
            "can_invite_developer",
            "can_invite_intern"
        ],
        "assistant_manager": [
            "own_department",
            "can_invite_developer",
            "can_invite_intern"
        ]
    }
};

// Define roles that can access performance page
const PERFORMANCE_PAGE_ROLES = ["ceo", "manager"];

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    console.log("Attempting to authenticate with backend:", process.env.BACKEND_URL);
                    
                    // Call your backend authentication API
                    const response = await fetch(`${process.env.BACKEND_URL}/auth/login`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password,
                        }),
                    });

                    console.log("Backend response status:", response.status);

                    if (!response.ok) {
                        console.error("Backend authentication failed:", response.status, response.statusText);
                        return null;
                    }

                    const data = await response.json();
                    console.log("Backend response data:", data);

                    // Return user object with role and permissions matching the API response
                    return {
                        id: data.user_id,
                        email: data.email,
                        name: data.username,
                        role: data.role_name,
                        department: data.department_name,
                        organizationId: data.user_id, // Using user_id as organizationId since organization_id is not in response
                        organizationName: data.organization_name,
                        accessToken: data.access_token,
                    };
                } catch (error) {
                    console.error("Authentication error:", error);
                    
                    // Temporary fallback for testing when backend is not available
                    if (credentials.email === "test@example.com" && credentials.password === "test123") {
                        console.log("Using fallback authentication for testing");
                        return {
                            id: "test_user_123",
                            email: credentials.email,
                            name: "Test User",
                            role: "ceo",
                            department: "Development",
                            organizationId: "test_org_123",
                            organizationName: "Test Organization",
                            accessToken: "test_token_123",
                        };
                    }
                    
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, account, trigger, session }) {
            if (user) {
                token.role = user.role;
                token.department = user.department;
                token.organizationId = user.organizationId;
                token.organizationName = user.organizationName;
                token.accessToken = user.accessToken; // Store the access token from user

                // Add permissions based on role
                token.permissions = getUserPermissions(user.role as string);
                token.canAccessPerformance = PERFORMANCE_PAGE_ROLES.includes(user.role as string);
            }

            // Store access token from account (if available)
            if (account?.access_token) {
                token.accessToken = account.access_token;
            }

            // Handle session updates (when update() is called)
            if (trigger === "update" && session?.user) {
                // Update the token with new user data
                if (session.user.name) {
                    token.name = session.user.name;
                }
            }

            return token;
        },
        async session({ session, token, trigger, newSession }) {
            if (token) {
                session.user.id = token.sub as string;
                session.user.name = token.name as string;
                session.user.email = token.email as string;
                session.user.role = token.role as string;
                session.user.department = token.department as string;
                session.user.organizationId = token.organizationId as string;
                session.user.organizationName = token.organizationName as string;
                session.user.permissions = token.permissions as any;
                session.user.canAccessPerformance = token.canAccessPerformance as boolean;
                session.accessToken = token.accessToken as string;
            }

            // Handle session updates (when update() is called)
            if (trigger === "update" && newSession?.user) {
                // Update the session with new user data
                session.user = { ...session.user, ...newSession.user };
            }

            return session;
        },
    },
    pages: {
        signIn: "/login",
        error: "/auth/error",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

// Helper function to get user permissions based on role
function getUserPermissions(role: string) {
    const normalizedRole = role.toLowerCase().replace(/\s+/g, "_");
    return USER_MANAGEMENT_PERMISSIONS.invites[normalizedRole as keyof typeof USER_MANAGEMENT_PERMISSIONS.invites] || [];
}

// Export types for TypeScript
export interface ExtendedUser {
    id: string;
    email: string;
    name: string;
    role: string;
    department: string;
    organizationId: string;
    organizationName: string;
    permissions: string[];
    canAccessPerformance: boolean;
}

declare module "next-auth" {
    interface User {
        role: string;
        department: string;
        organizationId: string;
        organizationName: string;
        accessToken: string;
    }

    interface Session {
        user: ExtendedUser;
        accessToken?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: string;
        department: string;
        organizationId: string;
        organizationName: string;
        permissions: string[];
        canAccessPerformance: boolean;
        accessToken?: string;
    }
}