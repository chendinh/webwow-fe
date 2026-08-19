"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface Props {
  params: { projectId: string };
}

export default function ProjectPage({ params }: Props) {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/projects/${params.projectId}/overview`);
  }, [params.projectId, router]);

  // Render nothing while redirecting — the app layout already shows the shell
  return null;
}
