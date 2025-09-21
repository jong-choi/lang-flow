import { NextRequest } from "next/server";
import { handleDelete } from "@/app/api/chat/_controllers/delete";
import { handleSend } from "@/app/api/chat/_controllers/send";
import { handleStream } from "@/app/api/chat/_controllers/stream";
import { handleUpdate } from "@/app/api/chat/_controllers/update";

type Params = {
  params: Promise<{
    sessionId: string;
  }>;
};

export async function POST(request: NextRequest, { params }: Params) {
  const { sessionId } = await params;

  return handleSend(request, sessionId);
}

export async function GET(request: NextRequest, { params }: Params) {
  const { sessionId } = await params;

  return handleStream(request, sessionId);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { sessionId } = await params;

  return handleUpdate(request, sessionId);
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { sessionId } = await params;

  return handleDelete(request, sessionId);
}
