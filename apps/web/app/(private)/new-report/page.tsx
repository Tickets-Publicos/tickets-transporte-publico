"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { NewReportForm } from "@/components/reports/new-report-form";
import { useAuth } from "@/hooks/use-auth";

export default function NewReportPage() {
  const user = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return <NewReportForm user={user} />;
}
