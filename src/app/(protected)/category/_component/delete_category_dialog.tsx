"use client"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";

interface DeleteCategoryDialogInput{
    dialogOpen: boolean;
    setDialogOpen: (state:boolean) => void
}

export function DeleteCategoryDialog({dialogOpen, setDialogOpen}:DeleteCategoryDialogInput){

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>연관된 영수증</DialogTitle>
                    <DialogDescription>
                        해당 카테고리는 삭제
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
            <div className="flex flex-col">
                

            </div>
        </Dialog>
    )
}