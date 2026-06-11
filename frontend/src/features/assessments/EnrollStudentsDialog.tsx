import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { CheckCircle2, Download, UserPlus, X } from "lucide-react";
import { CSVFormatInfo } from "./CSVFormatInfo";
import { CSVFileUpload } from "./CSVFileUpload";
import type { Course } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";
import { useEnrollStudents } from "./hooks/useEnrollStudents";

interface EnrollStudentsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	course: Course | null;
}

const MotionButton = motion(Button);

export function EnrollStudentsDialog({
	open,
	onOpenChange,
	course,
}: EnrollStudentsDialogProps) {
	const {
		students,
		uploading,
		enrolling,
		fileInputRef,
		manualRollno,
		setManualRollno,
		manualName,
		setManualName,
		activeTab,
		setActiveTab,
		handleFileChange,
		handleEnroll,
		handleClose,
		handleAddManualStudent,
		handleRemoveFromList,
		clearAllStudents,
		downloadTemplate,
	} = useEnrollStudents({ course, onOpenChange });

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[600px] border border-muted/80 bg-background/95 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden p-6 max-h-[90vh] flex flex-col">
				<motion.div
					initial={{ opacity: 0, y: 15, scale: 0.98 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					transition={{ type: "spring" as const, stiffness: 280, damping: 22 }}
					className="space-y-4 w-full flex flex-col flex-1 min-h-0"
				>
					<DialogHeader className="shrink-0">
						<DialogTitle className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
							Enroll Students
						</DialogTitle>
						<DialogDescription className="text-sm text-muted-foreground mt-1">
							Upload a CSV file to enroll students in{" "}
							<span className="font-semibold text-primary">{course?.course_code || "the selected course"}</span>
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-2 flex-1 overflow-y-auto pr-1 min-h-0">
						<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
							<TabsList className="grid w-full grid-cols-2 mb-4 bg-muted/65 p-1 rounded-xl">
								<TabsTrigger
									value="csv"
									className="flex items-center gap-2 rounded-lg font-semibold py-2 transition-all"
								>
									<Download className="w-4 h-4" />
									CSV Upload
								</TabsTrigger>
								<TabsTrigger
									value="manual"
									className="flex items-center gap-2 rounded-lg font-semibold py-2 transition-all"
								>
									<UserPlus className="w-4 h-4" />
									Manual Entry
								</TabsTrigger>
							</TabsList>

							<AnimatePresence mode="wait">
								{/* CSV Upload Tab */}
								{activeTab === "csv" && (
									<TabsContent key="csv" value="csv" className="space-y-4 mt-0 focus-visible:ring-0">
										<motion.div
											initial={{ opacity: 0, x: -12 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: 12 }}
											transition={{ type: "spring" as const, stiffness: 300, damping: 24 }}
											className="space-y-4"
										>
											<CSVFormatInfo
												onDownloadTemplate={downloadTemplate}
											/>
											<CSVFileUpload
												fileInputRef={fileInputRef}
												onFileChange={handleFileChange}
												uploading={uploading}
												enrolling={enrolling}
											/>
										</motion.div>
									</TabsContent>
								)}

								{/* Manual Entry Tab */}
								{activeTab === "manual" && (
									<TabsContent key="manual" value="manual" className="space-y-4 mt-0 focus-visible:ring-0">
										<motion.div
											initial={{ opacity: 0, x: 12 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: -12 }}
											transition={{ type: "spring" as const, stiffness: 300, damping: 24 }}
											className="space-y-4"
										>
											<div className="bg-green-50/50 dark:bg-green-950/10 rounded-xl p-4 border border-green-100/30">
												<h4 className="text-sm font-bold text-green-900 dark:text-green-300 flex items-center gap-2">
													<UserPlus className="w-4 h-4 text-green-600 dark:text-green-400" />
													Manual Student Entry
												</h4>
												<p className="text-xs text-green-700 dark:text-green-400 mt-1">
													Add students one by one to the enrollment list
												</p>
											</div>

											<div className="grid grid-cols-1 gap-4">
												<div className="grid grid-cols-2 gap-4">
													<div className="space-y-2">
														<Label htmlFor="rollno" className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-0.5">
															Roll Number
														</Label>
														<Input
															id="rollno"
															placeholder="e.g., CS101"
															value={manualRollno}
															onChange={(e) =>
																setManualRollno(e.target.value)
															}
															className="focus-visible:ring-indigo-500/30 transition-all font-mono font-bold bg-background/50 h-10"
															onKeyDown={(e) => {
																if (e.key === "Enter") {
																	e.preventDefault();
																	document
																		.getElementById(
																			"studentName",
																		)
																		?.focus();
																}
															}}
														/>
													</div>
													<div className="space-y-2">
														<Label htmlFor="studentName" className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-0.5">
															Student Name
														</Label>
														<Input
															id="studentName"
															placeholder="e.g., John Doe"
															value={manualName}
															onChange={(e) =>
																setManualName(e.target.value)
															}
															className="focus-visible:ring-indigo-500/30 transition-all font-semibold bg-background/50 h-10"
															onKeyDown={(e) => {
																if (e.key === "Enter") {
																	e.preventDefault();
																	handleAddManualStudent();
																}
															}}
														/>
													</div>
												</div>
												<MotionButton
													onClick={handleAddManualStudent}
													whileHover={{ scale: 1.01 }}
													whileTap={{ scale: 0.99 }}
													className="w-full font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100/50 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800/40 h-10 transition-all gap-1.5"
												>
													<UserPlus className="w-4 h-4" />
													Add Student
												</MotionButton>
											</div>
										</motion.div>
									</TabsContent>
								)}
							</AnimatePresence>
						</Tabs>

						{/* Preview Table - Shows for both tabs */}
						<AnimatePresence>
							{students.length > 0 && (
								<motion.div
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: "auto" }}
									exit={{ opacity: 0, height: 0 }}
									className="space-y-3 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 overflow-hidden"
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
											<CheckCircle2 className="w-4 h-4" />
											<span>
												Ready to enroll {students.length} student
												{students.length > 1 ? "s" : ""}
											</span>
										</div>
										<MotionButton
											variant="ghost"
											size="sm"
											whileHover={{ scale: 1.02, backgroundColor: "rgba(239,68,68,0.06)" }}
											whileTap={{ scale: 0.98 }}
											onClick={clearAllStudents}
											className="h-8 text-xs font-bold text-muted-foreground hover:text-destructive transition-colors"
										>
											Clear All
										</MotionButton>
									</div>

									<div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-background/50">
										<Table>
											<TableHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b">
												<TableRow>
													<TableHead className="text-[10px] font-bold uppercase py-3 pl-4">Roll No</TableHead>
													<TableHead className="text-[10px] font-bold uppercase py-3">Name</TableHead>
													<TableHead className="text-[10px] font-bold uppercase py-3 w-16 text-center">Remove</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												<AnimatePresence initial={false}>
													{students.map((student) => (
														<motion.tr
															key={student.rollno}
															initial={{ opacity: 0, y: -8 }}
															animate={{ opacity: 1, y: 0 }}
															exit={{ opacity: 0, x: 20 }}
															transition={{ type: "spring" as const, stiffness: 350, damping: 25 }}
															className="border-b last:border-0 hover:bg-slate-50/40 dark:hover:bg-slate-900/20"
														>
															<TableCell className="font-mono font-bold text-xs py-2.5 pl-4">
																{student.rollno}
															</TableCell>
															<TableCell className="text-xs font-semibold py-2.5">
																{student.name}
															</TableCell>
															<TableCell className="py-2.5 text-center">
																<MotionButton
																	variant="ghost"
																	size="icon"
																	whileHover={{ scale: 1.1, backgroundColor: "rgba(239,68,68,0.08)", color: "rgb(239,68,68)" }}
																	whileTap={{ scale: 0.9 }}
																	className="h-7 w-7 text-muted-foreground rounded-full transition-all"
																	onClick={() =>
																		handleRemoveFromList(
																			student.rollno,
																		)
																	}
																>
																	<X className="w-4 h-4" />
																</MotionButton>
															</TableCell>
														</motion.tr>
													))}
												</AnimatePresence>
											</TableBody>
										</Table>
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>

					<DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 shrink-0">
						<MotionButton
							variant="outline"
							onClick={handleClose}
							disabled={enrolling}
							whileHover={{ scale: 1.01 }}
							whileTap={{ scale: 0.99 }}
							className="font-semibold"
						>
							Cancel
						</MotionButton>
						<MotionButton
							onClick={handleEnroll}
							disabled={
								students.length === 0 || uploading || enrolling
							}
							whileHover={{ scale: 1.01 }}
							whileTap={{ scale: 0.99 }}
							className="font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 border-none shadow-md"
						>
							{enrolling ? "Enrolling..." : "Enroll Students"}
						</MotionButton>
					</DialogFooter>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
}
