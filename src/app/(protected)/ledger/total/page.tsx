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
import imageCompression from "browser-image-compression";
import { Filter, ImageIcon, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ReceiptTable } from "./_component/receipt_table";
import { AddReceiptDialog } from "./_component/add_receipt_dialog";
import { useFile } from "@/lib/api/hook/file_hook";

export default function TransactionTable() {
    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | undefined>();
    const [editingTransaction, setEditingTransaction] = useState<ReceiptResponseDto| null>(null);
    // Filter states
    const [dateFilterType, setDateFilterType] = useState<'document' | 'actual'>('document');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    
    // Form states
    const [type, setType] = useState<TxType>("OUTCOME");
    const [primaryCategory, setPrimaryCategory] = useState('');
    const [secondaryCategory, setSecondaryCategory] = useState('');
    const [eventId, setEventId] = useState<string>('none');
    const [note, setNote] = useState('');
    const [categories, setCategories] = useState<CategoryResponseDto[]>([]);
    const [events, setEvents] = useState<EventResponseDTO[]>([]);
    const [transactions, setTransactions] = useState<ReceiptResponseDto[]>([]);
    const {selectedOrgId, selectedYear} = useOrganizations();
    const {get_categories} = useCategory();
    const {get_event} = useEvent();
    const {create_receipt, delete_receipt, get_all_receipts, update_receipt} = useReceipt();
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

    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         resetForm();
    //     }, 150)
    //     return () => clearTimeout(timer);

    // }, [editDialogOpen])


    const handleViewImage = async (image: string) => {
        if (selectedOrgId === null){
            return;
        }
        const url = await get_presigned_get_url(selectedOrgId, image);
        if (url === null){
            return;
        }
        setSelectedImage(url.url);
        setImageDialogOpen(true);
    };

    const handleOpenDialog = async (transaction?: ReceiptResponseDto) => {
        if (transaction) {
            setEditingTransaction(transaction);
        } 
        setEditDialogOpen(true);
    };


    const onDelete = async (id:number) => {
        if (selectedOrgId === null){
            return;
        }
        await delete_receipt({
            organization_id:selectedOrgId,
            receipt_id:id
        })
        await fetchReceipts();
    }


    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ko-KR').format(amount);
    };

    // Filter transactions based on date range
    const filteredTransactions = transactions.filter(transaction => {
        if (!startDate && !endDate) return true;
        
        const dateToCompare = dateFilterType === 'document' ? transaction.paper_date : transaction.actual_date? transaction.actual_date:transaction.paper_date;
        
        if (startDate && endDate) {
        return dateToCompare >= startDate && dateToCompare <= endDate;
        } else if (startDate) {
        return dateToCompare >= startDate;
        } else if (endDate) {
        return dateToCompare <= endDate;
        }
        
        return true;
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
                    <AddReceiptDialog
                        dialogOpen={editDialogOpen}
                        setDialogOpen={setEditDialogOpen}
                        editingTransaction={editingTransaction}
                        categories={categories}
                        events={events}
                        handleViewImage={handleViewImage}
                        fetchReceipts={fetchReceipts}
                    />
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
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
                            <Label htmlFor="startDate">시작 날짜</Label>
                            <Input
                            id="startDate"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="endDate">종료 날짜</Label>
                            <Input
                            id="endDate"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label className="text-sm text-gray-600">필터링된 항목</Label>
                            <div className="text-2xl font-semibold">{filteredTransactions.length}개</div>
                        </div>
                    </div>
                )}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-4">
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
                        fetchReceipts={fetchReceipts}/>
                    </div>

                    {/* Mobile Card View */}
                    <div className="lg:hidden space-y-4">
                    {filteredTransactions.map((transaction) => (
                        <Card key={transaction.id} className="overflow-hidden">
                            <CardContent className="p-4">
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant={transaction.tx_type === "INCOME" ? 'default' : 'destructive'}>
                                                    {transaction.tx_type === "INCOME" ? '수입' : '지출'}
                                                </Badge>
                                                {transaction.receipt_image_id && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleViewImage(transaction.receipt_image_file_name!)}
                                                >
                                                    <ImageIcon className="w-3 h-3 mr-1" />
                                                    영수증
                                                </Button>
                                                )}
                                            </div>
                                            <h3 className="font-medium">{transaction.name}</h3>
                                            <p className={`text-lg ${transaction.tx_type === "INCOME" ? 'text-blue-600' : 'text-red-600'}`}>
                                                {formatCurrency(transaction.amount)}원
                                            </p>
                                        </div>
                                        <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleOpenDialog(transaction)}
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onDelete(transaction.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-gray-500">서류상 날짜:</span>
                                            <p>{transaction.paper_date}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">실제 날짜:</span>
                                            <p>{transaction.actual_date}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">관:</span>
                                            <p>{transaction.category_name}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">항목:</span>
                                            <p>{transaction.item_name}</p>
                                        </div>
                                        {transaction.event_id && (
                                        <div className="col-span-2">
                                            <span className="text-gray-500">행사:</span>
                                            <p>{getEventName(transaction.event_id)}</p>
                                        </div>
                                        )}
                                        {transaction.etc && (
                                        <div className="col-span-2">
                                            <span className="text-gray-500">비고:</span>
                                            <p className="text-gray-700">{transaction.etc}</p>
                                        </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    </div>
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