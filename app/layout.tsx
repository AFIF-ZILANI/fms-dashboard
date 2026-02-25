import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "@/components/navigation/app-sidebar";
import AppTopbar from "@/components/navigation/app-topbar";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import ReactQueryClientProvider from "@/components/providers/query-client-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/providers/auth-provider";
import { getAuthSession } from "@/lib/auth";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Grappine Dashboard | AI Farm Management",
    description:
        "A smart dashboard powered by Grappine AI to monitor, automate, and manage your poultry farm. Real time insights, digital record keeping, and better decision making in one place.",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await getAuthSession(); // server-side
    return (
        <html lang="en" suppressHydrationWarning={true}>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <ReactQueryClientProvider>
                    <AuthProvider session={session}>
                        <SidebarProvider>
                            <AppSidebar />
                            <SidebarInset>
                                <AppTopbar />
                                {children}
                            </SidebarInset>
                        </SidebarProvider>
                    </AuthProvider>
                    <Toaster />
                </ReactQueryClientProvider>
            </body>
        </html>
    );
}
