import axios from "axios";
import { CreateCategoryDTO, DeleteCategoryParams, EditAllDto, EditCategoryDto, ImportCategoryDto, SearchCategoryParams } from "../request/category_request"
import { CategoryResponseDto } from "../response/category_response";


export const useCategory = () => {
    const domain_url = `${process.env.NEXT_PUBLIC_SERVER_URL}/ledger/category/`;
    
    const create_category = async (create_category:CreateCategoryDTO) => {
        try {
            const response = await axios.post(domain_url, create_category, {
                headers:{
                    "Content_Type":"application/json"
                },
                withCredentials:true,
            });
            
        }catch(error){

        }
    }

    const import_category = async (import_category:ImportCategoryDto) => {
        try{
            const response = await axios.post(`${domain_url}/import`, import_category, {
                headers:{
                    "Content_Type":"application/json",
                },
                withCredentials:true,
            })
        }catch(error){

        }
    }

    const get_categories = async (search_category_params:SearchCategoryParams):Promise<CategoryResponseDto[]> => {
        try{
            const params = new URLSearchParams({
                organization_id:search_category_params.organization_id.toString(),
                year:search_category_params.year.toString(),
                tx_type:search_category_params.tx_type.toString()
            });
            const response = await axios.get<CategoryResponseDto[]>(`${domain_url}?${params.toString()}`, {
                withCredentials:true,
            });
            return response.data;
        } catch(error){
            console.error(error)

        }
        return [];
    }

    const update_category = async (edit_category:EditCategoryDto) => {
        try{
            const response = await axios.put(domain_url,edit_category, {
                headers:{
                    "Content_Type":"application/json"
                },
                withCredentials:true,
            })
        }catch(error){

        }
    }

    const update_all_category = async (edit_all_dto:EditAllDto) => {
        try{
            const response = await axios.put(`${domain_url}/all`,edit_all_dto, {
                headers: {
                    "Content_Type":"application/json",
                },
                withCredentials:true,
            })
        }catch(error){

        }
    }

    const delete_category = async (delete_category:DeleteCategoryParams) => {
        try{
            const params = new URLSearchParams({
                organization_id:delete_category.organization_id.toString(),
                category_id:delete_category.category_id.toString(),
            })
            const response = await axios.delete(`${domain_url}?${params.toString()}`)
        }catch(error){

        }
    }
    return {
        create_category,
        import_category,
        get_categories,
        update_category,
        update_all_category,
        delete_category,
    }
}