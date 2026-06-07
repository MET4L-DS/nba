import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { adminApi } from "@/services/api/admin";
import type { School, User } from "@/services/api/types";
import { generateAppointmentOrder } from "@/utils/appointmentUtils";

interface AppointDeanDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess: () => void;
	school: School | null;
	facultyUsers: User[];
}

export function AppointDeanDialog({
	isOpen,
	onOpenChange,
	onSuccess,
	school,
	facultyUsers,
}: AppointDeanDialogProps) {
	const [submitting, setSubmitting] = useState(false);
	const [appointDeanForm, setAppointDeanForm] = useState({
		employee_id: "",
		appointment_order: "",
	});

	useEffect(() => {
		if (isOpen && school) {
			setAppointDeanForm({
				employee_id: "",
				appointment_order: generateAppointmentOrder(
					"DEAN",
					school.school_id,
				),
			});
		}
	}, [isOpen, school]);

	const handleAppointDean = async () => {
		if (
			!school ||
			!appointDeanForm.employee_id ||
			!appointDeanForm.appointment_order
		) {
			toast.error("Please fill in all fields");
			return;
		}

		setSubmitting(true);
		try {
			await adminApi.appointDean(school.school_id, {
				employee_id: parseInt(appointDeanForm.employee_id),
				appointment_order: appointDeanForm.appointment_order,
			});
			toast.success("Dean appointed successfully");
			onOpenChange(false);
			onSuccess();
		} catch (error: any) {
			toast.error(error.message || "Failed to appoint Dean");
		} finally {
			setSubmitting(false);
		}
	};

	const eligibleFaculty = facultyUsers.filter(
		(u) => school && Number(u.school_id) === school.school_id,
	);

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md border border-muted/50 bg-card/95 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden">
				<div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-indigo-600 via-slate-500 to-transparent"></div>
				<DialogHeader className="pt-2">
					<DialogTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
						Appoint Dean - {school?.school_name}
					</DialogTitle>
					<DialogDescription className="text-sm text-muted-foreground/90 mt-1">
						Select a faculty member to appoint as Dean.
					</DialogDescription>
				</DialogHeader>
				<div className="py-4 space-y-4">
					<div className="space-y-2">
						<Label className="text-sm font-semibold text-foreground/90">Faculty Member</Label>
						<Select
							value={appointDeanForm.employee_id}
							onValueChange={(val) =>
								setAppointDeanForm({
									...appointDeanForm,
									employee_id: val,
								})
							}
						>
							<SelectTrigger className="border-muted/65 focus:ring-indigo-500/50 rounded-lg">
								<SelectValue placeholder="Select faculty" />
							</SelectTrigger>
							<SelectContent className="border-muted/50">
								{eligibleFaculty.map((u) => (
									<SelectItem
										key={u.employee_id}
										value={u.employee_id.toString()}
									>
										{u.username} ({u.employee_id})
										{u.department_code
											? ` - ${u.department_code}`
											: ""}
									</SelectItem>
								))}
								{eligibleFaculty.length === 0 && (
									<SelectItem value="none" disabled>
										No eligible faculty found in this school
									</SelectItem>
								)}
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-2">
						<Label htmlFor="order" className="text-sm font-semibold text-foreground/90">Appointment Order No.</Label>
						<Input
							id="order"
							value={appointDeanForm.appointment_order}
							onChange={(e) =>
								setAppointDeanForm({
									...appointDeanForm,
									appointment_order: e.target.value,
								})
							}
							placeholder="e.g. ORD/DEAN/2026/01"
							className="border-muted/65 focus-visible:ring-indigo-500/50 rounded-lg"
						/>
					</div>
				</div>
				<DialogFooter className="flex gap-3">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						className="flex-1 border-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all duration-200 active:scale-95 rounded-lg"
					>
						Cancel
					</Button>
					<Button 
						onClick={handleAppointDean} 
						disabled={submitting}
						className="flex-1 bg-gradient-to-r from-indigo-600 to-slate-600 hover:from-indigo-500 hover:to-slate-500 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 border-none rounded-lg"
					>
						{submitting ? (
							<span className="flex items-center justify-center gap-2">
								<span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
								Appointing...
							</span>
						) : (
							"Appoint Dean"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
