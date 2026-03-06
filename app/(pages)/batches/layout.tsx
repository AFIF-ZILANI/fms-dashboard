"use client";
import FAB from "./FAB";
export default function BatchesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative min-h-screen">
            {children}
            {/* <div className="mt-8 rounded-lg border border-primary/20 bg-primary/5 p-6 md:mx-6 mx-4 mb-4">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    Quick Actions Available
                </h3>
                <p className="text-sm text-muted-foreground">
                    Click the <strong>+ button</strong> in the bottom right
                    corner to access quick actions for recording mortality, feed
                    usage, FCR, weight, and more.
                </p>
            </div> */}
            <FAB />
        </div>
    );
}
