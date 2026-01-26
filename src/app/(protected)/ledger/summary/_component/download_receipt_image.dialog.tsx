"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "@/components/ui/dialog"
import { DialogTitle } from "@radix-ui/react-dialog";
import { useState } from "react"
import { ReceiptImageDownloader } from "./receipt_image_downloader";
import { ImageIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { SummaryType } from "@/lib/api/response/receipt_response";

interface DownloadReceiptImageDialogInput{
    summary_type:SummaryType,
    month:number | null,
    event_id: number | null
}

export function DownloadReceiptImageDialog({
    summary_type,
    month,
    event_id,
}:DownloadReceiptImageDialogInput){
    const [openDialog, setOpenDialog] = useState(false);

    return (<Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogTrigger asChild>
            <Button>
                <ImageIcon/>
                <Label>
                    영수증
                </Label>
            </Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>

                </DialogTitle>
            </DialogHeader>
            <div>
                <ReceiptImageDownloader 
                summary_type={summary_type}
                month={month}
                event_id={event_id}
                />
            </div>
        </DialogContent>
    </Dialog>)
}