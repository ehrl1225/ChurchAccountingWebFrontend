"use client"

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { JobStatus } from "@/lib/api/common_enum"
import { useReceipt } from "@/lib/api/hook/receipt_hook";
import { useOrganizations } from "@/lib/api/organization_context";
import { ReceiptJobDto, SummaryType } from "@/lib/api/response/receipt_response";
import { ImageIcon } from "lucide-react";
import { useEffect, useState } from "react"

interface ReceiptImageDownloaderInput{
    summary_type:SummaryType,
    month: number | null,
    event_id: number | null,
}

export function ReceiptImageDownloader ({
    summary_type, 
    month,
    event_id
}:ReceiptImageDownloaderInput) {
    const [fileName, setFileName] = useState<string | null>(null);
    const [jobStatus, setJobStatus] = useState<JobStatus>("idle");
    const [error, setError] = useState<string | null>(null);
    const [downloadUrl, setDownloadUrl] = useState<string|null>(null);
    const {download_receipt_image} = useReceipt();
    const {selectedOrgId, selectedYear} = useOrganizations();

    const domain_url = `${process.env.NEXT_PUBLIC_SERVER_URL}/ledger/receipt`

    useEffect(()=>{
        if (!fileName){return;}
        if (!selectedOrgId){return;}
        if (!selectedYear){return;}

        const eventSource = new EventSource(`${domain_url}/download/image/subscribe/${fileName}`)
        eventSource.onopen = () => {
            console.log("SSE connection established.");
        }

        eventSource.addEventListener("job_update", (event)=>{
            console.log("Job update received:", event.data);
            const data: ReceiptJobDto = JSON.parse(event.data);

            if (data.status === "completed"){
                setJobStatus("completed");
                setDownloadUrl(data.file_url);
                eventSource.close();
                console.log("SSE connection closed due to job completion.");
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
            setJobStatus("failed");
            eventSource.close();
        };

        return () => {
            console.log("Cleaning up SSE connection");
            eventSource.close();
        }
    },[fileName])

    const handleDownloadClick = async () => {
        if (!selectedOrgId){return;}
        if (!selectedYear){return;}
        setJobStatus("pending");
        setError(null);
        setFileName(null);
        setDownloadUrl(null);
        const data = await download_receipt_image({
            organization_id:selectedOrgId,
            year:selectedYear,
            summary_type:summary_type,
            month:month,
            event_id:event_id,
        });
        if (data === null){
            setJobStatus("failed");
            return;
        }
        setFileName(data.file_name);
        
    }

    const handleResetClick = async () => {
        setFileName(null);
        setError(null);
        setDownloadUrl(null);
        setJobStatus("idle");
    }

    const renderContent = () => {
        switch (jobStatus) {
            case "idle":
                return (
                <div className="flex">
                    <Button onClick={handleDownloadClick}>
                        <ImageIcon className="w-4 h-4 mr-2" />
                        <Label>
                            영수증 사진 다운로드
                        </Label>
                    </Button>
                </div>);
            case "pending":
                return (
                <div className="flex">
                    <Button disabled>
                        <Spinner/>
                        <Label>
                            영수증 준비 중...
                        </Label>
                    </Button>
                </div>);
            case "completed":
                return (
                <div className="flex">
                    <Label>이미지 파일 생성이 완료되었습니다.</Label>
                    <a href={downloadUrl!}>다운로드 하기</a>
                    <Button onClick={handleResetClick}>돌아가기</Button>
                </div>);
            case "failed":
                return (
                <div>
                    <Label>파일 생성 중 오류가 발생했습니다.</Label>
                    <Button onClick={handleDownloadClick}>
                        다시 시도
                    </Button>
                </div>);
        }

    }

    return (
        <div>
            {renderContent()}
        </div>
    )
}