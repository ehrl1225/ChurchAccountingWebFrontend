import axios from "axios";
import { CreateReceiptDto, DeleteReceiptParams, EditReceiptDto, ReceiptSummaryParams, SearchAllReceiptParams } from "../request/receipt_request";
import { ReceiptResponseDto, ReceiptSummaryDto, SummaryType } from "../response/receipt_response";


export const useReceipt = () => {
    const domain_url = `${process.env.NEXT_PUBLIC_SERVER_URL}/ledger/receipt`;

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

    const get_all_receipts = async (search_receipt_params:SearchAllReceiptParams):Promise<ReceiptResponseDto[]> => {
        try{
            const params = new URLSearchParams({
                "organization_id":search_receipt_params.organization_id.toString(),
                "year":search_receipt_params.year.toString()
            })
            const response = await axios.get<ReceiptResponseDto[]>(`${domain_url}/all?${params}`, {
                withCredentials:true,
            })
            return response.data
        }catch(error){

        }
        return []
    }

    const get_summary_receipts = async (receiptSummaryParams:ReceiptSummaryParams):Promise<ReceiptSummaryDto | null> => {
        try{
            const params = new URLSearchParams({
                "summary_type":receiptSummaryParams.summary_type,
                "organization_id":receiptSummaryParams.organization_id.toString(),
                "year":receiptSummaryParams.year.toString()
            });
            if (receiptSummaryParams.month_number !== null){
                params.append("month_number", receiptSummaryParams.month_number.toString())
            }
            if (receiptSummaryParams.event_id !== null){
                params.append("event_id", receiptSummaryParams.event_id.toString())
            }
            const response = await axios.get<ReceiptSummaryDto>(`${domain_url}/summary?${params}`, {
                withCredentials:true,
            })
            return response.data
        }catch(error){

        }
        return null
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
        get_summary_receipts,
        update_receipt,
        delete_receipt,
    }
}