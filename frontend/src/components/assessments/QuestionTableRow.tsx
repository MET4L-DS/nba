import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Trash2 } from "lucide-react";
import type { Question } from "@/services/api";

interface QuestionTableRowProps {
	question: Question;
	index: number;
	onUpdate: (updates: Partial<Question>) => void;
	onRemove: () => void;
	onAddSubQuestion: () => void;
}

export function QuestionTableRow({
	question,
	onUpdate,
	onRemove,
	onAddSubQuestion,
}: QuestionTableRowProps) {
	const questionLabel = question.sub_question
		? `Q${question.question_number}${question.sub_question}`
		: `Q${question.question_number}`;

	return (
		<tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
			{/* Q. No. */}
			<td className="px-4 py-3 border-b">
				<span className="font-mono text-xs font-semibold text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
					{questionLabel}
				</span>
			</td>

			{/* Sub-Q */}
			<td className="px-4 py-3 border-b">
				<Input
					type="text"
					value={question.sub_question}
					onChange={(e) => onUpdate({ sub_question: e.target.value })}
					className="w-16 h-8 text-xs"
					placeholder="-"
					maxLength={2}
				/>
			</td>

			{/* CO */}
			<td className="px-4 py-3 border-b">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button
							type="button"
							className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
						>
							CO{question.co}
							<Plus className="w-2.5 h-2.5 rotate-45 opacity-60" />
						</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start">
						{[1, 2, 3, 4, 5, 6].map((co) => (
							<DropdownMenuItem
								key={co}
								onSelect={() => onUpdate({ co })}
							>
								<span className="font-semibold text-xs mr-2">
									CO{co}
								</span>
								<span className="text-xs text-muted-foreground">
									Course Outcome {co}
								</span>
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</td>

			{/* Max Marks */}
			<td className="px-4 py-3 border-b">
				<Input
					type="number"
					step="0.5"
					min="0.5"
					value={question.max_marks}
					onChange={(e) =>
						onUpdate({ max_marks: parseFloat(e.target.value) || 0 })
					}
					onFocus={(e) => e.target.select()}
					className="w-24 h-8 text-xs"
					required
				/>
			</td>

			{/* Optional */}
			<td className="px-4 py-3 border-b">
				<Checkbox
					checked={question.is_optional}
					onCheckedChange={(checked) =>
						onUpdate({ is_optional: !!checked })
					}
				/>
			</td>

			{/* Actions */}
			<td className="px-4 py-3 border-b">
				<div className="flex items-center gap-1">
					<button
						type="button"
						onClick={onAddSubQuestion}
						title="Add sub-question"
						className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-muted-foreground hover:text-primary transition-colors"
					>
						<Plus className="w-3.5 h-3.5" />
					</button>
					<button
						type="button"
						onClick={onRemove}
						title="Remove question"
						className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/30 text-muted-foreground hover:text-destructive transition-colors"
					>
						<Trash2 className="w-3.5 h-3.5" />
					</button>
				</div>
			</td>
		</tr>
	);
}
