"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DialogDescription } from "@radix-ui/react-dialog"
import { Download, Upload } from "lucide-react"
import { useState } from "react"
import { ReceiptUploader } from "./receipt_uploader"

interface UploadReceiptDialogInput{
    fetchReceipts: ()=>Promise<void>
}

export function UploadReceiptDialog({fetchReceipts}:UploadReceiptDialogInput) {
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);

    const baseURL = process.env.NEXT_PUBLIC_SERVER_URL

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                    <Upload className="w-4 h-4 mr-2"/>
                    엑셀로 업로드
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>데이터 업로드</DialogTitle>
                    <DialogDescription>
                        템플릿을 다운로드해서 수정해서 업로드하면 반영됩니다.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col">
                    <Button asChild className="w-full sm:w-auto mb-10">
                        <a href={`${baseURL}/static/receipt_template.xlsx`} download={"receipt_template.xlsx"}>
                            <Download className="w-4 h-4 mr-2"/>
                            템플릿 다운로드
                        </a>
                    </Button>
                    <ReceiptUploader fetchReceipts={fetchReceipts}/>
                </div>
            </DialogContent>
        </Dialog>
    )
}