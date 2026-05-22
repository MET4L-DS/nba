import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Trash2, Save } from "lucide-react";
import { surveyApi } from "@/services/api/surveys";
import type { CourseSurveyQuestion } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";

interface CourseSurveyConfigProps {
	offeringId: number;
	maxCoCount?: number;
	onConfigSaved?: () => void;
}

export function CourseSurveyConfig({ offeringId, maxCoCount = 6, onConfigSaved }: CourseSurveyConfigProps) {
	const coRange = Array.from({ length: maxCoCount }, (_, i) => i + 1);
	const [questions, setQuestions] = useState<CourseSurveyQuestion[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		loadSurvey();
	}, [offeringId]);

	const loadSurvey = async () => {
		setLoading(true);
		try {
			const data = await surveyApi.getCourseExitSurvey(offeringId);
			if (data && data.questions && data.questions.length > 0) {
				const normalized = data.questions.map((q: CourseSurveyQuestion) => ({
					...q,
					mapping_weight: Number(q.mapping_weight) || 0,
					co_number: Number(q.co_number) || 1,
				}));
				setQuestions(normalized);
			} else {
				// Default template: 1 question per CO
				setQuestions(
					coRange.map((n) => ({
						question_number: n,
						question_text: `Rate your attainment for CO${n}`,
						co_number: n,
						mapping_weight: 1.0,
					})),
				);
			}
		} catch (err) {
			console.error("CourseSurveyConfig: Failed to load survey", err);
			toast.error("Failed to load survey configuration");
		} finally {
			setLoading(false);
		}
	};

	const addQuestion = () => {
		const nextNum = questions.length > 0 ? Math.max(...questions.map(q => q.question_number)) + 1 : 1;
		setQuestions([
			...questions,
			{ question_number: nextNum, question_text: "", co_number: 1, mapping_weight: 1.0 }
		]);
	};

	const removeQuestion = (idx: number) => {
		setQuestions((prev) =>
			prev
				.filter((_, i) => i !== idx)
				.map((q, i) => ({ ...q, question_number: i + 1 })),
		);
	};

	const updateQuestion = (idx: number, field: keyof CourseSurveyQuestion, value: string | number) => {
		setQuestions((prev) =>
			prev.map((q, i) => (i === idx ? { ...q, [field]: value } : q)),
		);
	};

	const handleSave = async () => {
		for (const q of questions) {
			if (!q.question_text.trim()) {
				toast.error(`Question ${q.question_number} is missing text`);
				return;
			}
			if (q.question_text.trim().length > 500) {
				toast.error(`Question ${q.question_number} text is too long (max 500 chars)`);
				return;
			}
			if (q.co_number < 1 || q.co_number > maxCoCount) {
				toast.error(`Question ${q.question_number} CO number must be between 1 and ${maxCoCount}`);
				return;
			}
			if (q.mapping_weight < 0 || q.mapping_weight > 1) {
				toast.error(`Question ${q.question_number} mapping weight must be between 0.0 and 1.0`);
				return;
			}
		}

		setSaving(true);
		try {
			await surveyApi.saveCourseExitQuestions(offeringId, questions);
			toast.success("Survey questions configured successfully");
			onConfigSaved?.();
		} catch (err) {
			console.error("CourseSurveyConfig: Failed to save", err);
			toast.error("Failed to save configuration");
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return <div className="text-muted-foreground p-4">Loading configuration...</div>;
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 15 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ type: "spring", duration: 0.5 }}
		>
			<Card className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 shadow-xl rounded-2xl overflow-hidden relative">
				<div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
				<CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-muted/20">
					<CardTitle className="text-base font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
						Survey Integration Console
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6 pt-6">
					<p className="text-xs text-muted-foreground leading-relaxed">
						Define the questions for this course's exit survey. The chronological order below corresponds to the column order in your Google Forms CSV export.
					</p>

					<div className="space-y-3 border rounded-xl p-4 bg-muted/15 dark:bg-zinc-900/10 border-muted/40 shadow-inner">
						<div className="grid grid-cols-[auto_1fr_120px_160px_auto] gap-4 items-center font-bold text-xs uppercase text-muted-foreground/80 tracking-wider mb-1 pb-2 border-b border-muted/20">
							<div className="w-8 text-center">#</div>
							<div>Question Text</div>
							<div className="text-center">Map to CO</div>
							<div className="text-center">Weight</div>
							<div className="w-8"></div>
						</div>
						
						<div className="space-y-3">
							<AnimatePresence initial={false}>
								{questions.map((q, idx) => (
									<motion.div 
										key={q.question_id ?? `q-${idx}`} 
										initial={{ opacity: 0, x: -10, scale: 0.98 }}
										animate={{ opacity: 1, x: 0, scale: 1 }}
										exit={{ opacity: 0, x: 10, scale: 0.95 }}
										transition={{ 
											type: "spring", 
											stiffness: 120, 
											damping: 14,
											delay: Math.min(idx * 0.04, 0.3)
										}}
										className="grid grid-cols-[auto_1fr_120px_160px_auto] gap-4 items-center bg-background/40 hover:bg-background/80 dark:bg-zinc-900/20 dark:hover:bg-zinc-900/40 p-2.5 rounded-xl border border-muted/20 hover:border-indigo-500/20 hover:shadow-sm transition-all duration-200"
									>
										<div className="w-8 text-center pt-0 font-bold text-sm text-muted-foreground/80">{q.question_number}</div>
										<div>
											<Input 
												value={q.question_text} 
												onChange={(e) => updateQuestion(idx, 'question_text', e.target.value)}
												placeholder="Rate your ability to..."
												className="h-9 rounded-lg bg-background/50 border-muted/60 focus-visible:ring-1 focus-visible:ring-indigo-500/30"
											/>
										</div>
										<div>
											<select 
												className="flex h-9 w-full items-center justify-between rounded-lg border border-muted/60 bg-background/50 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all font-semibold cursor-pointer"
												value={q.co_number}
												onChange={(e) => updateQuestion(idx, 'co_number', parseInt(e.target.value))}
											>
												{coRange.map(n => <option key={n} value={n} className="font-semibold text-foreground">CO{n}</option>)}
											</select>
										</div>
										<div className="flex items-center gap-2.5 px-1">
											<input 
												type="range"
												min="0"
												max="1"
												step="0.1"
												value={q.mapping_weight}
												onChange={(e) => updateQuestion(idx, 'mapping_weight', parseFloat(e.target.value))}
												className="w-full h-1.5 bg-muted dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-400"
											/>
											<span className="text-[11px] font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-md min-w-[36px] text-center shadow-sm">
												{(q.mapping_weight ?? 0).toFixed(1)}
											</span>
										</div>
										<div className="flex justify-center">
											<Button 
												variant="ghost" 
												size="icon" 
												className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg active:scale-95 duration-200 transition-all cursor-pointer border border-transparent hover:border-rose-500/10"
												onClick={() => removeQuestion(idx)}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</motion.div>
								))}
							</AnimatePresence>
						</div>
					</div>

					<div className="flex gap-2 justify-between items-center pt-2">
						<Button 
							variant="outline" 
							size="sm" 
							onClick={addQuestion}
							className="h-9 px-4 rounded-xl border-muted/80 bg-background/50 hover:bg-muted/50 text-foreground hover:scale-[1.02] active:scale-95 transition-all duration-200 font-semibold"
						>
							<Plus className="w-4 h-4 mr-2 text-indigo-500" /> Add Question
						</Button>
						<Button 
							onClick={handleSave} 
							disabled={saving}
							className="h-9 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all duration-200 font-semibold cursor-pointer"
						>
							{saving ? (
								"Saving..."
							) : (
								<>
									<Save className="w-4 h-4 mr-2" /> Save Configuration
								</>
							)}
						</Button>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}
