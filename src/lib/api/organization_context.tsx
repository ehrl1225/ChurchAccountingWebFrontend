"use client"

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { OrganizationResponseDto } from "./response/organization_response"
import { useJoinedOrganization } from "./hook/joined_organization_hook";
import { useAuth } from "./auth_context";

interface OrganizationContextType {
    organizations: OrganizationResponseDto[];
    setOrganizations: (organizations:OrganizationResponseDto[]) => void
    isLoading: boolean;
    fetchOrganizations: ()=>Promise<void>;
    selectedOrgId: number | null;
    setSelectedOrgId: (selectedOrgId:number|null) => void;
    selectedYear: number | null;
    setSelectedYear: (selectedYear:number|null) => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider = ({children}: {children:ReactNode}) => {
    const [organizations, setOrganizations] = useState<OrganizationResponseDto[]>([]);
    const {list_joined_organizations} = useJoinedOrganization();
    const [isLoading, setIsLoading] = useState(true);
    const {isAuthenticated} = useAuth();
    const [selectedOrgId, setSelectedOrgId] = useState<number|null>(null);
    const [selectedYear, setSelectedYear] = useState<number|null>(null);

    const fetchOrganizations = async () => {
        setIsLoading(true);
        if (isAuthenticated){
            const organization_data = await list_joined_organizations();
            setOrganizations(organization_data);
            setIsLoading(false);
        }
    }
    useEffect(() => {
        fetchOrganizations();
    }, [isAuthenticated]);

    const value = {
        organizations,
        setOrganizations,
        isLoading,
        fetchOrganizations,
        selectedOrgId,
        setSelectedOrgId,
        selectedYear,
        setSelectedYear,
    }

    if (isLoading) {
        return null;
    }
    return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>
}

export const useOrganizations = () => {
    const context = useContext(OrganizationContext);
    if (context === undefined){
        throw new Error(`useOrganization must be used within an OrganizationProvider`);
    }
    return context;
}