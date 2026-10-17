import { notFound } from "next/navigation";
import { GradeDetailPage } from "@/components/grade-detail-page";

export default async function Page({ params }: { params: Promise<{ grade: string }> }) {
  const { grade: rawGrade } = await params;
  const grade = Number(rawGrade);
  if (grade !== 1 && grade !== 2) notFound();
  return <GradeDetailPage grade={grade} />;
}
