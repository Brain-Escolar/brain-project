"use client";

import { useEffect, useState } from "react";
import { Box, SxProps, Theme } from "@mui/material";

interface RichTextContentProps {
  html: string;
  sx?: SxProps<Theme>;
}

export function RichTextContent({ html, sx }: RichTextContentProps) {
  const [clean, setClean] = useState("");

  useEffect(() => {
    // DOMPurify only runs client-side
    import("dompurify").then(({ default: DOMPurify }) => {
      setClean(
        DOMPurify.sanitize(html, {
          ALLOWED_TAGS: ["p", "strong", "em", "ul", "ol", "li", "a", "br"],
          ALLOWED_ATTR: ["href", "target", "rel"],
          FORCE_BODY: true,
        }),
      );
    });
  }, [html]);

  return (
    <Box
      dangerouslySetInnerHTML={{ __html: clean }}
      sx={{
        fontSize: "0.875rem",
        color: "text.secondary",
        lineHeight: 1.6,
        "& p": { m: 0 },
        "& ul, & ol": { pl: 2.5, my: 0.5 },
        "& a": { color: "primary.main", textDecoration: "underline" },
        // clamp to 3 lines in card preview
        display: "-webkit-box",
        WebkitLineClamp: 3,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        ...sx,
      }}
    />
  );
}
