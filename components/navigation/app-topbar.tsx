"use client";
import { Fragment } from "react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "../ui/sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function AppTopbar() {
    const paths = usePathname();
    const pathNames = paths.split("/").filter((path) => path);

    if (paths.startsWith("/login")) {
        return null;
    }

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mr-2 data-[orientation=vertical]:h-4"
                />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/">Home</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        {pathNames.length > 0 && (
                            <BreadcrumbSeparator className="" />
                        )}
                        {pathNames.map((name, index) => {
                            const href = `/${pathNames.slice(0, index + 1).join("/")}`;
                            const linkName =
                                name.charAt(0).toUpperCase() + name.slice(1);
                            const isLastPath = pathNames.length === index + 1;
                            return (
                                <Fragment key={name}>
                                    <BreadcrumbItem>
                                        {isLastPath ? (
                                            <BreadcrumbLink asChild>
                                                <Link href={href}>
                                                    {linkName}
                                                </Link>
                                            </BreadcrumbLink>
                                        ) : (
                                            <BreadcrumbPage>
                                                {linkName}
                                            </BreadcrumbPage>
                                        )}
                                    </BreadcrumbItem>
                                    {pathNames.length !== index + 1 && (
                                        <BreadcrumbSeparator className="" />
                                    )}
                                </Fragment>
                            );
                        })}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
        </header>
    );
}
