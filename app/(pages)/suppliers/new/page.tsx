import { AddSupplierForm } from "@/components/supplier/add-supplier-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Add New Supplier",
    description:
        "Create a new supplier profile and manage their supply information",
};

export default function AddSupplierPage() {
    return <AddSupplierForm />;
}
