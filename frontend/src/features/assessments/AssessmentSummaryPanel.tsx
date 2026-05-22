import { Separator } from "@/components/ui/separator";
import { School, BarChart3, Info, BookOpen, Layers } from "lucide-react";
import type { Test, Course, QuestionResponse } from "@/services/api";

interface AssessmentSummaryPanelProps {
    details: {
        test: Test;
        course: Course;
        questions: QuestionResponse[];
    };
}

export function AssessmentSummaryPanel({ details }: AssessmentSummaryPanelProps) {
    return (
        <div className="p-6 space-y-6 h-full overflow-y-auto">
            {/* Course Information Section */}
            <section className="space-y-4">
                <h4 className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2 bg-indigo-500/[0.04] px-3.5 py-2 rounded-xl border border-indigo-500/10 w-fit">
                    <School className="h-4 w-4" />
                    Course Information
                </h4>
                <div className="grid grid-cols-1 gap-3.5 pt-1">
                    <div className="p-3.5 rounded-xl border border-muted/40 bg-card/45 hover:bg-muted/[0.04] transition-all duration-300">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <BookOpen className="h-3 w-3 text-muted-foreground/75" />
                            Course Code & Name
                        </p>
                        <p className="text-sm font-bold text-foreground">
                            {details.course.course_code} - {details.course.course_name}
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3.5">
                        <div className="p-3.5 rounded-xl border border-muted/40 bg-card/45 hover:bg-muted/[0.04] transition-all duration-300">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                                Semester
                            </p>
                            <p className="text-sm font-semibold text-foreground">{details.course.semester}</p>
                        </div>
                        <div className="p-3.5 rounded-xl border border-muted/40 bg-card/45 hover:bg-muted/[0.04] transition-all duration-300">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                                Academic Year
                            </p>
                            <p className="text-sm font-semibold text-foreground">{details.course.year}</p>
                        </div>
                    </div>
                </div>
            </section>

            <Separator className="bg-muted/40" />

            {/* Assessment Summary Section */}
            <section className="space-y-4">
                <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2 bg-emerald-500/[0.04] px-3.5 py-2 rounded-xl border border-emerald-500/10 w-fit">
                    <BarChart3 className="h-4 w-4" />
                    Assessment Summary
                </h4>
                <div className="space-y-3.5 pt-1">
                    <div className="p-3.5 rounded-xl border border-muted/40 bg-card/45 hover:bg-muted/[0.04] transition-all duration-300">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                            Test Title
                        </p>
                        <p className="text-base font-extrabold text-foreground">{details.test.name}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3.5">
                        <div className="p-4 rounded-xl bg-blue-500/[0.04] dark:bg-blue-500/[0.07] border border-blue-500/15 hover:border-blue-500/35 hover:scale-[1.03] transition-all duration-300 shadow-xs">
                            <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
                                Full Marks
                            </p>
                            <p className="text-2xl font-black text-blue-700 dark:text-blue-300">
                                {details.test.full_marks}
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-orange-500/[0.04] dark:bg-orange-500/[0.07] border border-orange-500/15 hover:border-orange-500/35 hover:scale-[1.03] transition-all duration-300 shadow-xs">
                            <p className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-1">
                                Pass Marks
                            </p>
                            <p className="text-2xl font-black text-orange-700 dark:text-orange-300">
                                {details.test.pass_marks}
                            </p>
                        </div>
                    </div>
                    
                    <div className="p-3.5 rounded-xl border border-muted/40 bg-card/45 hover:bg-muted/[0.04] transition-all duration-300 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Layers className="h-4 w-4 text-muted-foreground/75" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                Total Questions
                            </span>
                        </div>
                        <span className="text-sm font-bold text-foreground bg-muted px-2.5 py-0.5 rounded-md border border-muted-foreground/10">
                            {details.questions.length}
                        </span>
                    </div>
                </div>
            </section>

            {/* Bottom Tip Block */}
            <div className="flex items-start gap-3 p-4 bg-amber-500/[0.05] dark:bg-amber-500/[0.08] rounded-xl border border-amber-500/20 shadow-inner">
                <Info className="h-4 w-4 text-amber-500 mt-0.5 shrink-0 animate-pulse" />
                <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
                    Review question mappings and mark distributions before finalizing marks entry for this assessment.
                </p>
            </div>
        </div>
    );
}
