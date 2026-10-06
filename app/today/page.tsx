"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardPage from "@/app/dashboard/page";

export default function TodayRedirect() {
  return <DashboardPage />;
}
