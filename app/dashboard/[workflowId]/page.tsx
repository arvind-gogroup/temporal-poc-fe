import type { Metadata } from "next";
import { WorkflowDetailCard } from "@/components/dashboard/workflow-detail-card";

export const metadata: Metadata = {
  title: "Workflow Detail — ReviewFlow",
};

export default async function WorkflowDetailPage({
  params,
}: {
  params: Promise<{ workflowId: string }>;
}) {
  const { workflowId } = await params;
  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <WorkflowDetailCard workflowId={workflowId} />
    </main>
  );
}
