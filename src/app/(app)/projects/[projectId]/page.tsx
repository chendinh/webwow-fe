import { redirect } from "next/navigation";

interface Props {
  params: { projectId: string };
}

export default function ProjectPage({ params }: Props) {
  redirect(`/projects/${params.projectId}/overview`);
}
