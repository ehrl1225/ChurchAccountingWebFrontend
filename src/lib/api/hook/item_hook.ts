import axiosInstance from "../axios_instance";
import { CreateItemDto, DeleteItemParams, EditItemDto } from "../request/item_request";


export const useItem = () => {
    const domain_url = `/ledger/item`;

    const create_item = async (create_item:CreateItemDto) => {
        try{
            const response = await axiosInstance.post(domain_url,create_item, {
                headers:{
                    "Content_Type":"application/json"
                },
            })

        } catch (error) {

        }
    }

    const update_item = async (edit_item:EditItemDto) => {
        try{
            const response = await axiosInstance.put(domain_url, edit_item, {
                headers:{
                    "Content_Type":"application/json"
                },
            })
        }catch (error){

        }
    }

    const delete_item = async (delete_item:DeleteItemParams) => {
        try{
            const params = new URLSearchParams({
                organization_id:delete_item.organization_id.toString(),
                item_id:delete_item.item_id.toString()
            })
            await axiosInstance.delete(`${domain_url}?${params.toString()}`);
        }catch(error){

        }
    }

    return {
        create_item,
        update_item,
        delete_item

    }
}