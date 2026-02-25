import Image from "next/image";
import LoginForm from "@/components/login/login-form";
import GoogleSignInButton from "@/components/signin-button";
import poultryFarm from "@/public/poultry-farm.jpg";

export default function LoginPage() {
    return (
        <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">
            {/* Left Side - Image */}
            <div className="hidden lg:flex flex-col justify-center items-center relative overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
                <div className="absolute inset-0 z-0">
                    <Image
                        src={poultryFarm}
                        alt="Zerod Farms - Professional Poultry Farm"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
                </div>

                {/* Content over image */}
                <div className="relative z-10 text-center text-white px-6 space-y-4">
                    <div className="space-y-2">
                        <h1 className="text-5xl font-bold text-balance">
                            Zerod Farms
                        </h1>
                        <p className="text-xl text-gray-100">
                            Professional Poultry Management
                        </p>
                    </div>
                    <p className="text-base text-gray-200 max-w-md text-balance">
                        Manage your poultry operation with precision,
                        efficiency, and care. Advanced tools for modern farming.
                    </p>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex flex-col justify-center items-center px-6 sm:px-12 py-12 lg:py-0">
                <div className="w-full max-w-md space-y-8">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <h1 className="text-4xl font-bold text-primary mb-2">
                            Zerod Farms
                        </h1>
                        <p className="text-sm text-foreground/60">
                            Professional Poultry Management
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="space-y-6">
                        <div className="space-y-2 text-center">
                            <h2 className="text-2xl font-bold text-foreground">
                                Welcome Back
                            </h2>
                            <p className="text-sm text-foreground/60">
                                Sign in to your farm management account
                            </p>
                        </div>

                        {/* Login Form Component */}
                        <LoginForm />

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        {/* Google Auth Button */}
                        <GoogleSignInButton />

                        {/* Signup Link */}
                        <p className="text-center text-sm text-foreground/60">
                            Don&apos;t have an account?{" "}
                            <a
                                href="#"
                                className="font-semibold text-primary hover:text-accent transition-colors"
                            >
                                Sign up
                            </a>
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-border pt-6 space-y-2 text-xs text-foreground/50 text-center">
                        <p>© 2024 Zerod Farms. All rights reserved.</p>
                        <div className="flex justify-center gap-4">
                            <a
                                href="#"
                                className="hover:text-foreground transition-colors"
                            >
                                Privacy Policy
                            </a>
                            <a
                                href="#"
                                className="hover:text-foreground transition-colors"
                            >
                                Terms of Service
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
