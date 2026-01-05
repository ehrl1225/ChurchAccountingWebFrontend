import { TxType } from "../common_enum";

export interface ReceiptResponseDto{
    id: number;
    receipt_image_url: string;
    paper_date: string;
    actual_date: string | null;
    name: string;
    tx_type: TxType;
    amount: number;
    category_id: number;
    category_name: string;
    event_id: number | null;
    item_id: number;
    item_name: string;
    etc: string | null;
}

export enum SummaryType {
    MONTH = "month",
    EVENT = "event"
}

export interface ReceiptSummaryItemDto { 
    item_id: number;
    item_name: string;
    amount: number;
}

export interface ReceiptSummaryCategoryDto {
    category_id: number;
    category_name: string;
    tx_type:TxType;
    amount: number;
    items: ReceiptSummaryItemDto[];
}


export interface ReceiptSummaryDto{
    summary_type: SummaryType;
    month_number: number | null;
    event_id: number | null;
    event_name: string | null;
    total_income: number;
    total_outcome: number;
    balance: number;
    categories: ReceiptSummaryCategoryDto[]
}