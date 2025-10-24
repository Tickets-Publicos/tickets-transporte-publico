"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { NewReportForm } from "@/components/reports/new-report-form";
import { useAuth } from "@/hooks/use-auth";

export default function NewReportPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  if (!user) {
    return null;
  }

  return <NewReportForm user={user} />;
}
