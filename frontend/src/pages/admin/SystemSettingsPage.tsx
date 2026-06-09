import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { AppHeader } from "@/components/layout";
import { apiService } from "@/services/api";
import { useSettings } from "@/context/SettingsContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Building2, Save, Upload, RefreshCw, Sparkles, BookOpen, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function SystemSettingsPage() {
	const { sidebarOpen, setSidebarOpen } = useOutletContext<{
		sidebarOpen: boolean;
		setSidebarOpen: (open: boolean) => void;
	}>();

	const { settings, refreshSettings } = useSettings();

	const [uniName, setUniName] = useState("");
	const [uniSubtitle, setUniSubtitle] = useState("");
	const [sysName, setSysName] = useState("");
	const [sysShortName, setSysShortName] = useState("");
	const [mottoText, setMottoText] = useState("");
	const [mottoSubtext, setMottoSubtext] = useState("");

	const [savingText, setSavingText] = useState(false);
	const [uploadingLogo, setUploadingLogo] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [logoPreview, setLogoPreview] = useState<string | null>(null);

	// Load settings values when they are fetched
	useEffect(() => {
		if (settings) {
			setUniName(settings.university_name);
			setUniSubtitle(settings.university_subtitle);
			setSysName(settings.system_name);
			setSysShortName(settings.system_short_name);
			setMottoText(settings.motto_text);
			setMottoSubtext(settings.motto_subtext);
			setLogoPreview(settings.logo_url);
		}
	}, [settings]);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			setSelectedFile(file);
			setLogoPreview(URL.createObjectURL(file));
		}
	};

	const handleLogoUpload = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedFile) {
			toast.error("Please select an image file first");
			return;
		}

		setUploadingLogo(true);
		try {
			await apiService.uploadLogo(selectedFile);
			toast.success("Logo uploaded and updated successfully!");
			await refreshSettings();
			setSelectedFile(null);
		} catch (err: any) {
			console.error(err);
			toast.error(err.message || "Failed to upload logo");
		} finally {
			setUploadingLogo(false);
		}
	};

	const handleSaveTextSettings = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!uniName.trim() || !sysName.trim() || !sysShortName.trim()) {
			toast.error("University Name, System Name, and System Short Name are required");
			return;
		}

		setSavingText(true);
		try {
			await apiService.updateSettings({
				university_name: uniName.trim(),
				university_subtitle: uniSubtitle.trim(),
				system_name: sysName.trim(),
				system_short_name: sysShortName.trim(),
				motto_text: mottoText.trim(),
				motto_subtext: mottoSubtext.trim(),
			});
			toast.success("Branding settings updated successfully!");
			await refreshSettings();
		} catch (err: any) {
			console.error(err);
			toast.error(err.message || "Failed to save settings");
		} finally {
			setSavingText(false);
		}
	};

	return (
		<div className="flex-1 flex flex-col min-w-0 overflow-hidden">
			<AppHeader
				title="System Branding Settings"
				sidebarOpen={sidebarOpen}
				onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
				onLogout={async () => {
					await apiService.logout();
					window.location.href = "/login";
				}}
			/>
			<div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-w-6xl mx-auto w-full">
				<div className="flex flex-col gap-1.5">
					<h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
						<Building2 className="w-6 h-6 text-indigo-500" />
						University Branding & Configuration
					</h1>
					<p className="text-sm text-muted-foreground">
						Customize the name, logo, titles, and slogan to deploy OBEMS for a different institution.
					</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Left 2 Columns: Text Configuration Forms */}
					<div className="lg:col-span-2 space-y-6">
						<form onSubmit={handleSaveTextSettings}>
							<Card className="border-border/60 shadow-lg backdrop-blur-md bg-card/60">
								<CardHeader className="border-b border-border/40 pb-4">
									<CardTitle className="text-base font-bold flex items-center gap-2">
										<Sparkles className="w-4 h-4 text-indigo-500" />
										Institution Details
									</CardTitle>
									<CardDescription>
										Change the basic names and descriptors shown on login and layout.
									</CardDescription>
								</CardHeader>
								<CardContent className="pt-6 space-y-4">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-1.5">
											<div className="flex items-center gap-1">
												<Label htmlFor="uni_name" className="text-xs font-semibold">
													University / Organization Name *
												</Label>
												<Tooltip>
													<TooltipTrigger type="button" asChild>
														<HelpCircle className="w-3.5 h-3.5 text-muted-foreground/60 hover:text-muted-foreground cursor-help" />
													</TooltipTrigger>
													<TooltipContent side="top">
														The official name of the institution shown in headers, logins, and reports.
													</TooltipContent>
												</Tooltip>
											</div>
											<Input
												id="uni_name"
												value={uniName}
												onChange={(e) => setUniName(e.target.value)}
												placeholder="e.g. Tezpur University"
												className="rounded-xl"
											/>
										</div>
										<div className="space-y-1.5">
											<div className="flex items-center gap-1">
												<Label htmlFor="uni_subtitle" className="text-xs font-semibold">
													University Subtitle / Tagline
												</Label>
												<Tooltip>
													<TooltipTrigger type="button" asChild>
														<HelpCircle className="w-3.5 h-3.5 text-muted-foreground/60 hover:text-muted-foreground cursor-help" />
													</TooltipTrigger>
													<TooltipContent side="top">
														Additional information (e.g. Est. 1994, A Central University) shown on the login page.
													</TooltipContent>
												</Tooltip>
											</div>
											<Input
												id="uni_subtitle"
												value={uniSubtitle}
												onChange={(e) => setUniSubtitle(e.target.value)}
												placeholder="e.g. A Central University • Est. 1994"
												className="rounded-xl"
											/>
										</div>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-1.5">
											<div className="flex items-center gap-1">
												<Label htmlFor="sys_name" className="text-xs font-semibold">
													System / Platform Name *
												</Label>
												<Tooltip>
													<TooltipTrigger type="button" asChild>
														<HelpCircle className="w-3.5 h-3.5 text-muted-foreground/60 hover:text-muted-foreground cursor-help" />
													</TooltipTrigger>
													<TooltipContent side="top">
														The main application title shown on the login page and navigation header.
													</TooltipContent>
												</Tooltip>
											</div>
											<Input
												id="sys_name"
												value={sysName}
												onChange={(e) => setSysName(e.target.value)}
												placeholder="e.g. Outcome Based Education System"
												className="rounded-xl"
											/>
										</div>
										<div className="space-y-1.5">
											<div className="flex items-center gap-1">
												<Label htmlFor="sys_short" className="text-xs font-semibold">
													Platform Short Name / Abbreviation *
												</Label>
												<Tooltip>
													<TooltipTrigger type="button" asChild>
														<HelpCircle className="w-3.5 h-3.5 text-muted-foreground/60 hover:text-muted-foreground cursor-help" />
													</TooltipTrigger>
													<TooltipContent side="top">
														Short system code (e.g. OBEMS) used for small screens, nav bars, and quick references.
													</TooltipContent>
												</Tooltip>
											</div>
											<Input
												id="sys_short"
												value={sysShortName}
												onChange={(e) => setSysShortName(e.target.value)}
												placeholder="e.g. OBEMS"
												className="rounded-xl"
											/>
										</div>
									</div>

									<div className="border-t border-border/40 my-4 pt-4 space-y-4">
										<h3 className="text-sm font-bold flex items-center gap-2 text-indigo-500">
											<BookOpen className="w-4 h-4" />
											Motto / slogan (Login Page Footer)
										</h3>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div className="space-y-1.5">
												<div className="flex items-center gap-1">
													<Label htmlFor="motto" className="text-xs font-semibold">
														Motto Text
													</Label>
													<Tooltip>
														<TooltipTrigger type="button" asChild>
															<HelpCircle className="w-3.5 h-3.5 text-muted-foreground/60 hover:text-muted-foreground cursor-help" />
														</TooltipTrigger>
														<TooltipContent side="top">
															The institution motto or tagline rendered at the bottom footer of the login screen.
														</TooltipContent>
													</Tooltip>
												</div>
												<Input
													id="motto"
													value={mottoText}
													onChange={(e) => setMottoText(e.target.value)}
													placeholder="e.g. विज्ञानं यज्ञं तनुते"
													className="rounded-xl"
												/>
											</div>
											<div className="space-y-1.5">
												<div className="flex items-center gap-1">
													<Label htmlFor="motto_sub" className="text-xs font-semibold">
														Motto Translation / Detail
													</Label>
													<Tooltip>
														<TooltipTrigger type="button" asChild>
															<HelpCircle className="w-3.5 h-3.5 text-muted-foreground/60 hover:text-muted-foreground cursor-help" />
														</TooltipTrigger>
														<TooltipContent side="top">
															The English translation or expanded meaning of the motto text.
														</TooltipContent>
													</Tooltip>
												</div>
												<Input
													id="motto_sub"
													value={mottoSubtext}
													onChange={(e) => setMottoSubtext(e.target.value)}
													placeholder="e.g. Specialized knowledge promotes creativity"
													className="rounded-xl"
												/>
											</div>
										</div>
									</div>

									<div className="pt-4 border-t border-border/40 flex justify-end">
										<Button
											type="submit"
											disabled={savingText}
											className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold active:scale-95 duration-200 transition-all px-6"
										>
											{savingText ? (
												<>
													<RefreshCw className="w-4 h-4 mr-2 animate-spin" />
													Saving...
												</>
											) : (
												<>
													<Save className="w-4 h-4 mr-2" />
													Save Changes
												</>
											)}
										</Button>
									</div>
								</CardContent>
							</Card>
						</form>
					</div>

					{/* Right Column: Logo Upload */}
					<div>
						<Card className="border-border/60 shadow-lg backdrop-blur-md bg-card/60 h-full flex flex-col justify-between">
							<CardHeader className="border-b border-border/40 pb-4">
								<CardTitle className="text-base font-bold flex items-center gap-2">
									<Upload className="w-4 h-4 text-indigo-500" />
									University Logo
								</CardTitle>
								<CardDescription>
									Upload an image file to update the branding logo across the application.
								</CardDescription>
							</CardHeader>
							<CardContent className="pt-6 space-y-6 flex-1 flex flex-col justify-between">
								<div className="flex flex-col items-center justify-center border-2 border-dashed border-border/60 rounded-2xl p-6 bg-muted/20 hover:bg-muted/40 transition-colors duration-200 group relative">
									{logoPreview ? (
										<motion.div
											initial={{ scale: 0.9, opacity: 0 }}
											animate={{ scale: 1, opacity: 1 }}
											className="w-32 h-32 rounded-2xl bg-white/10 p-4 border border-border flex items-center justify-center overflow-hidden shadow-md"
										>
											<img
												src={logoPreview}
												alt="Branding Logo Preview"
												className="max-w-full max-h-full object-contain"
											/>
										</motion.div>
									) : (
										<div className="w-32 h-32 rounded-2xl border border-dashed flex items-center justify-center text-muted-foreground">
											No logo
										</div>
									)}
									<p className="text-xs text-muted-foreground mt-4 text-center">
										PNG, JPG, SVG, WEBP, GIF files accepted.
									</p>
								</div>

								<form onSubmit={handleLogoUpload} className="space-y-4">
									<div className="space-y-1.5">
										<div className="flex items-center gap-1">
											<Label htmlFor="logo-file" className="text-xs font-semibold cursor-pointer block">
												Select New Logo Image
											</Label>
											<Tooltip>
												<TooltipTrigger type="button" asChild>
													<HelpCircle className="w-3.5 h-3.5 text-muted-foreground/60 hover:text-muted-foreground cursor-help" />
												</TooltipTrigger>
												<TooltipContent side="top">
													Use small file size (5-10 KB) for logo
												</TooltipContent>
											</Tooltip>
										</div>
										<Input
											id="logo-file"
											type="file"
											accept="image/*"
											onChange={handleFileChange}
											className="rounded-xl cursor-pointer"
										/>
									</div>
									<Button
										type="submit"
										disabled={uploadingLogo || !selectedFile}
										className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold active:scale-95 duration-200 transition-all"
									>
										{uploadingLogo ? (
											<>
												<RefreshCw className="w-4 h-4 mr-2 animate-spin" />
												Uploading...
											</>
										) : (
											<>
												<Upload className="w-4 h-4 mr-2" />
												Upload Logo
											</>
										)}
									</Button>
								</form>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
