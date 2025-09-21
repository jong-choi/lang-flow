import { handleConnect } from "@/app/api/chat/_controllers/connect";

export async function POST() {
  return handleConnect();
}
