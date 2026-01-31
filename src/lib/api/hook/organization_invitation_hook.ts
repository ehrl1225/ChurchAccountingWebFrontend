import axiosInstance from "../axios_instance";
import { invitation_status } from "../common_enum";
import { CreateOrganizationInvitationDto } from "../request/organization_invitation_request";
import { OrganizationInvitationDto } from "../response/organization_invitation_response";


export const useOrganizationInvitation = () => {
    const domain_url = `/organization-invitation`;

    const create_organization_invitation = async (organization_invitation:CreateOrganizationInvitationDto) => {
        try{
            const response = await axiosInstance.post(`${domain_url}/`, organization_invitation, {
            })

        }catch(error){

        }
    }

    const update_organization_invitation = async (organization_invitation_id:number, status:invitation_status)=>{
        try{
            const response = await axiosInstance.put(`${domain_url}/${organization_invitation_id}/{status}?status_literal=${status}`, null, {
            })
        }catch (error){

        }
    }

    const get_organization_invitation = async ():Promise<OrganizationInvitationDto[]> => {
        try{
            const response = await axiosInstance.get<OrganizationInvitationDto[]>(`${domain_url}/`, {
            })
            return response.data;
        }catch (error ){

        }
        return [];
    }

    return {
        create_organization_invitation,
        update_organization_invitation,
        get_organization_invitation,
    }
}