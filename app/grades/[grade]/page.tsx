import { notFound } from "next/navigation";
import { GradeDetailPage } from "@/components/grade-detail-page";
import { AuthoredCoursePage } from "@/components/authored-course";

export default async function Page({ params }: { params: Promise<{ grade: string }> }) {
  const { grade: rawGrade } = await params;
  const grade = Number(rawGrade);
  if (grade !== 1 && grade !== 2) notFound();
  if (grade === 1) return <AuthoredCoursePage />;
  return <GradeDetailPage grade={grade} />;
}
