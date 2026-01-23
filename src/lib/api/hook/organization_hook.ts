import axiosInstance from "../axios_instance";
import { OrganizationRequestDto } from "../request/organization_request"
import { OrganizationResponseDto } from "../response/organization_response";


export const useOrganization = () => {
    const domain_url = `/organization`;

    const create_organization = async (organization:OrganizationRequestDto):Promise<OrganizationResponseDto | null> => {
        try {
            const response = await axiosInstance.post<OrganizationResponseDto>(`${domain_url}/`, organization,{
            });
            return response.data
        }catch (error) {

        }
        return null;
    }

    const update_organization = async (organization_id:number, organization:OrganizationRequestDto):Promise<OrganizationResponseDto | null> => {
        try{
            const response = await axiosInstance.put<OrganizationResponseDto>(`${domain_url}/${organization_id}`, organization, {
            });
            return response.data;
        }catch(error){

        }
        return null;
    }

    const delete_organization = async (organization_id:number) => {
        try{
            const response = await axiosInstance.delete(`${domain_url}/${organization_id}`,{
            })
        }catch(error) {

        }
    }

    return {
        create_organization,
        update_organization,
        delete_organization,
    }
}