"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TxType } from "@/lib/api/common_enum";
import { useCategory } from "@/lib/api/hook/category_hook";
import { useEvent } from "@/lib/api/hook/event_hook";
import { useReceipt } from "@/lib/api/hook/receipt_hook";
import { useOrganizations } from "@/lib/api/organization_context";
import { CategoryResponseDto } from "@/lib/api/response/category_response";
import { EventResponseDTO } from "@/lib/api/response/event_response";
import { ReceiptResponseDto } from "@/lib/api/response/receipt_response";
import { Download, Filter, ImageIcon, Pencil, Trash2, Upload} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ReceiptTable } from "./_component/receipt_table";
import { AddReceiptDialog, AddReceiptDialogRef } from "./_component/add_receipt_dialog";
import { useFile } from "@/lib/api/hook/file_hook";
import { UploadReceiptDialog } from "./_component/upload_receipt_dialog";
import { MobileReceiptCard } from "./_component/mobile_receipt_card";
import { Plus } from "lucide-react";

export default function TransactionTable() {
    const dialogRef = useRef<AddReceiptDialogRef>(null);
    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | undefined>();
    // Filter states
    const [dateFilterType, setDateFilterType] = useState<'document' | 'actual'>('document');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    
    // Form states
    const [categories, setCategories] = useState<CategoryResponseDto[]>([]);
    const [events, setEvents] = useState<EventResponseDTO[]>([]);
    const [transactions, setTransactions] = useState<ReceiptResponseDto[]>([]);
    const {selectedOrgId, selectedYear} = useOrganizations();
    const {get_categories} = useCategory();
    const {get_event} = useEvent();
    const {delete_receipt, get_all_receipts} = useReceipt();
    const {get_presigned_get_url} = useFile();

    const fetchReceipts = async () => {
        if (selectedOrgId === null){
            return;
        }
        if (selectedYear === null){
            return;
        }
        const data = await get_all_receipts({
            organization_id:selectedOrgId,
            year:selectedYear,
        })
        setTransactions(data);
    }

    const fetchCategories = async (tx_type:TxType | null) => {
        if (selectedOrgId === null){
            return;
        }
        if (selectedYear === null){
            return;
        }
        const data = await get_categories({
            organization_id:selectedOrgId,
            year:selectedYear,
            tx_type
        });
        setCategories(data);
    }

    const fetchEvents = async () => {
        if (selectedOrgId === null) {
            return;
        }
        if (selectedYear === null) {
            return;
        }
        const data = await get_event({
            organization_id:selectedOrgId,
            year:selectedYear
        });
        setEvents(data);
    }

    useEffect(()=>{
        fetchEvents();
        fetchCategories(null);
        fetchReceipts();
    },[selectedOrgId, selectedYear])


    const handleViewImage = async (image: string) => {
        if (selectedOrgId === null){
            return;
        }
        const url = await get_presigned_get_url("receipt",selectedOrgId, image);
        if (url === null){
            return;
        }
        setSelectedImage(url.url);
        setImageDialogOpen(true);
    };

    const handleOpenDialog = (transaction?: ReceiptResponseDto) => {
        dialogRef.current?.show(transaction);
    };

    const handleReceiptUpdate = (receipt: ReceiptResponseDto, isNew: boolean) => {
        if (isNew) {
            setTransactions(prev => [receipt, ...prev]);
        } else {
            setTransactions(prev => prev.map(t => t.id === receipt.id ? receipt : t));
        }
    };

    const onDelete = async (id:number) => {
        if (selectedOrgId === null){
            return;
        }
        const success = await delete_receipt({
            organization_id:selectedOrgId,
            receipt_id:id
        })
        if (success) {
            setTransactions(prev => prev.filter(t => t.id !== id));
        }
    }


    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ko-KR').format(amount);
    };

    // Filter transactions based on date range
    const filteredTransactions = transactions.filter(transaction => {
        if (!startDate && !endDate) return true;
        if (dateFilterType === "actual" && transaction.actual_date === null){
            return;
        }
        
        const dateToCompare = dateFilterType === 'document' ? transaction.paper_date : transaction.actual_date!;
        
        if (startDate && endDate) {
        return dateToCompare >= startDate && dateToCompare <= endDate;
        } else if (startDate) {
        return dateToCompare >= startDate;
        } else if (endDate) {
        return dateToCompare <= endDate;
        }
        
        return true;
    }).sort((a, b) => {
        if (sortOrder === 'desc') {
            return b.paper_date.localeCompare(a.paper_date);
        } else {
            return a.paper_date.localeCompare(b.paper_date);
        }
    });

    const totalIncome = filteredTransactions
        .filter(t => t.tx_type === "INCOME")
        .reduce((sum, t) => sum + t.amount, 0);
        
    const totalExpense = filteredTransactions
        .filter(t => t.tx_type === "OUTCOME")
        .reduce((sum, t) => sum + t.amount, 0);

    const getEventName = (eventId: number | null) => {
        if (!eventId) return '-';
        return events.find(e => e.id === eventId)?.name || '-';
    };

    const clearFilters = () => {
        setStartDate('');
        setEndDate('');
        setSelectedMonth('');
    };

    const handleMonthChange = (month: string) => {
        setSelectedMonth(month);
        if (month === "" || month === "all") {
            clearFilters();
        } else if (selectedYear) {
            const year = selectedYear;
            const monthInt = parseInt(month, 10);
            const firstDay = new Date(year, monthInt - 1, 1);
            const lastDay = new Date(year, monthInt, 0);
            
            const pad = (num:number) => num.toString().padStart(2, '0');
            
            setStartDate(`${year}-${pad(monthInt)}-01`);
            setEndDate(`${year}-${pad(monthInt)}-${pad(lastDay.getDate())}`);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle>회계 항목 전체 목록</CardTitle>
                        <CardDescription>
                            등록된 모든 수입 및 지출 항목을 확인하세요
                        </CardDescription>
                    </div>
                    <div className="flex gap-4">
                        <UploadReceiptDialog/>
                        <Button variant="outline" className="w-full sm:w-auto">
                            <Download className="w-4 h-4 mr-2"/>
                            엑셀로 다운로드
                        </Button>
                        <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto">
                            <Plus className="w-4 h-4 mr-2" />
                            항목 추가
                        </Button>
                        <AddReceiptDialog
                            ref={dialogRef}
                            categories={categories}
                            events={events}
                            handleViewImage={handleViewImage}
                            onReceiptUpdate={handleReceiptUpdate}
                        />
                    </div>
                </div>
                
                {/* Date Filters */}
                <div className="pt-4 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                        <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className="w-full sm:w-auto"
                        >
                        <Filter className="w-4 h-4 mr-2" />
                        {showFilters ? '필터 숨기기' : '날짜 필터'}
                        </Button>
                        {(startDate || endDate) && (
                        <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={clearFilters}
                            className="w-full sm:w-auto"
                        >
                            필터 초기화
                        </Button>
                        )}
                    </div>
                
                {showFilters && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="space-y-2">
                            <Label>정렬</Label>
                            <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="desc">최신순</SelectItem>
                                    <SelectItem value="asc">오래된순</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>날짜 기준</Label>
                            <Select value={dateFilterType} onValueChange={(value: 'document' | 'actual') => setDateFilterType(value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="document">서류상 날짜</SelectItem>
                                <SelectItem value="actual">실제 날짜</SelectItem>
                            </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>월별 필터</Label>
                            <Select value={selectedMonth} onValueChange={handleMonthChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="월 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">전체</SelectItem>
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                    <SelectItem key={month} value={month.toString()}>
                                        {month}월
                                    </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    
                        <div className="space-y-2">
                            <Label htmlFor="startDate">시작 날짜</Label>
                            <Input
                            id="startDate"
                            type="date"
                            min={`${selectedYear}-01-01`}
                            max={`${selectedYear}-12-31`}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="endDate">종료 날짜</Label>
                            <Input
                            id="endDate"
                            type="date"
                            min={startDate === ""?`${selectedYear}-01-01`:startDate}
                            max={`${selectedYear}-12-31`}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        
                        
                    </div>
                )}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-4 items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">총 수입:</span>
                        <span className="text-blue-600">{formatCurrency(totalIncome)}원</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">총 지출:</span>
                        <span className="text-red-600">{formatCurrency(totalExpense)}원</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">잔액:</span>
                        <span className={totalIncome - totalExpense >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(totalIncome - totalExpense)}원
                        </span>
                    </div>
                    <div className="ml-auto text-sm text-gray-600">
                        필터링된 항목: <span className="font-semibold">{filteredTransactions.length}개</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {filteredTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    {transactions.length === 0 ? '등록된 항목이 없습니다.' : '필터 조건에 맞는 항목이 없습니다.'}
                </div>
                ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden lg:block overflow-x-auto">
                        <ReceiptTable 
                        filteredTransactions={filteredTransactions} 
                        handleOpenDialog={handleOpenDialog} 
                        handleViewImage={handleViewImage} 
                        onDelete={onDelete}/>
                    </div>

                    {/* Mobile Card View */}
                    <MobileReceiptCard 
                    filteredTransactions={filteredTransactions}
                    handleOpenDialog={handleOpenDialog}
                    handleViewImage={handleViewImage}
                    onDelete={onDelete}
                    />
                </>
                )}

                {/* Image View Dialog */}
                <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
                    <DialogContent className="max-w-3xl w-[95vw]">
                        <DialogHeader>
                            <DialogTitle>영수증 이미지</DialogTitle>
                        </DialogHeader>
                        {selectedImage && (
                        <div className="overflow-y-auto max-h-[80vh]">
                            <img src={selectedImage} alt="영수증" className="w-full rounded-lg" />
                        </div>
                        )}
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}