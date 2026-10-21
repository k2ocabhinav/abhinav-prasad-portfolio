import { getProjectMarkdownResponse } from "@/lib/projectMarkdown";

export const dynamic = "force-static";

export function GET() {
  return getProjectMarkdownResponse("portfolio-platform");
}
