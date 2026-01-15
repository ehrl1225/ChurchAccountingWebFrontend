"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useEvent } from "@/lib/api/hook/event_hook";
import { useOrganizations } from "@/lib/api/organization_context";
import { EventResponseDTO } from "@/lib/api/response/event_response";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function EventPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventResponseDTO | null>(null);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [description, setDescription] = useState('');
  const {selectedOrgId, selectedYear, organizations} = useOrganizations();
  const [events, setEvents] = useState<EventResponseDTO[]>([]);

  const {get_event, create_event, update_event, delete_event} = useEvent();
  const currentOrganization = organizations.find(org => org.id === selectedOrgId);

  const fetchEvents = async () => {
    if (selectedOrgId === null){
      return;
    }
    if (selectedYear === null) {
      return;
    }
    const data = await get_event({
      organization_id: selectedOrgId,
      year:selectedYear,
    });
    setEvents(data);
  }

  useEffect(()=>{
    fetchEvents();
  },[selectedOrgId, selectedYear])

  const resetForm = () => {
    setName('');
    setStartDate("");
    setEndDate("");
    setDescription('');
    setEditingEvent(null);
  };

  const handleOpenDialog = (event?: EventResponseDTO) => {

    if (event) {
      setEditingEvent(event);
      setName(event.name);
      setStartDate(event.start_date);
      setEndDate(event.end_date);
      setDescription(event.description?event.description:"");
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const eventData = {
      name,
      start_date:new Date(startDate),
      end_date:new Date(endDate),
      description,
    };
    if (selectedOrgId === null){
      return;
    }
    if (selectedYear===null){
      return;
    }
    if (editingEvent) {
      await update_event({
        ...eventData,
        event_id:editingEvent.id,
        organization_id:selectedOrgId,
        event_name:name,
      });
    } else {
      await create_event({
        ...eventData,
        organization_id:selectedOrgId,
        year:selectedYear
      })
    }
    setDialogOpen(false);
    resetForm();
    await fetchEvents();
  };

  const hasWritePermission = () => {
    if (!currentOrganization) return false;
    return currentOrganization.my_role === "READ_WRITE" || currentOrganization.my_role === "ADMIN" || currentOrganization.my_role === "OWNER";
  };

  const canEdit = hasWritePermission();

  const onDelete = async (id:number) => {
    if (selectedOrgId === null) {
      return;
    }
    await delete_event({
      organization_id:selectedOrgId,
      event_id:id
    });
    await fetchEvents();
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>행사 관리</CardTitle>
            <CardDescription>행사를 추가하고 관리하세요</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                행사 추가
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md">
              <DialogHeader>
                <DialogTitle>{editingEvent ? '행사 수정' : '행사 추가'}</DialogTitle>
                <DialogDescription>
                  {editingEvent ? '행사 정보를 수정하세요' : '새로운 행사를 추가하세요'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="eventName">행사명</Label>
                  <Input
                    id="eventName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="행사 이름을 입력하세요"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">시작일</Label>
                    <Input
                      id="startDate"
                      type="date"
                      max={`${selectedYear}-12-31`}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">종료일</Label>
                    <Input
                      id="endDate"
                      type="date"
                      min={startDate}
                      max={`${selectedYear}-12-31`}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">설명</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="행사 설명"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setDialogOpen(false)}
                  >
                    취소
                  </Button>
                  <Button type="submit">
                    {editingEvent ? '수정' : '추가'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            등록된 행사가 없습니다.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>행사명</TableHead>
                    <TableHead>시작일</TableHead>
                    <TableHead>종료일</TableHead>
                    <TableHead>설명</TableHead>
                    <TableHead>작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>{event.name}</TableCell>
                      <TableCell>{event.start_date}</TableCell>
                      <TableCell>{event.end_date}</TableCell>
                      <TableCell className="max-w-xs truncate">{event.description || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(event)}
                            disabled={!canEdit}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(event.id)}
                            disabled={!canEdit}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {events.map((event) => (
                <Card key={event.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-medium">{event.name}</h3>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(event)}
                          disabled={!canEdit}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(event.id)}
                          disabled={!canEdit}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500">기간:</span>
                        <p>{event.start_date} ~ {event.end_date}</p>
                      </div>
                      {event.description && (
                        <div>
                          <span className="text-gray-500">설명:</span>
                          <p className="text-gray-700">{event.description}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}