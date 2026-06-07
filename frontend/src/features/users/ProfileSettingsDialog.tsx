import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PhoneListInput } from "../shared/PhoneListInput";
import { apiService, type User } from "@/services/api";
import { UserCog, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetFooter,
} from "@/components/ui/sheet";

export interface ProfileSettingsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onProfileUpdate?: (user: User) => void;
}

export function ProfileSettingsDialog({
	open,
	onOpenChange,
	onProfileUpdate,
}: ProfileSettingsDialogProps) {
	const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");
	const [profileData, setProfileData] = useState({
		username: "",
		email: "",
		designation: "",
		phones: [""] as string[],
	});
	const [passwordData, setPasswordData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (open) {
			// Pre-populate with stored user first
			const storedUser = apiService.getStoredUser();
			if (storedUser) {
				setProfileData({
					username: storedUser.username || "",
					email: storedUser.email || "",
					designation: storedUser.designation || "",
					phones: storedUser.phones && storedUser.phones.length > 0 ? storedUser.phones : [""]
				});
			}

			// Fetch fresh profile from API to ensure we have phone numbers and other fresh details
			const loadFreshProfile = async () => {
				try {
					const freshUser = await apiService.getProfile();
					setProfileData({
						username: freshUser.username || "",
						email: freshUser.email || "",
						designation: freshUser.designation || "",
						phones: freshUser.phones && freshUser.phones.length > 0 ? freshUser.phones : [""]
					});
				} catch (err) {
					console.warn("Failed to fetch fresh user profile", err);
				}
			};

			loadFreshProfile();
			
			// Reset password fields and errors
			setPasswordData({
				currentPassword: "",
				newPassword: "",
				confirmPassword: "",
			});
			setErrors({});
			setActiveTab("profile");
		}
	}, [open]);

	const handleSave = async () => {
		setErrors({});
		if (activeTab === "profile") {
			await handleSaveProfile();
		} else {
			await handleSavePassword();
		}
	};

	const handleSaveProfile = async () => {
		const newErrors: Record<string, string> = {};

		if (!profileData.username) {
			newErrors.username = "Name is required";
		}
		if (!profileData.email) {
			newErrors.email = "Email is required";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
			newErrors.email = "Invalid email format";
		}

		profileData.phones.forEach((phone, idx) => {
			if (phone && !/^\d{10}$/.test(phone)) {
				newErrors[`phone_${idx}`] = "Number must be 10 digits";
			}
		});

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		setIsLoading(true);
		try {
			const res = await apiService.updateProfile({
				username: profileData.username,
				email: profileData.email,
				designation: profileData.designation,
				phones: profileData.phones.filter((p) => p.trim() !== ""),
			});

			if (res.success) {
				toast.success(res.message || "Profile updated successfully!");
				if (onProfileUpdate && res.data) {
					onProfileUpdate(res.data);
				}
				onOpenChange(false);
			} else {
				toast.error(res.message || "Failed to update profile");
			}
		} catch (error: any) {
			console.error("Update profile error:", error);
			toast.error(error.message || "Failed to update profile. Email/Username might already be taken.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleSavePassword = async () => {
		const newErrors: Record<string, string> = {};

		if (!passwordData.currentPassword) {
			newErrors.currentPassword = "Current password is required";
		}
		if (!passwordData.newPassword) {
			newErrors.newPassword = "New password is required";
		} else if (passwordData.newPassword.length < 6) {
			newErrors.newPassword = "New password must be at least 6 characters";
		}
		if (passwordData.newPassword !== passwordData.confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match";
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		setIsLoading(true);
		try {
			const res = await apiService.changePassword({
				current_password: passwordData.currentPassword,
				new_password: passwordData.newPassword,
			});

			if (res.success) {
				toast.success(res.message || "Password changed successfully!");
				setPasswordData({
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
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent
				side="right"
				className="sm:max-w-md flex flex-col h-full bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-l border-white/20 dark:border-zinc-800/50 shadow-2xl p-6"
			>
				<SheetHeader className="p-0 mb-4">
					<SheetTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
						Profile Settings
					</SheetTitle>
					<SheetDescription className="text-muted-foreground text-sm">
						Update your personal details or change your account password.
					</SheetDescription>
				</SheetHeader>

				<Tabs
					value={activeTab}
					onValueChange={(val) => {
						setActiveTab(val as "profile" | "security");
						setErrors({});
					}}
					className="w-full flex-1 flex flex-col overflow-hidden"
				>
					<TabsList className="grid w-full grid-cols-2 mb-4 bg-muted/65 p-1 rounded-xl">
						<TabsTrigger
							value="profile"
							className="flex items-center gap-2 rounded-lg font-semibold py-2 transition-all cursor-pointer"
						>
							<UserCog className="w-4 h-4" />
							Profile Info
						</TabsTrigger>
						<TabsTrigger
							value="security"
							className="flex items-center gap-2 rounded-lg font-semibold py-2 transition-all cursor-pointer"
						>
							<ShieldAlert className="w-4 h-4" />
							Security
						</TabsTrigger>
					</TabsList>

					<div className="flex-1 overflow-y-auto pr-1">
						<TabsContent value="profile" className="space-y-4 focus-visible:ring-0 mt-0">
							<div className="space-y-4">
								<div className="space-y-1.5">
									<Label htmlFor="username">Full Name *</Label>
									<Input
										id="username"
										type="text"
										value={profileData.username}
										onChange={(e) =>
											setProfileData({ ...profileData, username: e.target.value })
										}
										disabled={isLoading}
										className={errors.username ? "border-red-500 bg-background/50" : "bg-background/50"}
										placeholder="John Doe"
									/>
									{errors.username && (
										<p className="text-xs text-red-500 mt-1">{errors.username}</p>
									)}
								</div>

								<div className="space-y-1.5">
									<Label htmlFor="email">Email Address *</Label>
									<Input
										id="email"
										type="email"
										value={profileData.email}
										onChange={(e) =>
											setProfileData({ ...profileData, email: e.target.value })
										}
										disabled={isLoading}
										className={errors.email ? "border-red-500 bg-background/50" : "bg-background/50"}
										placeholder="john.doe@example.com"
									/>
									{errors.email && (
										<p className="text-xs text-red-500 mt-1">{errors.email}</p>
									)}
								</div>

								<div className="space-y-1.5">
									<Label htmlFor="designation">Designation</Label>
									<Input
										id="designation"
										type="text"
										value={profileData.designation}
										onChange={(e) =>
											setProfileData({ ...profileData, designation: e.target.value })
										}
										disabled={isLoading}
										className="bg-background/50"
										placeholder="e.g. Professor, Assistant Professor"
									/>
								</div>

								<div className="pt-2">
									<Label className="text-sm font-medium mb-3 block">
										Phone Numbers
									</Label>
									<PhoneListInput
										phones={profileData.phones}
										onChange={(phones) =>
											setProfileData({ ...profileData, phones })
										}
										disabled={isLoading}
										errors={errors}
									/>
								</div>
							</div>
						</TabsContent>

						<TabsContent value="security" className="space-y-4 focus-visible:ring-0 mt-0">
							<div className="space-y-4">
								<div className="space-y-1.5">
									<Label htmlFor="currentPassword">Current Password *</Label>
									<Input
										id="currentPassword"
										type="password"
										value={passwordData.currentPassword}
										onChange={(e) =>
											setPasswordData({ ...passwordData, currentPassword: e.target.value })
										}
										disabled={isLoading}
										className={errors.currentPassword ? "border-red-500 bg-background/50" : "bg-background/50"}
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
										value={passwordData.newPassword}
										onChange={(e) =>
											setPasswordData({ ...passwordData, newPassword: e.target.value })
										}
										disabled={isLoading}
										className={errors.newPassword ? "border-red-500 bg-background/50" : "bg-background/50"}
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
										value={passwordData.confirmPassword}
										onChange={(e) =>
											setPasswordData({ ...passwordData, confirmPassword: e.target.value })
										}
										disabled={isLoading}
										className={errors.confirmPassword ? "border-red-500 bg-background/50" : "bg-background/50"}
										placeholder="••••••••"
									/>
									{errors.confirmPassword && (
										<p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
									)}
								</div>
							</div>
						</TabsContent>
					</div>

					<SheetFooter className="mt-4 pt-4 border-t border-muted/30 flex flex-row gap-3 justify-end">
						<Button
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isLoading}
							className="active:scale-95 transition-transform duration-100 cursor-pointer"
						>
							Close
						</Button>
						<Button 
							onClick={handleSave} 
							disabled={isLoading}
							className="bg-primary hover:bg-primary/90 active:scale-95 transition-transform duration-100 relative overflow-hidden group cursor-pointer"
						>
							<span className="relative z-10">
								{isLoading ? "Saving..." : activeTab === "profile" ? "Save Changes" : "Change Password"}
							</span>
							<span className="absolute inset-0 w-full h-full bg-linear-to-r from-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
						</Button>
					</SheetFooter>
				</Tabs>
			</SheetContent>
		</Sheet>
	);
}
