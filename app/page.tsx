import SignIn from "@/components/signin-button";

export default function Home() {
    return (
        <div className="grid grid-cols-1 md:px-4 lg:px-6">
            Home Page
            <SignIn />
        </div>
    );
}
