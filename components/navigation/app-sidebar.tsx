"use client";

import * as React from "react";
import {
    AudioWaveform,
    Command,
    GalleryVerticalEnd,
    House,
    Layers,
    Truck,
    ShoppingBag,
    Warehouse,
    Wallet,
} from "lucide-react";

import { NavMain } from "@/components/navigation/nav-main";
// import { NavProjects } from "@/components/navigation/nav-projects";
import { NavUser } from "@/components/navigation/nav-user";
import { TeamSwitcher } from "@/components/navigation/team-switcher";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar";
import { useAuthSession } from "@/lib/auth-helper";
import { usePathname } from "next/navigation";

// This is sample data.

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname();
    const { user } = useAuthSession();

    console.log(user);

    const data = {
        user: {
            name: user?.name,
            email: user?.email,
            avatar: user?.avatar,
        },
        teams: [
            {
                name: "ZeroD Farms Ltd.",
                logo: GalleryVerticalEnd,
                plan: "Enterprise",
            },
            {
                name: "ZeroD Farms Ltd.",
                logo: AudioWaveform,
                plan: "Startup",
            },
            {
                name: "ZeroD Ltd.",
                logo: Command,
                plan: "Free",
            },
        ],
        navMain: [
            {
                title: "Batches",
                url: "/batches",
                icon: Layers,
                isActive: true,
                items: [
                    {
                        title: "History",
                        url: "batc",
                    },
                ],
            },
            {
                title: "Houses",
                url: "/houses",
                icon: House,
                items: [
                    {
                        title: "Genesis",
                        url: "#",
                    },
                    {
                        title: "Explorer",
                        url: "#",
                    },
                    {
                        title: "Quantum",
                        url: "#",
                    },
                ],
            },
            {
                title: "Suppliers",
                url: "/suppliers",
                icon: Truck,
                items: [
                    {
                        title: "Introduction",
                        url: "#",
                    },
                    {
                        title: "Get Started",
                        url: "#",
                    },
                    {
                        title: "Tutorials",
                        url: "#",
                    },
                    {
                        title: "Changelog",
                        url: "#",
                    },
                ],
            },
            {
                title: "Inventory",
                url: "/inventory",
                icon: Warehouse,
                items: [
                    {
                        title: "New Item",
                        url: "/inventory/new/item",
                    },
                    {
                        title: "New Medicine",
                        url: "/inventory/new/medicine",
                    },
                ],
            },
            {
                title: "Payments",
                url: "/payments",
                icon: Wallet,
                items: [
                    {
                        title: "General",
                        url: "/payments",
                    },
                ],
            },
            {
                title: "Purchases",
                url: "/purchases",
                icon: ShoppingBag,
                items: [
                    {
                        title: "New Item",
                        url: "/purchases/new/item",
                    },
                ],
            },
        ],
        // projects: [
        //     {
        //         name: "Design Engineering",
        //         url: "#",
        //         icon: Frame,
        //     },
        //     {
        //         name: "Sales & Marketing",
        //         url: "#",
        //         icon: PieChart,
        //     },
        //     {
        //         name: "Travel",
        //         url: "#",
        //         icon: Map,
        //     },
        // ],
    };
    if (pathname.startsWith("/login")) {
        return null;
    }

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <TeamSwitcher teams={data.teams} />
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
                {/* <NavProjects projects={data.projects} /> */}
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
