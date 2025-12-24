export interface CreateCategoryDTO{
    category_name: string;
    item_name: string | null;
    tx_type: string;
    organization_id: number;
    year: number
};

export interface DeleteCategoryDto{
    organization_id: number;
    category_id: number;
};

export interface EditCategoryDto{
    organization_id: number;
    category_id: number;
    category_name: string;
}