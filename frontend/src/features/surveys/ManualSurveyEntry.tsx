import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { toast } from "sonner";
import { Save } from "lucide-react";
import { surveyApi } from "@/services/api/surveys";
import type { CourseSurveyQuestion, SurveyEnrollment } from "@/services/api";

interface ManualSurveyEntryProps {
	offeringId: number;
	onSaved?: () => void;
}

const LIKERT_OPTIONS = [
	{ value: "5", label: "5 - Strongly Agree" },
	{ value: "4", label: "4 - Agree" },
	{ value: "3", label: "3 - Neutral" },
	{ value: "2", label: "2 - Disagree" },
	{ value: "1", label: "1 - Strongly Disagree" },
];

const MotionCard = motion(Card);
const MotionButton = motion(Button);

export function ManualSurveyEntry({ offeringId, onSaved }: ManualSurveyEntryProps) {
	const [enrollments, setEnrollments] = useState<SurveyEnrollment[]>([]);
	const [questions, setQuestions] = useState<CourseSurveyQuestion[]>([]);
	const [entries, setEntries] = useState<Record<string, Record<number, string>>>({});
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	const hasConfig = questions.length > 0;

	const loadData = useCallback(async () => {
		setLoading(true);
		try {
			const data = await surveyApi.getCourseExitEnrollments(offeringId);
			setEnrollments(data.enrollments ?? []);
			setQuestions(data.questions ?? []);

			const initial: Record<string, Record<number, string>> = {};
			for (const e of data.enrollments ?? []) {
				initial[e.roll_no] = {};
				for (const q of data.questions ?? []) {
					if (q.question_id == null) continue;
					const qid = q.question_id;
					const existing = e.responses[qid];
					initial[e.roll_no][qid] = existing !== undefined ? String(existing) : "";
				}
			}
			setEntries(initial);
		} catch (err) {
			console.error("ManualSurveyEntry: Failed to load enrollment data", err);
			toast.error("Failed to load enrollment data");
		} finally {
			setLoading(false);
		}
	}, [offeringId]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	const updateEntry = (rollNo: string, questionId: number, value: string) => {
		setEntries((prev) => ({
			...prev,
			[rollNo]: { ...prev[rollNo], [questionId]: value },
		}));
	};

	const handleSave = async () => {
		const responses: Array<{ student_rollno: string; question_id: number; likert_rating: number }> = [];
		for (const [rollNo, ratings] of Object.entries(entries)) {
			for (const [qIdStr, val] of Object.entries(ratings)) {
				if (val === "" || val === undefined) continue;
				const num = parseInt(val, 10);
				if (num >= 1 && num <= 5) {
					responses.push({ student_rollno: rollNo, question_id: parseInt(qIdStr), likert_rating: num });
				}
			}
		}

		if (responses.length === 0) {
			toast.error("No entries to save");
			return;
		}

		setSaving(true);
		try {
			const result = await surveyApi.saveManualResponses(offeringId, responses);
			toast.success(`Saved ${result.imported_count} responses`);
			onSaved?.();
		} catch (err) {
			console.error("ManualSurveyEntry: Failed to save responses", err);
			toast.error("Failed to save responses");
		} finally {
			setSaving(false);
		}
	};

	const tableBodyVariants = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				staggerChildren: 0.03,
			},
		},
	};

	const rowVariants = {
		hidden: { opacity: 0, y: 10 },
		show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 280, damping: 22 } },
	};

	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center p-12 text-muted-foreground gap-3">
				<div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
				<p className="text-sm font-medium animate-pulse">Loading enrollments...</p>
			</div>
		);
	}

	if (!hasConfig) {
		return (
			<MotionCard
				initial={{ opacity: 0, scale: 0.98 }}
				animate={{ opacity: 1, scale: 1 }}
				className="bg-card/75 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-md"
			>
				<CardHeader className="border-b bg-muted/[0.05]"><CardTitle className="text-base font-bold text-foreground/80">Manual Data Entry</CardTitle></CardHeader>
				<CardContent className="pt-6">
					<p className="text-sm text-amber-600 dark:text-amber-400 font-medium">⚠️ Configure survey questions first before entering data.</p>
				</CardContent>
			</MotionCard>
		);
	}

	if (enrollments.length === 0) {
		return (
			<MotionCard
				initial={{ opacity: 0, scale: 0.98 }}
				animate={{ opacity: 1, scale: 1 }}
				className="bg-card/75 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-md"
			>
				<CardHeader className="border-b bg-muted/[0.05]"><CardTitle className="text-base font-bold text-foreground/80">Manual Data Entry</CardTitle></CardHeader>
				<CardContent className="pt-6">
					<p className="text-sm text-muted-foreground font-medium">🚫 No students enrolled in this course.</p>
				</CardContent>
			</MotionCard>
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
					Manual Data Entry
				</CardTitle>
				<MotionButton
					onClick={handleSave}
					disabled={saving}
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
					className="bg-primary text-primary-foreground font-semibold shadow-sm rounded-lg"
				>
					<Save className="w-4 h-4 mr-2" />
					{saving ? "Saving..." : "Save All Responses"}
				</MotionButton>
			</CardHeader>
			<CardContent className="pt-6 overflow-x-auto">
				<table className="w-full text-sm whitespace-nowrap">
					<thead>
						<tr className="border-b bg-muted/30">
							<th className="text-left py-2.5 px-3 sticky left-0 bg-background/95 backdrop-blur z-10 font-bold text-foreground/85">S.No</th>
							<th className="text-left py-2.5 px-3 sticky left-10 bg-background/95 backdrop-blur z-10 font-bold text-foreground/85">Student</th>
							{questions.map((q, qi) => (
								<th key={q.question_id ?? `q-${qi}`} className="text-center py-2.5 px-3 min-w-[130px] font-bold text-foreground/80">
									<div className="text-xs font-bold">Q{q.question_number}</div>
									<div className="text-[10px] font-normal text-muted-foreground truncate max-w-[130px] mt-0.5" title={q.question_text}>
										{q.question_text}
									</div>
									<div className="text-[10px] font-semibold text-primary mt-0.5">
										CO{q.co_number} <span className="opacity-60">(w={Number(q.mapping_weight || 0).toFixed(1)})</span>
									</div>
								</th>
							))}
						</tr>
					</thead>
					<motion.tbody
						variants={tableBodyVariants}
						initial="hidden"
						animate="show"
						className="divide-y divide-muted/20"
					>
						{enrollments.map((e, idx) => (
							<motion.tr
								key={e.roll_no}
								variants={rowVariants}
								className="hover:bg-muted/10 transition-colors"
							>
								<td className="py-2.5 px-3 text-muted-foreground text-xs sticky left-0 bg-background/95 backdrop-blur z-10 border-r border-muted/10">{idx + 1}</td>
								<td className="py-2.5 px-3 font-medium text-xs sticky left-10 bg-background/95 backdrop-blur z-10 border-r border-muted/10">
									<div className="font-bold text-foreground/90">{e.roll_no}</div>
									<div className="text-muted-foreground text-[10px] font-normal mt-0.5">{e.student_name}</div>
								</td>
								{questions.map((q) => {
									if (q.question_id == null) return null;
									const qid = q.question_id;
									const val = entries[e.roll_no]?.[qid] ?? "";
									return (
										<td key={qid} className="py-2 px-3 text-center">
											<motion.select
												whileHover={{ scale: 1.05 }}
												whileFocus={{ scale: 1.05 }}
												className="h-8 w-24 rounded-md border border-muted/80 bg-background/50 px-2 text-xs text-center shadow-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all font-medium cursor-pointer"
												value={val}
												onChange={(ev) => updateEntry(e.roll_no, qid, ev.target.value)}
											>
												<option value="">—</option>
												{LIKERT_OPTIONS.map((opt) => (
													<option key={opt.value} value={opt.value} className="text-left font-medium">{opt.label}</option>
												))}
											</motion.select>
										</td>
									);
								})}
							</motion.tr>
						))}
					</motion.tbody>
				</table>
				<div className="mt-6 flex justify-end gap-2 border-t pt-4 border-muted/30">
					<MotionButton
						onClick={handleSave}
						disabled={saving}
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						className="bg-primary text-primary-foreground font-semibold shadow-md rounded-lg px-6 h-10"
					>
						<Save className="w-4 h-4 mr-2" />
						{saving ? "Saving..." : "Save All Responses"}
					</MotionButton>
				</div>
			</CardContent>
		</MotionCard>
	);
}

