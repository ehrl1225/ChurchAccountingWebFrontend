import axiosInstance from "../axios_instance";
import { LoginFormDTO, RegisterFormDTO } from "../request/member_request";
import { MemberDTO } from "../response/member_response";

export const useMember = () => {
    const domain_url = `/member`;

    async function register_request(register_form:RegisterFormDTO) {
        try{
            const response = await axiosInstance.post(`${domain_url}/register`, register_form, {
                headers: {
                    "Content_Type": "application/json"
                },
            })
        }catch (error){

        }
    }

    async function login_request(login_form:LoginFormDTO): Promise<MemberDTO | null>{
        try{
            const response = await axiosInstance.post<MemberDTO>(`${domain_url}/login`, login_form, {
                headers: {
                    "Content_Type": "application/json"
                },
            })
            return response.data;
        }catch (error) {
            console.error("Error", error);
        }
        return null;
    }

    async function logout_request() {
        try{
            const response = await axiosInstance.post(`${domain_url}/logout`, null, {
                headers:{
                    "Content_Type": "application/json"
                },
            })
            
        }catch (error) {
            console.error("Error", error);
        }
    }

    async function me_request(): Promise<MemberDTO| null> {
        try{
            const response = await axiosInstance.get<MemberDTO>(`${domain_url}/me`, {
                headers: {
                    "Content_Type": "application/json"
                },
            });
            return response.data;
        }catch(error){
            
        }
        return null;
    }

    return {
        register_request,
        login_request,
        logout_request,
        me_request,
    }
}