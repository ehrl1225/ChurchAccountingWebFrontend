"use client"

import { useAuth } from "@/lib/api/auth_context";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { Navigation, Page } from "../_component/Navigation";

export default function NeedLogin({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const isAuth = pathname === "/auth/login" || pathname === "/auth/register";

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/auth/login");
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return null; // Or a loading spinner
    }

    if (!isAuthenticated) {
        return null; // Redirect will handle this, but explicitly return null to prevent content flash
    }

    return <div className="min-h-screen bg-gray-50">
        {!isAuth && <Navigation currentPage={pathname as Page}/>}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            {children}
        </div>
    </div>;
}   