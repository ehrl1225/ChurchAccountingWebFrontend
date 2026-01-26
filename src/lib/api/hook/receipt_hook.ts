import axiosInstance from "../axios_instance";
import { CreateReceiptDto, DeleteReceiptParams, DownloadReceiptImageDto, EditReceiptDto, ReceiptSummaryParams, SearchAllReceiptParams, UploadReceiptDto } from "../request/receipt_request";
import { FileInfoResponseDto } from "../response/file_response";
import { ReceiptResponseDto, ReceiptSummaryDto, SummaryType } from "../response/receipt_response";


export const useReceipt = () => {
    const domain_url = `/ledger/receipt`;

    const create_receipt = async (create_receipt:CreateReceiptDto):Promise<ReceiptResponseDto | null> =>{
        try{
            const response = await axiosInstance.post<ReceiptResponseDto>(`${domain_url}/`, create_receipt, {})
            return response.data;
        } catch(error){
            return null;
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
        const response = await axiosInstance.put<ReceiptResponseDto>(`${domain_url}/`, edit_receipt, {
        })
        return response.data
    }

    const delete_receipt = async (delete_receipt_params:DeleteReceiptParams) => {
        try{
            const params = new URLSearchParams({
                "organization_id":delete_receipt_params.organization_id.toString(),
                "receipt_id":delete_receipt_params.receipt_id.toString()
            })
            await axiosInstance.delete(`${domain_url}/?${params.toString()}`, {
            })
            return true
        }catch(error){
            return false
        }
    }

    const upload_receipt = async (upload_receipt:UploadReceiptDto) => {
        try{
            const response = await axiosInstance.post(`${domain_url}/upload/excel`, upload_receipt, {})

        }catch(e){

        }
    }

    const download_receipt = async (selectedOrgId:number, selectedYear:number):Promise<FileInfoResponseDto|null> => {
        try{
            const response = await axiosInstance.post<FileInfoResponseDto>(`${domain_url}/download/excel/${selectedOrgId}/${selectedYear}`)
            return response.data;
        }catch(e){

        }
        return null
    }

    const download_receipt_image = async (download_receipt_image_dto:DownloadReceiptImageDto):Promise<FileInfoResponseDto|null> => {
        try{
            const response = await axiosInstance.post<FileInfoResponseDto>(`${domain_url}/download/image`, download_receipt_image_dto)
            return response.data;
        }catch(e){

        }
        return null;
    }



    return {
        create_receipt,
        get_all_receipts,
        get_summary_receipts,
        update_receipt,
        delete_receipt,
        upload_receipt,
        download_receipt,
        download_receipt_image,
    }
}