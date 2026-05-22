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
import { Plus, RefreshCw, Trash2, EyeOff, Eye } from "lucide-react";
import { useState } from "react";
import type { CreateUserRequest, Department, School } from "@/services/api";

interface AdminCreateUserDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	newUser: CreateUserRequest;
	setNewUser: (user: CreateUserRequest) => void;
	departments: Department[];
	schools: School[];
	onSubmit: () => void;
	isSubmitting: boolean;
}

export function AdminCreateUserDialog({
	open,
	onOpenChange,
	newUser,
	setNewUser,
	departments,
	schools,
	onSubmit,
	isSubmitting,
}: AdminCreateUserDialogProps) {
	const [showPassword, setShowPassword] = useState(false);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px] border border-muted/50 bg-card/95 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden">
				<div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 via-slate-500 to-transparent" />
				<DialogHeader className="pt-2">
					<DialogTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">Add New User</DialogTitle>
					<DialogDescription className="text-muted-foreground text-sm">
						Create a new system user account. Fields marked with * are required.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="employee_id" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Employee ID *</Label>
							<Input
								id="employee_id"
								type="number"
								placeholder="e.g., 5001"
								value={newUser.employee_id || ""}
								onChange={(e) =>
									setNewUser({
										...newUser,
										employee_id:
											parseInt(e.target.value) || 0,
									})
								}
								className="bg-background/60 shadow-inner focus-visible:ring-1 focus-visible:ring-indigo-500/30 rounded-xl border-muted/50 transition-all"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="role" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Role *</Label>
							<Select
								value={newUser.role}
								onValueChange={(val) =>
									setNewUser({
										...newUser,
										role: val as CreateUserRequest["role"],
									})
								}
							>
								<SelectTrigger className="bg-background/60 shadow-sm border-muted/50 rounded-xl transition-all focus:ring-1 focus:ring-indigo-500/30 active:scale-95 duration-200">
									<SelectValue placeholder="Select role" />
								</SelectTrigger>
								<SelectContent className="bg-popover/90 backdrop-blur-md border-muted/50 rounded-xl">
									<SelectItem value="admin" className="rounded-lg focus:bg-muted/60">Admin</SelectItem>
									<SelectItem value="hod" className="rounded-lg focus:bg-muted/60">
										HOD (Dedicated Account)
									</SelectItem>
									<SelectItem value="dean" className="rounded-lg focus:bg-muted/60">
										Dean (Dedicated Account)
									</SelectItem>
									<SelectItem value="faculty" className="rounded-lg focus:bg-muted/60">
										Faculty
									</SelectItem>
									<SelectItem value="staff" className="rounded-lg focus:bg-muted/60">Staff</SelectItem>
								</SelectContent>
							</Select>
							{newUser.role === "hod" && (
								<p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 leading-normal font-medium bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
									Creates a permanent HOD login account (e.g.
									hod_cse@tezu.ac.in). Faculty serving as HOD
									are tracked separately via Dean's HOD
									Management.
								</p>
							)}
						</div>
					</div>
					<div className="space-y-2">
						<Label htmlFor="username" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name *</Label>
						<Input
							id="username"
							placeholder="e.g., Dr. John Doe"
							value={newUser.username}
							onChange={(e) =>
								setNewUser({
									...newUser,
									username: e.target.value,
								})
							}
							className="bg-background/60 shadow-inner focus-visible:ring-1 focus-visible:ring-indigo-500/30 rounded-xl border-muted/50 transition-all"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email *</Label>
						<Input
							id="email"
							type="email"
							placeholder="e.g., john@tezu.edu"
							value={newUser.email}
							onChange={(e) =>
								setNewUser({
									...newUser,
									email: e.target.value,
								})
							}
							className="bg-background/60 shadow-inner focus-visible:ring-1 focus-visible:ring-indigo-500/30 rounded-xl border-muted/50 transition-all"
						/>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="designation" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Designation</Label>
							<Input
								id="designation"
								placeholder="e.g., Professor"
								value={newUser.designation ?? ""}
								onChange={(e) =>
									setNewUser({
										...newUser,
										designation: e.target.value,
									})
								}
								className="bg-background/60 shadow-inner focus-visible:ring-1 focus-visible:ring-indigo-500/30 rounded-xl border-muted/50 transition-all"
							/>
						</div>
						<div className="space-y-2">
							<Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone Numbers</Label>
							<div className="flex flex-col gap-2">
								{(newUser.phones?.length
									? newUser.phones
									: [""]
								).map((phone, idx) => (
									<div
										key={idx}
										className="flex items-center gap-2"
									>
										<Input
											type="tel"
											maxLength={10}
											pattern="\\d{10}"
											placeholder="e.g., 9876543210"
											value={phone}
											onChange={(e) => {
												const val =
													e.target.value.replace(
														/\D/g,
														"",
													);
												const newPhones = [
													...(newUser.phones || []),
												];
												newPhones[idx] = val;
												setNewUser({
													...newUser,
													phones: newPhones,
												});
											}}
											className="bg-background/60 shadow-inner focus-visible:ring-1 focus-visible:ring-indigo-500/30 rounded-xl border-muted/50 transition-all font-mono"
										/>
										{(newUser.phones?.length
											? newUser.phones.length
											: 1) > 1 && (
											<Button
												type="button"
												variant="ghost"
												size="icon"
												className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 active:scale-95 duration-200 transition-all rounded-xl shrink-0"
												onClick={() => {
													let newPhones = (
														newUser.phones || []
													).filter(
														(_, i) => i !== idx,
													);
													if (newPhones.length === 0)
														newPhones = [""];
													setNewUser({
														...newUser,
														phones: newPhones,
													});
												}}
											>
												<Trash2 className="w-4 h-4" />
											</Button>
										)}
									</div>
								))}
							</div>
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="w-full mt-2 border-dashed border-muted/80 bg-background/30 rounded-xl hover:bg-muted/40 active:scale-95 duration-200 transition-all text-xs font-semibold"
								onClick={() => {
									setNewUser({
										...newUser,
										phones: [...(newUser.phones || []), ""],
									});
								}}
							>
								<Plus className="w-3.5 h-3.5 mr-1.5" />
								Add Phone
							</Button>
						</div>
					</div>

					{["faculty", "staff", "hod"].includes(newUser.role) && (
						<div className="space-y-2">
							<Label htmlFor="department_id" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Department *</Label>
							<Select
								value={
									newUser.department_id
										? String(newUser.department_id)
										: ""
								}
								onValueChange={(val) =>
									setNewUser({
										...newUser,
										department_id: val
											? parseInt(val)
											: null,
										school_id: null,
									})
								}
							>
								<SelectTrigger className="bg-background/60 shadow-sm border-muted/50 rounded-xl transition-all focus:ring-1 focus:ring-indigo-500/30 active:scale-95 duration-200">
									<SelectValue placeholder="Select department" />
								</SelectTrigger>
								<SelectContent className="bg-popover/90 backdrop-blur-md border-muted/50 rounded-xl">
									{departments.map((dept) => (
										<SelectItem
											key={`dept-${dept.department_id}`}
											value={String(dept.department_id)}
											className="rounded-lg focus:bg-muted/60"
										>
											{dept.department_name} ({dept.department_code})
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}

					{newUser.role === "dean" && (
						<div className="space-y-2">
							<Label htmlFor="school_id" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">School *</Label>
							<Select
								value={
									newUser.school_id
										? String(newUser.school_id)
										: ""
								}
								onValueChange={(val) =>
									setNewUser({
										...newUser,
										school_id: val ? parseInt(val) : null,
										department_id: null,
									})
								}
							>
								<SelectTrigger className="bg-background/60 shadow-sm border-muted/50 rounded-xl transition-all focus:ring-1 focus:ring-indigo-500/30 active:scale-95 duration-200">
									<SelectValue placeholder="Select school" />
								</SelectTrigger>
								<SelectContent className="bg-popover/90 backdrop-blur-md border-muted/50 rounded-xl">
									{schools.map((school) => (
										<SelectItem
											key={`school-${school.school_id}`}
											value={String(school.school_id)}
											className="rounded-lg focus:bg-muted/60"
										>
											{school.school_name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}

					<div className="space-y-2">
						<Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password *</Label>
						<div className="relative">
							<Input
								id="password"
								type={showPassword ? "text" : "password"}
								placeholder="Minimum 6 characters"
								value={newUser.password}
								onChange={(e) =>
									setNewUser({
										...newUser,
										password: e.target.value,
									})
								}
								className="bg-background/60 shadow-inner focus-visible:ring-1 focus-visible:ring-indigo-500/30 rounded-xl border-muted/50 transition-all pr-10"
							/>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-foreground active:scale-95 duration-200 transition-all rounded-r-xl"
								onClick={() => setShowPassword(!showPassword)}
							>
								{showPassword ? (
									<EyeOff className="h-4 w-4" />
								) : (
									<Eye className="h-4 w-4" />
								)}
							</Button>
						</div>
					</div>
				</div>
				<DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-muted/30">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						className="rounded-xl active:scale-95 duration-200 transition-all border-muted/50 bg-background/40 hover:bg-muted/50"
					>
						Cancel
					</Button>
					<Button 
						onClick={onSubmit} 
						disabled={isSubmitting}
						className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold rounded-xl shadow-md shadow-indigo-500/10 hover:shadow-lg active:scale-95 duration-200 transition-all border border-indigo-500/30"
					>
						{isSubmitting ? (
							<>
								<RefreshCw className="mr-2 h-4 w-4 animate-spin" />
								Creating...
							</>
						) : (
							"Create User"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
