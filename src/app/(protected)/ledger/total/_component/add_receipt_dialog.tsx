"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TxType } from "@/lib/api/common_enum";
import { useOrganizations } from "@/lib/api/organization_context";
import { CategoryResponseDto } from "@/lib/api/response/category_response";
import { EventResponseDTO } from "@/lib/api/response/event_response";
import { ReceiptResponseDto } from "@/lib/api/response/receipt_response";
import { ImageIcon, Plus, Upload, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import imageCompression from "browser-image-compression";
import { useReceipt } from "@/lib/api/hook/receipt_hook";
import { useFile } from "@/lib/api/hook/file_hook";
import axios from "axios";

export interface addReceiptDialogInput {
    dialogOpen: boolean,
    setDialogOpen: (status:boolean) => void,
    editingTransaction:ReceiptResponseDto | null,
    setEditingTransaction: (receipt:ReceiptResponseDto| null)=>void;
    categories:CategoryResponseDto[],
    events:EventResponseDTO[],
    handleViewImage: (image:string) => void,
    fetchReceipts: () => Promise<void>;
}

export function AddReceiptDialog(
    {
        dialogOpen, 
        setDialogOpen, 
        editingTransaction, 
        setEditingTransaction,
        categories, 
        events, 
        handleViewImage,
        fetchReceipts,
    }:addReceiptDialogInput){
    const [documentDate, setDocumentDate] = useState('');
    const [actualDate, setActualDate] = useState('');
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<TxType>("OUTCOME");
    const [receiptImageId, setReceiptImageId] = useState<number | null>(null);
    const [receiptImage, setReceiptImage] = useState<string | undefined>();
    const [receiptImageURL, setReceiptImageURL] = useState<string | null>();
    const [note, setNote] = useState('');
    const [primaryCategory, setPrimaryCategory] = useState('');
    const [secondaryCategory, setSecondaryCategory] = useState('');
    const [eventId, setEventId] = useState<string>('');
    const {selectedOrgId,selectedYear} = useOrganizations();
    const {create_receipt, update_receipt} = useReceipt();
    const {get_presigned_post_url, get_presigned_get_url} = useFile();

    const resetForm = () => {
        setReceiptImage(undefined);
        setReceiptImageId(null);
        setDocumentDate('');
        setActualDate('');
        setName('');
        setAmount('');
        setType("OUTCOME");
        setPrimaryCategory('');
        setSecondaryCategory('');
        setEventId('');
    }

    const setReceiptImageUrlFromReceiptImage= async ()=>{
        if (selectedOrgId === null){
            return;
        }
        if (receiptImage === undefined){
            return;
        }
        const image_url = await get_presigned_get_url("receipt",selectedOrgId, receiptImage);
        if (image_url === null){
            return;
        }
        setReceiptImageURL(image_url.url);
    }

    useEffect(()=>{
        if (dialogOpen){
            if (editingTransaction) {
                setReceiptImage(editingTransaction.receipt_image_file_name|| undefined);
                setReceiptImageUrlFromReceiptImage();
                setReceiptImageId(editingTransaction.receipt_image_id)
                setDocumentDate(editingTransaction.paper_date);
                setActualDate(editingTransaction.actual_date || "");
                setName(editingTransaction.name);
                setAmount(editingTransaction.amount.toString());
                setType(editingTransaction.tx_type);
                setPrimaryCategory(editingTransaction.category_id.toString());
                setSecondaryCategory(editingTransaction.item_id.toString());
                setEventId(editingTransaction.event_id?.toString()||'');
                setNote(editingTransaction.etc || "");
                return;
            }
        }
        setEditingTransaction(null);
        resetForm();
    }
    ,[dialogOpen]);

    const onAdd = async () => {
        if (selectedOrgId === null){
            return;
        }
        if (selectedYear === null) {
            return;
        }
        
        await create_receipt({
            receipt_image_id: receiptImageId,
            paper_date:documentDate,
            actual_date:actualDate===""?null:actualDate,
            name:name,
            tx_type:type,
            amount:Number(amount),
            category_id: Number(primaryCategory),
            item_id:Number(secondaryCategory),
            event_id:eventId !==""?Number(eventId):null,
            etc:note===""?null:note,
            organization_id:selectedOrgId,
            year:selectedYear,
        })

        
    }

    const onUpdate = async (id:number) => {
        if (selectedOrgId === null) {
            return;
        }
        if (selectedYear === null) {
            return;
        }
        await update_receipt({
            organization_id:selectedOrgId,
            receipt_id:id,
            receipt_image_id:receiptImageId,
            paper_date:documentDate,
            actual_date:actualDate === ""?null:actualDate,
            name:name,
            tx_type:type,
            amount:Number(amount),
            category_id:Number(primaryCategory),
            item_id:Number(secondaryCategory),
            event_id:eventId !== ""? Number(eventId) : null,
            etc:note===""?null:note
        })
    }

    const handleSubmit = async (e:FormEvent) =>{
        e.preventDefault()

        if (editingTransaction) {
            await onUpdate(editingTransaction.id);
        }else {
            await onAdd();
        }
        await fetchReceipts();
        setDialogOpen(false);
        resetForm();
    }

    const handleOpenDialog = () => {
        setDialogOpen(false);
    }

    const handleRemoveImage = () => {
        setReceiptImage(undefined);
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (selectedOrgId === null){
            return;
        }
        console.log("test");
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true
        };
        const compressedFile = await imageCompression(file, options)
        console.log("try get url");
        const post_url_response = await get_presigned_post_url("receipt",{
            organization_id:selectedOrgId,
            file_name:file.name,
        });
        if (post_url_response === null){
            return;
        }
        console.log(`url = ${post_url_response.url}`)
        const formData = new FormData();
        formData.append('file', compressedFile);
        try{
            const response = await axios.post(post_url_response.url, formData, {})
        }catch(e){
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setReceiptImageId(post_url_response.id);
            setReceiptImage(reader.result as string);
        };
        reader.readAsDataURL(compressedFile);
        const image_url = await get_presigned_get_url("receipt",selectedOrgId,post_url_response.file_name);
        if (image_url === null){
            return;
        }
        setReceiptImageURL(image_url.url);

        
    }

    const selectedPrimaryCategory = categories.find(c => c.id.toString() === primaryCategory);

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                    {receiptImageURL ? (
                        <div className="relative inline-block group">
                            <img src={receiptImageURL} alt="영수증 썸네일" className="h-48 object-contain rounded-lg border bg-gray-100 p-2" />
                            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="icon"
                                    onClick={() => handleViewImage(receiptImage!)}
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
                        min={`${selectedYear}-01-01`}
                        max={`${selectedYear}-12-31`}
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
                        min={`${selectedYear}-01-01`}
                        max={`${selectedYear}-12-31`}
                        value={actualDate}
                        onChange={(e) => setActualDate(e.target.value)}
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
                                <SelectItem value="INCOME">수입</SelectItem>
                                <SelectItem value="OUTCOME">지출</SelectItem>
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
                    onClick={() => setDialogOpen(false)}
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
    )
}