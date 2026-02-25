import "next-auth";
import "next-auth/jwt";
import { UserRole } from "@prisma/client";

declare module "next-auth" {
    interface User {
        id: string;
        role: UserRole;
        email: string;
        name: string;
        avatar: string;
    }

    interface Session {
        user: {
            id: string;
            role: UserRole;
            email: string;
            name: string;
            avatar: string;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: UserRole;
        email: string;
        name: string;
        avatar: string;
    }
}