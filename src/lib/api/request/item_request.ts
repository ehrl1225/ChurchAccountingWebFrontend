export interface CreateItemDto{
    category_id: number;
    item_name: string;
    organization_id: number;
    year: number;
}

export interface DeleteItemParams{
    organization_id: number;
    category_id: number;
    item_id: number;
}

export interface EditItemDto{
    organization_id: number;
    category_id: number;
    item_id: number;
    item_name: string;
}