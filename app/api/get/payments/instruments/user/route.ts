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
        const type: UserRole | null =
            (searchParams.get("type") as UserRole) || null;

        if (!id && type !== UserRole.ADMIN) {
            throwError({
                message: "Missing id parameter",
                statusCode: 400,
            });
        }

        let instruments: { id: string; label: string; type: PaymentMethod }[] =
            [];
        let owner: UserRole;
        let ownerId = "";
        switch (type) {
            case "SUPPLIER":
                const supplier = await prisma.suppliers.findUnique({
                    where: {
                        id: id ?? "",
                    },
                });

                console.log(supplier);
                if (!supplier) {
                    throwError({
                        message: "invalid supplier id",
                        statusCode: 400,
                    });
                }
                ownerId = supplier.id;
                owner = UserRole.SUPPLIER;
                break;
            case "CUSTOMER":
                const customer = await prisma.customers.findUnique({
                    where: {
                        id: id ?? "",
                    },
                });

                if (!customer) {
                    throwError({
                        message: "invalid customer id",
                        statusCode: 400,
                    });
                }
                ownerId = customer.id;
                owner = UserRole.CUSTOMER;
                break;
            // case "TRANSPORTER":
            case "ADMIN":
                const admin = await prisma.admins.findFirst({});

                if (!admin) {
                    throwError({
                        message: "invalid admin id",
                        statusCode: 400,
                    });
                }
                ownerId = admin.id;
                owner = UserRole.ADMIN;
                break;
            case "DOCTOR":
                const doctor = await prisma.doctors.findUnique({
                    where: {
                        id: id ?? "",
                    },
                });

                if (!doctor) {
                    throwError({
                        message: "invalid doctor id",
                        statusCode: 400,
                    });
                }
                ownerId = doctor.id;
                owner = UserRole.DOCTOR;
                break;
            case "EMPLOYEE":
                const employee = await prisma.employees.findUnique({
                    where: {
                        id: id ?? "",
                    },
                });

                if (!employee) {
                    throwError({
                        message: "invalid employee id",
                        statusCode: 400,
                    });
                }
                ownerId = employee.id;
                owner = UserRole.EMPLOYEE;
                break;
            default:
                throw new Error("Invalid actor type");
        }

        console.log(owner, ownerId);

        const instrument = await prisma.paymentInstrument.findMany({
            where: {
                owner_type: owner,
                owner_id: ownerId,
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
                statusCode: 404,
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
