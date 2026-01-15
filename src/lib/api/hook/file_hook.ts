import axiosInstance from "../axios_instance";
import { CreateFileInfo } from "../request/file_request";
import { FileInfoResponseDto } from "../response/file_response";


export const useFile = () => {
    const domain_url = "/file";

    const get_presigned_post_url = async (create_file_info:CreateFileInfo):Promise<FileInfoResponseDto | null>=>{
        try{
            const response = await axiosInstance.post<FileInfoResponseDto>(`${domain_url}/url/post/`, create_file_info, {})
            return response.data
        } catch (error){

        }
        return null
    }

    const get_presigned_get_url = async (organization_id:number, file_name:string):Promise<FileInfoResponseDto|null> => {
        try{
            const response = axiosInstance.get<FileInfoResponseDto>(`${domain_url}/url/get/${organization_id}/${file_name}`)
            return (await response).data
        } catch (errro){

        }
        return null;
    }

    return {
        get_presigned_post_url,
        get_presigned_get_url
    }
}