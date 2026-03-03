import React from "react";

export function RequiredLabel({ label }: { label: string }) {
    return (
        <React.Fragment>
            {label}
            <span className="text-red-500">*</span>
        </React.Fragment>
    );
}

export function OptionalLabel({ label }: { label: string }) {
    return (
        <React.Fragment>
            {label}
            <span className="text-gray-500">&#40;optional&#41;</span>
        </React.Fragment>
    );
}
