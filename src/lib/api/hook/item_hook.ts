import { CreateItemDto, DeleteItemParams, EditItemDto } from "../request/item_request";


export const useItem = () => {
    const domain_url = `${process.env.NEXT_PUBLIC_SERVER_URL}/ledger/item/`;

    const create_item = async (create_item:CreateItemDto) => {
        try{
            const response = await axios.post(domain_url,create_item, {
                headers:{
                    "Content_Type":"application/json"
                },
                withCredentials:true,
            })

        } catch (error) {

        }
    }

    const update_item = async (edit_item:EditItemDto) => {
        try{
            const response = await axios.put(domain_url, edit_item, {
                headers:{
                    "Content_Type":"application/json"
                },
                withCredentials:true,
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
        }catch(error){

        }
    }

    return {
        create_item,
        update_item,
        delete_item

    }
}