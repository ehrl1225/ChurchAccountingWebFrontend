"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useFile } from "@/lib/api/hook/file_hook"
import { useReceipt } from "@/lib/api/hook/receipt_hook"
import { useOrganizations } from "@/lib/api/organization_context"
import { DialogDescription } from "@radix-ui/react-dialog"
import axios from "axios"
import { Download, Upload } from "lucide-react"
import React, { useState } from "react"

export function UploadReceiptDialog() {
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const {selectedOrgId, selectedYear} = useOrganizations();
    const {get_presigned_post_url} = useFile();
    const {upload_receipt} = useReceipt();
    const [] = useState();

    const baseURL = process.env.NEXT_PUBLIC_SERVER_URL

    const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (selectedOrgId === null){
            return;
        }
        if (selectedYear === null){
            return;
        }
        const post_url_response = await get_presigned_post_url("excel", {
            organization_id:selectedOrgId,
            year:selectedYear,
            file_name:file.name
        });
        if (!post_url_response) return;
        const formData = new FormData();
        Object.entries(post_url_response.fields).forEach(([Key, value])=> {
            formData.append(Key, value as string);
        })
        formData.append('file', file);
        try{
            await axios.post(post_url_response.url, formData, {});
        }catch(e){
            console.error(e);
            return;
        }
        await upload_receipt({
            organization_id:selectedOrgId,
            year:selectedYear,
            excel_file_name:post_url_response.file_name
        });
        
    }

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
                    <div className="flex flex-col">
                        <input
                        type="file"
                        id="excel-upload"
                        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        onChange={handleExcelUpload}
                        className="hidden"
                        />
                        <Label htmlFor="excel-upload" className="cursor-pointer flex-col">
                            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400"/>
                            <span className="text-sm text-gray-600">
                                클릭하여 엑셀 파일 업로드
                            </span>
                        </Label>

                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}