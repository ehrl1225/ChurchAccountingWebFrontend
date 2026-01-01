"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/lib/api/auth_context";
import { Building2, Calendar, FolderTree, LogOut, Menu, PieChart, Table } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type Page = '/auth/login' | '/auth/register' | '/ledger/total' | '/ledger/summary' | '/category' | '/event' | '/organization';

export function Navigation({currentPage}:{"currentPage":Page}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const {logout} = useAuth();

  const navigationItems = [
    { id: '/ledger/total', icon: Table, label: '전체 목록' },
    { id: '/ledger/summary', icon: PieChart, label: '수입/지출 요약' },
    { id: '/category', icon: FolderTree, label: '관/항목 관리' },
    { id: '/event', icon: Calendar, label: '행사 관리' },
    { id: '/organization', icon: Building2, label: '조직 관리' },
  ] as const;

  const handleNavigate = (page: Page) => {
    router.push(page);
    setMobileMenuOpen(false);
  };

  const onNavigate = (page:Page) => {
    router.push(page);
  }
  const pendingInvitationsCount = 0;

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 flex-1">
            <h1 className="text-xl text-gray-900">회계 관리 시스템</h1>
            
            <div className="flex space-x-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentPage === item.id ? 'default' : 'ghost'}
                    onClick={() => onNavigate(item.id as Page)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                    {item.id === '/organization' && pendingInvitationsCount > 0 && (
                      <Badge className="ml-2" variant="outline">
                        {pendingInvitationsCount}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center space-x-2 flex-1">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px]">
                <SheetHeader>
                  <SheetTitle>메뉴</SheetTitle>
                  <SheetDescription>
                    원하는 페이지를 선택하세요
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col space-y-4 mt-4">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.id}
                        variant={currentPage === item.id ? 'default' : 'ghost'}
                        onClick={() => handleNavigate(item.id as Page)}
                        className="w-full justify-start gap-3"
                      >
                        <Icon className="w-5 h-5" />
                        {item.label}
                        {item.id === '/organization' && pendingInvitationsCount > 0 && (
                          <Badge className="ml-auto" variant="outline">
                            {pendingInvitationsCount}
                          </Badge>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
            <h1 className="text-lg">회계 관리</h1>
          </div>
          
          <Button
            variant="ghost"
            onClick={logout}
            className="flex items-center gap-2"
            size="sm"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">로그아웃</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}