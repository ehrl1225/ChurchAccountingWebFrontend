import axiosInstance from "../axios_instance";
import { OrganizationRequestDto } from "../request/organization_request"


export const useOrganization = () => {
    const domain_url = `/organization`;

    const create_organization = async (organization:OrganizationRequestDto) => {
        try {
            const response = await axiosInstance.post(`${domain_url}/`, organization,{
            })
        }catch (error) {

        }
    }

    const update_organization = async (organization_id:number, organization:OrganizationRequestDto) => {
        try{
            const response = await axiosInstance.put(`${domain_url}/${organization_id}`, organization, {
            });
        }catch(error){

        }
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