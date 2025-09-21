import type { NextRequest } from "next/server";
import { handleFlowStream } from "@/app/api/flow/_controllers/stream";

export async function POST(request: NextRequest) {
  return handleFlowStream(request);
}
