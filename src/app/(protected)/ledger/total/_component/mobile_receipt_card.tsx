"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useReceipt } from "@/lib/api/hook/receipt_hook"
import { useOrganizations } from "@/lib/api/organization_context"
import { ReceiptResponseDto } from "@/lib/api/response/receipt_response"
import { ImageIcon, Pencil, Trash2 } from "lucide-react"

export interface MobileReceiptCardInput {
    filteredTransactions:ReceiptResponseDto[],
    handleOpenDialog:(receipt:ReceiptResponseDto)=>void,
    handleViewImage:(receipt:string) => void,
    onDelete: (id: number) => Promise<void>
}

export function MobileReceiptCard ({
    filteredTransactions, 
    handleOpenDialog, 
    handleViewImage, 
    onDelete
}:MobileReceiptCardInput) {

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ko-KR').format(amount);
    };

    return (
        <div className="lg:hidden space-y-4">
            {filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className="overflow-hidden">
                <CardContent className="p-4">
                    <div className="space-y-3">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant={transaction.tx_type === "INCOME" ? 'default' : 'destructive'} style={transaction.tx_type === "INCOME"? {backgroundColor: '#1E88E5' }:undefined}>
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
                                <p>{transaction.event_name}</p>
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
    )
}