import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
	Open: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20 dark:border-yellow-500/30",
	"In Progress": "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 dark:border-blue-500/30",
	Completed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/30",
};

const MotionCard = motion(Card);
const MotionButton = motion(Button);

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

	const listVariants = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				staggerChildren: 0.08,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 15 },
		show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 20 } },
	};

	return (
		<Card className="bg-card/75 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-md">
			<CardHeader className="flex flex-row items-center justify-between pb-4 border-b bg-muted/[.1]">
				<CardTitle className="text-base font-bold flex items-center gap-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
					<div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
						<ClipboardCheck className="h-4.5 w-4.5 text-primary" />
					</div>
					Action Plans & Interventions
				</CardTitle>
				{!isFormOpen && (
					<MotionButton
						size="sm"
						onClick={() => setIsFormOpen(true)}
						whileHover={{ scale: 1.03 }}
						whileTap={{ scale: 0.97 }}
						className="bg-primary shadow-sm font-semibold"
					>
						<Plus className="w-4 h-4 mr-1" />
						Add Plan
					</MotionButton>
				)}
			</CardHeader>
			<CardContent className="pt-6">
				<AnimatePresence mode="popLayout">
					{isFormOpen && (
						<motion.div
							initial={{ opacity: 0, y: -20, scale: 0.98 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: -20, scale: 0.98 }}
							transition={{ type: "spring" as const, stiffness: 285, damping: 22 }}
							className="mb-6 overflow-hidden"
						>
							<Card className="border-primary/20 bg-primary/5 dark:bg-primary/[0.02] shadow-sm rounded-xl">
								<CardHeader className="pb-3 flex flex-row items-center justify-between">
									<CardTitle className="text-sm font-bold text-primary">
										{editing ? "✏️ Edit Action Plan" : "✨ New Action Plan"}
									</CardTitle>
									<Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground hover:bg-muted/80 rounded-full" onClick={resetForm}>
										<X className="h-4 w-4" />
									</Button>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="space-y-1.5">
										<Label className="font-semibold text-xs text-foreground/80">PO/PSO (optional)</Label>
										<Input
											value={form.po_name}
											onChange={(e) =>
												setForm((f) => ({ ...f, po_name: e.target.value }))
											}
											placeholder="e.g. PO1"
											className="bg-background focus-visible:ring-indigo-500/30 transition-all font-mono"
										/>
									</div>
									<div className="space-y-1.5">
										<Label className="font-semibold text-xs text-foreground/80">Gap Description *</Label>
										<Textarea
											value={form.gap_description}
											onChange={(e) =>
												setForm((f) => ({
													...f,
													gap_description: e.target.value,
												}))
											}
											placeholder="Describe the gap..."
											className="bg-background min-h-[80px] focus-visible:ring-indigo-500/30 transition-all"
										/>
									</div>
									<div className="space-y-1.5">
										<Label className="font-semibold text-xs text-foreground/80">Action Text *</Label>
										<Textarea
											value={form.action_text}
											onChange={(e) =>
												setForm((f) => ({
													...f,
													action_text: e.target.value,
												}))
											}
											placeholder="Describe the action to take..."
											className="bg-background min-h-[80px] focus-visible:ring-indigo-500/30 transition-all"
										/>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-1.5">
											<Label className="font-semibold text-xs text-foreground/80">Responsible Person</Label>
											<Input
												value={form.responsible_person}
												onChange={(e) =>
													setForm((f) => ({
														...f,
														responsible_person: e.target.value,
													}))
												}
												placeholder="Name"
												className="bg-background focus-visible:ring-indigo-500/30 transition-all"
											/>
										</div>
										<div className="space-y-1.5">
											<Label className="font-semibold text-xs text-foreground/80">Target Date</Label>
											<Input
												type="date"
												value={form.target_date}
												onChange={(e) =>
													setForm((f) => ({
														...f,
														target_date: e.target.value,
													}))
												}
												className="bg-background focus-visible:ring-indigo-500/30 transition-all cursor-pointer"
											/>
										</div>
									</div>
								</CardContent>
								<CardFooter className="flex justify-end gap-2 pt-0">
									<Button variant="outline" onClick={resetForm} className="font-medium rounded-lg h-9">
										Cancel
									</Button>
									<MotionButton
										onClick={handleSave}
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
										className="bg-primary text-primary-foreground font-semibold rounded-lg h-9"
									>
										{editing ? "Update Plan" : "Save Plan"}
									</MotionButton>
								</CardFooter>
							</Card>
						</motion.div>
					)}
				</AnimatePresence>

				{loading ? (
					<div className="flex flex-col items-center justify-center p-12 text-muted-foreground gap-3">
						<div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
						<p className="text-sm font-medium animate-pulse">Loading action plans...</p>
					</div>
				) : plans.length === 0 ? (
					!isFormOpen && (
						<motion.div
							initial={{ opacity: 0, scale: 0.98 }}
							animate={{ opacity: 1, scale: 1 }}
							className="text-center py-12 border-2 border-dashed border-muted/50 rounded-xl text-muted-foreground bg-muted/[0.05]"
						>
							<ClipboardCheck className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
							<p className="text-sm font-medium mb-3">No action plans yet for this batch.</p>
							<MotionButton
								variant="outline"
								size="sm"
								onClick={() => setIsFormOpen(true)}
								whileHover={{ scale: 1.03 }}
								whileTap={{ scale: 0.97 }}
								className="font-semibold shadow-sm border-primary/20 hover:border-primary/40 hover:bg-primary/5"
							>
								Create your first plan
							</MotionButton>
						</motion.div>
					)
				) : (
					<motion.div
						className="space-y-4"
						variants={listVariants}
						initial="hidden"
						animate="show"
					>
						{plans.map((plan) => (
							<MotionCard
								key={plan.id}
								variants={itemVariants}
								whileHover={{
									y: -4,
									boxShadow: "0 12px 24px -10px rgba(0, 0, 0, 0.08)",
									borderColor: "rgba(139, 92, 246, 0.3)",
								}}
								className="overflow-hidden border border-muted/50 bg-card hover:bg-muted/[0.01] transition-all duration-300 rounded-xl"
							>
								<div className="p-4 flex flex-col md:flex-row gap-4 justify-between items-start">
									<div className="space-y-3 flex-1 min-w-0">
										<div className="flex items-center gap-2 flex-wrap">
											{plan.po_name && (
												<Badge variant="secondary" className="font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 border border-slate-200/50">
													{plan.po_name}
												</Badge>
											)}
											<Badge
												variant="outline"
												className={`font-semibold border shadow-sm ${STATUS_COLORS[plan.status] ?? ""}`}
											>
												{plan.status}
											</Badge>
										</div>
										
										<div>
											<h4 className="text-sm font-bold text-foreground/90 leading-snug">
												{plan.gap_description}
											</h4>
											<p className="text-sm text-muted-foreground mt-1.5 leading-relaxed bg-muted/[0.03] p-2 rounded-lg border border-muted/[0.05]">
												{plan.action_text}
											</p>
										</div>
										
										<div className="flex flex-wrap gap-x-6 gap-y-2 pt-1 border-t border-muted/20">
											{plan.responsible_person && (
												<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
													<span className="font-semibold text-foreground/70">Responsible:</span>
													{plan.responsible_person}
												</div>
											)}
											{plan.target_date && (
												<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
													<span className="font-semibold text-foreground/70">Target:</span>
													{plan.target_date}
												</div>
											)}
										</div>
									</div>
									<div className="flex md:flex-col gap-2 shrink-0 self-start md:self-stretch md:justify-start">
										<MotionButton
											variant="secondary"
											size="sm"
											className="h-8 shadow-sm font-medium hover:bg-muted"
											onClick={() => openEdit(plan)}
											whileHover={{ scale: 1.03 }}
											whileTap={{ scale: 0.97 }}
										>
											<Pencil className="h-3.5 w-3.5 mr-1 text-primary" /> Edit
										</MotionButton>
										<MotionButton
											variant="destructive"
											size="sm"
											className="h-8 md:mt-auto shadow-sm font-medium"
											onClick={() => handleDelete(plan.id)}
											whileHover={{ scale: 1.03 }}
											whileTap={{ scale: 0.97 }}
										>
											<Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
										</MotionButton>
									</div>
								</div>
							</MotionCard>
						))}
					</motion.div>
				)}
			</CardContent>
		</Card>
	);
}

