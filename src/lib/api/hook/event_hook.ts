import axiosInstance from "../axios_instance";
import { CreateEventDTO, DeleteEventParams, EditEventDto, SearchEventParams } from "../request/event_request";
import { EventResponseDTO } from "../response/event_response";


export const useEvent = () => {
    const domain_url = `/ledger/event`;

    const create_event = async (create_event:CreateEventDTO) => {
        try{
            const response = await axiosInstance.post(`${domain_url}/`, create_event, {
            })
        }catch(error){

        }
    }

    const get_event = async (search_event_param:SearchEventParams):Promise<EventResponseDTO[]> =>  {
        try{
            const params = new URLSearchParams({
                "organization_id":search_event_param.organization_id.toString(),
                "year":search_event_param.year.toString(),
            });
            const response = await axiosInstance.get<EventResponseDTO[]>(`${domain_url}/?${params.toString()}`, {
            })
            return response.data
        }catch(error) {

        }
        return [];
    }

    const update_event = async (edit_event:EditEventDto) => {
        try{
            const response = await axiosInstance.put(`${domain_url}/`, edit_event, {
            })
        }catch(error) {

        }
    }

    const delete_event = async (delete_event_params:DeleteEventParams) => {
        try{
            const params = new URLSearchParams({
                "organization_id":delete_event_params.organization_id.toString(),
                "event_id":delete_event_params.event_id.toString(),
            })
            const response = await axiosInstance.delete(`${domain_url}?${params}`,{
            })
        }catch(error){

        }
    }



    return {
        create_event,
        get_event,
        update_event,
        delete_event,
    }
}