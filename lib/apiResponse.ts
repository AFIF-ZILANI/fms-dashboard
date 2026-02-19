/**
 * Send a standardized API response (success or failure).
 *
 * This utility ensures a consistent response structure across your API,
 * improving maintainability and making frontend handling predictable.
 *
 * ✅ Recommended usage:
 * - Use this function for both success and error responses.
 * - For errors, prefer using `errorResponse()` which internally calls this function.
 *
 * ---
 *
 * ✅ Usage Example:
 * ```ts
 * return response({
 *   message: "Created successfully",
 *   data: createdItem,
 *   statusCode: 201,
 *   success: true
 * });
 * ```
 *
 * ---
 *
 * ✅ Standard Response Format:
 * ```json
 * {
 *   "success": true,
 *   "message": "Created successfully",
 *   "data": { ... },
 *   "statusCode": 201
 * }
 * ```
 *
 * ---
 *
 * @template T - The type of the response `data`.
 *
 * @param {object} options - Response configuration.
 * @param {string} [options.message] - Optional message describing the result.
 * @param {T | null} [options.data=null] - Optional response payload.
 * @param {number} [options.statusCode=200] - HTTP status code for the response.
 * @param {boolean} [options.success=true] - Whether the response indicates success.
 *
 * @returns {NextResponse} A Next.js JSON response with a consistent structure:
 * `{ success, message, data, statusCode }`.
 */

import { NextResponse } from "next/server";
import { AppError } from "./error";
import z from "zod";
import { Prisma } from "@/app/generated/prisma/client";
import { prettifyFieldName } from "./strings";

type ApiResponse<T> = {
    success: boolean;
    message?: string;
    data: T | null;
    statusCode: number;
};

export function response<T>({
    message,
    data,
    statusCode = 200,
    success = true,
}: {
    message?: string;
    data?: T;
    statusCode?: number;
    success?: boolean;
}) {
    return NextResponse.json<ApiResponse<T>>(
        {
            message,
            data: data ?? null,
            statusCode,
            success,
        },
        {
            status: statusCode,
        }
    );
}

export function errorResponse(error: unknown) {
    console.error("<|-|- [error log from 'errorResponse fn'] -|-|> ", error);

    // 1. Custom AppError
    if (error instanceof AppError) {
        return response({
            message: error.message,
            statusCode: error.statusCode || 500,
            success: false,
            data: error.data ?? null,
        });
    }

    // 2. Zod validation error
    if (error instanceof z.ZodError) {
        const errors = error.issues.map((err) => ({
            field: err.path.join(".") || null,
            message: err.message,
        }));

        return response({
            message: "Validation failed.",
            data: { details: errors },
            success: false,
            statusCode: 400,
        });
    }

    // 3. Syntax error
    if (error instanceof SyntaxError) {
        return response({
            message: "Invalid JSON body.",
            success: false,
            statusCode: 400,
            data: null,
        });
    }


    // 4. Prisma known errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            /**
             * P2000 = Input value is too long
             */
            case "P2000":
                return response({
                    message: "Input value is too long.",
                    success: false,
                    statusCode: 400,
                    data: {
                        type: "VALUE_TOO_LONG",
                    },
                });

            /**
             * P2001 = Record not found
             * P2025 = Record not found
             */
            case "P2001":
            case "P2025":
                return response({
                    message: "Record not found.",
                    success: false,
                    statusCode: 404,
                    data: {
                        type: "NOT_FOUND",
                    },
                });

            /**
             * P2002 = Unique constraint failed
             */
            case "P2002": {
                const target = (error.meta?.target as string[]) || [];
                return response({
                    message: "Duplicate entry. This record already exists.",
                    success: false,
                    statusCode: 409,
                    data: {
                        type: "DUPLICATE",
                        fields: target,
                    },
                });
            }

            /**
             * P2003 = Foreign key constraint failed
             */
            case "P2003":
                return response({
                    message: "Invalid reference. Related record not found.",
                    success: false,
                    statusCode: 400,
                    data: {
                        type: "FOREIGN_KEY_ERROR",
                        field: error.meta?.field_name || null,
                    },
                });

            /**
             * P2004 = Database constraint failed
             */
            case "P2004":
                return response({
                    message: "Database constraint failed.",
                    success: false,
                    statusCode: 400,
                    data: {
                        type: "CONSTRAINT_FAILED",
                    },
                });

            /**
             * Default case for Prisma known errors
             */
            default:
                return response({
                    message: "Database error.",
                    success: false,
                    statusCode: 500,
                    data: {
                        type: "PRISMA_ERROR",
                        prismaCode: error.code,
                        meta: error.meta ?? null,
                    },
                });
        }
    }
    // 5. Prisma query validation error
    if (error instanceof Prisma.PrismaClientValidationError) {
        return response({
            message: "Invalid database query.",
            success: false,
            statusCode: 400,
            data: null,
        });
    }

    // 6. Prisma initialization error (DB connection fail)
    if (error instanceof Prisma.PrismaClientInitializationError) {
        return response({
            message: "Database connection failed.",
            success: false,
            statusCode: 500,
            data: null,
        });
    }

    // 7. Prisma unknown error
    if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        return response({
            message: "Unknown database error occurred.",
            success: false,
            statusCode: 500,
            data: null,
        });
    }

    // 8. Prisma rust panic error
    if (error instanceof Prisma.PrismaClientRustPanicError) {
        return response({
            message: "Critical database engine error occurred.",
            success: false,
            statusCode: 500,
            data: null,
        });
    }



    // 9. Regular JS error
    if (error instanceof Error) {
        return response({
            message: error.message || "Something went wrong on server",
            statusCode: 500,
            success: false,
            data: null,
        });
    }

    // 10. Unknown error fallback
    return response({
        message: "Something went wrong on server",
        statusCode: 500,
        success: false,
        data: null,
    });
}