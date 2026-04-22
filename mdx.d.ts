declare module "*.mdx" {
  import type { ComponentType } from "react";
  import type { BeyondPostMeta } from "@/types";

  export const metadata: BeyondPostMeta;
  const MDXComponent: ComponentType<Record<string, unknown>>;
  export default MDXComponent;
}
