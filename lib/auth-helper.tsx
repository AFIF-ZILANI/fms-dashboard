"use client";

import { useSession } from "next-auth/react";

export function useAuthSession() {
    const { data, status } = useSession();

    const user = data?.user ?? null;

    return {
        session: data,
        user,
        isAuthenticated: status === "authenticated",
        isLoading: status === "loading",
        role: user?.role ?? null,
        userId: user?.id ?? null,
    };
}
