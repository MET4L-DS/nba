import { useState, useEffect } from "react";
import { toast } from "sonner";
import { facultyApi } from "@/services/api/faculty";
import type { EnrolledStudent, UpdateStudentRequest } from "@/services/api";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { STATUS_OPTIONS } from "../constants";

interface EditStudentDialogProps {
	student: EnrolledStudent | null;
	onClose: () => void;
	onSuccess: (updatedStudent: Partial<EnrolledStudent>) => void;
}

export function EditStudentDialog({
	student,
	onClose,
	onSuccess,
}: EditStudentDialogProps) {
	const [editForm, setEditForm] = useState<UpdateStudentRequest>({});
	const [editSaving, setEditSaving] = useState(false);

	interface ParsedEnrollment {
		offeringId: number;
		courseCode: string;
		isRepeater: boolean;
	}

	const [enrollments, setEnrollments] = useState<ParsedEnrollment[]>([]);
	const [initialEnrollments, setInitialEnrollments] = useState<ParsedEnrollment[]>([]);

	useEffect(() => {
		if (student?.enrollment_details) {
			const parsed = student.enrollment_details.split(", ").map((item) => {
				const [offeringIdStr, courseCode, isRepeaterStr] = item.split(":");
				return {
					offeringId: parseInt(offeringIdStr, 10),
					courseCode,
					isRepeater: isRepeaterStr === "1",
				};
			});
			setEnrollments(parsed);
			setInitialEnrollments(parsed);
		} else {
			setEnrollments([]);
			setInitialEnrollments([]);
		}
	}, [student]);

	const handleRepeaterToggle = (offeringId: number, nextIsRepeater: boolean) => {
		setEnrollments((prev) =>
			prev.map((e) =>
				e.offeringId === offeringId ? { ...e, isRepeater: nextIsRepeater } : e
			)
		);
	};

	useEffect(() => {
		if (student) {
			setEditForm({
				student_name: student.student_name,
				email: student.email ?? "",
				phones: student.phones?.length ? student.phones : [],
				student_status: student.student_status,
				batch_year: student.batch_year,
			});
		} else {
			setEditForm({});
		}
	}, [student]);

	const handleEditSave = async () => {
		if (!student) return;

		const validPhones = (editForm.phones || []).filter(
			(p) => p.trim() !== "",
		);
		if (
			validPhones.length > 0 &&
			validPhones.some((p) => !/^\d{10}$/.test(p))
		) {
			toast.error("Phone number must be exactly 10 digits");
			return;
		}

		// Identify modified enrollments
		const modifiedEnrollments = enrollments.filter((e) => {
			const init = initialEnrollments.find((i) => i.offeringId === e.offeringId);
			return init ? init.isRepeater !== e.isRepeater : false;
		});

		setEditSaving(true);
		try {
			// 1. Update Student Profile Info
			const dataToSave = {
				...editForm,
				phones: validPhones,
				phone: validPhones.length > 0 ? validPhones[0] : null,
			};
			await facultyApi.updateStudent(student.roll_no, dataToSave);

			// 2. Update Cohorts/Repeaters (only if changed)
			if (modifiedEnrollments.length > 0) {
				await Promise.all(
					modifiedEnrollments.map((e) =>
						facultyApi.updateEnrollment(e.offeringId, student.roll_no, e.isRepeater)
					)
				);
			}

			// 3. Prepare updated client side representation
			const newDetails = enrollments
				.map((e) => `${e.offeringId}:${e.courseCode}:${e.isRepeater ? 1 : 0}`)
				.join(", ");
			
			const courses = student.enrolled_courses.split(", ").map((courseStr) => {
				const currentEnr = enrollments.find((e) =>
					courseStr.startsWith(e.courseCode + ":")
				);
				if (currentEnr) {
					const clean = courseStr.endsWith(" [Repeater]")
						? courseStr.slice(0, -11)
						: courseStr;
					return currentEnr.isRepeater ? `${clean} [Repeater]` : clean;
				}
				return courseStr;
			});
			const newCoursesStr = courses.join(", ");

			toast.success("Student updated successfully");
			onSuccess({
				roll_no: student.roll_no,
				student_name: editForm.student_name ?? student.student_name,
				email:
					(editForm.email as string | null | undefined) ??
					student.email,
				phones: dataToSave.phones.length
					? dataToSave.phones
					: student.phones || [],
				student_status:
					editForm.student_status ?? student.student_status,
				batch_year: editForm.batch_year ?? student.batch_year,
				enrollment_details: newDetails,
				enrolled_courses: newCoursesStr,
			});
			onClose();
		} catch (error) {
			toast.error("Failed to update student");
		} finally {
			setEditSaving(false);
		}
	};

	return (
		<Dialog
			open={!!student}
			onOpenChange={(open: boolean) => !open && onClose()}
		>
			<DialogContent className="max-w-md bg-background/95 backdrop-blur-md border border-muted/50 shadow-2xl rounded-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col">
				<div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-violet-500 via-indigo-500 to-transparent" />
				<DialogHeader className="shrink-0">
					<DialogTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
						Edit Student Info
					</DialogTitle>
					<p className="text-xs text-indigo-500 font-semibold uppercase tracking-wider mt-0.5">
						Roll No: {student?.roll_no}
					</p>
				</DialogHeader>

				<div className="space-y-4 py-3 flex-1 overflow-y-auto pr-1 min-h-0">
					<div className="space-y-1.5">
						<Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
						<Input
							value={editForm.student_name ?? ""}
							onChange={(e) =>
								setEditForm((f) => ({
									...f,
									student_name: e.target.value,
								}))
							}
							className="rounded-xl border-muted/65 bg-background/50 focus-visible:ring-violet-500/25 h-10"
						/>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-1.5">
							<Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</Label>
							<Input
								type="email"
								value={editForm.email ?? ""}
								onChange={(e) =>
									setEditForm((f) => ({
										...f,
										email: e.target.value || null,
									}))
								}
								className="rounded-xl border-muted/65 bg-background/50 focus-visible:ring-violet-500/25 h-10"
							/>
						</div>
						<div className="space-y-1.5">
							<Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phones</Label>
							{(editForm.phones?.length
								? editForm.phones
								: [""]
							).map((phone, index, arr) => (
								<div key={index} className="flex gap-2 mb-2">
									<Input
										type="tel"
										maxLength={10}
										pattern="\d{10}"
										value={phone}
										placeholder="10-digit phone"
										onChange={(e) => {
											const val = e.target.value.replace(
												/\D/g,
												"",
											);
											const newPhones = [...arr];
											newPhones[index] = val;
											setEditForm((f) => ({
												...f,
												phones: newPhones,
											}));
										}}
										className="rounded-xl border-muted/65 bg-background/50 focus-visible:ring-violet-500/25 h-10"
									/>
									{arr.length > 1 && (
										<Button
											type="button"
											variant="ghost"
											size="icon"
											className="shrink-0 text-destructive hover:bg-destructive/10 rounded-xl"
											onClick={() => {
												const newPhones = arr.filter(
													(_, i) => i !== index,
												);
												setEditForm((f) => ({
													...f,
													phones: newPhones,
												}));
											}}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									)}
								</div>
							))}
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="mt-1 flex items-center gap-1 w-full border-dashed rounded-xl active:scale-95 duration-200 transition-all font-semibold text-xs py-2"
								onClick={() => {
									setEditForm((f) => ({
										...f,
										phones: [...(f.phones || []), ""],
									}));
								}}
							>
								<Plus className="h-3.5 w-3.5 text-violet-500" />
								Add Phone Number
							</Button>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-1.5">
							<Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Batch Year</Label>
							<Input
								type="number"
								value={editForm.batch_year ?? ""}
								onChange={(e) =>
									setEditForm((f) => ({
										...f,
										batch_year: e.target.value
											? Number(e.target.value)
											: undefined,
									}))
								}
								className="rounded-xl border-muted/65 bg-background/50 focus-visible:ring-violet-500/25 h-10"
							/>
						</div>
						<div className="space-y-1.5">
							<Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</Label>
							<Select
								value={editForm.student_status ?? "Active"}
								onValueChange={(v) =>
									setEditForm((f) => ({
										...f,
										student_status: v,
									}))
								}
							>
								<SelectTrigger className="rounded-xl border-muted/65 bg-background/50 focus:ring-violet-500/20 h-10">
									<SelectValue />
								</SelectTrigger>
								<SelectContent className="rounded-xl">
									{STATUS_OPTIONS.map((s) => (
										<SelectItem key={s} value={s}>
											{s}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
					{enrollments.length > 0 && (
						<div className="space-y-2 pt-2 border-t border-muted/40">
							<Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Course Cohorts (Mark Repeaters)</Label>
							<div className="space-y-2 bg-muted/20 p-3 rounded-xl border border-muted/50 max-h-[160px] overflow-y-auto">
								{enrollments.map((enr) => (
									<div key={enr.offeringId} className="flex items-center justify-between py-0.5">
										<span className="text-xs font-semibold text-foreground/80 font-mono bg-violet-500/5 px-2 py-0.5 rounded border border-violet-500/10">{enr.courseCode}</span>
										<Select
											value={enr.isRepeater ? "repeater" : "regular"}
											onValueChange={(val) => handleRepeaterToggle(enr.offeringId, val === "repeater")}
										>
											<SelectTrigger className="w-[110px] h-8 text-xs rounded-lg bg-background/50 border-muted/60">
												<SelectValue />
											</SelectTrigger>
											<SelectContent className="rounded-lg">
												<SelectItem value="regular" className="text-xs">Regular</SelectItem>
												<SelectItem value="repeater" className="text-xs text-rose-500 font-medium">Repeater</SelectItem>
											</SelectContent>
										</Select>
									</div>
								))}
							</div>
						</div>
					)}
				</div>

				<DialogFooter className="mt-4 gap-2 shrink-0">
					<Button
						variant="outline"
						onClick={onClose}
						disabled={editSaving}
						className="rounded-xl active:scale-95 duration-200 transition-all font-semibold"
					>
						Cancel
					</Button>
					<Button 
						onClick={handleEditSave} 
						disabled={editSaving}
						className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-md shadow-violet-600/10 active:scale-95 duration-200 transition-all"
					>
						{editSaving ? "Saving…" : "Save Changes"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
