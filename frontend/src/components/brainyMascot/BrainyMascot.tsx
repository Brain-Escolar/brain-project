import Image from "next/image";
import { Box } from "@mui/material";

interface BrainyMascotProps {
  height?: number;
}

/**
 * 1920×1280 PNG — character is centered; ~20% transparent padding on each side.
 * Shifts the image left inside a narrow slot so the visible brain aligns with page content.
 */
const ASPECT = 1920 / 1280;
const LEFT_PADDING_RATIO = 0.2;
const VISIBLE_CHAR_RATIO = 0.55;

export default function BrainyMascot({ height = 65 }: BrainyMascotProps) {
  const renderedWidth = height * ASPECT;
  const shiftLeft = renderedWidth * LEFT_PADDING_RATIO;
  const slotWidth = renderedWidth * VISIBLE_CHAR_RATIO;

  return (
    <Box
      aria-hidden
      sx={{
        flexShrink: 0,
        width: slotWidth,
        height,
        overflow: "visible",
        position: "relative",
      }}
    >
      <Image
        src="/brand/brainy/brainy-front-rgb.png"
        alt=""
        width={1920}
        height={1280}
        priority
        style={{
          height,
          width: "auto",
          marginLeft: -shiftLeft,
          display: "block",
        }}
      />
    </Box>
  );
}
