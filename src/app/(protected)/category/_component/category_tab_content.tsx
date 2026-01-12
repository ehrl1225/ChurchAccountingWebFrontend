"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TabsContent } from "@/components/ui/tabs";
import { TxType } from "@/lib/api/common_enum";
import { useOrganizations } from "@/lib/api/organization_context";
import { EditAllCategoryDto } from "@/lib/api/request/category_request";
import { EditAllItemDto } from "@/lib/api/request/item_request"
import { CategoryResponseDto } from "@/lib/api/response/category_response";
import { Check, Pencil, Plus, Trash2, TrendingDown, X } from "lucide-react";
import { useState } from "react";
import { AddItemDialog } from "./add_item_dialog";
import { useItem } from "@/lib/api/hook/item_hook";
import { useCategory } from "@/lib/api/hook/category_hook";

export interface categoryTabContentInput{
    tx_type:TxType;
    isEditMode:boolean;
    editableCategories:EditAllCategoryDto[];
    setEditableCategories: (categories:EditAllCategoryDto[]) => void;
    filteredCategoriesByType : (tx_type:TxType) => CategoryResponseDto[] | EditAllCategoryDto[];
    fetchCategories: () => Promise<void>;
}

export function CategoryTabContent ({tx_type, isEditMode, editableCategories, setEditableCategories, filteredCategoriesByType, fetchCategories}:categoryTabContentInput) {
    const {organizations, selectedOrgId, selectedYear} = useOrganizations();
    const selectedOrg = organizations.find(org => org.id === selectedOrgId);
    const [editingCategoryId, setEditingCategoryId] = useState<Number|null>();
    const [editingCategoryValue, setEditingCategoryValue] = useState('');
    const [editingSecondaryId, setEditingSecondaryId] = useState<Number|null>(null);
    const [editingSecondaryValue, setEditingSecondaryValue] = useState('');
    const {update_category, delete_category} = useCategory();
    const {create_item, update_item, delete_item} = useItem();

    const txType_to_kor = (tx_type:TxType) => {
        if (tx_type === "INCOME"){
            return "수입";
        }else{
            return "지출"
        }
    }

    const hasWritePermission = () => {
        if (selectedOrg){
            return selectedOrg.my_role === "READ_WRITE" || selectedOrg.my_role === "ADMIN" || selectedOrg.my_role === "OWNER"
        }
        return false;
    }
    const canEdit = hasWritePermission();

    const onAddItem = async (categoryId:number | null, item:string) => {
        if (categoryId === null){
            return
        }
        if (isEditMode){
            setEditableCategories(editableCategories.map( cat => {
                if (cat.id === categoryId){
                    return {
                        ...cat,
                        items: [...cat.items, {
                            category_id:categoryId,
                            id:null,
                            name:item,
                            deleted:false
                        }]
                    }
                }
                return cat
            }
            ))
        }else{
            if (selectedOrgId === null){
                return;
            }
            if (selectedYear === null) {
                return;
            }
            await create_item({
                organization_id:selectedOrgId,
                year:selectedYear,
                category_id:categoryId,
                item_name:item
            });
            await fetchCategories();
        }
    }

    const onEditCategory = async (category_id:number | null, category_name:string) => {
        if (category_id === null ){
            return;
        }
        if (isEditMode){
            setEditableCategories(editableCategories.map( cat => {
                if (cat.id === category_id){
                    return {
                        ...cat,
                        name:category_name,
                    };
                }
                return cat;
            }))
        }else {
            if (selectedOrgId === null){
                return;
            }
            await update_category({
                organization_id:selectedOrgId,
                category_id,
                category_name
            })
            await fetchCategories();
        }
    }

    const onEditItem = async (category_id:number|null, item_id:number | null, item_name:string) => {
        if (category_id === null){
            return;
        }
        if( item_id === null){
            return;
        }
        if (isEditMode) {
            setEditableCategories(editableCategories.map(cat => {
                if (cat.id === category_id){
                    return {
                        ...cat,
                        items: cat.items.map(it => {
                            if (it.id === item_id){
                                return {
                                    ...it,
                                    name:item_name
                                }
                            }
                            return it
                        })
                    }
                }
                return cat;
            }))
        }else{
            if (selectedOrgId === null){
                return;
            }
            await update_item({
                organization_id:selectedOrgId,
                category_id,
                item_id,
                item_name,
            });
            await fetchCategories();

        }

    }

    const onDeleteCategory = async (category_id:number | null) => {
        if (category_id === null){
            return;
        }
        if (isEditMode) {
            setEditableCategories(editableCategories.map(cat => {
                if (cat.id === category_id){
                    return {
                        ...cat,
                        deleted:true,
                    }
                }
                return cat
            }))
        }else {
            if (selectedOrgId === null){
                return;
            }
            await delete_category({
                organization_id:selectedOrgId,
                category_id,
            })
            await fetchCategories();
        }

    }

    const onDeleteItem = async (category_id:number| null, item_id:number| null) => {
        if (category_id === null){
            return;
        }
        if (item_id === null){
            return;
        }
        if (isEditMode) {
            setEditableCategories(editableCategories.map(cat => {
                if (cat.id === category_id){
                    return {
                        ...cat,
                        items:cat.items.map(it => {
                            if (it.id === item_id){
                                return {
                                    ...it,
                                    deleted:true
                                }
                            }
                            return it
                        })
                    }
                }
                return cat
            }))
        }else {
            if (selectedOrgId === null){
                return;
            }
            await delete_item({
                organization_id:selectedOrgId,
                category_id,
                item_id,
            });
            await fetchCategories();
        }

    }

    const startEditingCategory = (categoryId:Number | null, categoryName: string) => {
        setEditingCategoryId(categoryId);
        setEditingCategoryValue(categoryName);
    }

    const cancelEditingCategory = () => {
        setEditingCategoryId(null);
        setEditingCategoryValue('');
    }

    const startEditingSecondary = (itemId:Number|null, itemName:string) => {
        setEditingSecondaryId(itemId);
        setEditingSecondaryValue(itemName);
    }

    const cancelEditingSecondary = () => {
        setEditingSecondaryId(null);
        setEditingSecondaryValue('');
    }

    return (
        <TabsContent value={tx_type} className="space-y-4 mt-4">
            {filteredCategoriesByType(tx_type).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
                등록된 {txType_to_kor(tx_type)} 카테고리가 없습니다.
            </div>
        ) : (
            <div className="space-y-4">
            {filteredCategoriesByType(tx_type).map((category) => {
                const isEditingCategory = editingCategoryId === category.id;
                return(
                <Card key={category.id}>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-lg">
                                    {isEditingCategory ? (
                                    <div className="flex items-center gap-1">
                                        <Input 
                                        value={editingCategoryValue}
                                        onChange={(e)=>setEditingCategoryValue(e.target.value)}
                                        className="h-8 w-32"
                                        autoFocus
                                        onKeyDown={(e)=>{
                                            if (e.key === 'Enter'){
                                                onEditCategory(category.id, editingCategoryValue);
                                            }else if (e.key === 'Escape'){
                                                cancelEditingCategory();
                                            }
                                        }}
                                        />
                                        <Button
                                        size='icon'
                                        variant="ghost"
                                        className="h-8 w-8"
                                        onClick={() => {}}
                                        >
                                            <Check className="w-3 h-3"/>
                                        </Button>
                                        <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8"
                                        onClick={() => {}}
                                        >
                                            <X/>
                                        </Button>
                                    </div>
                                    )
                                    : category.name}
                                </CardTitle>
                                <Badge variant="destructive" className="flex items-center gap-1">
                                    <TrendingDown className="w-3 h-3" />
                                    {txType_to_kor(tx_type)}
                                </Badge>
                            </div>
                            {canEdit && <div className="flex flex-col sm:flex-row gap-2">
                                <AddItemDialog addItem={(item_value:string) =>onAddItem(category.id, item_value)}/>
                                <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {startEditingCategory(category.id, category.name)}}
                                >
                                    <Pencil className="w-4 h-4"/>
                                </Button>
                                <Button
                                variant="outline"
                                size="icon"
                                onClick={() => onDeleteCategory(category.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                                
                            </div>}
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
                                            onEditItem(category.id, secondary.id, secondary.name)
                                        } else if (e.key === 'Escape') {
                                            cancelEditingSecondary();
                                        }
                                    }}
                                    />
                                    <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
                                    onClick={() => onEditItem(category.id, secondary.id, secondary.name)}
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
                                        onClick={() => onDeleteItem(category.id, secondary.id)}
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
            )})}
            </div>
        )}
        </TabsContent>
    )
}