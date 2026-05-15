import type { Metadata } from "next";
import { WorkflowTable } from "@/components/dashboard/workflow-table";

export const metadata: Metadata = {
  title: "Dashboard — Employee Review Workflows",
};

export default function DashboardPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <WorkflowTable />
    </main>
  );
}
