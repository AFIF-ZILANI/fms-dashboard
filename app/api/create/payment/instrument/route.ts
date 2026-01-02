import { PaymentMethod } from "@/app/generated/prisma/enums";
import { errorResponse, response } from "@/lib/apiResponse";
import prisma from "@/lib/prisma";
import { paymentInstrumentSchema } from "@/schemas/payment.schem";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const data = paymentInstrumentSchema.parse(body);
        console.log(body);
        await prisma.paymentInstrument.create({
            data: {
                owner_type: data.ownerType,
                owner_id: data.ownerId,
                label: data.label,
                type: data.type,
                account_no:
                    data.type === PaymentMethod.BANK_TRANSFER
                        ? data.accountNo
                        : null,
                mobile_no:
                    data.type === PaymentMethod.MFS ? data.mobileNo : null,
                mfs_type: data.type === PaymentMethod.MFS ? data.mfsType : null,
                bank_name:
                    data.type === PaymentMethod.BANK_TRANSFER
                        ? data.bankName
                        : null,
            },
        });
        return response({
            message: "Payment Instrument created successfully!",
        });
    } catch (error) {
        return errorResponse(error);
    }
}
