import { TxType } from "../common_enum";
import { EditAllItemDto } from "./item_request";

export interface CreateCategoryDTO{
    category_name: string;
    item_name: string | null;
    tx_type: TxType;
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

export interface EditAllDto{
    organization_id: number;
    year: number;
    categories: EditAllCategoryDto[];
}

export interface EditAllCategoryDto{
    id: number | null;
    name: string;
    tx_type: TxType;
    items: EditAllItemDto[];
    deleted: boolean;
}

export interface ImportCategoryDto{
    from_organization_id: number;
    from_organization_year: number;
    to_organization_id: number;
    to_organization_year: number;
}