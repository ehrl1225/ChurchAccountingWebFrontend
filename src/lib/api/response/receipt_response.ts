import { TxType } from "../common_enum";

export interface ReceiptResponseDto{
    id: number;
    receipt_image_url: string;
    paper_date: Date;
    actual_date: Date | null;
    name: string;
    tx_type: TxType;
    amount: number;
    category_id: number;
    category_name: string;
    item_id: number;
    item_name: string;
    etc: string | null;
}