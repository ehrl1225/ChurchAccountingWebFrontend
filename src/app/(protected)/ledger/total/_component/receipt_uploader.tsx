"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { JobStatus } from "@/lib/api/common_enum";
import { useFile } from "@/lib/api/hook/file_hook";
import { useReceipt } from "@/lib/api/hook/receipt_hook";
import { useOrganizations } from "@/lib/api/organization_context";
import { ReceiptJobDto } from "@/lib/api/response/receipt_response";
import axios from "axios";
import { Upload } from "lucide-react";
import { useEffect, useState } from "react"

interface ReceiptUploaderInput{
    fetchReceipts: ()=>Promise<void>
}

export function ReceiptUploader({fetchReceipts}:ReceiptUploaderInput) {
    const [fileName, setFileName] = useState<string | null>(null);
    const [jobStatus, setJobStatus] = useState<JobStatus>("idle");
    const [error, setError] = useState<string| null>(null);
    const {selectedOrgId, selectedYear} = useOrganizations();
    const {get_presigned_post_url} = useFile();
    const {upload_receipt} = useReceipt();

    const domain_url = `${process.env.NEXT_PUBLIC_SERVER_URL}/ledger/receipt`

    useEffect(()=>{
        if (!fileName) { return;}
        if (!selectedOrgId) { return;}
        if (!selectedYear) { return;}
        
        const eventSource = new EventSource(`${domain_url}/upload/excel/subscribe/${fileName}`)
        
        eventSource.onopen = () => {
            console.log("SSE connection established.");
        };

        eventSource.addEventListener("job_update", (event)=>{
            console.log("Job update received:", event.data);
            const data: ReceiptJobDto = JSON.parse(event.data);

            if (data.status === "completed"){
                setJobStatus("completed");
                fetchReceipts();
                eventSource.close();
            }else if (data.status === "failed"){
                setJobStatus("failed");
                setError("An unknown error occured");
                eventSource.close();
                console.log("SSE connection closed due to job failure.");
            }
        });

        eventSource.onerror = (err) => {
            console.error("EventSource failed", err);
            setError("Failed to connect to the status server");
            setJobStatus("failed")
            eventSource.close();
            console.log("SSE connection closed due to job failure");
        }

        return () => {
            console.log("Cleaning up SSE connection.");
            eventSource.close();
        }

    },[fileName])

    const handleUploadFileChanged = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setFileName(post_url_response.file_name);
        setJobStatus("pending")
    }

    const reset = () => {
        setFileName(null);
        setJobStatus("idle");
        setError(null);
    }

    const renderContent = () => {
        switch (jobStatus){
            case "idle":
                return (<div className="flex flex-col">
                    <Input
                    type="file"
                    id="excel-upload"
                    accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    onChange={handleUploadFileChanged}
                    className="hidden"
                    />
                    <Label htmlFor="excel-upload" className="cursor-pointer flex-col">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400"/>
                        <span className="text-sm text-gray-600">
                            클릭하여 엑셀 파일 업로드
                        </span>
                    </Label>
                </div>);
            case "pending":
                return (<div className="flex justify-center">
                    <Spinner/>
                    <Label>엑셀 파일로 업로드 중입니다... 잠시만 기다려 주세요.</Label>
                </div>);
            case "completed":
                return (<div className="flex flex-col">
                    <p className="text-center">엑셀 파일 업로드가 완료되었습니다.</p>
                    <Button onClick={reset}>
                        돌아가기
                    </Button>
                </div>);
            case "failed":
                return (<div>
                    <p>엑셀 파일 업로드 중 오류가 발생했습니다.</p>
                    <Button onClick={reset}>
                        돌아가기
                    </Button>
                </div>)
            default:
                return null;
        }
    }
    return (
        <div>
            {renderContent()}
        </div>
    )
}
