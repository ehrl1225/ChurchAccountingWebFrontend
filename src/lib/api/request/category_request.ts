import { TxType } from "../common_enum";

export interface CreateCategoryDTO{
    category_name: string;
    item_name: string | null;
    tx_type: string;
    organization_id: number;
    year: number
};

export interface DeleteCategoryParams{
    organization_id: number;
    category_id: number;
};

export interface EditCategoryDto{
    organization_id: number;
    category_id: number;
    category_name: string;
}

export interface SearchCategoryParams{
    organization_id:number;
    year:number;
    tx_type:TxType;
}