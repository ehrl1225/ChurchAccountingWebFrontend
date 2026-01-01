"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCategory } from "@/lib/api/hook/category_hook";
import { useItem } from "@/lib/api/hook/item_hook";
import { useJoinedOrganization } from "@/lib/api/hook/joined_organization_hook";
import { useOrganizations } from "@/lib/api/organization_context";
import { Check, Pencil, Plus, Trash2, TrendingDown, TrendingUp, X } from "lucide-react";
import { useState } from "react";

export default function CategoryPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [categoryType, setCategoryType] = useState<'income' | 'expense'>('expense');
  const [primaryCategory, setPrimaryCategory] = useState('');
  const [secondaryCategory, setSecondaryCategory] = useState('');
  const [isNewPrimary, setIsNewPrimary] = useState(true);
  const [importSourceOrgId, setImportSourceOrgId] = useState('');
  const [importSourceYear, setImportSourceYear] = useState('');
  const {} = useOrganizations();
  const {} = useJoinedOrganization();
  const {} = useCategory();
  const {} = useItem();
  
  // 일괄 편집 모드 상태
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableCategories, setEditableCategories] = useState<EditableCategory[]>([]);
  const [editingSecondaryId, setEditingSecondaryId] = useState<string | null>(null);
  const [editingSecondaryValue, setEditingSecondaryValue] = useState('');

  const onAddCategory = (a:string,b:string,c:string) => {}


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (primaryCategory && secondaryCategory) {
      onAddCategory(categoryType, primaryCategory, secondaryCategory);
      setPrimaryCategory('');
      setSecondaryCategory('');
      setDialogOpen(false);
    }
  };

  const hasWritePermission = () => {
    if (!currentOrganization) return false;
    const member = currentOrganization.members.find(m => m.userId === currentUserId);
    return member?.permission === 'write' || member?.permission === 'admin' || member?.permission === 'owner' || currentOrganization.createdBy === currentUserId;
  };

  const canEdit = hasWritePermission();

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (importSourceOrgId && importSourceYear) {
      onImportCategories(importSourceOrgId, Number(importSourceYear));
      setImportDialogOpen(false);
      setImportSourceOrgId('');
      setImportSourceYear('');
    }
  };

  // 불러올 수 있는 조직 목록 가져오기
  const getAvailableOrganizations = () => {
    const orgMap = new Map<string, { id: string; name: string }>();
    
    allCategories.forEach(cat => {
      // 현재 선택된 조직이 아니거나, 같은 조직이지만 다른 연도가 있는 경우
      if (!orgMap.has(cat.organizationId)) {
        const org = allOrganizations.find(o => o.id === cat.organizationId);
        if (org) {
          orgMap.set(cat.organizationId, {
            id: org.id,
            name: org.name,
          });
        }
      }
    });

    return Array.from(orgMap.values());
  };

  // 선택된 조직의 사용 가능한 연도 목록 가져오기
  const getAvailableYears = (orgId: string) => {
    const years = new Set<number>();
    
    allCategories.forEach(cat => {
      if (cat.organizationId === orgId) {
        // 현재 선택된 조직/연도 조합은 제외
        if (cat.organizationId !== selectedOrganizationId || cat.year !== selectedYear) {
          years.add(cat.year);
        }
      }
    });

    return Array.from(years).sort((a, b) => b - a);
  };

  const availableOrganizations = getAvailableOrganizations();
  const availableYears = importSourceOrgId ? getAvailableYears(importSourceOrgId) : [];

  // 현재 탭의 카테고리만 필터링
  const filteredCategoriesByType = (type: 'income' | 'expense') => {
    if (isEditMode) {
      return editableCategories.filter(c => c.type === type && !c.isDeleted);
    }
    return categories.filter(c => c.type === type);
  };

  // 카테고리 타입별로 기존 관 목록 가져오기
  const getExistingPrimaryCategories = () => {
    return categories.filter(c => c.type === categoryType);
  };

  // 편집 모드 시작
  const startEditMode = () => {
    setEditableCategories(categories.map(cat => ({ ...cat })));
    setIsEditMode(true);
  };

  // 편집 모드 취소
  const cancelEditMode = () => {
    setEditableCategories([]);
    setIsEditMode(false);
    setEditingSecondaryId(null);
    setEditingSecondaryValue('');
  };

  // 편집 내용 적용
  const applyChanges = () => {
    if (onUpdateCategories) {
      const updatedCategories = editableCategories.filter(cat => !cat.isDeleted);
      onUpdateCategories(updatedCategories);
    }
    setIsEditMode(false);
    setEditableCategories([]);
    setEditingSecondaryId(null);
    setEditingSecondaryValue('');
  };

  // 항목 추가 (편집 모드)
  const addSecondaryInEditMode = (categoryId: string) => {
    const newSecondary = window.prompt('새 항목 이름을 입력하세요:');
    if (newSecondary && newSecondary.trim()) {
      setEditableCategories(prev => prev.map(cat => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            secondaries: [...cat.secondaries, newSecondary.trim()],
          };
        }
        return cat;
      }));
    }
  };

  // 항목 삭제 (편집 모드)
  const deleteSecondaryInEditMode = (categoryId: string, secondary: string) => {
    setEditableCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          secondaries: cat.secondaries.filter(s => s !== secondary),
        };
      }
      return cat;
    }));
  };

  // 관 삭제 (편집 모드)
  const deleteCategoryInEditMode = (categoryId: string) => {
    setEditableCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return { ...cat, isDeleted: true };
      }
      return cat;
    }));
  };

  // 항목 수정 시작
  const startEditingSecondary = (categoryId: string, secondary: string) => {
    setEditingSecondaryId(`${categoryId}-${secondary}`);
    setEditingSecondaryValue(secondary);
  };

  // 항목 수정 저장
  const saveEditingSecondary = (categoryId: string, oldSecondary: string) => {
    if (editingSecondaryValue.trim() && editingSecondaryValue !== oldSecondary) {
      setEditableCategories(prev => prev.map(cat => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            secondaries: cat.secondaries.map(s => s === oldSecondary ? editingSecondaryValue.trim() : s),
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
                            variant={categoryType === 'income' ? 'default' : 'outline'}
                            onClick={() => {
                              setCategoryType('income');
                              setPrimaryCategory('');
                            }}
                            className="w-full"
                          >
                            <TrendingUp className="w-4 h-4 mr-2" />
                            수입
                          </Button>
                          <Button
                            type="button"
                            variant={categoryType === 'expense' ? 'default' : 'outline'}
                            onClick={() => {
                              setCategoryType('expense');
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
                              <option key={category.id} value={category.primary}>
                                {category.primary}
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
                          required
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
        <Tabs defaultValue="expense" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="expense" className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              지출
            </TabsTrigger>
            <TabsTrigger value="income" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              수입
            </TabsTrigger>
          </TabsList>

          <TabsContent value="expense" className="space-y-4 mt-4">
            {filteredCategoriesByType('expense').length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                등록된 지출 카테고리가 없습니다.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCategoriesByType('expense').map((category) => (
                  <Card key={category.id}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{category.primary}</CardTitle>
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
                              onClick={() => addSecondaryInEditMode(category.id)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          )}
                          {(canEdit && !isEditMode) || isEditMode ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => isEditMode ? deleteCategoryInEditMode(category.id) : onDeleteCategory(category.primary)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {category.secondaries.map((secondary) => {
                          const editId = `${category.id}-${secondary}`;
                          const isEditing = editingSecondaryId === editId;
                          
                          return (
                            <div key={secondary} className="flex items-center gap-1">
                              {isEditing ? (
                                <div className="flex items-center gap-1">
                                  <Input
                                    value={editingSecondaryValue}
                                    onChange={(e) => setEditingSecondaryValue(e.target.value)}
                                    className="h-8 w-32"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        saveEditingSecondary(category.id, secondary);
                                      } else if (e.key === 'Escape') {
                                        cancelEditingSecondary();
                                      }
                                    }}
                                  />
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
                                    onClick={() => saveEditingSecondary(category.id, secondary)}
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
                                  {secondary}
                                  {isEditMode && (
                                    <>
                                      <button
                                        onClick={() => startEditingSecondary(category.id, secondary)}
                                        className="ml-1 hover:text-blue-600"
                                      >
                                        <Pencil className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => deleteSecondaryInEditMode(category.id, secondary)}
                                        className="hover:text-red-600"
                                      >
                                        ×
                                      </button>
                                    </>
                                  )}
                                  {canEdit && !isEditMode && (
                                    <button
                                      onClick={() => onDeleteCategory(category.primary, secondary)}
                                      className="ml-1 hover:text-red-600"
                                    >
                                      ×
                                    </button>
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

          <TabsContent value="income" className="space-y-4 mt-4">
            {filteredCategoriesByType('income').length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                등록된 수입 카테고리가 없습니다.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCategoriesByType('income').map((category) => (
                  <Card key={category.id}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{category.primary}</CardTitle>
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
                              onClick={() => isEditMode ? deleteCategoryInEditMode(category.id) : onDeleteCategory(category.primary)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {category.secondaries.map((secondary) => {
                          const editId = `${category.id}-${secondary}`;
                          const isEditing = editingSecondaryId === editId;
                          
                          return (
                            <div key={secondary} className="flex items-center gap-1">
                              {isEditing ? (
                                <div className="flex items-center gap-1">
                                  <Input
                                    value={editingSecondaryValue}
                                    onChange={(e) => setEditingSecondaryValue(e.target.value)}
                                    className="h-8 w-32"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        saveEditingSecondary(category.id, secondary);
                                      } else if (e.key === 'Escape') {
                                        cancelEditingSecondary();
                                      }
                                    }}
                                  />
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
                                    onClick={() => saveEditingSecondary(category.id, secondary)}
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
                                  {secondary}
                                  {isEditMode && (
                                    <>
                                      <button
                                        onClick={() => startEditingSecondary(category.id, secondary)}
                                        className="ml-1 hover:text-blue-600"
                                      >
                                        <Pencil className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => deleteSecondaryInEditMode(category.id, secondary)}
                                        className="hover:text-red-600"
                                      >
                                        ×
                                      </button>
                                    </>
                                  )}
                                  {canEdit && !isEditMode && (
                                    <button
                                      onClick={() => onDeleteCategory(category.primary, secondary)}
                                      className="ml-1 hover:text-red-600"
                                    >
                                      ×
                                    </button>
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