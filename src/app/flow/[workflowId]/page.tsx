import { notFound } from "next/navigation";
import {
  getWorkflowAccess,
  getWorkflowById,
} from "@/app/api/flow/workflows/_controllers/workflows";
import { FlowBuilderScreen } from "@/features/flow/components/flow-builder-screen";
import { FlowGeneratorStoreProvider } from "@/features/flow/providers/flow-store-provider";
import {
  mapRowToSchemaEdge,
  mapRowToSchemaNode,
} from "@/features/flow/utils/workflow-transformers";
import { auth } from "@/features/auth/lib/auth";

interface FlowPageParams {
  params: Promise<{
    workflowId: string;
  }>;
}

export default async function FlowPage({ params }: FlowPageParams) {
  const session = await auth();
  const sessionUserId = session?.user?.id ?? null;

  if (!sessionUserId) {
    notFound();
  }

  const { workflowId } = await params;
  const access = await getWorkflowAccess(workflowId, sessionUserId);

  if (!access || (!access.isOwner && !access.isLicensed)) {
    notFound();
  }

  const workflow = await getWorkflowById(workflowId);

  if (!workflow) {
    notFound();
  }

  const initialNodes = (workflow.nodes ?? []).map(mapRowToSchemaNode);
  const initialEdges = (workflow.edges ?? []).map(mapRowToSchemaEdge);

  return (
    <FlowGeneratorStoreProvider
      initialState={{
        workflowName: workflow.name ?? "untitled",
        initialNodes: initialNodes,
        initialEdges: initialEdges,
      }}
    >
      <FlowBuilderScreen />
    </FlowGeneratorStoreProvider>
  );
}
