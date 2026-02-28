/**
 * Format a date to "DD MMM YYYY" format (e.g., "25 Mar 2025")
 * @param date - Date object, ISO string, or timestamp
 * @returns Formatted date string (e.g., "25 Mar 2025")
 */
export function formatDate(date: Date | string | number): string {
    const dateObj =
        typeof date === "string" || typeof date === "number"
            ? new Date(date)
            : date;

    // Check for invalid date
    if (isNaN(dateObj.getTime())) {
        throw new Error("Invalid date provided");
    }

    const day = dateObj.getDate();
    const monthShort = dateObj.toLocaleString("en-US", { month: "short" });
    const year = dateObj.getFullYear();

    return `${day} ${monthShort} ${year}`;
}

// ============================================
// USAGE EXAMPLES
// ============================================

// Example 1: From Date object
const date1 = new Date("2025-03-25");
console.log(formatDate(date1)); // "25 Mar 2025"

// Example 2: From ISO string
const date2 = "2025-12-31T10:30:00Z";
console.log(formatDate(date2)); // "31 Dec 2025"

// Example 3: From timestamp
const date3 = 1711324800000;
console.log(formatDate(date3)); // "25 Mar 2024"

// Example 4: Current date
console.log(formatDate(new Date())); // e.g., "21 Jan 2026"

// ============================================
// BONUS: Additional Format Options
// ============================================

/**
 * Format date with various options
 */
export function formatDateAdvanced(
    date: Date | string | number,
    options: {
        format?: "short" | "long" | "full"; // Default: 'short'
        includeDay?: boolean; // Include day of week
        locale?: string; // Default: 'en-US'
    } = {}
): string {
    const { format = "short", includeDay = false, locale = "en-US" } = options;

    const dateObj =
        typeof date === "string" || typeof date === "number"
            ? new Date(date)
            : date;

    if (isNaN(dateObj.getTime())) {
        throw new Error("Invalid date provided");
    }

    let formatted = "";

    // Add day of week if requested
    if (includeDay) {
        const dayName = dateObj.toLocaleString(locale, { weekday: "short" });
        formatted += `${dayName}, `;
    }

    // Format based on type
    switch (format) {
        case "short": {
            // "25 Mar 2025"
            const day = dateObj.getDate();
            const month = dateObj.toLocaleString(locale, { month: "short" });
            const year = dateObj.getFullYear();
            formatted += `${day} ${month} ${year}`;
            break;
        }
        case "long": {
            // "25 March 2025"
            const day = dateObj.getDate();
            const month = dateObj.toLocaleString(locale, { month: "long" });
            const year = dateObj.getFullYear();
            formatted += `${day} ${month} ${year}`;
            break;
        }
        case "full": {
            // "March 25, 2025"
            formatted += dateObj.toLocaleString(locale, {
                month: "long",
                day: "numeric",
                year: "numeric",
            });
            break;
        }
    }

    return formatted;
}

// ============================================
// ADVANCED USAGE EXAMPLES
// ============================================

const testDate = new Date("2025-03-25");

console.log(formatDateAdvanced(testDate));
// "25 Mar 2025"

console.log(formatDateAdvanced(testDate, { format: "long" }));
// "25 March 2025"

console.log(formatDateAdvanced(testDate, { format: "full" }));
// "March 25, 2025"

console.log(formatDateAdvanced(testDate, { includeDay: true }));
// "Tue, 25 Mar 2025"

console.log(formatDateAdvanced(testDate, { format: "long", includeDay: true }));
// "Tue, 25 March 2025"

// ============================================
// UTILITY: Relative Time (Bonus)
// ============================================

/**
 * Get relative time (e.g., "2 days ago", "in 3 hours")
 */
export function getRelativeTime(date: Date | string | number): string {
    const dateObj =
        typeof date === "string" || typeof date === "number"
            ? new Date(date)
            : date;

    if (isNaN(dateObj.getTime())) {
        throw new Error("Invalid date provided");
    }

    const now = new Date();
    const diffMs = dateObj.getTime() - now.getTime();
    const diffSec = Math.floor(Math.abs(diffMs) / 1000);
    const isPast = diffMs < 0;

    // Less than a minute
    if (diffSec < 60) {
        return isPast ? "just now" : "in a few seconds";
    }

    // Minutes
    if (diffSec < 3600) {
        const mins = Math.floor(diffSec / 60);
        return isPast
            ? `${mins} minute${mins > 1 ? "s" : ""} ago`
            : `in ${mins} minute${mins > 1 ? "s" : ""}`;
    }

    // Hours
    if (diffSec < 86400) {
        const hours = Math.floor(diffSec / 3600);
        return isPast
            ? `${hours} hour${hours > 1 ? "s" : ""} ago`
            : `in ${hours} hour${hours > 1 ? "s" : ""}`;
    }

    // Days
    if (diffSec < 2592000) {
        const days = Math.floor(diffSec / 86400);
        return isPast
            ? `${days} day${days > 1 ? "s" : ""} ago`
            : `in ${days} day${days > 1 ? "s" : ""}`;
    }

    // Fall back to formatted date
    return formatDate(dateObj);
}

console.log(getRelativeTime(new Date(Date.now() - 1000 * 60 * 5)));
// "5 minutes ago"

console.log(getRelativeTime(new Date(Date.now() + 1000 * 60 * 60 * 2)));
// "in 2 hours"


export function formatTimeAgo(date: Date | string | number): string {
    const dateObj =
        typeof date === "string" || typeof date === "number"
            ? new Date(date)
            : date;

    if (isNaN(dateObj.getTime())) {
        throw new Error("Invalid date provided");
    }

    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
        return `${seconds}s ago`;
    }

    if (minutes < 60) {
        return `${minutes}m ago`;
    }

    if (hours < 24) {
        return `${hours}h ago`;
    }

    return `${days}d ago`;
}