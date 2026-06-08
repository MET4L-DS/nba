import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Lock, User, ArrowRight } from "lucide-react";

interface LoginFormProps {
	onSubmit: (identifier: string, password: string) => Promise<void>;
	loading: boolean;
}

const containerVariants = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: { staggerChildren: 0.1, delayChildren: 0.1 },
	},
};

const itemVariants = {
	hidden: { opacity: 0, y: 18 },
	show: {
		opacity: 1,
		y: 0,
		transition: { type: "spring" as const, stiffness: 280, damping: 24 },
	},
};

export function LoginForm({ onSubmit, loading }: LoginFormProps) {
	const [identifier, setIdentifier] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [identifierFocused, setIdentifierFocused] = useState(false);
	const [passwordFocused, setPasswordFocused] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await onSubmit(identifier, password);
	};

	return (
		<div className="flex flex-col justify-center p-8 md:p-12 bg-background min-h-full">
			<motion.div
				className="mx-auto w-full max-w-md space-y-8"
				variants={containerVariants}
				initial="hidden"
				animate="show"
			>
				{/* University Logo for mobile */}
				<motion.div
					className="flex flex-col items-center md:hidden mb-4"
					variants={itemVariants}
				>
					<div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center overflow-hidden shadow-lg">
						<picture>
							<source srcSet="/tulogo.webp" type="image/webp" />
							<img
								src="/tulogo.png"
								alt="Tezpur University"
								className="h-12 w-12 object-contain"
							/>
						</picture>
					</div>
					<h2 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
						Tezpur University
					</h2>
				</motion.div>

				{/* Header */}
				<motion.div className="space-y-2" variants={itemVariants}>
					<div className="flex items-center gap-2 mb-3">
						<div className="h-0.5 w-8 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" />
						<span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
							Sign In
						</span>
					</div>
					<h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
						OBEMS{" "}
						<span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
							Portal
						</span>
					</h1>
					<p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
						Sign in with your university credentials to continue.
					</p>
				</motion.div>

				{/* Form */}
				<motion.form
					onSubmit={handleSubmit}
					className="space-y-5"
					variants={itemVariants}
				>
					{/* Identifier Field */}
					<motion.div
						className="space-y-2"
						animate={identifierFocused ? { y: -1 } : { y: 0 }}
						transition={{
							type: "spring",
							stiffness: 400,
							damping: 30,
						}}
					>
						<Label
							htmlFor="identifier"
							className={`text-sm font-semibold transition-colors duration-200 ${
								identifierFocused
									? "text-indigo-600 dark:text-indigo-400"
									: "text-slate-600 dark:text-slate-300"
							}`}
						>
							Email or Employee ID
						</Label>
						<div className="relative">
							<User
								className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${
									identifierFocused
										? "text-indigo-500"
										: "text-slate-400 dark:text-slate-500"
								}`}
							/>
							<Input
								id="identifier"
								type="text"
								placeholder="faculty@tezu.ac.in or EMP12345"
								value={identifier}
								onChange={(e) => setIdentifier(e.target.value)}
								onFocus={() => setIdentifierFocused(true)}
								onBlur={() => setIdentifierFocused(false)}
								required
								autoComplete="username"
								className="pl-10 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 dark:focus:border-indigo-500 dark:focus:ring-indigo-500/20 rounded-xl h-11"
							/>
							<AnimatePresence>
								{identifierFocused && (
									<motion.div
										className="absolute inset-0 rounded-xl ring-2 ring-indigo-400/30 dark:ring-indigo-500/30 pointer-events-none"
										initial={{ opacity: 0, scale: 0.98 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.98 }}
										transition={{ duration: 0.15 }}
									/>
								)}
							</AnimatePresence>
						</div>
					</motion.div>

					{/* Password Field */}
					<motion.div
						className="space-y-2"
						animate={passwordFocused ? { y: -1 } : { y: 0 }}
						transition={{
							type: "spring",
							stiffness: 400,
							damping: 30,
						}}
					>
						<div className="flex items-center justify-between">
							<Label
								htmlFor="password"
								className={`text-sm font-semibold transition-colors duration-200 ${
									passwordFocused
										? "text-indigo-600 dark:text-indigo-400"
										: "text-slate-600 dark:text-slate-300"
								}`}
							>
								Password
							</Label>
							<Link
								to="/forgot-password"
								className="text-xs text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors"
							>
								Forgot password?
							</Link>
						</div>
						<div className="relative">
							<Lock
								className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${
									passwordFocused
										? "text-indigo-500"
										: "text-slate-400 dark:text-slate-500"
								}`}
							/>
							<Input
								id="password"
								type={showPassword ? "text" : "password"}
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								onFocus={() => setPasswordFocused(true)}
								onBlur={() => setPasswordFocused(false)}
								required
								autoComplete="current-password"
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
							<AnimatePresence>
								{passwordFocused && (
									<motion.div
										className="absolute inset-0 rounded-xl ring-2 ring-indigo-400/30 dark:ring-indigo-500/30 pointer-events-none"
										initial={{ opacity: 0, scale: 0.98 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.98 }}
										transition={{ duration: 0.15 }}
									/>
								)}
							</AnimatePresence>
						</div>
					</motion.div>

					{/* Submit Button */}
					<motion.div
						variants={itemVariants}
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
										Signing in...
									</>
								) : (
									<>
										Sign In
										<ArrowRight className="w-4 h-4" />
									</>
								)}
							</span>
						</ShimmerButton>
					</motion.div>
				</motion.form>

				{/* Help Text */}
				<motion.div
					className="text-center text-sm text-slate-500 dark:text-slate-400"
					variants={itemVariants}
				>
					<p>
						Need help?{" "}
						<a
							href="#"
							className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold transition-colors"
						>
							Contact IT Support
						</a>
					</p>
				</motion.div>
			</motion.div>
		</div>
	);
}
