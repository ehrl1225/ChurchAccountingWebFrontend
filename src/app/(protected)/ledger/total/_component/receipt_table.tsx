"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useReceipt } from "@/lib/api/hook/receipt_hook"
import { useOrganizations } from "@/lib/api/organization_context"
import { ReceiptResponseDto } from "@/lib/api/response/receipt_response"
import { ImageIcon, Pencil, Trash2 } from "lucide-react"

export interface ReceiptTableInput{
    filteredTransactions:ReceiptResponseDto[],
    handleOpenDialog:(receipt:ReceiptResponseDto)=>void
    handleViewImage:(reciept:string) => void
    fetchReceipts: () => void
}

export function ReceiptTable({filteredTransactions, handleOpenDialog, handleViewImage, fetchReceipts}:ReceiptTableInput) {
    const {delete_receipt} = useReceipt();
    const {selectedOrgId} = useOrganizations();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ko-KR').format(amount);
    };

    const onDelete = async (id:number) =>{
        if (selectedOrgId === null){
            return;
        }
        await delete_receipt({
            organization_id:selectedOrgId,
            receipt_id:id
        })
        await fetchReceipts();
    }

    return (
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
                    {transaction.receipt_image_id ? (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewImage(transaction.receipt_image_file_name!)}
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
                    <Badge variant={transaction.tx_type === "INCOME" ? 'default' : 'destructive'} style={transaction.tx_type === "INCOME"?{backgroundColor: '#1E88E5' }:undefined}>
                        {transaction.tx_type === "INCOME" ? '수입' : '지출'}
                    </Badge>
                </TableCell>
                <TableCell className={transaction.tx_type === "INCOME" ? 'text-blue-600' : 'text-red-600'}>
                    {formatCurrency(transaction.amount)}원
                </TableCell>
                <TableCell>{transaction.category_name}</TableCell>
                <TableCell>{transaction.item_name}</TableCell>
                <TableCell>{transaction.event_name}</TableCell>
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
    )
}