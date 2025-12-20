"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export default function page(){
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
    const handleSubmit = () => {};
    const onSwitchToRegister = () => {};

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>로그인</CardTitle>
          <CardDescription>회계 관리 시스템에 로그인하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <Button type="submit" className="w-full">
              로그인
            </Button>
            
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={onSwitchToRegister}
              >
                계정이 없으신가요? 회원가입
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}