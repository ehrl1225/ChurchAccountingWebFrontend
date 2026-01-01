"use client"

import { useAuth } from "@/lib/api/auth_context";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { Navigation, Page } from "../_component/Navigation";
import { useOrganizationInvitationEvent } from "@/lib/api/hook/organization_invitation_event_hook";
import { InvitationNotifications } from "./organization/_component/InvitationNotifications";
import { useOrganizationInvitation } from "@/lib/api/hook/organization_invitation_hook";
import { OrganizationProvider, useOrganizations } from "@/lib/api/organization_context";
import { invitation_status } from "@/lib/api/common_enum";
import { OrganizationSelector } from "../_component/OrganizationSelector";

export default function NeedLogin({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const isOrganization = pathname === "/organization";
    const {invitations, remove_invitation} = useOrganizationInvitationEvent(isAuthenticated);

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
        <OrganizationProvider>
            <Navigation currentPage={pathname as Page} pendingInvitationsCount={invitations.length}/>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                    {isOrganization && <InvitationNotifications invitations={invitations} remove_invitation={remove_invitation}/>}
                    {!isOrganization && <OrganizationSelector/> }
                    {children}
            </div>
        </OrganizationProvider>
    </div>;
}   