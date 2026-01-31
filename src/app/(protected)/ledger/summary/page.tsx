"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TxType } from "@/lib/api/common_enum";
import { useReceipt } from "@/lib/api/hook/receipt_hook";
import { useWord } from "@/lib/api/hook/word_hook";
import { useOrganizations } from "@/lib/api/organization_context";
import { EventResponseDTO } from "@/lib/api/response/event_response";
import { ReceiptSummaryCategoryDto, ReceiptSummaryDto, SummaryType } from "@/lib/api/response/receipt_response";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { DownloadReceiptImageDialog } from "./_component/download_receipt_image.dialog";
import { useEvent } from "@/lib/api/hook/event_hook";
import { Checkbox } from "@/components/ui/checkbox";

export default function SummaryView() {
    const [filterType, setFilterType] = useState<SummaryType>(SummaryType.MONTH);
    const [selectedMonth, setSelectedMonth] = useState<string>('all');
    const [selectedEventId, setSelectedEventId] = useState<string>('all');
    const [events, setEvents] = useState<EventResponseDTO[]>([]);
    const [summaryData, setSummaryData] = useState<ReceiptSummaryDto | null>(null);
    const {selectedOrgId, selectedYear} = useOrganizations();
    const [useCarryForward, setUseCarryForward] = useState<boolean>(false);
    const {get_summary_receipts} = useReceipt();
    const {get_event} = useEvent();
    const {create_word_file_url} = useWord();

    useEffect(()=>{
        fetchEvents();
    }, [selectedOrgId, selectedYear])

    useEffect(()=>{
        fetchSummary();
    }, [selectedOrgId, selectedYear, selectedMonth, selectedEventId, filterType]);

    const totalIncome = summaryData?.total_income || 0;
    const totalExpense = summaryData?.total_outcome || 0;
    const carryAmount = summaryData?.carry_amount || 0;
    const balance = (summaryData?.balance || 0) + (useCarryForward ? carryAmount: 0);
    const baseURL = process.env.NEXT_PUBLIC_SERVER_URL
    const getMonth = (month:string) => {
        if (month === "all"){
            return null;
        }
        return Number(month)
    }

    const getNumber = (num_str:string) => {
        if (num_str === "all"){
            return null;
        }
        return Number(num_str);
    }

    const fetchSummary = async () => {
        if (selectedOrgId === null){
            return;
        }
        if (selectedYear === null){
            return;
        }
        const data = await get_summary_receipts({
            organization_id:selectedOrgId,
            year:selectedYear,
            summary_type:filterType,
            month_number:getMonth(selectedMonth),
            event_id: selectedEventId === "all" ? null : Number(selectedEventId),
            use_carry_forward:useCarryForward,
        })
        setSummaryData(data)
    }

    const fetchEvents = async () => {
        if (selectedOrgId === null){
            return;
        }
        if (selectedYear === null){
            return;
        }
        const data = await get_event({
            organization_id:selectedOrgId,
            year:selectedYear,
        });
        setEvents(data);
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ko-KR').format(amount);
    };

    const months = Array.from({ length: 12 }, (_, i) => ({
        value: String(i + 1).padStart(2, '0'),
        label: `${i + 1}월`,
    }));


    const filter_categories = (tx_type:TxType) => {
        if (summaryData === null){
            return [];
        }
        return summaryData.categories.filter(e => e.tx_type === tx_type)
    }    

    const incomeSummary = filter_categories("INCOME");
    const expenseSummary = filter_categories("OUTCOME");

    const make_report_url = () => {
        if (selectedOrgId === null){
            return undefined;
        }
        if (selectedYear === null){
            return undefined;
        }
        if (summaryData === null){
            return undefined;
        }
        if (filterType === SummaryType.EVENT && selectedEventId === "all"){
            return undefined;
        }
        return `${baseURL}${create_word_file_url({
            organization_id:selectedOrgId,
            year:selectedYear,
            summary_type:summaryData.summary_type,
            month_number:getMonth(selectedMonth),
            event_id: selectedEventId === "all" ? null : Number(selectedEventId),
            use_carry_forward:useCarryForward
        })}`

    }
    const report_download_url = make_report_url();

    const renderSummaryTable = (summary: ReceiptSummaryCategoryDto[], type: TxType) => {
        const total = type === "INCOME" ? totalIncome : totalExpense;
        
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span>총 {type === "INCOME" ? '수입' : '지출'}</span>
                    <span className={`${type === "INCOME" ? 'text-blue-600' : 'text-red-600'}`}>
                        {formatCurrency(total)}원
                    </span>
                </div>

                {summary.map((s) => {
                
                return (
                    <Card key={s.category_id}>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>{s.category_name}</CardTitle>
                                <span className={type === "INCOME" ? 'text-blue-600' : 'text-red-600'}>
                                    {formatCurrency(s.amount)}원
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-3/7">항목</TableHead>
                                        <TableHead className="text-right w-2/7">금액</TableHead>
                                        <TableHead className="text-right w-2/7">비율</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {s.items.map((i) => (
                                    <TableRow key={i.item_id}>
                                        <TableCell className="w-3/7">{i.item_name}</TableCell>
                                        <TableCell className={`text-right w-2/7 ${type === "INCOME" ? 'text-blue-600' : 'text-red-600'}`}>
                                        {formatCurrency(i.amount)}원
                                        </TableCell>
                                        <TableCell className="text-right text-gray-600 w-2/7">
                                            {((i.amount / s.amount) * 100).toFixed(1)}%
                                        </TableCell>
                                    </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                );
                })}

                {Object.keys(summary).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    등록된 {type === "INCOME" ? '수입' : '지출'} 항목이 없습니다.
                </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>수입/지출 요약</CardTitle>
                    <CardDescription>관과 항목별로 정리된 수입 및 지출 현황</CardDescription>
                </CardHeader>
                <CardContent>
                <div className="space-y-4">
                    {/* 필터 선택 */}
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-1 w-full space-y-2">
                            <Label>보고서 유형</Label>
                            <Select value={filterType} onValueChange={(value: SummaryType) => setFilterType(value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="month">월별 보고서</SelectItem>
                                    <SelectItem value="event">행사별 보고서</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {filterType === 'month' ? (
                        <div className="flex-1 w-full space-y-2">
                            <Label>월 선택</Label>
                            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">전체</SelectItem>
                                    {months.map((month) => (
                                    <SelectItem key={month.value} value={month.value}>
                                        {month.label}
                                    </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        ) : (
                            <div className="flex-1 w-full space-y-2">
                            <Label>행사 선택</Label>
                            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">전체</SelectItem>
                                    {events.map((event) => (
                                    <SelectItem key={event.id} value={event.id.toString()}>
                                        {event.name}
                                    </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            </div>
                        )}
                        {filterType === 'month' && (
                            <div className="flex-1 items-center space-x-2 mt-2 sm:mt-0">
                                <Checkbox 
                                id="useCarryForward"
                                checked={useCarryForward}
                                onCheckedChange={(checked:boolean) => setUseCarryForward(checked)}
                                />
                                <Label htmlFor="useCarryForward">전월 이월금 포함</Label>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <Button asChild disabled={report_download_url === undefined} className="w-full sm:w-auto">
                                <a href={report_download_url} download="report.docx">
                                    <Download className="w-4 h-4 mr-2" />
                                    보고서
                                </a>
                            </Button>
                            {/* <Button variant="outline" className="w-full sm:w-auto">
                                <ImageIcon className="w-4 h-4 mr-2" />
                                영수증
                            </Button> */}
                            <DownloadReceiptImageDialog 
                            summary_type={filterType} 
                            month={getMonth(selectedMonth)}
                            event_id={getNumber(selectedEventId)}
                            />
                        </div>
                    </div>

                    {/* 요약 정보 */}
                    <div className={`grid grid-cols-1 ${useCarryForward ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-4`}>
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <div className="text-sm text-gray-600 mb-1">총 수입</div>
                            <div className="text-blue-600">{formatCurrency(totalIncome)}원</div>
                        </div>
                        <div className="p-4 bg-red-50 rounded-lg">
                            <div className="text-sm text-gray-600 mb-1">총 지출</div>
                            <div className="text-red-600">{formatCurrency(totalExpense)}원</div>
                        </div>
                        {useCarryForward && <div className="p-4 bg-gray-200 rounded-lg">
                            <div className="text-sm text-gray-600 mb-1">이월된 금액</div>
                            <div className="text-gray-600">{formatCurrency(summaryData?.carry_amount!)}원</div>
                        </div>}
                        <div className={`p-4 rounded-lg ${balance >= 0 ? 'bg-green-50' : 'bg-orange-50'}`}>
                            <div className="text-sm text-gray-600 mb-1">잔액</div>
                            <div className={balance >= 0 ? 'text-green-600' : 'text-orange-600'}>
                            {formatCurrency(balance )}원
                            </div>
                        </div>
                    </div>
                    
                </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="OUTCOME" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="OUTCOME">지출</TabsTrigger>
                    <TabsTrigger value="INCOME">수입</TabsTrigger>
                </TabsList>
                <TabsContent value="OUTCOME" className="space-y-4 mt-4">
                    {renderSummaryTable(expenseSummary, 'OUTCOME')}
                </TabsContent>
                <TabsContent value="INCOME" className="space-y-4 mt-4">
                    {renderSummaryTable(incomeSummary, 'INCOME')}
                </TabsContent>
            </Tabs>
        </div>
    );
}