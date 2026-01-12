"use clinet"
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TxType } from "@/lib/api/common_enum";
import { useCategory } from "@/lib/api/hook/category_hook";
import { useItem } from "@/lib/api/hook/item_hook";
import { useOrganization } from "@/lib/api/hook/organization_hook";
import { useOrganizations } from "@/lib/api/organization_context";
import { CategoryResponseDto } from "@/lib/api/response/category_response";
import { Plus, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";

export interface addCategoryInput{
    fetchCategories : () => Promise<void>,
    categories: CategoryResponseDto[]
};

export function AddCategoryDialog({fetchCategories, categories}:addCategoryInput){
    const [dialogOpen, setDialogOpen] = useState(false);
    const [categoryType, setCategoryType] = useState<TxType>("OUTCOME");
    const [primaryCategory, setPrimaryCategory] = useState('');
    const [secondaryCategory, setSecondaryCategory] = useState('');
    const [isNewPrimary, setIsNewPrimary] = useState(true);

    const {selectedOrgId, selectedYear} = useOrganizations();
    const {create_category} = useCategory();
    const {create_item} = useItem();

    const getExistingPrimaryCategories = () => {
        return categories.filter(c => c.tx_type === categoryType)
    }
    
    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (selectedOrgId === null){
            return;
        }
        if (selectedYear === null){
            return
        }
        if (isNewPrimary){
            if (primaryCategory === ""){
                return;
            }
            await create_category({
                organization_id:selectedOrgId,
                year:selectedYear,
                tx_type:categoryType,
                category_name:primaryCategory,
                item_name:secondaryCategory,
            })
        }else{
            // 여기에서 primaryCategory에는 category id 값을 가짐
            const category_id = Number(primaryCategory);
            await create_item({
                organization_id:selectedOrgId,
                year:selectedYear,
                category_id,
                item_name:secondaryCategory
            })
        }

        setPrimaryCategory('');
        setSecondaryCategory('');
        setDialogOpen(false);
        await fetchCategories();
    }

    return (
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
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>카테고리 타입</Label>
                        <div className="grid grid-cols-2 gap-2">
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
    )
}