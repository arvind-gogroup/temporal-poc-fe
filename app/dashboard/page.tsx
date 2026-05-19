import type { Metadata } from "next";
import { WorkflowTable } from "@/components/dashboard/workflow-table";

export const metadata: Metadata = {
  title: "Dashboard — ReviewFlow",
};

export default function DashboardPage() {
  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <WorkflowTable />
    </main>
  );
}
