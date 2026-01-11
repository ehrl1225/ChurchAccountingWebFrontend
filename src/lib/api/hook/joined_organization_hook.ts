import axiosInstance from "../axios_instance";
import { ChangeRoleDto, DeleteJoinedOrganizationParams } from "../request/joined_organization_request"
import { OrganizationRequestDto } from "../request/organization_request";
import { OrganizationResponseDto } from "../response/organization_response";

export const useJoinedOrganization = () => {
    const domain_url = `/joined-organization`;

    const change_role = async (organization_id:number, change_role:ChangeRoleDto) => {
        try{
            const response = await axiosInstance.put(`${domain_url}/${organization_id}`, change_role, {
                headers:{
                    "Content_Type":"application/json",
                },
            })
        }catch(error){

        }
    }

    const list_joined_organizations = async ():Promise<OrganizationResponseDto[]> => {
        try{
            const response = await axiosInstance.get<OrganizationResponseDto[]>(domain_url, {
                headers:{
                    "Content_Type":"application/json",
                },
            })
            return response.data;
        }catch(error){
            console.error(error);

        }
        return [];
    }

    const delete_joined_organization = async (delete_joined_organization:DeleteJoinedOrganizationParams) => {
        try{
            const params = new URLSearchParams({
                "organization_id":delete_joined_organization.organizatino_id.toString(),
                "joined_organization_id":delete_joined_organization.joined_organization_id.toString(),
            })
            const response = await axiosInstance.delete(`${domain_url}?${params}`,{
            })
        }catch(error){

        }
    }

    return {
        change_role,
        list_joined_organizations,
        delete_joined_organization,
    }
}