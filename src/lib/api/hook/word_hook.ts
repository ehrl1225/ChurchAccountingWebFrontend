import axiosInstance from "../axios_instance"
import { CreateSettlementDto } from "../request/word_request"

export const useWord = () =>{
    const domain_url = "/file/word";
    const create_word_file = async(create_settlement:CreateSettlementDto)=>{
        try{
            const params = new URLSearchParams({
                summary_type:create_settlement.summary_type,
                organization_id:create_settlement.organization_id.toString(),
                year:create_settlement.year.toString(),
                use_carry_forward:create_settlement.use_carry_forward.toString(),
            })
            if (create_settlement.month_number !== null){
                params.set("month_number", create_settlement.month_number.toString())
            }
            if (create_settlement.event_id !== null){
                params.set("event_id", create_settlement.event_id.toString());
            }
            const response = await axiosInstance.get<Blob>(`${domain_url}/?${params}`, {
                responseType: 'blob'
            })
            return response

        } catch (error){

        }
        return null;
    }

    const create_word_file_url = (create_settlement:CreateSettlementDto) => {
        const params = new URLSearchParams({
            summary_type:create_settlement.summary_type,
            organization_id:create_settlement.organization_id.toString(),
            year:create_settlement.year.toString(),
            use_carry_forward:create_settlement.use_carry_forward.toString(),
        })
        if (create_settlement.month_number !== null){
            params.set("month_number", create_settlement.month_number.toString())
        }
        if (create_settlement.event_id !== null){
            params.set("event_id", create_settlement.event_id.toString());
        }
        return `${domain_url}/?${params}`
    }

    return {
        create_word_file,
        create_word_file_url
    }
}