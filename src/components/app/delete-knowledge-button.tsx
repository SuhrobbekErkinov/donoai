"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteKnowledge } from "@/server/knowledge";

export function DeleteKnowledgeButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this knowledge item? This cannot be undone."))
          return;
        start(async () => {
          const r = await deleteKnowledge(id);
          if (r.ok) {
            toast.success("Deleted");
            router.push("/knowledge");
          } else toast.error(r.error);
        });
      }}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
      Delete
    </Button>
  );
}
