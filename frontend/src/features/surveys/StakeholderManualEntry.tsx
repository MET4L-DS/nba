import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Save, Trash2 } from "lucide-react";
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

	useEffect(() => {
		surveyApi.getStakeholderManualEntries(programmeId, batchYear, stakeholderType).then((data) => {
			setQuestions(data.questions ?? []);
			setRespondents(data.respondents?.length ? data.respondents : [blankRespondent(1)]);
		});
	}, [programmeId, batchYear, stakeholderType]);

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
		const payload = respondents.flatMap((respondent, index) => questions
			.filter((question) => question.question_id && respondent.responses[String(question.question_id)])
			.map((question) => ({
				respondent_identifier: respondent.respondent_identifier || `manual-${index + 1}`,
				respondent_name: respondent.respondent_name,
				qualification: respondent.qualification,
				question_id: Number(question.question_id),
				likert_rating: Number(respondent.responses[String(question.question_id)]),
			})));

		setSaving(true);
		try {
			await surveyApi.saveStakeholderManualEntries(programmeId, batchYear, stakeholderType, payload);
			toast.success("Manual responses saved");
			onSaved?.();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to save responses");
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="p-4">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle className="text-base">Manual Stakeholder Entry</CardTitle>
					<div className="flex gap-2">
						<Button variant="outline" size="sm" onClick={() => setRespondents((rows) => [...rows, blankRespondent(rows.length + 1)])}>
							<Plus className="w-4 h-4 mr-1" /> Add Row
						</Button>
						<Button size="sm" onClick={save} disabled={saving || questions.length === 0}>
							<Save className="w-4 h-4 mr-1" /> Save
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{questions.length === 0 ? (
						<div className="py-10 text-center text-muted-foreground">Configure survey questions before entering responses.</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b bg-muted/50">
										<th className="px-2 py-2 text-left min-w-40">Name</th>
										<th className="px-2 py-2 text-left min-w-36">Qualification</th>
										{questions.map((question) => <th key={question.question_id} className="px-2 py-2 text-center min-w-20">Q{question.question_number}<div className="text-xs text-muted-foreground">{question.po_name}</div></th>)}
										<th className="px-2 py-2" />
									</tr>
								</thead>
								<tbody>
									{respondents.map((respondent, index) => (
										<tr key={index} className="border-b">
											<td className="px-2 py-2"><Input value={respondent.respondent_name} onChange={(e) => updateRespondent(index, { respondent_name: e.target.value, respondent_identifier: e.target.value || `manual-${index + 1}` })} /></td>
											<td className="px-2 py-2"><Input value={respondent.qualification} onChange={(e) => updateRespondent(index, { qualification: e.target.value })} /></td>
											{questions.map((question) => <td key={question.question_id} className="px-2 py-2"><select className="h-9 w-full rounded-md border bg-background px-2" value={respondent.responses[String(question.question_id)] ?? ""} onChange={(e) => updateRating(index, Number(question.question_id), Number(e.target.value))}><option value="">-</option><option value="5">5</option><option value="4">4</option><option value="3">3</option><option value="2">2</option><option value="1">1</option></select></td>)}
											<td className="px-2 py-2"><Button variant="ghost" size="icon" onClick={() => setRespondents((rows) => rows.filter((_, i) => i !== index))}><Trash2 className="w-4 h-4" /></Button></td>
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
