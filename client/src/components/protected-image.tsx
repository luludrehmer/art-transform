import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

const DOWNLOAD_PROTECTION_MESSAGE = "Please use the download button below to save your artwork.";

interface ProtectedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

export function ProtectedImage({ onContextMenu, onDragStart, ...props }: ProtectedImageProps) {
  const { toast } = useToast();

  const showProtectionToast = useCallback(() => {
    toast({
      title: "Use the download button",
      description: DOWNLOAD_PROTECTION_MESSAGE,
      variant: "default",
    });
  }, [toast]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLImageElement>) => {
      e.preventDefault();
      showProtectionToast();
      onContextMenu?.(e);
    },
    [showProtectionToast, onContextMenu]
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLImageElement>) => {
      e.preventDefault();
      showProtectionToast();
      onDragStart?.(e);
    },
    [showProtectionToast, onDragStart]
  );

  return (
    <img
      {...props}
      draggable={false}
      onContextMenu={handleContextMenu}
      onDragStart={handleDragStart}
      style={{
        ...props.style,
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitUserDrag: "none",
        pointerEvents: "auto",
      }}
      className={["protected-image", props.className].filter(Boolean).join(" ")}
    />
  );
}
