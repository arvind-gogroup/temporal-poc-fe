import type { Metadata } from "next";
import { WorkflowDetailCard } from "@/components/dashboard/workflow-detail-card";

export const metadata: Metadata = {
  title: "Workflow Detail — Employee Review",
};

export default async function WorkflowDetailPage({
  params,
}: {
  params: Promise<{ workflowId: string }>;
}) {
  const { workflowId } = await params;
  return (
    <main className="container mx-auto px-4 py-8">
      <WorkflowDetailCard workflowId={workflowId} />
    </main>
  );
}
