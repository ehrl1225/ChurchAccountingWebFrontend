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

export default function CategoryPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [categoryType, setCategoryType] = useState<TxType>("OUTCOME");
  const [currentCategoryType, setCurrentCategoryType] = useState<TxType>("OUTCOME");
  const [primaryCategory, setPrimaryCategory] = useState('');
  const [secondaryCategory, setSecondaryCategory] = useState('');
  const [isNewPrimary, setIsNewPrimary] = useState(true);
  const [importSourceOrgId, setImportSourceOrgId] = useState('');
  const [importSourceYear, setImportSourceYear] = useState('');
  const [categories, setCategories] = useState<CategoryResponseDto[]>([]);
  const {organizations, selectedOrgId, selectedYear} = useOrganizations();
  const {get_categories, import_category, update_all_category, create_category, delete_category} = useCategory();
  const {create_item, delete_item} = useItem();

  const selectedOrg = organizations.find(org => org.id === selectedOrgId);
  const importOrg = organizations.find(org => org.id.toString() === importSourceOrgId);
  const availableOrganizations = organizations
  
  
  // 선택된 조직의 연도 범위에 따라 연도 목록 생성
  const availableYears = importOrg && selectedOrg
  ? Array.from(
      { length: importOrg.end_year - importOrg.start_year + 1 }, 
      (_, i) => importOrg.start_year + i
      ).filter(e=>e!==selectedYear || importOrg.id !== selectedOrg.id)
  : [];
  
  
  // 일괄 편집 모드 상태
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableCategories, setEditableCategories] = useState<EditAllCategoryDto[]>([]);
  const [editingSecondaryId, setEditingSecondaryId] = useState<Number | null>(null);
  const [editingSecondaryValue, setEditingSecondaryValue] = useState('');

  const fetchCategories = async (tx_type:TxType) => {
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
    fetchCategories(currentCategoryType);
  },[selectedOrgId, selectedYear, currentCategoryType])

  const onAddCategory = async (tx_type:TxType, category:string,item:string) => {
    if (selectedOrgId === null){
      return;
    }
    if (selectedYear === null) {
      return;
    }
    await create_category({
      category_name:category,
      item_name:item,
      organization_id:selectedOrgId,
      tx_type:tx_type,
      year:selectedYear,
    });
  }

  const onImportCategories = async () => {
    const orgId = Number(importSourceOrgId);
    const year = Number(importSourceYear);
    if (selectedOrgId === null){
      return;
    }
    if (selectedYear === null){
      return;
    }
    await import_category({
      from_organization_id:orgId,
      from_organization_year:year,
      to_organization_id:selectedOrgId,
      to_organization_year:selectedYear,
    });
    await fetchCategories(currentCategoryType);

  }

  const onAddItem = async (category_id:number)=>{
    if (selectedOrgId === null){
      return;
    }
    if (selectedYear === null){
      return;
    }
    await create_item({
      organization_id:selectedOrgId,
      year: selectedYear,
      category_id,
      item_name:secondaryCategory
    })

  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement
    if (isNewPrimary){
      await onAddCategory(categoryType, primaryCategory, secondaryCategory);
    }else{
      const category_id_element = form.elements.namedItem("existingPrimary") as HTMLSelectElement;
      const category_id = Number(category_id_element.value);
      await onAddItem(category_id);

    }
    setPrimaryCategory('');
    setSecondaryCategory('');
    setDialogOpen(false);
    await fetchCategories(currentCategoryType);
  };

  const hasWritePermission = () => {
    if (selectedOrg){
      return selectedOrg.my_role === "READ_WRITE" || selectedOrg.my_role === "ADMIN" || selectedOrg.my_role === "OWNER"
    }
    return false;
  };

  const canEdit = hasWritePermission();

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (importSourceOrgId && importSourceYear) {
      onImportCategories();
      setImportDialogOpen(false);
      setImportSourceOrgId('');
      setImportSourceYear('');
    }
  }


  // 현재 탭의 카테고리만 필터링
  const filteredCategoriesByType = (type: TxType) => {
    if (isEditMode) {
      return editableCategories.filter(c => c.tx_type === type && !c.deleted);
    }
    return categories.filter(c => c.tx_type === type);
  };

  // 카테고리 타입별로 기존 관 목록 가져오기
  const getExistingPrimaryCategories = () => {
    return categories.filter(c => c.tx_type === categoryType);
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
    setEditingSecondaryId(null);
    setEditingSecondaryValue('');
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
    setEditingSecondaryId(null);
    setEditingSecondaryValue('');
  };

  // 항목 추가 (편집 모드)
  const addSecondaryInEditMode = (categoryId: number | null) => {
    const newSecondary = window.prompt('새 항목 이름을 입력하세요:');
    if (newSecondary && newSecondary.trim()) {
      setEditableCategories(prev => prev.map(cat => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            secondaries: [...cat.items, newSecondary.trim()],
          };
        }
        return cat;
      }));
    }
  };

  // 항목 삭제 (편집 모드)
  const deleteSecondaryInEditMode = (categoryId: number | null, secondaryId: number| null) => {
    setEditableCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          secondaries: cat.items.filter(s => s.id !== secondaryId),
        };
      }
      return cat;
    }));
  };

  // 관 삭제 (편집 모드)
  const deleteCategoryInEditMode = (categoryId: number| null) => {
    if (categoryId === null) {
      return;
    }
    setEditableCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return { ...cat, deleted: true };
      }
      return cat;
    }));
  };

  const onDeleteCategory = async (categoryId:number|null) => {
    if (categoryId === null) {
      return;
    }
    if (selectedOrgId === null){
      return;
    }
    await delete_category({
      category_id:categoryId,
      organization_id:selectedOrgId
    })
  }

  const onDeleteItem = async (categoryId:number|null, itemId: number | null) => {
    if (categoryId === null){
      return;
    }
    if (itemId === null){
      return;
    }
    if (selectedOrgId === null){
      return;
    }
    await delete_item({
      category_id:categoryId,
      item_id:itemId,
      organization_id:selectedOrgId
    })
    await fetchCategories(currentCategoryType);

  }

  // 항목 수정 시작
  const startEditingSecondary = (itemId:number | null, itemName: string) => {
    setEditingSecondaryId(itemId);
    setEditingSecondaryValue(itemName);
  };

  // 항목 수정 저장
  const saveEditingSecondary = (categoryId: number|null, oldSecondaryId: Number | null, oldSecondaryName:string) => {
    if (editingSecondaryValue.trim() && editingSecondaryValue !== oldSecondaryName) {
      setEditableCategories(prev => prev.map(cat => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            items: cat.items.map(s => s.id === oldSecondaryId ? {...s, name:editingSecondaryValue.trim()} : s),
          };
        }
        return cat;
      }));
    }
    setEditingSecondaryId(null);
    setEditingSecondaryValue('');
  };

  // 항목 수정 취소
  const cancelEditingSecondary = () => {
    setEditingSecondaryId(null);
    setEditingSecondaryValue('');
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
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto">
                      <Plus className="w-4 h-4 mr-2" />
                      카테고리 추가
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-md">
                    <DialogHeader>
                      <DialogTitle>새 카테고리 추가</DialogTitle>
                      <DialogDescription>
                        관(1차 카테고리)과 항목(2차 카테고리)을 추가하세요
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label>카테고리 타입</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            type="button"
                            variant={categoryType === "INCOME" ? 'default' : 'outline'}
                            onClick={() => {
                              setCategoryType("INCOME");
                              setPrimaryCategory('');
                            }}
                            className="w-full"
                          >
                            <TrendingUp className="w-4 h-4 mr-2" />
                            수입
                          </Button>
                          <Button
                            type="button"
                            variant={categoryType === "OUTCOME" ? 'default' : 'outline'}
                            onClick={() => {
                              setCategoryType("OUTCOME");
                              setPrimaryCategory('');
                            }}
                            className="w-full"
                          >
                            <TrendingDown className="w-4 h-4 mr-2" />
                            지출
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>관 (1차 카테고리) 선택 방식</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            type="button"
                            variant={isNewPrimary ? 'default' : 'outline'}
                            onClick={() => {
                              setIsNewPrimary(true);
                              setPrimaryCategory('');
                            }}
                            className="w-full"
                          >
                            새로 만들기
                          </Button>
                          <Button
                            type="button"
                            variant={!isNewPrimary ? 'default' : 'outline'}
                            onClick={() => {
                              setIsNewPrimary(false);
                              setPrimaryCategory('');
                            }}
                            className="w-full"
                          >
                            기존 관에 추가
                          </Button>
                        </div>
                      </div>

                      {isNewPrimary ? (
                        <div className="space-y-2">
                          <Label htmlFor="newPrimary">새 관 이름</Label>
                          <Input
                            id="newPrimary"
                            type="text"
                            placeholder="예: 사업비"
                            value={primaryCategory}
                            onChange={(e) => setPrimaryCategory(e.target.value)}
                            required
                          />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label htmlFor="existingPrimary">기존 관 선택</Label>
                          <select
                            id="existingPrimary"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            value={primaryCategory}
                            onChange={(e) => setPrimaryCategory(e.target.value)}
                            required
                          >
                            <option value="">선택하세요</option>
                            {getExistingPrimaryCategories().map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="secondary">항목 (2차 카테고리)</Label>
                        <Input
                          id="secondary"
                          type="text"
                          placeholder="예: 행사비"
                          value={secondaryCategory}
                          onChange={(e) => setSecondaryCategory(e.target.value)}
                        />
                      </div>

                      <Button type="submit" className="w-full">
                        추가
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
                {availableOrganizations.length > 0 && (
                  <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
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
                      <form onSubmit={handleImport} className="space-y-4">
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
                            {availableOrganizations.map((org) => (
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

          <TabsContent value="OUTCOME" className="space-y-4 mt-4">
            {filteredCategoriesByType("OUTCOME").length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                등록된 지출 카테고리가 없습니다.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCategoriesByType("OUTCOME").map((category) => (
                  <Card key={category.id}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{category.name}</CardTitle>
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <TrendingDown className="w-3 h-3" />
                            지출
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          {isEditMode && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addSecondaryInEditMode(category.id!)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          )}
                          {(canEdit && !isEditMode) || isEditMode ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => isEditMode ? deleteCategoryInEditMode(category.id) : onDeleteCategory(category.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {category.items.map((secondary) => {
                          const isEditing = editingSecondaryId === secondary.id;
                          
                          return (
                            <div key={secondary.id} className="flex items-center gap-1">
                              {isEditing ? (
                                <div className="flex items-center gap-1">
                                  <Input
                                    value={editingSecondaryValue}
                                    onChange={(e) => setEditingSecondaryValue(e.target.value)}
                                    className="h-8 w-32"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        if (isEditMode){
                                          saveEditingSecondary(category.id, secondary.id, secondary.name);
                                        }
                                      } else if (e.key === 'Escape') {
                                        cancelEditingSecondary();
                                      }
                                    }}
                                  />
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
                                    onClick={() => saveEditingSecondary(category.id, secondary.id, secondary.name)}
                                  >
                                    <Check className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
                                    onClick={cancelEditingSecondary}
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              ) : (
                                <Badge variant="secondary" className="flex items-center gap-2">
                                  {secondary.name}
                                  {canEdit && (
                                    <>
                                      <button
                                        onClick={() => startEditingSecondary(secondary.id, secondary.name)}
                                        className="ml-1 hover:text-blue-600"
                                      >
                                        <Pencil className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => isEditMode ? deleteSecondaryInEditMode(category.id, secondary.id): onDeleteItem(category.id, secondary.id)}
                                        className="hover:text-red-600"
                                      >
                                        ×
                                      </button>
                                    </>
                                  )}
                                </Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="INCOME" className="space-y-4 mt-4">
            {filteredCategoriesByType("INCOME").length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                등록된 수입 카테고리가 없습니다.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCategoriesByType("INCOME").map((category) => (
                  <Card key={category.id}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{category.name}</CardTitle>
                          <Badge className="flex items-center gap-1" style={{ backgroundColor: '#10b981' }}>
                            <TrendingUp className="w-3 h-3" />
                            수입
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          {isEditMode && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addSecondaryInEditMode(category.id)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          )}
                          {(canEdit && !isEditMode) || isEditMode ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => isEditMode ? deleteCategoryInEditMode(category.id) : onDeleteCategory(category.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {category.items.map((secondary) => {
                          const isEditing = editingSecondaryId === secondary.id;
                          
                          return (
                            <div key={secondary.id} className="flex items-center gap-1">
                              {isEditing ? (
                                <div className="flex items-center gap-1">
                                  <Input
                                    value={editingSecondaryValue}
                                    onChange={(e) => setEditingSecondaryValue(e.target.value)}
                                    className="h-8 w-32"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        saveEditingSecondary(category.id, secondary.id, secondary.name);
                                      } else if (e.key === 'Escape') {
                                        cancelEditingSecondary();
                                      }
                                    }}
                                  />
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
                                    onClick={() => saveEditingSecondary(category.id, secondary.id, secondary.name)}
                                  >
                                    <Check className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
                                    onClick={cancelEditingSecondary}
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              ) : (
                                <Badge variant="secondary" className="flex items-center gap-2">
                                  {secondary.name}
                                  {canEdit && (
                                    <>
                                      <button
                                        onClick={() => startEditingSecondary(secondary.id, secondary.name)}
                                        className="ml-1 hover:text-blue-600"
                                      >
                                        <Pencil className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => isEditMode ? deleteSecondaryInEditMode(category.id, secondary.id) : onDeleteItem(category.id, secondary.id)}
                                        className="hover:text-red-600"
                                      >
                                        ×
                                      </button>
                                    </>
                                  )}
                                </Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}