import { Fragment } from "react";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { QuestionResponse } from "@/services/api";

interface AssessmentQuestionBreakdownProps {
    questions: QuestionResponse[];
}

export function AssessmentQuestionBreakdown({ questions }: AssessmentQuestionBreakdownProps) {
    const groupedQuestions = questions.reduce((acc, q) => {
        const key = q.question_number;
        if (!acc[key]) acc[key] = [];
        acc[key].push(q);
        return acc;
    }, {} as Record<number, QuestionResponse[]>);

    return (
        <div className="flex-1 overflow-auto rounded-xl border border-muted/50 bg-card/30 backdrop-blur-md shadow-inner">
            <Table>
                <TableHeader className="sticky top-0 bg-muted/95 dark:bg-slate-900/95 backdrop-blur-md z-10 border-b border-muted">
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/80 py-3.5 pl-4">Q. No.</TableHead>
                        <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/80 py-3.5">Sub</TableHead>
                        <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/80 py-3.5">CO Mapping</TableHead>
                        <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/80 py-3.5 text-center">Max Marks</TableHead>
                        <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/80 py-3.5 text-center">Optional</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Object.keys(groupedQuestions)
                        .sort((a, b) => Number(a) - Number(b))
                        .map((qNum) => (
                            <Fragment key={qNum}>
                                {groupedQuestions[Number(qNum)].map((q, idx) => (
                                    <TableRow key={q.id} className="hover:bg-primary/[0.02] border-b border-muted/40 transition-colors duration-200">
                                        <TableCell className="font-mono font-bold text-foreground py-3.5 pl-4">
                                            {idx === 0 ? `Q${q.question_number}` : ""}
                                        </TableCell>
                                        <TableCell className="text-sm font-medium text-muted-foreground py-3.5">
                                            {q.sub_question || "—"}
                                        </TableCell>
                                        <TableCell className="py-3.5">
                                            <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 font-bold px-2.5 py-0.5 rounded-md shadow-xs">
                                                CO{q.co}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center font-extrabold text-foreground text-sm py-3.5">
                                            {q.max_marks}
                                        </TableCell>
                                        <TableCell className="text-center py-3.5">
                                            {q.is_optional ? (
                                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-2 py-0.5 font-bold shadow-xs">
                                                    Yes
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-muted text-muted-foreground border-muted/50 px-2 py-0.5 font-medium shadow-xs">
                                                    No
                                                </Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </Fragment>
                        ))}
                </TableBody>
            </Table>
        </div>
    );
}
