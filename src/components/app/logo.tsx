import Image from "next/image";
import { cn } from "@/lib/utils";

// DonoAI brand emblem. The source image is a circular neon badge on a dark
// field, so we mask it to a circle — the black corners clip away cleanly.
export function Logo({
  size = 36,
  className,
  priority = false,
}: {
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo.jpg"
      alt="DonoAI"
      width={size}
      height={size}
      priority={priority}
      className={cn(
        "shrink-0 rounded-full object-cover ring-1 ring-black/10",
        className,
      )}
    />
  );
}
