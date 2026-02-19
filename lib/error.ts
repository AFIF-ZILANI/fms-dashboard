/**
 * Represents a custom application error with an HTTP status code and optional data.
 *
 * @remarks
 * This class extends the native `Error` object to include additional properties
 * such as `statusCode` for HTTP error handling and `data` for passing extra error details.
 *
 * @example
 * ```typescript
 * throw new AppError('Resource not found', 404, { resource: 'User' });
 * ```
 *
 * @extends Error
 */
export class AppError<E> extends Error {
    statusCode: number;
    data?: E;

    constructor(message: string, statusCode: number = 500, data?: E) {
        super(message);
        this.statusCode = statusCode;
        this.data = data;
        Error.captureStackTrace(this, this.constructor);
    }
}

// Helper function so you can throw easily
export function throwError<T>({
    message,
    statusCode = 500,
    data,
}: {
    message: string;
    statusCode?: number;
    data?: T;
}): never {
    throw new AppError(message, statusCode, data);
}
