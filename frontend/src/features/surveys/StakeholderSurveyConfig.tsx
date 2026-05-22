import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, Save } from "lucide-react";
import { surveyApi } from "@/services/api/surveys";
import type { StakeholderSurveyQuestion } from "@/services/api";

const PO_OPTIONS = [
	...Array.from({ length: 12 }, (_, i) => `PO${i + 1}`),
	...Array.from({ length: 3 }, (_, i) => `PSO${i + 1}`),
];

const DEFAULT_PO_TEMPLATE = PO_OPTIONS.map((po, i) => ({
	question_number: i + 1,
	question_text: `Rate the programme's attainment of ${po}`,
	po_name: po,
	mapping_weight: 1.0,
}));

interface StakeholderSurveyConfigProps {
	programmeId: number;
	batchYear: string;
	stakeholderType: string;
	onConfigSaved?: () => void;
}

const MotionCard = motion(Card);
const MotionButton = motion(Button);

export function StakeholderSurveyConfig({
	programmeId,
	batchYear,
	stakeholderType,
	onConfigSaved,
}: StakeholderSurveyConfigProps) {
	const [questions, setQuestions] = useState<Array<StakeholderSurveyQuestion & { _key?: string }>>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	const loadSurvey = useCallback(async () => {
		if (!batchYear || !stakeholderType) return;
		setLoading(true);
		try {
			const data = await surveyApi.getStakeholderSurvey(
				programmeId,
				Number(batchYear),
				stakeholderType,
			);
			if (data && data.questions && data.questions.length > 0) {
				setQuestions(data.questions.map((q, i) => ({
					...q,
					mapping_weight: Number(q.mapping_weight),
					_key: `${q.question_id || i}`,
				})));
			} else {
				setQuestions(DEFAULT_PO_TEMPLATE.map((q, i) => ({ ...q, _key: `tmpl_${i}` })));
			}
		} catch {
			toast.error("Failed to load survey configuration");
		} finally {
			setLoading(false);
		}
	}, [programmeId, batchYear, stakeholderType]);

	useEffect(() => {
		loadSurvey();
	}, [loadSurvey]);

	const addQuestion = () => {
		const nextNum =
			questions.length > 0
				? Math.max(...questions.map((q) => q.question_number)) + 1
				: 1;
		setQuestions([
			...questions,
			{
				question_number: nextNum,
				question_text: "",
				po_name: "PO1",
				mapping_weight: 1.0,
				_key: `new_${Date.now()}_${Math.random()}`,
			},
		]);
	};

	const removeQuestion = (idx: number) => {
		setQuestions((prev) =>
			prev
				.filter((_, i) => i !== idx)
				.map((q, i) => ({ ...q, question_number: i + 1 })),
		);
	};

	const updateQuestion = (
		idx: number,
		field: keyof StakeholderSurveyQuestion,
		value: string | number,
	) => {
		setQuestions((prev) =>
			prev.map((q, i) =>
				i === idx ? { ...q, [field]: value } : q,
			),
		);
	};

	const handleSave = async () => {
		for (const q of questions) {
			if (!q.question_text.trim()) {
				toast.error(`Question ${q.question_number} is missing text`);
				return;
			}
			if (q.mapping_weight < 0 || q.mapping_weight > 1) {
				toast.error(
					`Question ${q.question_number} mapping weight must be between 0.0 and 1.0`,
				);
				return;
			}
		}

		setSaving(true);
		try {
			// Strip _key property before sending API
			const cleanQuestions = questions.map(({ _key, ...q }) => q);
			await surveyApi.saveStakeholderQuestions(
				programmeId,
				Number(batchYear),
				stakeholderType,
				cleanQuestions,
			);
			toast.success("Survey questions configured successfully");
			onConfigSaved?.();
		} catch {
			toast.error("Failed to save configuration");
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center p-12 text-muted-foreground gap-3">
				<div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
				<p className="text-sm font-medium animate-pulse">Loading configuration...</p>
			</div>
		);
	}

	return (
		<MotionCard
			initial={{ opacity: 0, y: 15 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ type: "spring" as const, stiffness: 260, damping: 20 }}
			className="bg-card/75 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-md"
		>
			<CardHeader className="flex flex-row items-center justify-between pb-3 border-b bg-muted/[0.08]">
				<CardTitle className="text-base font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
					Stakeholder Survey Question Configuration
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6 pt-6">
				<p className="text-sm text-muted-foreground leading-relaxed">
					Define the questions for this stakeholder survey. Each question maps to a PO/PSO with a weight. The chronological order below corresponds to the CSV column order.
				</p>

				<div className="space-y-3 border border-muted/65 rounded-xl p-4 bg-muted/20 backdrop-blur-sm">
					<div className="grid grid-cols-[3rem_1fr_10rem_6rem_3rem] gap-4 items-center font-bold text-xs uppercase text-muted-foreground/80 pb-2 border-b border-muted/40">
						<div className="text-center">#</div>
						<div>Question Text</div>
						<div>Map to PO</div>
						<div className="text-center">Weight</div>
						<div className="w-8" />
					</div>

					<div className="space-y-2 overflow-y-auto max-h-[500px] pr-1">
						<AnimatePresence initial={false} mode="popLayout">
							{questions.map((q, idx) => (
								<motion.div
									key={q._key || idx}
									layout
									initial={{ opacity: 0, y: 12, scale: 0.98 }}
									animate={{ opacity: 1, y: 0, scale: 1 }}
									exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
									transition={{ type: "spring" as const, stiffness: 280, damping: 25 }}
									className="grid grid-cols-[3rem_1fr_10rem_6rem_3rem] gap-4 items-center bg-background/50 hover:bg-background/80 p-2.5 rounded-xl border border-muted/40 transition-all shadow-xs"
								>
									<div className="text-center font-mono font-bold text-xs text-muted-foreground">
										{q.question_number}
									</div>
									<div>
										<Input
											value={q.question_text}
											onChange={(e) =>
												updateQuestion(
													idx,
													"question_text",
													e.target.value,
												)
											}
											placeholder="Question text..."
											className="bg-background focus-visible:ring-indigo-500/30 transition-all font-medium h-9"
										/>
									</div>
									<div>
										<Select
											value={q.po_name}
											onValueChange={(v) =>
												updateQuestion(idx, "po_name", v)
											}
										>
											<SelectTrigger className="bg-background focus:ring-indigo-500/30 transition-all h-9 font-semibold">
												<SelectValue placeholder="Select PO" />
											</SelectTrigger>
											<SelectContent className="max-h-[250px]">
												{PO_OPTIONS.map((po) => (
													<SelectItem key={po} value={po} className="font-semibold">
														{po}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<div>
										<Input
											type="number"
											step="0.1"
											min="0"
											max="1"
											value={q.mapping_weight}
											className="bg-background text-center focus-visible:ring-indigo-500/30 transition-all font-mono font-bold h-9"
											onChange={(e) => {
												const parsed = parseFloat(e.target.value);
												updateQuestion(
													idx,
													"mapping_weight",
													isNaN(parsed) ? 0 : Math.min(1, Math.max(0, parsed)),
												);
											}}
										/>
									</div>
									<div className="flex justify-center">
										<MotionButton
											variant="ghost"
											size="icon"
											className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10 dark:hover:bg-red-500/20 rounded-full transition-all"
											onClick={() => removeQuestion(idx)}
											whileHover={{ scale: 1.1 }}
											whileTap={{ scale: 0.9 }}
										>
											<Trash2 className="h-4 w-4" />
										</MotionButton>
									</div>
								</motion.div>
							))}
						</AnimatePresence>
					</div>
				</div>

				<div className="flex gap-2 justify-between border-t pt-4 border-muted/30">
					<MotionButton
						variant="outline"
						size="sm"
						onClick={addQuestion}
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						className="font-bold border-primary/20 hover:border-primary/40 hover:bg-primary/5 h-10 px-4 rounded-lg"
					>
						<Plus className="w-4 h-4 mr-2 text-primary" /> Add Question
					</MotionButton>
					<MotionButton
						onClick={handleSave}
						disabled={saving}
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						className="bg-primary text-primary-foreground font-bold shadow-md h-10 px-5 rounded-lg"
					>
						{saving ? (
							"Saving..."
						) : (
							<>
								<Save className="w-4 h-4 mr-2" /> Save Configuration
							</>
						)}
					</MotionButton>
				</div>
			</CardContent>
		</MotionCard>
	);
}

