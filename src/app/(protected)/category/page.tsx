"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TxType } from "@/lib/api/common_enum";
import { useCategory } from "@/lib/api/hook/category_hook";
import { useItem } from "@/lib/api/hook/item_hook";
import { useOrganizations } from "@/lib/api/organization_context";
import { EditAllCategoryDto } from "@/lib/api/request/category_request";
import { CategoryResponseDto } from "@/lib/api/response/category_response";
import { Check, Pencil, Plus, Trash2, TrendingDown, TrendingUp, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AddCategoryDialog } from "./_component/add_category_dialog";
import { ImportCategoryDialog } from "./_component/import_category_dialog";
import { CategoryTabContent } from "./_component/category_tab_content";

export default function CategoryPage() {
  const [currentCategoryType, setCurrentCategoryType] = useState<TxType>("OUTCOME");
  const [categories, setCategories] = useState<CategoryResponseDto[]>([]);
  const {organizations, selectedOrgId, selectedYear} = useOrganizations();
  const {get_categories, update_all_category} = useCategory();

  const selectedOrg = organizations.find(org => org.id === selectedOrgId);
  const availableOrganizations = organizations

  // 일괄 편집 모드 상태
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableCategories, setEditableCategories] = useState<EditAllCategoryDto[]>([]);

  const fetchCategories = async (tx_type:TxType | null) => {
    if (selectedOrgId === null){
      return;
    }
    if (selectedYear === null) {
      return;
    }
    const data = await get_categories({
      organization_id:selectedOrgId,
      year:selectedYear,
      tx_type:tx_type
    });
    setCategories(data);
  }

  useEffect(()=>{
    fetchCategories(null);
  },[selectedOrgId, selectedYear])


  const hasWritePermission = () => {
    if (selectedOrg){
      return selectedOrg.my_role === "READ_WRITE" || selectedOrg.my_role === "ADMIN" || selectedOrg.my_role === "OWNER"
    }
    return false;
  };

  const canEdit = hasWritePermission();



  // 현재 탭의 카테고리만 필터링
  const filteredCategoriesByType = (type: TxType) => {
    if (isEditMode) {
      return editableCategories.filter(c => c.tx_type === type && !c.deleted);
    }
    return categories.filter(c => c.tx_type === type);
  };


  // 편집 모드 시작
  const startEditMode = () => {
    setEditableCategories(categories.map(cat => ({
      id:cat.id,
      name:cat.name,
      tx_type:cat.tx_type,
      items:cat.items.map(item => ({
        category_id: cat.id,
        id:item.id,
        name:item.name,
        deleted:false
      })),
      deleted:false,
    })));
    setIsEditMode(true);
  };

  // 편집 모드 취소
  const cancelEditMode = () => {
    setEditableCategories([]);
    setIsEditMode(false);
  };

  const onUpdateCategories = async () => {
    if (selectedOrgId === null){
      return;
    }
    if (selectedYear === null){
      return;
    }
    await update_all_category({
      organization_id:selectedOrgId,
      year:selectedYear,
      categories:editableCategories
    })
    await fetchCategories(currentCategoryType);
  };

  // 편집 내용 적용
  const applyChanges = () => {
    onUpdateCategories();
    setIsEditMode(false);
    setEditableCategories([]);
  };


  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <CardTitle>관/항목 관리</CardTitle>
            <CardDescription>회계 카테고리를 수입/지출별로 관리하세요</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            {canEdit && !isEditMode && (
              <>
                <AddCategoryDialog fetchCategories={()=>fetchCategories(null)} categories={categories}/>
                {availableOrganizations.length > 0 && (
                  <ImportCategoryDialog fetchCategories={()=>fetchCategories(null)}/>
                )}
                <Button variant="outline" onClick={startEditMode} className="w-full sm:w-auto">
                  <Pencil className="w-4 h-4 mr-2" />
                  일괄 편집
                </Button>
              </>
            )}
            {isEditMode && (
              <>
                <Button variant="outline" onClick={cancelEditMode} className="w-full sm:w-auto">
                  <X className="w-4 h-4 mr-2" />
                  취소
                </Button>
                <Button onClick={applyChanges} className="w-full sm:w-auto">
                  <Check className="w-4 h-4 mr-2" />
                  적용
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="OUTCOME" className="w-full" onValueChange={e=>setCurrentCategoryType(e as TxType)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="OUTCOME" className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              지출
            </TabsTrigger>
            <TabsTrigger value="INCOME" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              수입
            </TabsTrigger>
          </TabsList>

          <CategoryTabContent 
          tx_type="OUTCOME"
          isEditMode={isEditMode}
          editableCategories={editableCategories}
          setEditableCategories={setEditableCategories}
          filteredCategoriesByType={filteredCategoriesByType}
          fetchCategories={()=>fetchCategories(null)}
          />

          <CategoryTabContent
          tx_type="INCOME"
          isEditMode={isEditMode}
          editableCategories={editableCategories}
          setEditableCategories={setEditableCategories}
          filteredCategoriesByType={filteredCategoriesByType}
          fetchCategories={()=>fetchCategories(null)}
          />
        </Tabs>
      </CardContent>
    </Card>
  );
}