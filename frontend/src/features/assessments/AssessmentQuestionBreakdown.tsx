import { Fragment, useMemo, memo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Edit2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/services/api";
import type { QuestionResponse } from "@/services/api";

interface AssessmentQuestionBreakdownProps {
    questions: QuestionResponse[];
    onQuestionUpdated?: () => void;
}

export const AssessmentQuestionBreakdown = memo(function AssessmentQuestionBreakdown({
    questions,
    onQuestionUpdated,
}: AssessmentQuestionBreakdownProps) {
    const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
    const [editCoValue, setEditCoValue] = useState<string>("1");
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const groupedQuestions = useMemo(() => {
        return questions.reduce((acc, q) => {
            const key = q.question_number;
            if (!acc[key]) acc[key] = [];
            acc[key].push(q);
            return acc;
        }, {} as Record<number, QuestionResponse[]>);
    }, [questions]);

    const handleStartEdit = (q: QuestionResponse) => {
        setEditingQuestionId(q.question_id);
        setEditCoValue(String(q.co));
    };

    const handleCancelEdit = () => {
        setEditingQuestionId(null);
    };

    const handleSaveEdit = async (questionId: number) => {
        setIsSaving(true);
        try {
            await apiService.updateQuestion(questionId, { co: Number(editCoValue) });
            toast.success("Question CO mapping updated successfully");
            setEditingQuestionId(null);
            if (onQuestionUpdated) {
                onQuestionUpdated();
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to update question CO mapping");
        } finally {
            setIsSaving(false);
        }
    };

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
                        <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/80 py-3.5 text-right pr-4">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Object.keys(groupedQuestions)
                        .sort((a, b) => Number(a) - Number(b))
                        .map((qNum) => (
                            <Fragment key={qNum}>
                                {groupedQuestions[Number(qNum)].map((q, idx) => (
                                    <TableRow key={q.question_id} className="hover:bg-primary/[0.02] border-b border-muted/40 transition-colors duration-200">
                                        <TableCell className="font-mono font-bold text-foreground py-3.5 pl-4">
                                            {idx === 0 ? `Q${q.question_number}` : ""}
                                        </TableCell>
                                        <TableCell className="text-sm font-medium text-muted-foreground py-3.5">
                                            {q.sub_question || "—"}
                                        </TableCell>
                                        <TableCell className="py-3.5">
                                            {editingQuestionId === q.question_id ? (
                                                <Select
                                                    value={editCoValue}
                                                    onValueChange={setEditCoValue}
                                                    disabled={isSaving}
                                                >
                                                    <SelectTrigger className="w-[95px] h-8 bg-background border-slate-200 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500">
                                                        <SelectValue placeholder="CO" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {[1, 2, 3, 4, 5, 6].map((num) => (
                                                            <SelectItem key={num} value={String(num)}>
                                                                CO{num}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 font-bold px-2.5 py-0.5 rounded-md shadow-xs">
                                                    CO{q.co}
                                                </Badge>
                                            )}
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
                                        <TableCell className="text-right pr-4 py-3.5">
                                            {editingQuestionId === q.question_id ? (
                                                <div className="flex justify-end gap-1.5">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleSaveEdit(q.question_id)}
                                                        disabled={isSaving}
                                                        className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-full"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={handleCancelEdit}
                                                        disabled={isSaving}
                                                        className="h-7 w-7 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-full"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleStartEdit(q)}
                                                    disabled={editingQuestionId !== null}
                                                    className="h-7 w-7 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-full transition-colors"
                                                >
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </Button>
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
});
