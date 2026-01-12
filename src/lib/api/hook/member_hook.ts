import { toast } from "sonner";
import axiosInstance from "../axios_instance";
import { LoginFormDTO, RegisterFormDTO } from "../request/member_request";
import { MemberDTO } from "../response/member_response";
import { useCallback } from "react";

export const useMember = () => {
    const domain_url = `/member`;

    const register_request = useCallback(async (register_form:RegisterFormDTO) => {
        try{
            const response = await axiosInstance.post(`${domain_url}/register`, register_form, {
            })
        }catch (error){

        }
    }, [domain_url]);

    const login_request = useCallback(async (login_form:LoginFormDTO): Promise<MemberDTO | null> => {
        try{
            const response = await axiosInstance.post<MemberDTO>(`${domain_url}/login`, login_form, {
            })
            toast.success("로그인 성공")
            return response.data;
        }catch (error) {
            toast.error("Failed to login")
        }
        return null;
    }, [domain_url]);

    const logout_request = useCallback(async () => {
        try{
            const response = await axiosInstance.post(`${domain_url}/logout`, null, {
            })
            
        }catch (error) {
            console.error("Error", error);
        }
    }, [domain_url]);

    const me_request = useCallback(async (): Promise<MemberDTO| null> => {
        try{
            const response = await axiosInstance.get<MemberDTO>(`${domain_url}/me`, {
            });
            return response.data;
        }catch(error){
            
        }
        return null;
    }, [domain_url]);

    return {
        register_request,
        login_request,
        logout_request,
        me_request,
    }
}
