"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTrigger } from "@/components/ui/dialog"
import { DialogTitle } from "@radix-ui/react-dialog";
import { Download } from "lucide-react"
import { useState } from "react";
import { ReceiptDownloader } from "./receipt_downloader";


export function DownloadReceiptDialog(){
    const [openDialog, setOpenDialog] = useState(false);

    return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
                <Download className="w-4 h-4 mr-2"/>
                엑셀로 다운로드
            </Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    데이터 다운로드
                </DialogTitle>
                <DialogDescription>
                    데이터 엑셀 파일 생성후 생성이 완료되면 다운로드 할 수 있습니다.
                </DialogDescription>

            </DialogHeader>
            <div className="flex flex-col w-full justify-items-center">
                <ReceiptDownloader />
            </div>
        </DialogContent>
    </Dialog>
    )
}