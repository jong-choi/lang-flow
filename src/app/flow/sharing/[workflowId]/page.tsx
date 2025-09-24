import { notFound } from "next/navigation";
import { auth } from "@/features/auth/lib/auth";
import { WorkflowShareDetailContent } from "@/features/flow/components/sharing/business/workflow-share-detail-content";
import { getWorkflowShareDetail } from "@/features/flow/services/workflow-sharing-service";

interface WorkflowShareDetailPageProps {
  params: { workflowId: string };
}

export default async function WorkflowShareDetailPage({
  params,
}: WorkflowShareDetailPageProps) {
  const session = await auth();
  const viewerId = session?.user?.id ?? null;

  const detail = await getWorkflowShareDetail(
    params.workflowId,
    viewerId ?? undefined,
  );
  if (!detail) notFound();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 py-10">
      <WorkflowShareDetailContent share={detail} viewerId={viewerId} />
    </div>
  );
}

