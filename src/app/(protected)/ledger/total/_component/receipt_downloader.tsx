"use client"
import { useEffect, useState } from "react";
import { JobStatus } from "../../../../../lib/api/common_enum";
import { ReceiptJobDto } from "../../../../../lib/api/response/receipt_response";
import { Button } from "@/components/ui/button";
import { useReceipt } from "@/lib/api/hook/receipt_hook";
import axiosInstance from "@/lib/api/axios_instance";
import { useOrganizations } from "@/lib/api/organization_context";
import { FileInfoResponseDto } from "@/lib/api/response/file_response";
import { Spinner } from "@/components/ui/spinner";
import { Label } from "@/components/ui/label";


export function ReceiptDownloader () {
    const [fileName, setFileName] = useState<string | null>(null);
    const [jobStatus, setJobStatus] = useState<JobStatus>("idle");
    const [error, setError] = useState<string | null>(null);
    const [downloadUrl, setDownloadUrl] = useState<string| null>(null);
    const {} = useReceipt();
    const {selectedOrgId, selectedYear} = useOrganizations()
    
    const domain_url = `${process.env.NEXT_PUBLIC_SERVER_URL}/ledger/receipt`
    

    useEffect(()=>{
        if (!fileName){return;}
        if (!selectedOrgId){return;}
        if (!selectedYear){return;}

        const eventSource = new EventSource(`${domain_url}/download/subscribe/${fileName}`);

        eventSource.onopen = () => {
            console.log("SSE connection established.");
        };

        eventSource.addEventListener("job_update", (event) => {
            console.log("Job update received:", event.data);
            const data: ReceiptJobDto = JSON.parse(event.data);

            if (data.status === "completed"){
                setJobStatus("completed");
                setDownloadUrl(data.file_url);
                eventSource.close();
                console.log("SSE connection closed due to job completion.");
            } else if (data.status === "failed"){
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
            console.log("Cleaning up SSE connection.");
            eventSource.close();
        }
    },[fileName]);

    const handleDownloadClick = async () => {
        if (!selectedOrgId){return;}
        if (!selectedYear){return;}
        setJobStatus("pending");
        setError(null);
        setFileName(null);
        setDownloadUrl(null);
        try{
            const response = await axiosInstance.post<FileInfoResponseDto>(`${domain_url}/download/${selectedOrgId}/${selectedYear}`)
            const data = response.data;
            setFileName(data.file_name);
            
        }catch(e) {

        }
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
                return (<div className="flex justify-center">
                    <Button onClick={handleDownloadClick}>
                        엑셀 다운로드
                    </Button>
                </div>
                );
            case "pending":
                return (
                    <div className="flex justify-center">
                        <Spinner/>
                        <Label>엑셀 파일을 생성 중입니다... 잠시만 기다려 주세요.</Label>
                    </div>
                )
            case "completed":
                return (
                    <div className="flex flex-col">
                        <p className="text-center">엑셀 파일 생성이 완료되었습니다.</p>
                        <a href={downloadUrl!} className="text-center">여기를 클릭하여 다운로드하세요.</a>
                        <Button onClick={handleResetClick}>돌아가기</Button>
                    </div>
                )
            case "failed":
                return (
                    <div>
                        <p>파일 생성 중 오류가 발생했습니다.</p>
                        <Button onClick={handleDownloadClick}>
                            다시 시도
                        </Button>
                    </div>
                )
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