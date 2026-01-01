"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { invitation_status } from "@/lib/api/common_enum";
import { useOrganizationInvitation } from "@/lib/api/hook/organization_invitation_hook";
import { useOrganizations } from "@/lib/api/organization_context";
import { OrganizationInvitationDto } from "@/lib/api/response/organization_invitation_response";
import { Check, X } from "lucide-react";

interface InvitationNotificationsProps {
  invitations: OrganizationInvitationDto[];
  remove_invitation: (organization_invitation:number)=>void
}

export function InvitationNotifications({ 
  invitations, 
  remove_invitation,
}: InvitationNotificationsProps) {
  if (invitations.length === 0) return null;
  const {update_organization_invitation} = useOrganizationInvitation();
  const {fetchOrganizations} = useOrganizations()

  const update_invitation = async (invitation_id:number, status:invitation_status) => {
    await update_organization_invitation(invitation_id, status);
    await fetchOrganizations();
    remove_invitation(invitation_id);
  }


  return (
    <div className="space-y-2 mb-6">
      {invitations.map((invitation) => (
        <Card key={invitation.id} className="bg-blue-50 border-blue-200">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">{invitation.invitor_name}</span>님이{' '}
                  <span className="font-medium">{invitation.organization_name}</span> 조직에 초대했습니다.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => update_invitation(invitation.id, "accept")}
                  className="flex-1 sm:flex-none"
                >
                  <Check className="w-4 h-4 mr-1" />
                  수락
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => update_invitation(invitation.id, "reject")}
                  className="flex-1 sm:flex-none"
                >
                  <X className="w-4 h-4 mr-1" />
                  거절
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}