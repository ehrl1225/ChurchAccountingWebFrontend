"use client"

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOrganizations } from "@/lib/api/organization_context";


export function OrganizationSelector() {
    const {organizations, selectedOrgId, selectedYear, setSelectedOrgId, setSelectedYear} = useOrganizations();
    const selectedOrg = organizations.find(org => org.id === selectedOrgId);
  
    // 선택된 조직의 연도 범위에 따라 연도 목록 생성
    const years = selectedOrg 
    ? Array.from(
        { length: selectedOrg.end_year - selectedOrg.start_year + 1 }, 
        (_, i) => selectedOrg.start_year + i
        )
    : [];

    const onOrganizationChange = (id: string) => {
        setSelectedOrgId(Number(id));
    }

    const onYearChange = (year: string) => {
        setSelectedYear(Number(year));
    }

    return (
    <Card>
        <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full space-y-2">
            <Label htmlFor="organization">조직</Label>
            <Select value={selectedOrgId?.toString()} onValueChange={onOrganizationChange}>
                <SelectTrigger id="organization">
                <SelectValue placeholder="조직을 선택해주세요"/>
                </SelectTrigger>
                <SelectContent>
                {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id.toString()}>
                    {org.name}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
            </div>

            <div className="flex-1 w-full space-y-2">
            <Label htmlFor="year">연도</Label>
            <Select value={selectedYear?.toString()} onValueChange={onYearChange}>
                <SelectTrigger id="year" disabled={!selectedOrgId}>
                <SelectValue placeholder="연도를 선택해주세요"/>
                </SelectTrigger>
                <SelectContent>
                {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                    {year}년
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
            </div>
        </div>
        </CardContent>
    </Card>
    );
}