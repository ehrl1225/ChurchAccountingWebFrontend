'use client'

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { MemberDTO } from "./response/member_response"
import { useMember } from "./hook/member_hook";
import { LoginFormDTO } from "./request/member_request";
import { Card, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AuthContextType {
    member: MemberDTO | null;
    login: ({email, password}:LoginFormDTO) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    isLoading: boolean;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: {children: ReactNode})=>{
    const [member, setMember] = useState<MemberDTO | null>(null);
    const {login_request, logout_request, me_request} = useMember();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkUserStatus = async () => {
            const userData = await me_request();
            setMember(userData);
            setIsLoading(false);
        }
        checkUserStatus();
    }, []);

    const login = async ({email, password}: LoginFormDTO) => {
        setMember(await login_request({email:email, password:password}));
    }

    const logout = async () => {
        await logout_request();
        setMember(null);
    }

    const isAuthenticated = !!member;

    const value = {
        member,
        login,
        logout,
        isAuthenticated,
        isLoading,
    };

    if (isLoading){
        return null;
    }
    
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>

}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined){
        throw new Error(`useAuth는 AuthProvider 내에서 사용해야 합니다.`);
    }
    return context;
}