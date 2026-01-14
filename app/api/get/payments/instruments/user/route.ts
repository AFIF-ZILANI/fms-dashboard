import { PaymentMethod, UserRole } from "@/app/generated/prisma/enums";
import { errorResponse, response } from "@/lib/apiResponse";
import { throwError } from "@/lib/error";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const searchParams = url.searchParams;

        const id = searchParams.get("id");
        if (!id) {
            throw new Error("Missing id parameter");
        }
        const type: UserRole | null =
            (searchParams.get("type") as UserRole) || null;

        let instruments: { id: string; label: string; type: PaymentMethod }[] =
            [];
        let owner: UserRole;
        let profileId = "";
        switch (type) {
            case "SUPPLIER":
                const supplier = await prisma.suppliers.findFirst({
                    where: {
                        id,
                    },
                });

                console.log(supplier);
                if (!supplier) {
                    throwError({
                        message: "invalid supplier id",
                        statusCode: 400,
                    });
                }
                profileId = supplier.profile_id;
                owner = UserRole.SUPPLIER;
                break;
            case "CUSTOMER":
                const customer = await prisma.customers.findFirst({
                    where: {
                        id,
                    },
                });

                if (!customer) {
                    throwError({
                        message: "invalid customer id",
                        statusCode: 400,
                    });
                }
                profileId = customer.profile_id;
                owner = UserRole.CUSTOMER;
                break;
            // case "TRANSPORTER":
            case "ADMIN":
                const admin = await prisma.admins.findFirst({
                    where: {
                        id,
                    },
                });

                if (!admin) {
                    throwError({
                        message: "invalid admin id",
                        statusCode: 400,
                    });
                }
                profileId = admin.profile_id;
                owner = UserRole.ADMIN;
                break;
            case "DOCTOR":
                const doctor = await prisma.doctors.findFirst({
                    where: {
                        id,
                    },
                });

                if (!doctor) {
                    throwError({
                        message: "invalid doctor id",
                        statusCode: 400,
                    });
                }
                profileId = doctor.profile_id;
                owner = UserRole.DOCTOR;
                break;
            case "EMPLOYEE":
                const employee = await prisma.employees.findFirst({
                    where: {
                        id,
                    },
                });

                if (!employee) {
                    throwError({
                        message: "invalid employee id",
                        statusCode: 400,
                    });
                }
                profileId = employee.profile_id;
                owner = UserRole.EMPLOYEE;
                break;
            default:
                throw new Error("Invalid actor type");
        }

        const instrument = await prisma.paymentInstrument.findMany({
            where: {
                owner_type: owner,
                owner_id: profileId,
                is_active: true,
            },
        });
        console.log(instrument);
        if (instrument) {
            instruments = instrument.map((inst) => ({
                id: inst.id,
                label: inst.label,
                type: inst.type,
            }));
        }

        if (instruments.length === 0) {
            throwError({
                message: "No payment instruments found for this user",
                statusCode: 400,
            });
        }

        return response({
            message: "",
            data: instruments,
        });
    } catch (error) {
        return errorResponse(error);
    }
}
