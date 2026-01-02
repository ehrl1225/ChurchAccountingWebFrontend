import { TxType } from "../common_enum";
import { ItemResponseDto } from "./item_response";

export interface CategoryResponseDto{
    id: number;
    name: string;
    tx_type:TxType;
    items: ItemResponseDto[];
}