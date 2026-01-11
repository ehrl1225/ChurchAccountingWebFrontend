import axiosInstance from "../axios_instance";
import { CreateReceiptDto, DeleteReceiptParams, EditReceiptDto, ReceiptSummaryParams, SearchAllReceiptParams } from "../request/receipt_request";
import { ReceiptResponseDto, ReceiptSummaryDto, SummaryType } from "../response/receipt_response";


export const useReceipt = () => {
    const domain_url = `/ledger/receipt`;

    const create_receipt = async (create_receipt:CreateReceiptDto) =>{
        try{
            const response = await axiosInstance.post(`${domain_url}/`, create_receipt, {
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
            const response = await axiosInstance.get<ReceiptResponseDto[]>(`${domain_url}/all?${params}`, {
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
            const response = await axiosInstance.get<ReceiptSummaryDto>(`${domain_url}/summary?${params}`, {
            })
            return response.data
        }catch(error){

        }
        return null
    }

    const update_receipt = async (edit_receipt:EditReceiptDto) => {
        try{
            const response = await axiosInstance.put(`${domain_url}/`, edit_receipt, {
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
            const response = await axiosInstance.delete(`${domain_url}/?${params.toString()}`, {
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