import { notFound } from 'next/navigation';
import PronunciationLessonContent from '@/components/PronunciationLessonContent';
import { getPronunciationLesson, pronunciationLessons } from '@/lib/pronunciation-lessons';
export default async function PronunciationLessonPage({ params }: { params: Promise<{ lesson: string }> }) { const lesson = getPronunciationLesson((await params).lesson); if (!lesson) notFound(); return <PronunciationLessonContent lesson={lesson} total={pronunciationLessons.length} />; }
