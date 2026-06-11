import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export interface CourseFormData {
	course_code: string;
	name: string;
	credit: number;
	faculty_id: string;
	year: number;
	semester: string;
}

interface Faculty {
	employee_id: string;
	username: string;
	email: string;
	role: string;
}

interface CourseDialogProps {
	mode: "add" | "edit";
	open: boolean;
	onOpenChange: (open: boolean) => void;
	formData: CourseFormData;
	setFormData: (data: CourseFormData) => void;
	faculty: Faculty[];
	isLoadingFaculty: boolean;
	onSubmit: () => void;
	isSubmitting: boolean;
	onCancel: () => void;
	years: number[];
	semesters: readonly string[];
}

export function CourseDialog({
	mode,
	open,
	onOpenChange,
	formData,
	setFormData,
	faculty,
	isLoadingFaculty,
	onSubmit,
	isSubmitting,
	onCancel,
	years,
	semesters,
}: CourseDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="bg-card/90 backdrop-blur-lg border border-muted/50 rounded-2xl max-w-[500px] shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
				<DialogHeader className="shrink-0">
					<DialogTitle className="text-lg font-bold text-foreground">
						{mode === "add" ? "Add New Course" : "Edit Course"}
					</DialogTitle>
					<DialogDescription className="text-xs text-muted-foreground mt-1">
						{mode === "add"
							? "Create a new course for your department"
							: "Update course information"}
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4 py-4 flex-1 overflow-y-auto pr-1 min-h-0">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor={`${mode}_course_code`} className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
								Course Code *
							</Label>
							<Input
								id={`${mode}_course_code`}
								placeholder="e.g., CS301"
								value={formData.course_code}
								onChange={(e) =>
									setFormData({
										...formData,
										course_code: e.target.value.toUpperCase(),
									})
								}
								className="bg-background/60 shadow-inner focus-visible:ring-1 focus-visible:ring-amber-500/30 rounded-xl border-muted/50 transition-all font-mono"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor={`${mode}_credit`} className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Credits *</Label>
							<Select
								value={String(formData.credit)}
								onValueChange={(value) =>
									setFormData({
										...formData,
										credit: parseInt(value),
									})
								}
							>
								<SelectTrigger className="bg-background/60 shadow-inner focus:ring-1 focus:ring-amber-500/30 transition-all rounded-xl border-muted/50 h-10">
									<SelectValue />
								</SelectTrigger>
								<SelectContent className="bg-card/95 backdrop-blur-md border border-muted/50 rounded-xl">
									{[1, 2, 3, 4, 5, 6].map((c) => (
										<SelectItem key={c} value={String(c)} className="focus:bg-amber-500/10 focus:text-amber-600 dark:focus:text-amber-400 rounded-lg">
											{c} {c === 1 ? "Credit" : "Credits"}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor={`${mode}_name`} className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Course Name *</Label>
						<Input
							id={`${mode}_name`}
							placeholder="e.g., Database Management Systems"
							value={formData.name}
							onChange={(e) =>
								setFormData({
									...formData,
									name: e.target.value,
								})
							}
							className="bg-background/60 shadow-inner focus-visible:ring-1 focus-visible:ring-amber-500/30 rounded-xl border-muted/50 transition-all"
						/>
					</div>

					{mode === "add" && (
						<>
							<div className="space-y-2">
								<Label htmlFor={`${mode}_faculty`} className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
									Assign Faculty *
								</Label>
								<Select
									value={formData.faculty_id}
									onValueChange={(value) =>
										setFormData({
											...formData,
											faculty_id: value,
										})
									}
									disabled={isLoadingFaculty}
								>
									<SelectTrigger className="bg-background/60 shadow-inner focus:ring-1 focus:ring-amber-500/30 transition-all rounded-xl border-muted/50 h-10">
										<SelectValue
											placeholder={
												isLoadingFaculty
													? "Loading..."
													: "Select faculty member"
											}
										/>
									</SelectTrigger>
									<SelectContent className="bg-card/95 backdrop-blur-md border border-muted/50 rounded-xl">
										{faculty
											.filter(
												(f) =>
													f.role === "faculty" ||
													f.role === "hod",
											)
											.map((f) => (
												<SelectItem
													key={f.employee_id}
													value={f.employee_id}
													className="focus:bg-amber-500/10 focus:text-amber-600 dark:focus:text-amber-400 rounded-lg py-2"
												>
													<span className="font-semibold">{f.username}</span>
													{f.role === "hod" ? (
														<span className="text-xs text-amber-500 ml-2 font-bold bg-amber-500/10 px-1 py-0.5 rounded">HOD</span>
													) : null}
												</SelectItem>
											))}
									</SelectContent>
								</Select>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor={`${mode}_year`} className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
										Year *
									</Label>
									<Select
										value={String(formData.year)}
										onValueChange={(value) =>
											setFormData({
												...formData,
												year: parseInt(value),
											})
										}
									>
										<SelectTrigger className="bg-background/60 shadow-inner focus:ring-1 focus:ring-amber-500/30 transition-all rounded-xl border-muted/50 h-10">
											<SelectValue />
										</SelectTrigger>
										<SelectContent className="bg-card/95 backdrop-blur-md border border-muted/50 rounded-xl">
											{years.map((y) => (
												<SelectItem
													key={y}
													value={String(y)}
													className="focus:bg-amber-500/10 focus:text-amber-600 dark:focus:text-amber-400 rounded-lg"
												>
													{y}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label htmlFor={`${mode}_semester`} className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
										Semester *
									</Label>
									<Select
										value={formData.semester}
										onValueChange={(value) =>
											setFormData({
												...formData,
												semester: value,
											})
										}
									>
										<SelectTrigger className="bg-background/60 shadow-inner focus:ring-1 focus:ring-amber-500/30 transition-all rounded-xl border-muted/50 h-10">
											<SelectValue />
										</SelectTrigger>
										<SelectContent className="bg-card/95 backdrop-blur-md border border-muted/50 rounded-xl">
											{semesters.map((s) => (
												<SelectItem key={s} value={s} className="focus:bg-amber-500/10 focus:text-amber-600 dark:focus:text-amber-400 rounded-lg">
													{s} Semester
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
						</>
					)}
				</div>

				<DialogFooter className="mt-4 gap-2 shrink-0">
					<Button variant="outline" onClick={onCancel} className="bg-background/60 shadow-sm border-muted/50 rounded-xl active:scale-95 duration-200 transition-all font-semibold h-10 px-4">
						Cancel
					</Button>
					<Button
						onClick={onSubmit}
						disabled={isSubmitting}
						className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl active:scale-95 duration-200 transition-all border border-orange-500/30 shadow-md shadow-orange-500/10 h-10 px-6"
					>
						{isSubmitting ? (
							<div className="flex items-center gap-2">
								<div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
								<span>{mode === "add" ? "Creating..." : "Saving..."}</span>
							</div>
						) : (
							<span>{mode === "add" ? "Create Course" : "Save Changes"}</span>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
