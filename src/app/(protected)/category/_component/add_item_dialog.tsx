import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import React, { useState } from "react";

export interface addItemDialogInput{
    addItem: (item:string) => Promise<void>
}

export function AddItemDialog({addItem}:addItemDialogInput){
    const [dialogOpen, setDialogOpen] = useState(false);
    const [item, setItem] = useState('');

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await addItem(item);
        setDialogOpen(false);
        setItem("");
    }

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button 
                variant="outline"
                size="icon"
                >
                    <Plus className="w-4 h-4"/>
                </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md">
                <DialogHeader>
                    <DialogTitle>새 카테고리 추가</DialogTitle>
                    <DialogDescription>
                        항목(2차 카테고리)을 추가하세요.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="item">항목 (2차 카테고리)</Label>
                        <Input
                        id="item"
                        type="text"
                        placeholder="예: 행사비"
                        value={item}
                        onChange={(e)=>setItem(e.target.value)}
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