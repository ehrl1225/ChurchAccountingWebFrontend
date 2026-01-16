import { SummaryType } from "../response/receipt_response";

export interface CreateSettlementDto{
    summary_type: SummaryType;
    month_number: number | null;
    event_id: number | null;
    organization_id: number;
    year: number;
}