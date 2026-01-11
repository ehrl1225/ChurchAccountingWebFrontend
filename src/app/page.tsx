'use client'

import { useAuth } from "@/lib/api/auth_context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push("/ledger/total");
      } else {
        router.push("/auth/login");
      }
    }
  }, [isLoading, isAuthenticated, router]);

  return <></>;
}