import { ClipboardList } from "lucide-react";
import { QuestionTableRow } from "./QuestionTableRow";
import type { Question } from "@/services/api";

interface QuestionsTableProps {
	questions: Question[];
	onUpdateQuestion: (index: number, updates: Partial<Question>) => void;
	onRemoveQuestion: (index: number) => void;
	onAddSubQuestion: (questionNumber: number) => void;
}

export function QuestionsTable({
	questions,
	onUpdateQuestion,
	onRemoveQuestion,
	onAddSubQuestion,
}: QuestionsTableProps) {
	if (questions.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-16 px-8 text-center">
				<div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
					<ClipboardList className="w-6 h-6 text-muted-foreground" />
				</div>
				<p className="text-sm font-semibold text-muted-foreground mb-1">
					No questions added yet
				</p>
				<p className="text-xs text-muted-foreground/70">
					Use the button below to add your first question
				</p>
			</div>
		);
	}

	return (
		<div className="overflow-x-auto">
			<table className="w-full text-left border-collapse">
				<thead>
					<tr className="bg-slate-50 dark:bg-gray-800/50">
						<th className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-3 px-4 w-24 border-b">
							Q. No.
						</th>
						<th className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-3 px-4 w-20 border-b">
							Sub-Q
						</th>
						<th className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-3 px-4 w-28 border-b">
							CO
						</th>
						<th className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-3 px-4 w-32 border-b">
							Max Marks
						</th>
						<th className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-3 px-4 w-24 border-b">
							Optional
						</th>
						<th className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-3 px-4 border-b w-full">
							Actions
						</th>
					</tr>
				</thead>
				<tbody>
					{questions.map((question, index) => (
						<QuestionTableRow
							key={`${question.question_number}-${question.sub_question}-${index}`}
							question={question}
							index={index}
							onUpdate={(updates) =>
								onUpdateQuestion(index, updates)
							}
							onRemove={() => onRemoveQuestion(index)}
							onAddSubQuestion={() =>
								onAddSubQuestion(question.question_number)
							}
						/>
					))}
				</tbody>
			</table>
		</div>
	);
}
