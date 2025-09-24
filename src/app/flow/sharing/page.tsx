import { auth } from "@/features/auth/lib/auth";
import { WorkflowSharingPageContent } from "@/features/flow/components/sharing/business/workflow-sharing-page-content";
import type { ShareableWorkflowOption } from "@/features/flow/components/sharing/form/workflow-share-form";
import { listSharedWorkflows } from "@/features/flow/services/workflow-sharing-service";
import { listWorkflows } from "@/app/api/flow/workflows/_controllers/workflows";

export default async function WorkflowSharingPage() {
  const session = await auth();
  const viewerId = session?.user?.id ?? null;

  const [shares, workflows] = await Promise.all([
    listSharedWorkflows(viewerId ?? undefined),
    viewerId
      ? listWorkflows({ userId: viewerId, ownedOnly: true })
      : Promise.resolve([]),
  ]);

  const shareableWorkflows: ShareableWorkflowOption[] = workflows.map(
    (workflow) => ({
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
    }),
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 py-10">
      <WorkflowSharingPageContent
        initialShares={shares}
        viewerId={viewerId}
        shareableWorkflows={shareableWorkflows}
      />
    </div>
  );
}

