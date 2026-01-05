import { SummaryType } from "../response/receipt_response";

export interface CreateReceiptDto{
    receipt_image_url: string | null;
    paper_date: Date;
    actural_date: Date | null;
    name: string;
    tx_type: string;
    amount:number;
    category_id: number;
    item_id: number;
    event_id: number | null;
    etc: string | null;
    organization_id: number;
    year: number;
}

export interface DeleteReceiptParams{
    organization_id:number;
    receipt_id: number;
}

export interface EditReceiptDto{
    organization_id:number;
    receipt_id: number;
    receipt_image_url: string;
    paper_date: Date;
    actual_date: Date;
    name: string;
    tx_type: string;
    amount: number;
    category_id: number;
    item_id: number;
    event_id: number;
    etc:string;
}

export interface SearchAllReceiptParams{
    organization_id: number;
    year: number;
}

export interface ReceiptSummaryParams{
    summary_type:SummaryType;
    month_number: number | null;
    event_id: number | null;
    organization_id: number;
    year: number;
}
