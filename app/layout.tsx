import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "@/components/navigation/app-sidebar";
import AppTopbar from "@/components/navigation/app-topbar";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import ReactQueryClientProvider from "@/components/providers/query-client-provider";
import { Toaster } from "@/components/ui/sonner";

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

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning={true}>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <ReactQueryClientProvider>
                    <SidebarProvider>
                        <AppSidebar />
                        <SidebarInset>
                            <AppTopbar />
                            {children}
                            <SpeedInsights />
                        </SidebarInset>
                    </SidebarProvider>
                    <Toaster />
                </ReactQueryClientProvider>
            </body>
        </html>
    );
}
