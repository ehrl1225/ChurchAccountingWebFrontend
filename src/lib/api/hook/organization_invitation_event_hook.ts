import { useEffect, useState } from "react"
import { OrganizationInvitationDto } from "../response/organization_invitation_response";
import { toast } from "sonner";
import { useOrganizationInvitation } from "./organization_invitation_hook";


export const useOrganizationInvitationEvent = (isAuthenticated: boolean) => {
    const [invitations, setinvitations] = useState<OrganizationInvitationDto[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const domain_url = `${process.env.NEXT_PUBLIC_SERVER_URL}/organization-invitation`;
    const {get_organization_invitation} = useOrganizationInvitation();

    const fetch_invitations = async () => {
        const data = await get_organization_invitation();
        setinvitations(data)
    }

    useEffect(()=>{
        if (!isAuthenticated){
            setinvitations([]);
            setIsConnected(false);
            setError(null);
            return;
        }
        fetch_invitations();


        const eventSource = new EventSource(`${domain_url}/subscribe`, {
            withCredentials:true,
        });


        eventSource.onopen = () => {
            console.log("SSE connection established.");
            setIsConnected(true);
            setError(null);
        }

        eventSource.onmessage = (event) => {
            try{
                const newInvitations: OrganizationInvitationDto[] = JSON.parse(event.data);
                setinvitations(newInvitations);
            }catch(e){
                console.error("Failed to parse SSE data:", e);
                setError("수신된 초대 데이터 형식이 올바르지 않습니다.");
            }
        }

        eventSource.onerror = (err) => {
            console.log("EventSource error:", err);
            setError("초대 목록을 가져오는 데 문제가 발생했습니다. 자동으로 재연결을 시도합니다.");
            setIsConnected(false);
        }
        return () => {
            eventSource.close();
            console.log("SSE connection closed");
        }
    }, [isAuthenticated]);

    const remove_invitation = (invitation_id:number) => {
        setinvitations(invitations.filter((e) => e.id !== invitation_id))
    }
    return {invitations, remove_invitation ,isConnected, error};
}