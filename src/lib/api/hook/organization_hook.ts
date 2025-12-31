import { OrganizationRequestDto } from "../request/organization_request"


export const use_organization = () => {
    const domain_url = `${process.env.NEXT_PUBLIC_SERVER_URL}/organization`;

    const create_organization = async (organization:OrganizationRequestDto) => {
        try {
            const response = await axios.post(domain_url, organization,{
                headers:{
                    "Content_Type":"application/json",
                },
                withCredentials:true,
            })
        }catch (error) {

        }
    }

    const update_organization = async (organization_id:number, organization:OrganizationRequestDto) => {
        try{
            const response = await axios.put(`${domain_url}/${organization_id}`, organization, {
                headers:{
                    "Content_Type":"application/json",
                },
                withCredentials:true,
            });
        }catch(error){

        }
    }

    const delete_organization = async (organization_id:number) => {
        try{
            const response = await axios.delete(`${domain_url}/${organization_id}`,{
                withCredentials:true,
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