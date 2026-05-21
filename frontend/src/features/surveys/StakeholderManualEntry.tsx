import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Save, Trash2, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { surveyApi } from "@/services/api/surveys";
import type { StakeholderManualRespondent, StakeholderSurveyQuestion } from "@/services/api/types";

interface StakeholderManualEntryProps {
	programmeId: number;
	batchYear: number;
	stakeholderType: string;
	onSaved?: () => void;
}

export function StakeholderManualEntry({ programmeId, batchYear, stakeholderType, onSaved }: StakeholderManualEntryProps) {
	const [questions, setQuestions] = useState<StakeholderSurveyQuestion[]>([]);
	const [respondents, setRespondents] = useState<StakeholderManualRespondent[]>([]);
	const [saving, setSaving] = useState(false);
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);

	const loadData = useCallback(async () => {
		setLoading(true);
		setLoadError(null);
		try {
			const data = await surveyApi.getStakeholderManualEntries(programmeId, batchYear, stakeholderType);
			setQuestions(data.questions ?? []);
			setRespondents(data.respondents?.length > 0 ? data.respondents : [blankRespondent(1)]);
		} catch (e) {
			setLoadError(e instanceof Error ? e.message : "Failed to load manual entry data");
			toast.error("Failed to load survey configuration");
		} finally {
			setLoading(false);
		}
	}, [programmeId, batchYear, stakeholderType]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	const updateRespondent = (index: number, patch: Partial<StakeholderManualRespondent>) => {
		setRespondents((current) => current.map((row, i) => i === index ? { ...row, ...patch } : row));
	};

	const updateRating = (index: number, questionId: number, value: number) => {
		setRespondents((current) => current.map((row, i) => i === index ? {
			...row,
			responses: { ...row.responses, [questionId]: value },
		} : row));
	};

	const save = async () => {
		if (questions.length === 0) {
			toast.error("No questions configured");
			return;
		}

		const validRespondents = respondents.filter(r => r.respondent_name.trim());
		if (validRespondents.length === 0) {
			toast.error("Add at least one respondent with a name");
			return;
		}

		const payload = validRespondents.flatMap((respondent) => {
			const identifier = respondent.respondent_identifier || respondent.respondent_name.replace(/\s+/g, "_").toLowerCase();
			return questions
				.filter((question) => question.question_id && respondent.responses[String(question.question_id)] != null)
				.map((question) => ({
					respondent_identifier: identifier,
					respondent_name: respondent.respondent_name,
					qualification: respondent.qualification || null,
					question_id: Number(question.question_id),
					likert_rating: Number(respondent.responses[String(question.question_id)]),
				}));
		});

		if (payload.length === 0) {
			toast.error("No ratings entered");
			return;
		}

		setSaving(true);
		try {
			await surveyApi.saveStakeholderManualEntries(programmeId, batchYear, stakeholderType, payload);
			toast.success(`Saved ${payload.length} responses`);
			onSaved?.();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to save responses");
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="p-4 flex items-center justify-center text-muted-foreground gap-2">
				<RefreshCw className="w-4 h-4 animate-spin" />
				Loading manual entry data...
			</div>
		);
	}

	if (loadError) {
		return (
			<div className="p-4 flex items-start gap-2 text-red-500 bg-red-50 border border-red-200 rounded-lg">
				<AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
				<div>
					<p className="font-medium text-sm">Failed to load</p>
					<p className="text-xs mt-0.5">{loadError}</p>
					<Button variant="outline" size="sm" className="mt-2" onClick={loadData}>
						Retry
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="p-4">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between pb-3">
					<CardTitle className="text-base">Manual Stakeholder Entry</CardTitle>
					<div className="flex gap-2">
						<Button variant="outline" size="sm" onClick={() => setRespondents((rows) => [...rows, blankRespondent(rows.length + 1)])}>
							<Plus className="w-4 h-4 mr-1" /> Add Row
						</Button>
						<Button size="sm" onClick={save} disabled={saving || questions.length === 0}>
							{saving ? (
								<><RefreshCw className="w-4 h-4 mr-1 animate-spin" /> Saving...</>
							) : (
								<><Save className="w-4 h-4 mr-1" /> Save</>
							)}
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{questions.length === 0 ? (
						<div className="py-10 text-center text-muted-foreground">
							Configure survey questions in the Question Config tab before entering responses.
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-sm whitespace-nowrap">
								<thead>
									<tr className="border-b bg-muted/50">
										<th className="px-2 py-2 text-left min-w-40">Name</th>
										<th className="px-2 py-2 text-left min-w-32">Qualification</th>
										{questions.map((question) => (
											<th key={question.question_id ?? question.question_number} className="px-2 py-2 text-center min-w-20">
												Q{question.question_number}
												<div className="text-xs font-normal text-muted-foreground">{question.po_name}</div>
											</th>
										))}
										<th className="px-2 py-2 w-10" />
									</tr>
								</thead>
								<tbody>
									{respondents.map((respondent, index) => (
										<tr key={index} className="border-b hover:bg-muted/10">
											<td className="px-2 py-1.5">
												<Input
													value={respondent.respondent_name}
													onChange={(e) => updateRespondent(index, {
														respondent_name: e.target.value,
														respondent_identifier: e.target.value
															? e.target.value.replace(/\s+/g, "_").toLowerCase()
															: `manual-${index + 1}`,
													})}
													placeholder="Respondent name"
												/>
											</td>
											<td className="px-2 py-1.5">
												<Input
													value={respondent.qualification}
													onChange={(e) => updateRespondent(index, { qualification: e.target.value })}
													placeholder="e.g. Manager"
												/>
											</td>
											{questions.map((question) => (
												<td key={question.question_id ?? question.question_number} className="px-2 py-1.5">
													<select
														className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
														value={respondent.responses[String(question.question_id)] ?? ""}
														onChange={(e) => updateRating(index, Number(question.question_id), Number(e.target.value))}
													>
														<option value="">-</option>
														<option value="5">5 - Strongly Agree</option>
														<option value="4">4 - Agree</option>
														<option value="3">3 - Neutral</option>
														<option value="2">2 - Disagree</option>
														<option value="1">1 - Strongly Disagree</option>
													</select>
												</td>
											))}
											<td className="px-2 py-1.5">
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
													disabled={respondents.length <= 1}
													onClick={() => setRespondents((rows) => rows.filter((_, i) => i !== index))}
												>
													<Trash2 className="w-4 h-4" />
												</Button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function blankRespondent(index: number): StakeholderManualRespondent {
	return { respondent_identifier: `manual-${index}`, respondent_name: "", qualification: "", responses: {} };
}