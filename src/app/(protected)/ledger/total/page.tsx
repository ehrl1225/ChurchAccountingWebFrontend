"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { TxType } from "@/lib/api/common_enum";
import { useCategory } from "@/lib/api/hook/category_hook";
import { useEvent } from "@/lib/api/hook/event_hook";
import { useReceipt } from "@/lib/api/hook/receipt_hook";
import { useOrganizations } from "@/lib/api/organization_context";
import { CategoryResponseDto } from "@/lib/api/response/category_response";
import { EventResponseDTO } from "@/lib/api/response/event_response";
import { ReceiptResponseDto } from "@/lib/api/response/receipt_response";
import { Filter, ImageIcon, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";

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
    const [receiptImage, setReceiptImage] = useState<string | undefined>();
    const [documentDate, setDocumentDate] = useState('');
    const [actualDate, setActualDate] = useState('');
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<TxType>("OUTCOME");
    const [primaryCategory, setPrimaryCategory] = useState('');
    const [secondaryCategory, setSecondaryCategory] = useState('');
    const [eventId, setEventId] = useState<string>('none');
    const [note, setNote] = useState('');
    const [categories, setCategories] = useState<CategoryResponseDto[]>([]);
    const [events, setEvents] = useState<EventResponseDTO[]>([]);
    const [transactions, setTransactions] = useState<ReceiptResponseDto[]>([]);
    const {selectedOrgId, selectedYear} = useOrganizations();
    const {} = useCategory();
    const {} = useEvent();
    const {create_receipt, delete_receipt, get_all_receipts, update_receipt} = useReceipt();

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

    useEffect(()=>{
        fetchReceipts()
    },[selectedOrgId, selectedYear])

    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         resetForm();
    //     }, 150)
    //     return () => clearTimeout(timer);

    // }, [editDialogOpen])


    const handleViewImage = (image: string) => {
        setSelectedImage(image);
        setImageDialogOpen(true);
    };

    const resetForm = () => {
        setReceiptImage(undefined);
        setDocumentDate('');
        setActualDate('');
        setName('');
        setAmount('');
        setType("OUTCOME");
        setPrimaryCategory('');
        setSecondaryCategory('');
        setEventId('none');
        setNote('');
        setEditingTransaction(null);
    };

    const handleOpenDialog = (transaction?: ReceiptResponseDto) => {
        if (transaction) {
            setEditingTransaction(transaction);
            setReceiptImage(transaction.receipt_image_url);
            setDocumentDate(transaction.paper_date);
            setActualDate(transaction.actual_date || "");
            setName(transaction.name);
            setAmount(transaction.amount.toString());
            setType(transaction.tx_type);
            setPrimaryCategory(transaction.category_name);
            setSecondaryCategory(transaction.item_name);
            setEventId(transaction.event_id?.toString() || 'none');
            setNote(transaction.etc?transaction.etc:"");
        } else {
            resetForm();
        }
        setEditDialogOpen(true);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setReceiptImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setReceiptImage(undefined);
    };

    const onAdd = async (a:any) => {

    }

    const onUpdate = async (a:any, b:any) => {

    }

    const onDelete = async (a:any) => {

    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const transactionData = {
        receiptImage,
        documentDate,
        actualDate,
        name,
        amount: Number(amount),
        type,
        primaryCategory,
        secondaryCategory,
        eventId: eventId === 'none' ? undefined : eventId,
        note,
        };

        if (editingTransaction) {
        onUpdate(editingTransaction.id, transactionData);
        } else {
        onAdd(transactionData);
        }
        
        setEditDialogOpen(false);
        resetForm();
    };

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

    const selectedPrimaryCategory = categories.find(c => c.name === primaryCategory);
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
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogTrigger asChild>
                    <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto">
                        <Plus className="w-4 h-4 mr-2" />
                        항목 추가
                    </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw]">
                    <DialogHeader>
                        <DialogTitle>{editingTransaction ? '항목 수정' : '항목 추가'}</DialogTitle>
                        <DialogDescription>
                        {editingTransaction ? '회계 항목 정보를 수정하세요' : '새로운 회계 항목을 추가하세요'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                        <Label>영수증 이미지</Label>
                        {receiptImage ? (
                            <div className="relative inline-block group">
                            <img src={receiptImage} alt="영수증 썸네일" className="h-48 object-contain rounded-lg border bg-gray-100 p-2" />
                            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="icon"
                                    onClick={() => handleViewImage(receiptImage)}
                                    aria-label="원본 크기로 보기"
                                >
                                    <ImageIcon className="w-4 h-4"/>
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    onClick={handleRemoveImage}
                                    aria-label="이미지 제거"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <input
                                type="file"
                                id="receipt-upload"
                                accept="image/*"
                                multiple={true}
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                            <Label htmlFor="receipt-upload" className="cursor-pointer">
                                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                클릭하여 영수증 이미지 업로드
                                </span>
                            </Label>
                            </div>
                        )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="documentDate">서류상 날짜</Label>
                            <Input
                            id="documentDate"
                            type="date"
                            value={documentDate}
                            onChange={(e) => setDocumentDate(e.target.value)}
                            required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="actualDate">실제 날짜</Label>
                            <Input
                            id="actualDate"
                            type="date"
                            value={actualDate}
                            onChange={(e) => setActualDate(e.target.value)}
                            required
                            />
                        </div>
                        </div>

                        <div className="space-y-2">
                        <Label htmlFor="name">이름</Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="거래처 또는 항목 이름"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">구분</Label>
                            <Select value={type} onValueChange={(value: TxType) => setType(value)}>
                            <SelectTrigger id="type">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="income">수입</SelectItem>
                                <SelectItem value="expense">지출</SelectItem>
                            </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount">금액</Label>
                            <Input
                            id="amount"
                            type="number"
                            placeholder="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                            />
                        </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="primaryCategory">관 (1차 카테고리)</Label>
                            <Select 
                            value={primaryCategory} 
                            onValueChange={(value) => {
                                setPrimaryCategory(value);
                                setSecondaryCategory('');
                            }}
                            >
                            <SelectTrigger id="primaryCategory">
                                <SelectValue placeholder="관 선택" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                    {category.name}
                                </SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="secondaryCategory">항목 (2차 카테고리)</Label>
                            <Select 
                            value={secondaryCategory} 
                            onValueChange={setSecondaryCategory}
                            disabled={!primaryCategory}
                            >
                            <SelectTrigger id="secondaryCategory">
                                <SelectValue placeholder="항목 선택" />
                            </SelectTrigger>
                            <SelectContent>
                                {selectedPrimaryCategory?.items.map((secondary) => (
                                <SelectItem key={secondary.id} value={secondary.id.toString()}>
                                    {secondary.name}
                                </SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                        </div>
                        </div>

                        <div className="space-y-2">
                        <Label htmlFor="event">행사 (선택사항)</Label>
                        <Select value={eventId} onValueChange={setEventId}>
                            <SelectTrigger id="event">
                            <SelectValue placeholder="행사 선택 (선택사항)" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="none">행사 없음</SelectItem>
                            {events.map((event) => (
                                <SelectItem key={event.id} value={event.id.toString()}>
                                {event.name}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        </div>

                        <div className="space-y-2">
                        <Label htmlFor="note">비고</Label>
                        <Textarea
                            id="note"
                            placeholder="추가 메모사항"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={3}
                        />
                        </div>

                        <div className="flex gap-2 justify-end">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setEditDialogOpen(false)}
                        >
                            취소
                        </Button>
                        <Button type="submit">
                            {editingTransaction ? '수정' : '추가'}
                        </Button>
                        </div>
                    </form>
                    </DialogContent>
                </Dialog>
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
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>영수증</TableHead>
                                <TableHead>서류상 날짜</TableHead>
                                <TableHead>실제 날짜</TableHead>
                                <TableHead>이름</TableHead>
                                <TableHead>구분</TableHead>
                                <TableHead>금액</TableHead>
                                <TableHead>관</TableHead>
                                <TableHead>항목</TableHead>
                                <TableHead>행사</TableHead>
                                <TableHead>비고</TableHead>
                                <TableHead>작업</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {filteredTransactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                            <TableCell>
                                {transaction.receipt_image_url ? (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleViewImage(transaction.receipt_image_url!)}
                                >
                                    <ImageIcon className="w-4 h-4" />
                                </Button>
                                ) : (
                                <span className="text-gray-400">-</span>
                                )}
                            </TableCell>
                            <TableCell>{transaction.paper_date}</TableCell>
                            <TableCell>{transaction.actual_date}</TableCell>
                            <TableCell>{transaction.name}</TableCell>
                            <TableCell>
                                <Badge variant={transaction.tx_type === "INCOME" ? 'default' : 'destructive'}>
                                {transaction.tx_type === "INCOME" ? '수입' : '지출'}
                                </Badge>
                            </TableCell>
                            <TableCell className={transaction.tx_type === "INCOME" ? 'text-blue-600' : 'text-red-600'}>
                                {formatCurrency(transaction.amount)}원
                            </TableCell>
                            <TableCell>{transaction.category_name}</TableCell>
                            <TableCell>{transaction.item_name}</TableCell>
                            <TableCell>{getEventName(transaction.event_id)}</TableCell>
                            <TableCell className="max-w-xs truncate">{transaction.etc || '-'}</TableCell>
                            <TableCell>
                                <div className="flex gap-2">
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
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
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
                                    {transaction.receipt_image_url && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleViewImage(transaction.receipt_image_url!)}
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
                        <img src={selectedImage} alt="영수증" className="w-full rounded-lg" />
                        )}
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}