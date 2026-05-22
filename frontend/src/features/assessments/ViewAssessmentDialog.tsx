import { useEffect, useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetClose,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, X, Printer, Pencil } from "lucide-react";
import { apiService } from "@/services/api";
import type { Test, QuestionResponse, Course } from "@/services/api";
import { AssessmentSummaryPanel } from "./AssessmentSummaryPanel";
import { AssessmentQuestionBreakdown } from "./AssessmentQuestionBreakdown";
import { motion } from "framer-motion";

interface ViewAssessmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    testId: number | null;
    onGoToMarks?: (test: Test) => void;
}

export interface AssessmentDetails {
    test: Test;
    course: Course;
    questions: QuestionResponse[];
}

const MotionButton = motion(Button);

export function ViewAssessmentDialog({
    open,
    onOpenChange,
    testId,
    onGoToMarks,
}: ViewAssessmentDialogProps) {
    const [loading, setLoading] = useState(false);
    const [details, setDetails] = useState<AssessmentDetails | null>(null);

    useEffect(() => {
        if (open && testId) {
            loadAssessmentDetails();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, testId]);

    const loadAssessmentDetails = async () => {
        if (!testId) return;
        setLoading(true);
        try {
            const data = await apiService.getAssessment(testId);
            setDetails(data);
        } catch (error) {
            console.error("Failed to load assessment details:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-[min(92vw,1000px)] max-w-none sm:max-w-none p-0 flex flex-col gap-0 [&>button]:hidden border-l border-slate-200/80 dark:border-slate-800/80 bg-background/95 backdrop-blur-md shadow-2xl">
                <SheetTitle className="sr-only">Assessment Details</SheetTitle>
                <SheetDescription className="sr-only">View complete assessment information and question breakdown</SheetDescription>
                
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between bg-white/50 dark:bg-slate-900/50 shrink-0 relative">
                    <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500"></div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Assessment Details</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">View complete assessment information and question breakdown</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <MotionButton 
                            size="sm"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                        >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Details
                        </MotionButton>
                        <SheetClose asChild>
                            <MotionButton 
                                variant="ghost" 
                                size="icon" 
                                whileHover={{ scale: 1.08, backgroundColor: "rgba(0,0,0,0.03)" }}
                                whileTap={{ scale: 0.92 }}
                                className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-5 w-5" />
                            </MotionButton>
                        </SheetClose>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex overflow-hidden bg-slate-50/20 dark:bg-slate-950/10">
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center space-y-4">
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
                                    transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                                >
                                    <FileText className="w-12 h-12 mx-auto text-indigo-500" />
                                </motion.div>
                                <p className="text-sm font-semibold text-muted-foreground">Loading assessment details...</p>
                            </div>
                        </div>
                    ) : details ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="flex-1 flex overflow-hidden"
                        >
                            <ScrollArea className="w-2/5 border-r border-slate-200/60 dark:border-slate-800/60 bg-white/20 dark:bg-slate-900/10">
                                <motion.div
                                    initial={{ opacity: 0, x: -15 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.05 }}
                                >
                                    <AssessmentSummaryPanel details={details} />
                                </motion.div>
                            </ScrollArea>
                            
                            <motion.div 
                                initial={{ opacity: 0, x: 15 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
                                className="w-3/5 flex flex-col overflow-hidden"
                            >
                                <div className="px-8 pt-8 pb-4 shrink-0">
                                    <h4 className="text-sm font-bold flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse" />
                                        Question Breakdown
                                    </h4>
                                </div>
                                <AssessmentQuestionBreakdown questions={details.questions} />
                            </motion.div>
                        </motion.div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center space-y-2">
                                <FileText className="w-12 h-12 mx-auto text-muted-foreground/60" />
                                <p className="text-muted-foreground font-semibold">No assessment details available</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {details && (
                    <div className="px-8 py-4.5 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200/60 dark:border-slate-800/60 flex justify-between items-center shrink-0">
                        <MotionButton 
                            variant="ghost" 
                            size="sm" 
                            whileHover={{ scale: 1.02, backgroundColor: "rgba(0,0,0,0.02)" }}
                            whileTap={{ scale: 0.98 }}
                            className="text-muted-foreground hover:text-foreground gap-2 font-semibold h-9"
                        >
                            <Printer className="h-4 w-4" />
                            Print Assessment Spec
                        </MotionButton>
                        <div className="flex gap-3">
                            <SheetClose asChild>
                                <MotionButton 
                                    variant="outline"
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    className="font-semibold h-9.5"
                                >
                                    Close
                                </MotionButton>
                            </SheetClose>
                            <MotionButton 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                className="font-bold shadow-md bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 border-none px-5 h-9.5" 
                                onClick={() => onGoToMarks?.(details.test)}
                            >
                                Go to Marks Entry
                            </MotionButton>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
