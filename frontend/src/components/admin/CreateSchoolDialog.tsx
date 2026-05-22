import { useState } from "react";
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
	DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/services/api/admin";

interface CreateSchoolDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess: () => void;
}

export function CreateSchoolDialog({
	isOpen,
	onOpenChange,
	onSuccess,
}: CreateSchoolDialogProps) {
	const [submitting, setSubmitting] = useState(false);
	const [schoolForm, setSchoolForm] = useState({
		school_code: "",
		school_name: "",
		description: "",
	});

	const resetForm = () => {
		setSchoolForm({
			school_code: "",
			school_name: "",
			description: "",
		});
	};

	const handleOpenChange = (open: boolean) => {
		if (open) {
			resetForm();
		}
		onOpenChange(open);
	};

	const handleCreateSchool = async () => {
		if (!schoolForm.school_name.trim() || !schoolForm.school_code.trim()) {
			toast.error("School name and code are required");
			return;
		}

		setSubmitting(true);
		try {
			await adminApi.createSchool(schoolForm);
			toast.success("School created successfully");
			onOpenChange(false);
			resetForm();
			onSuccess();
		} catch (error: any) {
			toast.error(error.message || "Failed to create school");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl active:scale-95 duration-200 transition-all border border-indigo-500/30 shadow-md shadow-indigo-500/10 h-10 px-4">
					<Plus className="h-4 w-4" />
					Add School
				</Button>
			</DialogTrigger>
			<DialogContent className="bg-card/90 backdrop-blur-lg border border-muted/50 rounded-2xl max-w-md shadow-2xl">
				<DialogHeader>
					<DialogTitle className="text-lg font-bold text-foreground">Create New School</DialogTitle>
					<DialogDescription className="text-xs text-muted-foreground mt-1">
						Add a new school registry to the university system.
					</DialogDescription>
				</DialogHeader>
				<div className="py-4 space-y-4">
					<div className="space-y-2">
						<Label htmlFor="school-code" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">School Code</Label>
						<Input
							id="school-code"
							value={schoolForm.school_code}
							onChange={(e) =>
								setSchoolForm({
									...schoolForm,
									school_code: e.target.value.toUpperCase(),
								})
							}
							placeholder="e.g. SOE"
							className="bg-background/60 shadow-inner focus-visible:ring-1 focus-visible:ring-indigo-500/30 rounded-xl border-muted/50 transition-all font-mono"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="school-name" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">School Name</Label>
						<Input
							id="school-name"
							value={schoolForm.school_name}
							onChange={(e) =>
								setSchoolForm({
									...schoolForm,
									school_name: e.target.value,
								})
							}
							placeholder="e.g. School of Engineering"
							className="bg-background/60 shadow-inner focus-visible:ring-1 focus-visible:ring-indigo-500/30 rounded-xl border-muted/50 transition-all"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="description" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
							Description (Optional)
						</Label>
						<Input
							id="description"
							value={schoolForm.description}
							onChange={(e) =>
								setSchoolForm({
									...schoolForm,
									description: e.target.value,
								})
							}
							placeholder="e.g. Engineering and Technology disciplines"
							className="bg-background/60 shadow-inner focus-visible:ring-1 focus-visible:ring-indigo-500/30 rounded-xl border-muted/50 transition-all"
						/>
					</div>
				</div>
				<DialogFooter className="mt-4 gap-2">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						className="bg-background/60 shadow-sm border-muted/50 rounded-xl active:scale-95 duration-200 transition-all font-semibold h-10 px-4"
					>
						Cancel
					</Button>
					<Button
						onClick={handleCreateSchool}
						disabled={submitting}
						className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl active:scale-95 duration-200 transition-all border border-indigo-500/30 shadow-md shadow-indigo-500/10 h-10 px-6"
					>
						{submitting ? (
							<div className="flex items-center gap-2">
								<div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
								<span>Creating...</span>
							</div>
						) : (
							<span>Create School</span>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
