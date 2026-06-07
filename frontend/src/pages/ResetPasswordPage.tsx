import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { DotPattern } from "@/components/ui/dot-pattern";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiService } from "@/services/api";
import { toast } from "sonner";

export function ResetPasswordPage() {
	const [searchParams] = useSearchParams();
	const token = searchParams.get("token");
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		newPassword: "",
		confirmPassword: "",
	});

	const [loading, setLoading] = useState(false);
	const [newPassFocused, setNewPassFocused] = useState(false);
	const [confirmPassFocused, setConfirmPassFocused] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);

	useEffect(() => {
		if (!token) {
			toast.error("Invalid or missing password reset token.");
		}
	}, [token]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		if (!token) {
			toast.error("Cannot reset password without a valid reset token.");
			return;
		}

		if (!formData.newPassword) {
			toast.error("Please enter a new password");
			return;
		}

		if (formData.newPassword.length < 6) {
			toast.error("Password must be at least 6 characters long");
			return;
		}

		if (formData.newPassword !== formData.confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		setLoading(true);
		try {
			const res = await apiService.resetPassword({
				token: token,
				new_password: formData.newPassword,
			});

			if (res.success) {
				toast.success("Password reset successfully. You can now login.");
				setIsSubmitted(true);
			} else {
				toast.error(res.message || "Failed to reset password.");
			}
		} catch (err: any) {
			toast.error(err.message || "Something went wrong. Please request a new link.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-linear-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
			{/* Theme Toggle Button */}
			<div className="absolute top-6 right-6 z-50">
				<AnimatedThemeToggler className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm text-slate-900 dark:text-white hover:bg-white dark:hover:bg-slate-600 transition-colors border border-slate-300 dark:border-slate-700/50 shadow-lg" />
			</div>

			{/* Animated Dot Pattern Background */}
			<DotPattern
				className={cn(
					"mask-[radial-gradient(600px_circle_at_center,white,transparent)] text-slate-400/50 dark:text-neutral-400/80",
				)}
				width={20}
				height={20}
				cx={1}
				cy={1}
				cr={1}
			/>

			{/* Main Content Container */}
			<div className="relative z-10 w-full max-w-lg px-4">
				<Card className="overflow-hidden border-slate-200 bg-white backdrop-blur-xl shadow-2xl dark:border-slate-700/50 dark:bg-slate-900/90 rounded-2xl">
					<CardContent className="p-8 md:p-10 space-y-6">
						{/* Back to Login link */}
						<div className="flex justify-between items-center">
							<Link
								to="/login"
								className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-semibold transition-colors group"
							>
								<ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
								Back to Login
							</Link>
						</div>

						{!token ? (
							<div className="text-center py-6 space-y-4">
								<div className="w-16 h-16 rounded-full bg-red-500/10 dark:bg-red-500/20 text-red-500 flex items-center justify-center mx-auto text-3xl font-bold">
									!
								</div>
								<h2 className="text-xl font-bold text-slate-900 dark:text-white">
									Invalid Reset Token
								</h2>
								<p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
									This password reset request is invalid, expired, or missing a token. Please request a new password reset.
								</p>
								<div className="pt-4">
									<Link
										to="/forgot-password"
										className="inline-flex items-center gap-2 text-sm bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-xl font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-950/70 transition-colors"
									>
										Request New Reset Link
									</Link>
								</div>
							</div>
						) : !isSubmitted ? (
							<>
								{/* Header */}
								<div className="space-y-2">
									<div className="flex items-center gap-2 mb-3">
										<div className="h-0.5 w-8 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" />
										<span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
											New Credentials
										</span>
									</div>
									<h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
										Reset Password
									</h1>
									<p className="text-slate-500 dark:text-slate-400 text-sm">
										Please enter your new password below. It must be at least 6 characters long.
									</p>
								</div>

								{/* Form */}
								<form onSubmit={handleSubmit} className="space-y-5">
									{/* New Password */}
									<div className="space-y-2">
										<Label
											htmlFor="newPassword"
											className={`text-sm font-semibold transition-colors duration-200 ${
												newPassFocused
													? "text-indigo-600 dark:text-indigo-400"
													: "text-slate-600 dark:text-slate-300"
											}`}
										>
											New Password
										</Label>
										<div className="relative">
											<Lock
												className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${
													newPassFocused
														? "text-indigo-500"
														: "text-slate-400 dark:text-slate-500"
												}`}
											/>
											<Input
												id="newPassword"
												type={showPassword ? "text" : "password"}
												placeholder="••••••••"
												value={formData.newPassword}
												onChange={(e) =>
													setFormData({ ...formData, newPassword: e.target.value })
												}
												onFocus={() => setNewPassFocused(true)}
												onBlur={() => setNewPassFocused(false)}
												required
												className="pl-10 pr-11 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 dark:focus:border-indigo-500 dark:focus:ring-indigo-500/20 rounded-xl h-11"
											/>
											<motion.button
												type="button"
												onClick={() => setShowPassword(!showPassword)}
												className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
												whileTap={{ scale: 0.88 }}
											>
												{showPassword ? (
													<EyeOff className="w-4 h-4" />
												) : (
													<Eye className="w-4 h-4" />
												)}
											</motion.button>
										</div>
									</div>

									{/* Confirm Password */}
									<div className="space-y-2">
										<Label
											htmlFor="confirmPassword"
											className={`text-sm font-semibold transition-colors duration-200 ${
												confirmPassFocused
													? "text-indigo-600 dark:text-indigo-400"
													: "text-slate-600 dark:text-slate-300"
											}`}
										>
											Confirm New Password
										</Label>
										<div className="relative">
											<Lock
												className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${
													confirmPassFocused
														? "text-indigo-500"
														: "text-slate-400 dark:text-slate-500"
												}`}
											/>
											<Input
												id="confirmPassword"
												type={showPassword ? "text" : "password"}
												placeholder="••••••••"
												value={formData.confirmPassword}
												onChange={(e) =>
													setFormData({
														...formData,
														confirmPassword: e.target.value,
													})
												}
												onFocus={() => setConfirmPassFocused(true)}
												onBlur={() => setConfirmPassFocused(false)}
												required
												className="pl-10 pr-11 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 dark:focus:border-indigo-500 dark:focus:ring-indigo-500/20 rounded-xl h-11"
											/>
										</div>
									</div>

									<motion.div
										whileHover={{ scale: 1.01 }}
										whileTap={{ scale: 0.98 }}
									>
										<ShimmerButton
											className="w-full h-11 rounded-xl mt-2"
											type="submit"
											disabled={loading}
										>
											<span className="flex items-center justify-center gap-2 whitespace-pre-wrap text-center text-sm font-semibold leading-none tracking-tight text-white">
												{loading ? (
													<>
														<div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
														Resetting...
													</>
												) : (
													<>
														Reset Password
														<ArrowRight className="w-4 h-4" />
													</>
												)}
											</span>
										</ShimmerButton>
									</motion.div>
								</form>
							</>
						) : (
							<motion.div
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								className="text-center py-6 space-y-4"
							>
								<div className="w-16 h-16 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto text-3xl">
									✓
								</div>
								<h2 className="text-xl font-bold text-slate-900 dark:text-white">
									Password Reset Completed
								</h2>
								<p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
									Your password has been successfully updated. You can now log in using your new credentials.
								</p>
								<div className="pt-4">
									<ShimmerButton
										className="px-6 h-11 rounded-xl font-semibold mx-auto"
										onClick={() => navigate("/login")}
									>
										<span className="flex items-center gap-2 text-white">
											Log In Now
											<ArrowRight className="w-4 h-4" />
										</span>
									</ShimmerButton>
								</div>
							</motion.div>
						)}
					</CardContent>
				</Card>

				{/* Footer */}
				<p className="mt-6 text-center text-xs text-slate-600 dark:text-slate-500">
					© {new Date().getFullYear()} Tezpur University. All rights reserved.
				</p>
			</div>
		</div>
	);
}
