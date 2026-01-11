"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useCategory } from "@/lib/api/hook/category_hook";
import { useOrganizations } from "@/lib/api/organization_context";
import { Plus } from "lucide-react";
import { useState } from "react";

export interface importCategoryInput {
    fetchCategories: () => Promise<void>
}

export function ImportCategoryDialog({fetchCategories}:importCategoryInput) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [importSourceOrgId, setImportSourceOrgId] = useState('');
    const [importSourceYear, setImportSourceYear] = useState('');
    const {organizations, selectedOrgId, selectedYear} = useOrganizations();
    const {import_category} = useCategory();

    const importOrg = organizations.find(org => org.id.toString() === importSourceOrgId);

    const availableYears = importOrg && selectedOrgId
    ? Array.from(
        { length: importOrg.end_year - importOrg.start_year + 1 }, 
        (_, i) => importOrg.start_year + i
        ).filter(e=>e!==selectedYear || importOrg.id !== selectedOrgId)
    : [];

    const onImport = async (e:React.FormEvent) => {
        e.preventDefault();
        if (selectedOrgId === null){
            return;
        }
        if (selectedYear === null){
            return;
        }
        const from_organization_id = Number(importSourceOrgId);
        const from_organization_year = Number(importSourceYear);

        if (importSourceOrgId && importSourceYear){
            await import_category({
                from_organization_id,
                from_organization_year,
                to_organization_id:selectedOrgId,
                to_organization_year:selectedYear,
            });
            await fetchCategories();
            setDialogOpen(false);
            setImportSourceOrgId('');
            setImportSourceYear('');
        }
    }

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                카테고리 가져오기
                </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md">
                <DialogHeader>
                <DialogTitle>카테고리 가져오기</DialogTitle>
                <DialogDescription>
                    다른 조직/연도의 카테고리를 가져와서 사용할 수 있습니다.
                </DialogDescription>
                </DialogHeader>
                <form onSubmit={onImport} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="importSourceOrgId">가져올 조직 선택</Label>
                    <select
                    id="importSourceOrgId"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={importSourceOrgId}
                    onChange={(e) => {
                        setImportSourceOrgId(e.target.value);
                        setImportSourceYear(''); // 조직 변경 시 연도 초기화
                    }}
                    required
                    >
                    <option value="">조직을 선택하세요</option>
                    {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                        {org.name}
                    </option>
                    ))}
                    </select>
                </div>

                {importSourceOrgId && (
                    <div className="space-y-2">
                    <Label htmlFor="importSourceYear">가져올 연도 선택</Label>
                    <select
                        id="importSourceYear"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={importSourceYear}
                        onChange={(e) => setImportSourceYear(e.target.value)}
                        required
                    >
                        <option value="">연도를 선택하세요</option>
                        {availableYears.map((year) => (
                        <option key={year} value={year}>
                            {year}년
                        </option>
                        ))}
                    </select>
                    </div>
                )}

                <Button type="submit" className="w-full" disabled={!importSourceOrgId || !importSourceYear}>
                    가져오기
                </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}