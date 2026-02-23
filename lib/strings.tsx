import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export function TooltipCreator({
    text,
    size,
}: {
    text: string;
    size?: number;
}) {
    const shortId = (id: string) => id.slice(0, size || 14) + "...";
    if (text) {
        if (text.length < (size || 14)) {
            return text;
        }
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="text-muted-foreground cursor-pointer">
                            {shortId(text)}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>{text}</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }
}

export function formatCurrencyInBDT(amount: number) {
    const number = Number(amount) || 0;

    const formatted = number
        .toFixed(2)
        .replace(/\.00$/, "") // remove .00
        .replace(/(\.\d)0$/, "$1") // remove trailing zero like .50 → .5
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return `৳${formatted}`;
}

export function formatEnums(unitRaw: string) {
    return unitRaw
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

export function normalizeOrgNameEn(name: string): string {
    if (!name) return "";

    // 1. Unicode normalize (important for Bangla, accents, etc.)
    let s = name.normalize("NFC");

    // 2. lowercase (safe even for Bangla)
    s = s.toLowerCase();

    // 3. Replace punctuation/symbols with spaces
    // Keeps letters/numbers (including Bangla unicode letters)
    s = s.replace(/[^\p{L}\p{N}]+/gu, " ");

    // 4. Collapse multiple spaces
    s = s.trim().replace(/\s+/g, " ");

    // 5. Remove company suffix words
    // (remove them only as whole words)
    const stopWords = new Set([
        "ltd",
        "limited",
        "co",
        "company",
        "inc",
        "incorporated",
        "corp",
        "corporation",
        "llc",
        "plc",
        "gmbh",
        "ag",
        "bv",
        "srl",
        "sa",
        "pte",
        "pvt",
        "private",
        "group",
        "holdings",
        "trading",
        "enterprise",
        "enterprises",
    ]);

    const parts = s.split(" ").filter((w) => !stopWords.has(w));

    return parts.join(" ").trim();
}

export function normalizeOrgNameEnBnSoft(name: string): string {
    if (!name) return "";

    // 1. Unicode normalize (important for Bangla/Unicode)
    let s = name.normalize("NFC");

    // 2. lowercase (safe for Bangla too)
    s = s.toLowerCase();

    // 3. Replace punctuation/symbols with spaces
    // Keeps letters/numbers (including Bangla letters)
    s = s.replace(/[^\p{L}\p{N}]+/gu, " ");

    // 4. Collapse multiple spaces
    s = s.trim().replace(/\s+/g, " ");

    // 5. Stop words (English + Bangla)
    const stopWords = new Set([
        // English
        "ltd",
        "limited",
        "co",
        "company",
        "inc",
        "incorporated",
        "corp",
        "corporation",
        "llc",
        "plc",
        "gmbh",
        "ag",
        "bv",
        "srl",
        "sa",
        "pte",
        "pvt",
        "private",
        "group",
        "holdings",
        "trading",
        "enterprise",
        "enterprises",

        // Bangla common suffix
        "লিমিটেড",
        "লিঃ",
        "কোম্পানি",
        "কো",
        "কোঃ",
        "প্রাঃ",
        "প্রাইভেট",
        "প্রাইভেটলিমিটেড",
        "প্রাইভেট লিমিটেড",
        "গ্রুপ",
        "হোল্ডিংস",
        "এন্টারপ্রাইজ",
        "এন্টারপ্রাইজেস",
        "কর্পোরেশন",
        "কর্প",
    ]);

    // Normalize by splitting words
    const parts = s.split(" ").filter((w) => !stopWords.has(w));

    return parts.join(" ").trim();
}

export function normalizeOrgNameEnBnAggressive(name: string): string {
    if (!name) return "";

    // 1. Unicode normalize (important for Bangla/Unicode)
    let s = name.normalize("NFC");

    // 2. lowercase
    s = s.toLowerCase();

    // 3. Replace punctuation/symbols with spaces
    s = s.replace(/[^\p{L}\p{N}]+/gu, " ");

    // 4. Collapse multiple spaces
    s = s.trim().replace(/\s+/g, " ");

    // 5. Remove suffix patterns (works even if attached)
    // Example: "বাংলাদেশফার্মালিমিটেড" -> "বাংলাদেশফার্মা"
    const banglaSuffixPatterns = [
        /লিমিটেড$/u,
        /লিঃ$/u,
        /প্রাঃ$/u,
        /কোম্পানি$/u,
        /কর্পোরেশন$/u,
        /গ্রুপ$/u,
        /হোল্ডিংস$/u,
        /এন্টারপ্রাইজ$/u,
        /এন্টারপ্রাইজেস$/u,
    ];

    // Remove suffix repeatedly (in case multiple suffixes exist)
    const removeBanglaSuffixes = (word: string) => {
        let w = word;
        let changed = true;

        while (changed) {
            changed = false;

            for (const pattern of banglaSuffixPatterns) {
                if (pattern.test(w)) {
                    w = w.replace(pattern, "");
                    changed = true;
                }
            }

            w = w.trim();
        }

        return w;
    };

    // 6. Stop words (English + Bangla)
    const stopWords = new Set([
        // English stop words
        "ltd",
        "limited",
        "co",
        "company",
        "inc",
        "incorporated",
        "corp",
        "corporation",
        "llc",
        "plc",
        "gmbh",
        "ag",
        "bv",
        "srl",
        "sa",
        "pte",
        "pvt",
        "private",
        "group",
        "holdings",
        "trading",
        "enterprise",
        "enterprises",
        "jsc",

        // Bangla stop words
        "লিমিটেড",
        "লিঃ",
        "কোম্পানি",
        "কো",
        "কোঃ",
        "প্রাঃ",
        "প্রাইভেট",
        "গ্রুপ",
        "হোল্ডিংস",
        "এন্টারপ্রাইজ",
        "এন্টারপ্রাইজেস",
        "কর্পোরেশন",
        "কর্প",
    ]);

    // 7. Split into words, clean each one
    const parts = s
        .split(" ")
        .map((w) => removeBanglaSuffixes(w))
        .filter(Boolean)
        .filter((w) => !stopWords.has(w));

    return parts.join(" ").trim();
}

export function normalizeItemName(name: string): string {
    if (!name) return "";

    let s = name.normalize("NFC");

    s = s.toLowerCase();

    // Replace punctuation/symbols with spaces
    s = s.replace(/[^\p{L}\p{N}]+/gu, " ");

    // Collapse spaces
    s = s.trim().replace(/\s+/g, " ");

    return s;
}

export function prettifyFieldName(field: string) {
    const map: Record<string, string> = {
        normalizedKey: "Name",
        labelName: "Name",
        email: "Email address",
        phone: "Phone number",
        countryId: "Country",
        productId: "Product",
        organizationId: "Organization",
    };

    // 1. If exact mapping exists, use it
    if (map[field]) return map[field];

    // 2. Remove common suffixes
    let cleaned = field
        .replace(/Id$/, "") // countryId -> country
        .replace(/_key$/, "")
        .replace(/_idx$/, "")
        .replace(/_fkey$/, "");

    // 3. Convert snake_case to words
    cleaned = cleaned.replace(/_/g, " ");

    // 4. Convert camelCase to words
    cleaned = cleaned.replace(/([a-z])([A-Z])/g, "$1 $2");

    // 5. Capitalize each word
    cleaned = cleaned
        .split(" ")
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

    return cleaned.trim();
}
