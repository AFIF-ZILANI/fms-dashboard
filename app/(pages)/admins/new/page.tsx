import { AddAdminForm } from "@/components/admin/add-admin-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Add New Admin",
    description: "Create a new admin profile",
};

export default function AddAdminPage() {
    return <AddAdminForm />;
}
