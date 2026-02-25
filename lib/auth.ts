import { getServerSession, NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import prisma from "./prisma";


export const authOptions: NextAuthOptions = {
    logger: {
        error: console.error,
        // warn: console.warn,
        // debug: console.debug,
    },
    pages: {
        signIn: "/login",
    },

    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                },
            },
        }),
    ],

    session: {
        strategy: "jwt",
    },

    callbacks: {
        async signIn({ user }) {
            if (!user.email) return false;
            const profile = await prisma.profiles.findFirst({
                where: { email: user.email, is_active: true, },
                select: {
                    id: true,
                },
            });


            if (!profile) {
                return "/login?error=UnauthorizedUser";
            }

            return true;
        },
        async jwt({ token, user }) {
            // Runs at login
            // console.log("[JWT]", user);
            if (user) {
                const profile = await prisma.profiles.findFirst({
                    where: { email: user.email, is_active: true, },
                    select: {
                        id: true,
                        role: true,
                        avatar: {
                            select: { image_url: true },
                        },
                    },
                });

                // console.log("[JWT PROFILE]", profile);

                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.role = profile?.role;
                token.avatar = profile?.avatar?.image_url ?? "";
            }

            // console.log("[JWT TOKEN]", token);

            return token;
        },

        async session({ session, token }) {
            // console.log("[SESSION]", session);
            // console.log("[SESSION TOKEN]", token);
            if (session.user) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.name = token.name as string;
                session.user.role = token.role as string;
                session.user.avatar = token.avatar as string;
            }

            // console.log("[SESSION RETURNED]", session);

            return session;
        },
    },
};

export const getAuthSession = () => getServerSession(authOptions);
