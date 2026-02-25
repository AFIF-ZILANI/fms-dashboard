"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // console.log("Login attempt:", { email, password });
        toast.error("Credentials Login is not Available");
        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label
                    htmlFor="email"
                    className="text-sm font-medium text-foreground"
                >
                    Email Address
                </Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="farmer@zerofarms.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 border-2 border-border focus:border-primary bg-background"
                    disabled={isLoading}
                />
            </div>

            <div className="space-y-2">
                <div className="flex justify-between">
                    <Label
                        htmlFor="password"
                        className="text-sm font-medium text-foreground"
                    >
                        Password
                    </Label>
                    <a
                        href="#"
                        className="text-xs text-primary hover:text-accent transition-colors"
                    >
                        Forgot password?
                    </a>
                </div>
                <div className="relative">
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-11 border-2 border-border focus:border-primary bg-background pr-12"
                        disabled={isLoading}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground transition-colors"
                        disabled={isLoading}
                    >
                        {showPassword ? (
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                            </svg>
                        ) : (
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    id="remember"
                    defaultChecked
                    className="w-4 h-4 rounded border-border cursor-pointer accent-primary"
                    disabled={isLoading}
                />
                <Label
                    htmlFor="remember"
                    className="text-sm font-medium text-foreground cursor-pointer"
                >
                    Remember me
                </Label>
            </div>

            <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-primary hover:bg-accent text-primary-foreground font-semibold rounded-lg transition-all duration-200 hover:shadow-lg"
            >
                {isLoading ? (
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                        <span>Signing in...</span>
                    </div>
                ) : (
                    "Sign In"
                )}
            </Button>
        </form>
    );
}
