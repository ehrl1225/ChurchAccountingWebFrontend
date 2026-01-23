"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useOrganization } from "@/lib/api/hook/organization_hook";
import { OrganizationRequestDto } from "@/lib/api/request/organization_request";
import { OrganizationResponseDto } from "@/lib/api/response/organization_response";
import { forwardRef, useImperativeHandle, useState } from "react";

interface EditOrganizationDialogProps {
  onOrganizationUpdate: (organization: OrganizationResponseDto, isNew: boolean) => void;
}

export interface EditOrganizationDialogRef {
  show: (organization?: OrganizationResponseDto) => void;
}

export const EditOrganizationDialog = forwardRef<EditOrganizationDialogRef, EditOrganizationDialogProps>(({ onOrganizationUpdate }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<OrganizationResponseDto | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState<string>('');
  const [start_year, setStartYear] = useState(new Date().getFullYear());
  const [end_year, setEndYear] = useState(new Date().getFullYear() + 1);

  const { create_organization, update_organization } = useOrganization();

  const resetForm = () => {
    setName('');
    setDescription('');
    setStartYear(new Date().getFullYear());
    setEndYear(new Date().getFullYear() + 1);
    setEditingOrg(null);
  };

  useImperativeHandle(ref, () => ({
    show: (organization) => {
      if (organization) {
        setEditingOrg(organization);
        setName(organization.name);
        setDescription(organization.description === null ? "" : organization.description);
        setStartYear(organization.start_year);
        setEndYear(organization.end_year);
      } else {
        resetForm();
      }
      setIsOpen(true);
    }
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const orgData: OrganizationRequestDto = {
      name,
      description,
      start_year,
      end_year,
    };

    if (editingOrg) {
      const updatedOrg = await update_organization(editingOrg.id, orgData);
      if (updatedOrg) {
        onOrganizationUpdate(updatedOrg, false);
      }
    } else {
      const newOrg = await create_organization(orgData);
      if (newOrg) {
        onOrganizationUpdate(newOrg, true);
      }
    }
    setIsOpen(false);
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
              onClick={() => setIsOpen(false)}
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
  );
});