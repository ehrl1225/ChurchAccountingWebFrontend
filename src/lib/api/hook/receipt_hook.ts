import { CreateReceiptDto, DeleteReceiptParams, EditReceiptDto, SearchAllReceiptParams } from "../request/receipt_request";


export const useReceipt = () => {
    const domain_url = `${process.env.NEXT_PUBLIC_SERVER_URL}/ledger/receipt/`;

    const create_receipt = async (create_receipt:CreateReceiptDto) =>{
        try{
            const response = await axios.post(domain_url, create_receipt, {
                headers: {
                    "Content_Type": "application/json"
                },
                withCredentials:true,
            })
        } catch(error){

        }
    }

    const get_all_receipts = async (search_receipt_params:SearchAllReceiptParams) => {
        try{
            const params = new URLSearchParams({
                "organization_id":search_receipt_params.organization_id.toString(),
                "year":search_receipt_params.year.toString()
            })
            const response = await axios.get(`${domain_url}?${params}`, {
                withCredentials:true,
            })
        }catch(error){

        }
    }

    const update_receipt = async (edit_receipt:EditReceiptDto) => {
        try{
            const response = await axios.put(domain_url, edit_receipt, {
                headers:{
                    "Content_Type":"application/json",
                },
                withCredentials:true,
            })
        }catch(error){

        }
    }

    const delete_receipt = async (delete_receipt_params:DeleteReceiptParams) => {
        try{
            const params = new URLSearchParams({
                "organization_id":delete_receipt_params.organization_id.toString(),
                "receipt_id":delete_receipt_params.receipt_id.toString()
            })
            const response = await axios.delete(domain_url, {
                withCredentials:true,
            })
        }catch(error){

        }
    }



    return {
        create_receipt,
        get_all_receipts,
        update_receipt,
        delete_receipt,
    }
}