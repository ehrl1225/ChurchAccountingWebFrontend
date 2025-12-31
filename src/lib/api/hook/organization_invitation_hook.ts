import { invitation_status } from "../common_enum";
import { CreateOrganizationInvitationDto } from "../request/organization_invitation_request";
import { OrganizationResponseDto } from "../response/organizatino_response";


export const use_organization_invitation = () => {
    const domain_url = `${process.env.NEXT_PUBLIC_SERVER_URL}/organization-invitation`;

    const create_organization_invitation = async (organization_invitation:CreateOrganizationInvitationDto) => {
        try{
            const response = await axios.post(domain_url, organization_invitation, {
                headers:{
                    "Content_Type":"application/json",
                },
                withCredentials:true,
            })

        }catch(error){

        }
    }

    const update_organization_invitation = async (organization_invitation_id:number, status:invitation_status)=>{
        try{
            const response = await axios.put(`${domain_url}/${organization_invitation_id}/${status}`, null, {
                withCredentials:true,
            })
        }catch (error){

        }
    }

    const get_organization_invitation = async ():Promise<OrganizationResponseDto[]> => {
        try{
            const response = await axios.get<OrganizationResponseDto[]>(domain_url, {
                withCredentials:true,
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