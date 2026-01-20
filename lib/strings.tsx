import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export function TooltipCreator({ text }: { text?: string }) {
    const shortId = (id: string) => id.slice(0, 14) + "...";
    if (text) {
        if (text.length < 14) {
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
