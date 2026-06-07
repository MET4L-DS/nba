import { useState } from "react";
import { toast } from "sonner";
import { FormDialog } from "../shared/FormDialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { apiService } from "@/services/api";

export interface ProfileSettingsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ProfileSettingsDialog({
	open,
	onOpenChange,
}: ProfileSettingsDialogProps) {
	const [formData, setFormData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isLoading, setIsLoading] = useState(false);

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.currentPassword) {
			newErrors.currentPassword = "Current password is required";
		}
		if (!formData.newPassword) {
			newErrors.newPassword = "New password is required";
		} else if (formData.newPassword.length < 6) {
			newErrors.newPassword = "New password must be at least 6 characters";
		}
		if (formData.newPassword !== formData.confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSave = async () => {
		if (!validateForm()) return;

		setIsLoading(true);
		try {
			const res = await apiService.changePassword({
				current_password: formData.currentPassword,
				new_password: formData.newPassword,
			});

			if (res.success) {
				toast.success(res.message || "Password changed successfully!");
				setFormData({
					currentPassword: "",
					newPassword: "",
					confirmPassword: "",
				});
				onOpenChange(false);
			} else {
				toast.error(res.message || "Failed to change password");
			}
		} catch (error: any) {
			console.error("Change password error:", error);
			toast.error(error.message || "Incorrect current password or verification failed.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<FormDialog
			open={open}
			onOpenChange={(val) => {
				if (!val) {
					setFormData({
						currentPassword: "",
						newPassword: "",
						confirmPassword: "",
					});
					setErrors({});
				}
				onOpenChange(val);
			}}
			title="Profile Settings"
			description="Manage your account password and security preferences."
			onSave={handleSave}
			isLoading={isLoading}
			saveLabel="Change Password"
			cancelLabel="Close"
			className="max-w-md"
		>
			<div className="space-y-4 py-1">
				<div className="space-y-1.5">
					<Label htmlFor="currentPassword">Current Password *</Label>
					<Input
						id="currentPassword"
						type="password"
						value={formData.currentPassword}
						onChange={(e) =>
							setFormData({ ...formData, currentPassword: e.target.value })
						}
						disabled={isLoading}
						className={errors.currentPassword ? "border-red-500" : ""}
						placeholder="••••••••"
					/>
					{errors.currentPassword && (
						<p className="text-xs text-red-500 mt-1">{errors.currentPassword}</p>
					)}
				</div>

				<div className="space-y-1.5">
					<Label htmlFor="newPassword">New Password *</Label>
					<Input
						id="newPassword"
						type="password"
						value={formData.newPassword}
						onChange={(e) =>
							setFormData({ ...formData, newPassword: e.target.value })
						}
						disabled={isLoading}
						className={errors.newPassword ? "border-red-500" : ""}
						placeholder="Min 6 characters"
					/>
					{errors.newPassword && (
						<p className="text-xs text-red-500 mt-1">{errors.newPassword}</p>
					)}
				</div>

				<div className="space-y-1.5">
					<Label htmlFor="confirmPassword">Confirm New Password *</Label>
					<Input
						id="confirmPassword"
						type="password"
						value={formData.confirmPassword}
						onChange={(e) =>
							setFormData({ ...formData, confirmPassword: e.target.value })
						}
						disabled={isLoading}
						className={errors.confirmPassword ? "border-red-500" : ""}
						placeholder="••••••••"
					/>
					{errors.confirmPassword && (
						<p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
					)}
				</div>
			</div>
		</FormDialog>
	);
}
