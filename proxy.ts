import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { UserRole } from "./app/generated/prisma/enums";

const publicRoutes = ["/login", "/signup", "/public"];

const roleRoutes: Record<UserRole, string[]> = {
    ADMIN: ["/admin"],
    EMPLOYEE: ["/employee"],
    CUSTOMER: ["/customer"],
    DOCTOR: ["/doctor"],
    SUPPLIER: ["/supplier"],
    // MANAGER: ["/manager"],
    // WORKER: ["/worker"],
};

export default withAuth(
    function middleware(req) {
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const pathname = req.nextUrl.pathname;

                // Allow public routes
                if (publicRoutes.some(route => pathname.startsWith(route))) {
                    return true;
                }

                // Must be authenticated
                if (!token) return false;

                const role = token.role as UserRole | undefined;

                // Check role route protection
                for (const [allowedRole, routes] of Object.entries(roleRoutes)) {
                    if (routes.some(route => pathname.startsWith(route))) {
                        return role === allowedRole;
                    }
                }

                return true;
            },
        },
    }
);

export const config = {
    matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};