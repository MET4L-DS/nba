import { useState, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { hodApi } from "@/services/api/hod";
import { staffApi } from "@/services/api/staff";
import { apiService } from "@/services/api";
import type { BaseCourse, Programme } from "@/services/api/types";
import { motion, AnimatePresence } from "framer-motion";


export interface CourseFormDialogProps {
	mode: "create" | "edit";
	courseType: "base" | "offering";
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (data: any) => Promise<void>;
	isLoading?: boolean;
	initialData?: any;
}

export function CourseFormDialog({
	mode,
	courseType,
	open,
	onOpenChange,
	onSave,
	isLoading = false,
	initialData,
}: CourseFormDialogProps) {
	const defaultFormData = {
		course_code: "",
		course_name: "",
		credit: "3",
		course_type: "Theory",
		course_level: "Undergraduate",
		is_active: true, // Base specific
		year: new Date().getFullYear().toString(), // Offering specific
		semester: "Autumn", // Offering specific
		faculty_id: "", // Offering specific
		co_threshold: "40", // Offering specific
		passing_threshold: "60", // Offering specific
	};

	const [formData, setFormData] = useState(defaultFormData);
	const [isCustomCredit, setIsCustomCredit] = useState(false);
	const [faculties, setFaculties] = useState<any[]>([]);
	const [isFetchingFaculties, setIsFetchingFaculties] = useState(false);
	const [baseCourses, setBaseCourses] = useState<BaseCourse[]>([]);
	const [isFetchingCourses, setIsFetchingCourses] = useState(false);
	const [selectedBaseCourseid, setSelectedBaseCourseid] = useState<
		number | null
	>(null);
	const [programmes, setProgrammes] = useState<Programme[]>([]);
	const [isFetchingProgrammes, setIsFetchingProgrammes] = useState(false);
	const [selectedProgrammeIds, setSelectedProgrammeIds] = useState<number[]>([]);
	const [programmeIdsModified, setProgrammeIdsModified] = useState(false);

	useEffect(() => {
		if (open) {
			if (initialData && mode === "edit") {
				const cred = (initialData.credit || 3).toString();
				setFormData({
					course_code: initialData.course_code || "",
					course_name:
						initialData.course_name || initialData.name || "",
					credit: cred,
					course_type: initialData.course_type || "Theory",
					course_level: initialData.course_level || "Undergraduate",
					is_active:
						initialData.is_active === undefined
							? true
							: initialData.is_active === 1,
					year: (
						initialData.year || new Date().getFullYear()
					).toString(),
					semester: initialData.semester || "Autumn",
					faculty_id: (initialData.faculty_id || "").toString(),
					co_threshold: (initialData.co_threshold || 40).toString(),
					passing_threshold: (
						initialData.passing_threshold || 60
					).toString(),
				});
				setIsCustomCredit(!["1", "2", "3", "4", "5", "6"].includes(cred));
				if (initialData.base_course_id) {
					setSelectedBaseCourseid(initialData.base_course_id);
				}
			} else if (
				initialData &&
				mode === "create" &&
				courseType === "offering"
			) {
				const cred = (initialData.credit || 3).toString();
				// prefill from base course when offering
				setFormData({
					...defaultFormData,
					course_code: initialData.course_code || "",
					course_name:
						initialData.course_name || initialData.name || "",
					credit: cred,
					course_type: initialData.course_type || "Theory",
					course_level: initialData.course_level || "Undergraduate",
				});
				setIsCustomCredit(!["1", "2", "3", "4", "5", "6"].includes(cred));
				if (initialData.course_id) {
					setSelectedBaseCourseid(initialData.course_id);
				}
			} else {
				setFormData(defaultFormData);
				setIsCustomCredit(false);
				setSelectedBaseCourseid(null);
			}

			const fetchData = async () => {
				const user = apiService.getStoredUser();
				const isStaff = user?.role === "staff";
				const currentApi = isStaff ? staffApi : hodApi;

				if (courseType === "offering") {
					setIsFetchingFaculties(true);
					try {
						const facultyResp = await currentApi.getDepartmentFaculty({
							limit: 100,
						});
						setFaculties(facultyResp.data);
					} catch (error) {
						console.error("Failed to fetch faculties:", error);
					} finally {
						setIsFetchingFaculties(false);
					}

					if (mode === "create") {
						setIsFetchingCourses(true);
						try {
							const courseResp = await currentApi.getBaseCourses({
								limit: 200,
							});
							setBaseCourses(courseResp.data || []);
						} catch (error) {
							console.error(
								"Failed to fetch base courses:",
								error,
							);
						} finally {
							setIsFetchingCourses(false);
						}
					}
				}

				if (courseType === "base") {
					setIsFetchingProgrammes(true);
					try {
						const progResp = await hodApi.getDepartmentProgrammes({
							limit: 100,
						});
						setProgrammes(progResp.data || []);
					} catch (error) {
						console.error("Failed to fetch programmes:", error);
					} finally {
						setIsFetchingProgrammes(false);
					}
					setSelectedProgrammeIds([]);
					setProgrammeIdsModified(false);
				}
			};
			fetchData();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, initialData, mode, courseType]);

	const handleSave = async () => {
		if (!formData.course_code || !formData.course_name) return;
		if (courseType === "offering" && !formData.faculty_id) return;

		let savePayload: any = {
			course_code: formData.course_code,
			credit: parseInt(formData.credit),
		};

		if (courseType === "base") {
			savePayload.course_name = formData.course_name;
			savePayload.course_type = formData.course_type;
			savePayload.course_level = formData.course_level;
			savePayload.is_active = formData.is_active ? 1 : 0;
			if (mode === "create" || programmeIdsModified) {
				savePayload.programme_ids = selectedProgrammeIds;
			}
		} else {
			savePayload.name = formData.course_name;
			savePayload.course_type = formData.course_type;
			savePayload.course_level = formData.course_level;
			savePayload.year = parseInt(formData.year);
			savePayload.semester = formData.semester;
			savePayload.faculty_id = parseInt(formData.faculty_id);
			savePayload.co_threshold = parseFloat(formData.co_threshold);
			savePayload.passing_threshold = parseFloat(
				formData.passing_threshold,
			);
		}

		await onSave(savePayload);
		if (mode === "create") {
			setFormData(defaultFormData);
		}
	};

	const title =
		mode === "create"
			? courseType === "base"
				? "Add New Course Template"
				: "Offer Course"
			: courseType === "base"
				? `Edit Course Template — ${initialData?.course_code}`
				: `Edit Course — ${initialData?.course_code}`;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 shadow-2xl rounded-xl p-6 max-h-[90vh] flex flex-col overflow-hidden">
				<AnimatePresence mode="wait">
					{open && (
						<motion.div
							initial={{ opacity: 0, y: 15, scale: 0.98 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: 15, scale: 0.98 }}
							transition={{ type: "spring", duration: 0.45, bounce: 0.15 }}
							className="space-y-4 w-full flex flex-col flex-1 min-h-0"
						>
							<DialogHeader className="shrink-0">
								<DialogTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
									{title}
								</DialogTitle>
							</DialogHeader>

							<div className="space-y-4 py-2 flex-1 overflow-y-auto pr-1 min-h-0">
								{mode === "create" && courseType === "offering" && (
									<motion.div 
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: "auto" }}
										transition={{ duration: 0.3 }}
										className="space-y-1.5 overflow-hidden"
									>
										<div className="flex items-center justify-between">
											<Label className="text-sm font-semibold">Select from Course Catalog</Label>
											{selectedBaseCourseid && (
												<Button
													variant="ghost"
													size="sm"
													onClick={() => {
														setSelectedBaseCourseid(null);
														setFormData((f) => ({
															...f,
															course_code: "",
															course_name: "",
															credit: "3",
														}));
														setIsCustomCredit(false);
													}}
													disabled={isLoading}
													className="text-xs text-primary hover:bg-primary/10 active:scale-95 duration-100"
												>
													Clear Selection
												</Button>
											)}
										</div>
										<Select
											value={
												selectedBaseCourseid
													? selectedBaseCourseid.toString()
													: undefined
											}
											onValueChange={(value) => {
												const selected = baseCourses.find(
													(c) => c.course_id === parseInt(value),
												);
												if (selected) {
													setSelectedBaseCourseid(
														selected.course_id,
													);
													const cred = selected.credit.toString();
													setFormData((f) => ({
														...f,
														course_code: selected.course_code,
														course_name: selected.course_name,
														credit: cred,
													}));
													setIsCustomCredit(!["1", "2", "3", "4", "5", "6"].includes(cred));
												}
											}}
											disabled={isLoading || isFetchingCourses}
										>
											<SelectTrigger className="w-full bg-white/50 dark:bg-zinc-900/50">
												<SelectValue placeholder="Browse available courses..." />
											</SelectTrigger>
											<SelectContent>
												{baseCourses.map((course) => (
													<SelectItem
														key={course.course_id}
														value={course.course_id.toString()}
													>
														{course.course_code} -{" "}
														{course.course_name} (
														{course.credit} cr.)
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{selectedBaseCourseid === null && (
											<p className="text-[10px] text-muted-foreground mt-1 font-medium">
												Or enter course details manually below
											</p>
										)}
									</motion.div>
								)}

								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-1.5">
										<Label className="text-sm font-semibold">Course Code *</Label>
										<Input
											value={formData.course_code}
											onChange={(e) =>
												setFormData((f) => ({
													...f,
													course_code: e.target.value,
												}))
											}
											disabled={
												isLoading ||
												(mode === "create" &&
													courseType === "offering" &&
													selectedBaseCourseid !== null)
											}
											placeholder="e.g., BT101"
											className="bg-white/50 dark:bg-zinc-900/50 focus:scale-[1.01] transition-transform duration-100"
										/>
									</div>
									<div className="space-y-1.5">
										<Label className="text-sm font-semibold">Credit</Label>
										{isCustomCredit ? (
											<div className="flex gap-2 items-center">
												<Input
													type="number"
													min={1}
													max={30}
													value={formData.credit === "custom" ? "" : formData.credit}
													onChange={(e) => {
														const val = e.target.value;
														setFormData((f) => ({
															...f,
															credit: val,
														}));
													}}
													disabled={
														isLoading ||
														(mode === "create" &&
															courseType === "offering" &&
															selectedBaseCourseid !== null)
													}
													placeholder="Credits"
													className="bg-white/50 dark:bg-zinc-900/50 flex-1 h-9 rounded-xl focus:scale-[1.01] transition-transform duration-100"
												/>
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() => {
														setIsCustomCredit(false);
														setFormData((f) => ({
															...f,
															credit: "3",
														}));
													}}
													disabled={
														isLoading ||
														(mode === "create" &&
															courseType === "offering" &&
															selectedBaseCourseid !== null)
													}
													className="shrink-0 h-9 rounded-xl active:scale-95 duration-200 transition-all font-semibold text-xs py-2 px-3 border border-muted/60"
												>
													Presets
												</Button>
											</div>
										) : (
											<Select
												value={formData.credit}
												onValueChange={(value) => {
													if (value === "custom") {
														setIsCustomCredit(true);
														setFormData((f) => ({
															...f,
															credit: "",
														}));
													} else {
														setFormData((f) => ({
															...f,
															credit: value,
														}));
													}
												}}
												disabled={
													isLoading ||
													(mode === "create" &&
														courseType === "offering" &&
														selectedBaseCourseid !== null)
												}
											>
												<SelectTrigger className="bg-white/50 dark:bg-zinc-900/50 rounded-xl h-9">
													<SelectValue />
												</SelectTrigger>
												<SelectContent className="rounded-xl">
													{[1, 2, 3, 4, 5, 6].map((c) => (
														<SelectItem
															key={c}
															value={c.toString()}
														>
															{c}
														</SelectItem>
													))}
													<SelectItem value="custom" className="text-violet-500 font-semibold">
														Custom...
													</SelectItem>
												</SelectContent>
											</Select>
										)}
									</div>
								</div>

								<div className="space-y-1.5">
									<Label className="text-sm font-semibold">Course Name *</Label>
									<Input
										value={formData.course_name}
										onChange={(e) =>
											setFormData((f) => ({
												...f,
												course_name: e.target.value,
											}))
										}
										disabled={
											isLoading ||
											(mode === "create" &&
												courseType === "offering" &&
												selectedBaseCourseid !== null)
										}
										placeholder="e.g., Biochemistry"
										className="bg-white/50 dark:bg-zinc-900/50 focus:scale-[1.005] transition-transform duration-100"
									/>
								</div>

								{(mode === "edit" ||
									courseType === "base" ||
									(mode === "create" &&
										courseType === "offering" &&
										selectedBaseCourseid === null)) && (
									<motion.div 
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										className="grid grid-cols-2 gap-4"
									>
										<div className="space-y-1.5">
											<Label className="text-sm font-semibold">Course Type</Label>
											<Select
												value={formData.course_type}
												onValueChange={(value) =>
													setFormData((f) => ({
														...f,
														course_type: value,
													}))
												}
												disabled={isLoading}
											>
												<SelectTrigger className="bg-white/50 dark:bg-zinc-900/50">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{[
														"Theory",
														"Lab",
														"Project",
														"Seminar",
													].map((t) => (
														<SelectItem key={t} value={t}>
															{t}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
										<div className="space-y-1.5">
											<Label className="text-sm font-semibold">Course Level</Label>
											<Select
												value={formData.course_level}
												onValueChange={(value) =>
													setFormData((f) => ({
														...f,
														course_level: value,
													}))
												}
												disabled={isLoading}
											>
												<SelectTrigger className="bg-white/50 dark:bg-zinc-900/50">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{[
														{ value: "Undergraduate", label: "UG" },
														{ value: "Postgraduate", label: "PG" },
														{ value: "UG & PG", label: "UG & PG" },
													].map((opt) => (
														<SelectItem key={opt.value} value={opt.value}>
															{opt.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									</motion.div>
								)}

								{courseType === "base" && (
									<motion.div 
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										className="space-y-4"
									>
										<div className="flex items-center space-x-2 pt-2">
											<Checkbox
												id="is_active"
												checked={formData.is_active}
												onCheckedChange={(checked: boolean) =>
													setFormData((f) => ({
														...f,
														is_active: checked,
													}))
												}
												disabled={isLoading}
												className="cursor-pointer"
											/>
											<Label htmlFor="is_active" className="text-sm cursor-pointer select-none">
												Active (Template visible for new offerings)
											</Label>
										</div>

										<div className="space-y-2 pt-2 border-t border-muted/30">
											<Label className="text-sm font-semibold">Assign to Programmes</Label>
											{isFetchingProgrammes ? (
												<p className="text-sm text-muted-foreground animate-pulse">
													Loading programmes...
												</p>
											) : programmes.length === 0 ? (
												<p className="text-sm text-muted-foreground">
													No programmes available for your department
												</p>
											) : (
												<ScrollArea className="h-32 rounded-md border border-muted/30 p-2 bg-white/30 dark:bg-zinc-900/30">
													{programmes.map((prog) => {
														const isChecked =
															selectedProgrammeIds.includes(
																prog.programme_id,
															);
														return (
															<div
																key={prog.programme_id}
																className="flex items-center gap-2 py-1"
															>
																<Checkbox
																	id={`prog-${prog.programme_id}`}
																	checked={isChecked}
																	onCheckedChange={() => {
																		setProgrammeIdsModified(
																			true,
																		);
																		setSelectedProgrammeIds(
																			(prev) =>
																				isChecked
																					? prev.filter(
																							(
																								id,
																							) =>
																								id !==
																								prog.programme_id,
																						)
																					: [
																							...prev,
																							prog.programme_id,
																						],
																		);
																	}}
																	disabled={isLoading}
																	className="cursor-pointer"
																/>
																<Label
																	htmlFor={`prog-${prog.programme_id}`}
																	className="text-sm cursor-pointer select-none font-medium text-gray-700 dark:text-gray-300"
																>
																	{prog.programme_code} —{" "}
																	{prog.programme_name}
																</Label>
															</div>
														);
													})}
												</ScrollArea>
											)}
										</div>
									</motion.div>
								)}

								{courseType === "offering" && (
									<motion.div 
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										className="space-y-4"
									>
										<div className="grid grid-cols-3 gap-4 border-t border-muted/30 pt-4">
											<div className="space-y-1.5">
												<Label className="text-sm font-semibold">Year</Label>
												<Input
													type="number"
													value={formData.year}
													onChange={(e) =>
														setFormData((f) => ({
															...f,
															year: e.target.value,
														}))
													}
													disabled={isLoading}
													min="2020"
													max="2050"
													className="bg-white/50 dark:bg-zinc-900/50"
												/>
											</div>
											<div className="space-y-1.5">
												<Label className="text-sm font-semibold">Semester</Label>
												<Select
													value={formData.semester}
													onValueChange={(value) =>
														setFormData((f) => ({
															...f,
															semester: value,
														}))
													}
													disabled={isLoading}
												>
													<SelectTrigger className="bg-white/50 dark:bg-zinc-900/50">
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														{["Autumn", "Spring"].map((s) => (
															<SelectItem key={s} value={s}>
																{s}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</div>
											<div className="space-y-1.5">
												<Label className="text-sm font-semibold">Faculty *</Label>
												<Select
													value={formData.faculty_id}
													onValueChange={(value) =>
														setFormData((f) => ({
															...f,
															faculty_id: value,
														}))
													}
													disabled={
														isLoading || isFetchingFaculties
													}
												>
													<SelectTrigger className="w-full bg-white/50 dark:bg-zinc-900/50">
														<SelectValue placeholder="Select Faculty" />
													</SelectTrigger>
													<SelectContent className="max-h-[200px]">
														{faculties.map((faculty) => (
															<SelectItem
																key={faculty.employee_id}
																value={faculty.employee_id.toString()}
															>
																{faculty.username} (
																{faculty.employee_id})
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</div>
										</div>

										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-1.5">
												<Label className="text-sm font-semibold">CO Attainment Threshold (%)</Label>
												<Input
													type="number"
													value={formData.co_threshold}
													onChange={(e) =>
														setFormData((f) => ({
															...f,
															co_threshold: e.target.value,
														}))
													}
													disabled={isLoading}
													className="bg-white/50 dark:bg-zinc-900/50"
												/>
											</div>
											<div className="space-y-1.5">
												<Label className="text-sm font-semibold">Passing Threshold (%)</Label>
												<Input
													type="number"
													value={formData.passing_threshold}
													onChange={(e) =>
														setFormData((f) => ({
															...f,
															passing_threshold:
																e.target.value,
														}))
													}
													disabled={isLoading}
													className="bg-white/50 dark:bg-zinc-900/50"
												/>
											</div>
										</div>
									</motion.div>
								)}
							</div>

							<DialogFooter className="border-t pt-4 border-muted/30 shrink-0">
								<Button
									variant="outline"
									onClick={() => onOpenChange(false)}
									disabled={isLoading}
									className="active:scale-95 transition-transform duration-100 cursor-pointer"
								>
									Cancel
								</Button>
								<Button
									onClick={handleSave}
									disabled={
										isLoading ||
										!formData.course_code ||
										!formData.course_name ||
										(courseType === "offering" && !formData.faculty_id)
									}
									className="active:scale-95 transition-transform duration-100 cursor-pointer bg-primary"
								>
									{isLoading ? "Saving..." : "Save Changes"}
								</Button>
							</DialogFooter>
						</motion.div>
					)}
				</AnimatePresence>
			</DialogContent>
		</Dialog>
	);
}
