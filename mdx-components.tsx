import Link from "next/link";
import type { MDXComponents } from "mdx/types";
import EditorialMediaFrame from "@/components/beyond-terminal/EditorialMediaFrame";
import PullQuote from "@/components/beyond-terminal/PullQuote";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: ({ href = "", ...props }) => {
      if (href.startsWith("/") || href.startsWith("#")) {
        return <Link href={href} {...props} />;
      }

      return <a href={href} target="_blank" rel="noreferrer" {...props} />;
    },
    EditorialMediaFrame,
    PullQuote,
    ...components,
  };
}
