"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/api/auth_context";
import { useJoinedOrganization } from "@/lib/api/hook/joined_organization_hook";
import { useOrganization } from "@/lib/api/hook/organization_hook";
import { useOrganizationInvitation } from "@/lib/api/hook/organization_invitation_hook";
import { OrganizationRequestDto } from "@/lib/api/request/organization_request";
import { OrganizationResponseDto } from "@/lib/api/response/organization_response";
import { Pencil, Plus, Trash2, UserPlus, X } from "lucide-react";
import { useState } from "react";
import { MemberRole } from "@/lib/api/common_enum"
import { JoinedOrganizatinoResponse } from "@/lib/api/response/joined_organization_response";
import { useOrganizations } from "@/lib/api/organization_context";

export default function organization_page() {
  const {member:current_member} = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<OrganizationResponseDto | null>(null);
  const [selectedOrgId, setSelectedOrgId] = useState<number>(0);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState<string>('');
  const [start_year, setStartYear] = useState(new Date().getFullYear());
  const [end_year, setEndYear] = useState(new Date().getFullYear() + 1);
  const [inviteUserId, setInviteUserId] = useState('');

  const {create_organization, update_organization, delete_organization} = useOrganization();
  const {change_role, delete_joined_organization} = useJoinedOrganization();
  const {create_organization_invitation} = useOrganizationInvitation();
  const {organizations,fetchOrganizations} = useOrganizations();

  const resetForm = () => {
    setName('');
    setDescription('');
    setStartYear(new Date().getFullYear());
    setEndYear(new Date().getFullYear() + 1);
    setEditingOrg(null);
  };

  const handleOpenDialog = (org?: OrganizationResponseDto) => {
    if (org) {
      setEditingOrg(org);
      setName(org.name);
      setDescription(org.description===null?"": org.description);
      setStartYear(org.start_year);
      setEndYear(org.end_year);
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleOpenInviteDialog = (orgId: number) => {
    setSelectedOrgId(orgId);
    setInviteUserId('');
    setInviteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const orgData:OrganizationRequestDto = {
      name,
      description,
      start_year,
      end_year,
    };

    if (editingOrg) {
      await update_organization(editingOrg.id, orgData);
    } else {
      await create_organization(orgData);
    }
    await fetchOrganizations();
    setDialogOpen(false);
    resetForm();
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteUserId.trim()) {
      await create_organization_invitation({email:inviteUserId.trim(), organization_id:selectedOrgId});
      setInviteDialogOpen(false);
      setInviteUserId('');
    }
  };

  const canEditOrg = (org: OrganizationResponseDto) => {
    return org.my_role === "ADMIN" || org.my_role === "OWNER";
  };

  const canManageMembers = (org: OrganizationResponseDto) => {
    if (org.my_role === "OWNER" || org.my_role === "ADMIN") return true;
    else return false;
  };

  const getPermissionLabel = (permission: MemberRole) => {
    switch (permission) {
      case 'READ_ONLY': return '읽기';
      case 'READ_WRITE': return '읽기/쓰기';
      case 'ADMIN': return '관리자';
      case 'OWNER': return '소유자';
    }
  };

  const onChangeRole = async (organization:OrganizationResponseDto, member:JoinedOrganizatinoResponse, member_role:MemberRole) => {
    await change_role(organization.id, {member_id:member.member_id, member_role});
    await fetchOrganizations();
  }
  const onDeleteOrganization = async (organization:OrganizationResponseDto) => {
    await delete_organization(organization.id);
    await fetchOrganizations();

  }

  const onDeleteJoinedOrganization = async (organization:OrganizationResponseDto, joined_organization:JoinedOrganizatinoResponse) => {
    await delete_joined_organization({
      organizatino_id:organization.id,
      joined_organization_id:joined_organization.id
    })
    await fetchOrganizations();
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>조직 관리</CardTitle>
            <CardDescription>조직을 생성하고 멤버를 관리하세요</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                조직 추가
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md">
              <DialogHeader>
                <DialogTitle>{editingOrg ? '조직 수정' : '조직 추가'}</DialogTitle>
                <DialogDescription>
                  {editingOrg ? '조직 정보를 수정하세요' : '새로운 조직을 추가하세요'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orgName">조직 이름</Label>
                  <Input
                    id="orgName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="조직 이름을 입력하세요"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">설명</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="조직 설명"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startYear">시작 연도</Label>
                  <Input
                    id="start_year"
                    type="number"
                    value={start_year}
                    onChange={(e) => setStartYear(Number(e.target.value))}
                    placeholder="시작 연도"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endYear">종료 연도</Label>
                  <Input
                    id="end_year"
                    type="number"
                    value={end_year}
                    onChange={(e) => setEndYear(Number(e.target.value))}
                    placeholder="종료 연도"
                    required
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setDialogOpen(false)}
                  >
                    취소
                  </Button>
                  <Button type="submit">
                    {editingOrg ? '수정' : '추가'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {organizations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            등록된 조직이 없습니다.
          </div>
        ) : (
          <div className="space-y-6">
            {organizations.map((org) => (
              <Card key={org.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <CardTitle className="truncate">{org.name}</CardTitle>
                        {org.my_role === "OWNER" && (
                          <Badge variant="secondary">소유자</Badge>
                        )}
                      </div>
                      <CardDescription className="mt-2">
                        {org.description || '설명 없음'}
                      </CardDescription>
                      <div className="mt-2">
                        <Badge variant="outline">{org.start_year}년 ~ {org.end_year}년</Badge>
                      </div>
                    </div>
                    {canEditOrg(org) && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(org)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        {org.my_role === "OWNER" &&<Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteOrganization(org)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <h4 className="text-sm">멤버 ({org.members.length}명)</h4>
                      {canEditOrg(org) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenInviteDialog(org.id)}
                          className="w-full sm:w-auto"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          멤버 초대
                        </Button>
                      )}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>사용자 ID</TableHead>
                            <TableHead>권한</TableHead>
                            <TableHead className="text-right">작업</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {org.members.map((member) => (
                            <TableRow key={member.member_id}>
                              <TableCell>{member.member_name}</TableCell>
                              <TableCell>
                                {member.member_role === "OWNER" ? (
                                  <Badge>소유자</Badge>
                                ) : canManageMembers(org) ? (
                                  <select
                                    className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                                    value={member.member_role}
                                    onChange={(e) => onChangeRole(org, member,e.target.value as MemberRole)}
                                  >
                                    <option value="READ_ONLY">읽기</option>
                                    <option value="READ_WRITE">읽기/쓰기</option>
                                    <option value="ADMIN">관리자</option>
                                  </select>
                                ) : (
                                  <Badge variant="outline">{getPermissionLabel(member.member_role)}</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {canManageMembers(org) && member.member_id !== current_member?.id && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onDeleteJoinedOrganization(org, member)}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-3">
                      {org.members.map((member) => (
                        <div key={member.member_id} className="border rounded-lg p-3 space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm">{member.member_id}</p>
                              <div className="mt-1">
                                {org.my_role === "OWNER" ? (
                                  <Badge>소유자</Badge>
                                ) : canManageMembers(org) ? (
                                  <select
                                    className="px-2 py-1 border border-gray-300 rounded-md text-sm w-full"
                                    value={member.member_role}
                                    onChange={(e) => onChangeRole(org,  member, e.target.value as MemberRole)}
                                  >
                                    <option value="READ_ONLY">읽기</option>
                                    <option value="READ_WRITE">읽기/쓰기</option>
                                    <option value="ADMIN">관리자</option>
                                  </select>
                                ) : (
                                  <Badge variant="outline">{getPermissionLabel(member.member_role)}</Badge>
                                )}
                              </div>
                            </div>
                            {canManageMembers(org) && member.member_id && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onDeleteJoinedOrganization(org, member)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Invite Member Dialog */}
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogContent className="w-[95vw] max-w-md">
            <DialogHeader>
              <DialogTitle>멤버 초대</DialogTitle>
              <DialogDescription>
                초대할 사용자의 ID를 입력하세요. 상대방이 수락하면 조직에 추가됩니다.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inviteUserId">사용자 ID</Label>
                <Input
                  id="inviteUserId"
                  value={inviteUserId}
                  onChange={(e) => setInviteUserId(e.target.value)}
                  placeholder="예: user3"
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setInviteDialogOpen(false)}
                >
                  취소
                </Button>
                <Button type="submit">
                  초대 보내기
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}