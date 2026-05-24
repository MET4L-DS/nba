import { memo, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell } from "@/components/ui/table";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import type { Question } from "@/services/api";

interface QuestionTableRowProps {
	question: Question;
	index: number;
	onUpdate: (index: number, updates: Partial<Question>) => void;
	onRemove: (index: number) => void;
	onAddSubQuestion: (questionNumber: number) => void;
}

const MotionButton = motion(Button);

export const QuestionTableRow = memo(function QuestionTableRow({
	question,
	index,
	onUpdate,
	onRemove,
	onAddSubQuestion,
}: QuestionTableRowProps) {
	const handleUpdate = useCallback((updates: Partial<Question>) => {
		onUpdate(index, updates);
	}, [index, onUpdate]);

	const handleRemove = useCallback(() => {
		onRemove(index);
	}, [index, onRemove]);

	const handleAddSubQuestion = useCallback(() => {
		onAddSubQuestion(question.question_number);
	}, [question.question_number, onAddSubQuestion]);

	const questionLabel = question.sub_question
		? `Q${question.question_number}${question.sub_question}`
		: `Q${question.question_number}`;

	const rowVariants = {
		hidden: { opacity: 0, x: -15, scale: 0.98 },
		show: { opacity: 1, x: 0, scale: 1, transition: { type: "spring" as const, stiffness: 280, damping: 22 } },
		exit: { opacity: 0, x: 15, scale: 0.98, transition: { duration: 0.15 } },
	};

	return (
		<motion.tr
			variants={rowVariants}
			initial="hidden"
			animate="show"
			exit="exit"
			layout
			className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors border-b last:border-0"
		>
			{/* Q. No. */}
			<TableCell className="py-4 pl-8 border-r-0">
				<Badge
					variant="outline"
					className="font-mono font-bold h-7 px-3 flex items-center bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs hover:border-primary/45 transition-colors cursor-default"
				>
					{questionLabel}
				</Badge>
			</TableCell>

			{/* Sub-Q */}
			<TableCell className="py-4 text-center">
				<div className="flex justify-center">
					<Input
						type="text"
						value={question.sub_question}
						onChange={(e) =>
							handleUpdate({ sub_question: e.target.value })
						}
						className="w-16 h-10 text-center font-bold shadow-xs bg-white dark:bg-slate-950 focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 border-slate-200 dark:border-slate-800 transition-all"
						placeholder="-"
						maxLength={2}
					/>
				</div>
			</TableCell>

			{/* CO */}
			<TableCell className="py-4">
				<div className="flex justify-center">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<MotionButton
								type="button"
								variant="outline"
								size="sm"
								whileHover={{ scale: 1.04 }}
								whileTap={{ scale: 0.96 }}
								className="rounded-full h-8 px-4.5 text-[11px] font-bold bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100 hover:text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 shadow-xs gap-1.5 transition-all"
							>
								CO{question.co}
								<ChevronDown className="w-3 h-3 opacity-60" />
							</MotionButton>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="center" className="rounded-xl p-1 shadow-lg border border-muted/80 backdrop-blur-md">
							{[1, 2, 3, 4, 5, 6].map((co) => (
								<DropdownMenuItem
									key={co}
									onSelect={() => handleUpdate({ co })}
									className="rounded-lg py-1.5 px-3 font-semibold text-xs gap-2"
								>
									<span className="font-bold text-primary">
										CO{co}
									</span>
									<span className="text-muted-foreground font-medium">
										Course Outcome {co}
									</span>
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</TableCell>

			{/* Max Marks */}
			<TableCell className="py-4">
				<div className="flex justify-center">
					<Input
						type="number"
						step="0.5"
						min="0.5"
						value={question.max_marks}
						onChange={(e) =>
							handleUpdate({
								max_marks: parseFloat(e.target.value) || 0,
							})
						}
						onFocus={(e) => e.target.select()}
						className="w-24 h-10 text-center font-bold font-mono shadow-xs focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 border-slate-200 dark:border-slate-800 transition-all"
						required
					/>
				</div>
			</TableCell>

			{/* Optional */}
			<TableCell className="py-4">
				<div className="flex justify-center">
					<Checkbox
						id={`optional-${index}`}
						checked={question.is_optional}
						onCheckedChange={(checked) =>
							handleUpdate({ is_optional: !!checked })
						}
						className="h-5 w-5 rounded-md border-slate-300 dark:border-slate-700 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-transform active:scale-95"
					/>
				</div>
			</TableCell>

			{/* Actions */}
			<TableCell className="py-4 pr-8">
				<div className="flex items-center justify-center gap-1.5">
					<MotionButton
						type="button"
						variant="ghost"
						size="icon"
						onClick={handleAddSubQuestion}
						title="Add sub-question"
						whileHover={{ scale: 1.1, backgroundColor: "rgba(59, 130, 246, 0.08)", color: "rgb(59, 130, 246)" }}
						whileTap={{ scale: 0.9 }}
						className="h-8 w-8 text-muted-foreground rounded-full transition-all"
					>
						<Plus className="h-4.5 w-4.5" />
					</MotionButton>
					<MotionButton
						type="button"
						variant="ghost"
						size="icon"
						onClick={handleRemove}
						title="Remove question"
						whileHover={{ scale: 1.1, backgroundColor: "rgba(239, 68, 68, 0.08)", color: "rgb(239, 68, 68)" }}
						whileTap={{ scale: 0.9 }}
						className="h-8 w-8 text-muted-foreground rounded-full transition-all"
					>
						<Trash2 className="h-4 w-4" />
					</MotionButton>
				</div>
			</TableCell>
		</motion.tr>
	);
});
