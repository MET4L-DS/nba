import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { actionPlanApi } from "@/services/api/actionPlans";
import { debugLogger } from "@/lib/debugLogger";
import { Plus, Pencil, Trash2, ClipboardCheck, X } from "lucide-react";
import type { ActionPlan } from "@/services/api";

interface ActionPlansSectionProps {
	programmeId: number;
	batchYear: string;
}

const STATUS_COLORS: Record<string, string> = {
	Open: "bg-yellow-100 text-yellow-800 border-yellow-300",
	"In Progress": "bg-blue-100 text-blue-800 border-blue-300",
	Completed: "bg-green-100 text-green-800 border-green-300",
};

export function ActionPlansSection({
	programmeId,
	batchYear,
}: ActionPlansSectionProps) {
	const [plans, setPlans] = useState<ActionPlan[]>([]);
	const [loading, setLoading] = useState(false);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editing, setEditing] = useState<ActionPlan | null>(null);
	const [form, setForm] = useState({
		po_name: "",
		gap_description: "",
		action_text: "",
		responsible_person: "",
		target_date: "",
	});

	const year = parseInt(batchYear, 10);

	const loadPlans = useCallback(async () => {
		if (!programmeId || !year) return;
		setLoading(true);
		try {
			const plans = await actionPlanApi.listByProgramme(programmeId, year);
			setPlans(plans);
		} catch (err) {
			debugLogger.error("ActionPlansSection", "Failed to load", err);
		} finally {
			setLoading(false);
		}
	}, [programmeId, year]);

	useEffect(() => {
		loadPlans();
	}, [loadPlans]);

	const resetForm = () => {
		setForm({
			po_name: "",
			gap_description: "",
			action_text: "",
			responsible_person: "",
			target_date: "",
		});
		setEditing(null);
		setIsFormOpen(false);
	};

	const openEdit = (plan: ActionPlan) => {
		setEditing(plan);
		setForm({
			po_name: plan.po_name ?? "",
			gap_description: plan.gap_description,
			action_text: plan.action_text,
			responsible_person: plan.responsible_person ?? "",
			target_date: plan.target_date ?? "",
		});
		setIsFormOpen(true);
	};

	const handleSave = async () => {
		if (!form.gap_description || !form.action_text) {
			toast.error("Gap description and action text are required");
			return;
		}
		try {
			if (editing) {
				await actionPlanApi.update(editing.id, form);
				toast.success("Action plan updated");
			} else {
				await actionPlanApi.create(programmeId, {
					...form,
					batch_year: year,
				});
				toast.success("Action plan created");
			}
			resetForm();
			loadPlans();
		} catch {
			toast.error("Failed to save action plan");
		}
	};

	const handleDelete = async (id: number) => {
		if (!confirm("Delete this action plan?")) return;
		try {
			await actionPlanApi.delete(id);
			toast.success("Action plan deleted");
			loadPlans();
		} catch {
			toast.error("Failed to delete action plan");
		}
	};

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
				<CardTitle className="text-base flex items-center gap-2">
					<ClipboardCheck className="h-5 w-5 text-primary" />
					Action Plans & Interventions
				</CardTitle>
				{!isFormOpen && (
					<Button size="sm" onClick={() => setIsFormOpen(true)}>
						<Plus className="w-4 h-4 mr-1" />
						Add Plan
					</Button>
				)}
			</CardHeader>
			<CardContent className="pt-4">
				{isFormOpen && (
					<Card className="mb-6 border-primary/20 bg-primary/5 shadow-sm">
						<CardHeader className="pb-3 flex flex-row items-center justify-between">
							<CardTitle className="text-sm font-semibold">
								{editing ? "Edit Action Plan" : "New Action Plan"}
							</CardTitle>
							<Button variant="ghost" size="icon" className="h-8 w-8 -mr-2" onClick={resetForm}>
								<X className="h-4 w-4" />
							</Button>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-1">
								<Label>PO/PSO (optional)</Label>
								<Input
									value={form.po_name}
									onChange={(e) =>
										setForm((f) => ({ ...f, po_name: e.target.value }))
									}
									placeholder="e.g. PO1"
									className="bg-background"
								/>
							</div>
							<div className="space-y-1">
								<Label>Gap Description *</Label>
								<Textarea
									value={form.gap_description}
									onChange={(e) =>
										setForm((f) => ({
											...f,
											gap_description: e.target.value,
										}))
									}
									placeholder="Describe the gap..."
									className="bg-background"
								/>
							</div>
							<div className="space-y-1">
								<Label>Action Text *</Label>
								<Textarea
									value={form.action_text}
									onChange={(e) =>
										setForm((f) => ({
											...f,
											action_text: e.target.value,
										}))
									}
									placeholder="Describe the action to take..."
									className="bg-background"
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-1">
									<Label>Responsible Person</Label>
									<Input
										value={form.responsible_person}
										onChange={(e) =>
											setForm((f) => ({
												...f,
												responsible_person: e.target.value,
											}))
										}
										placeholder="Name"
										className="bg-background"
									/>
								</div>
								<div className="space-y-1">
									<Label>Target Date</Label>
									<Input
										type="date"
										value={form.target_date}
										onChange={(e) =>
											setForm((f) => ({
												...f,
												target_date: e.target.value,
											}))
										}
										className="bg-background"
									/>
								</div>
							</div>
						</CardContent>
						<CardFooter className="flex justify-end gap-2 pt-0">
							<Button variant="outline" onClick={resetForm}>
								Cancel
							</Button>
							<Button onClick={handleSave}>
								{editing ? "Update Action Plan" : "Save Action Plan"}
							</Button>
						</CardFooter>
					</Card>
				)}

				{loading ? (
					<div className="flex items-center justify-center p-6 text-muted-foreground">
						<p className="text-sm animate-pulse">Loading action plans...</p>
					</div>
				) : plans.length === 0 ? (
					!isFormOpen && (
						<div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
							<p className="text-sm mb-2">No action plans yet for this batch.</p>
							<Button variant="outline" size="sm" onClick={() => setIsFormOpen(true)}>
								Create your first plan
							</Button>
						</div>
					)
				) : (
					<div className="space-y-4">
						{plans.map((plan) => (
							<Card key={plan.id} className="overflow-hidden hover:shadow-md transition-shadow">
								<div className="p-4 flex flex-col md:flex-row gap-4 justify-between items-start">
									<div className="space-y-3 flex-1 min-w-0">
										<div className="flex items-center gap-2 flex-wrap">
											{plan.po_name && (
												<Badge variant="secondary" className="font-mono bg-slate-100 text-slate-800 hover:bg-slate-200">
													{plan.po_name}
												</Badge>
											)}
											<Badge
												variant="outline"
												className={STATUS_COLORS[plan.status] ?? ""}
											>
												{plan.status}
											</Badge>
										</div>
										
										<div>
											<h4 className="text-sm font-semibold text-foreground/90 leading-tight">
												{plan.gap_description}
											</h4>
											<p className="text-sm text-muted-foreground mt-1">
												{plan.action_text}
											</p>
										</div>
										
										<div className="flex flex-wrap gap-x-6 gap-y-2 mt-2">
											{plan.responsible_person && (
												<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
													<span className="font-medium text-foreground/70">Responsible:</span>
													{plan.responsible_person}
												</div>
											)}
											{plan.target_date && (
												<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
													<span className="font-medium text-foreground/70">Target:</span>
													{plan.target_date}
												</div>
											)}
										</div>
									</div>
									<div className="flex md:flex-col gap-2 shrink-0 self-start md:self-stretch md:justify-start">
										<Button
											variant="secondary"
											size="sm"
											className="h-8"
											onClick={() => openEdit(plan)}
										>
											<Pencil className="h-3.5 w-3.5 mr-1" /> Edit
										</Button>
										<Button
											variant="destructive"
											size="sm"
											className="h-8 md:mt-auto"
											onClick={() => handleDelete(plan.id)}
										>
											<Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
										</Button>
									</div>
								</div>
							</Card>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
