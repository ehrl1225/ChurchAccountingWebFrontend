import { ItemResponseDto } from "./item_response";

export interface CategoryResponseDto{
    id: number;
    name: string;
    items: ItemResponseDto[];
}