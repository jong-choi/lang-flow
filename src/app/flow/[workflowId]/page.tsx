import { notFound } from "next/navigation";
import { getWorkflowById } from "@/app/api/flow/workflows/_controllers/workflows";
import { FlowBuilderScreen } from "@/features/flow/components/flow-builder-screen";
import { FlowGeneratorStoreProvider } from "@/features/flow/providers/flow-store-provider";
import {
  mapRowToSchemaEdge,
  mapRowToSchemaNode,
} from "@/features/flow/utils/workflow-transformers";

interface FlowPageParams {
  params: Promise<{
    workflowId: string;
  }>;
}

export default async function FlowPage({ params }: FlowPageParams) {
  const workflow = await getWorkflowById((await params).workflowId);

  if (!workflow) {
    notFound();
  }

  const initialNodes = (workflow.nodes ?? []).map(mapRowToSchemaNode);
  const initialEdges = (workflow.edges ?? []).map(mapRowToSchemaEdge);

  return (
    <FlowGeneratorStoreProvider
      initialState={{ workflowName: workflow.name ?? "untitled" }}
    >
      <FlowBuilderScreen
        initialNodes={initialNodes}
        initialEdges={initialEdges}
      />
    </FlowGeneratorStoreProvider>
  );
}
