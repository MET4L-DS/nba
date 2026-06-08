import { GraduationCap, BookOpen, Award, Users, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: { staggerChildren: 0.15, delayChildren: 0.2 },
	},
};

const slideUp = {
	hidden: { opacity: 0, y: 28 },
	show: {
		opacity: 1,
		y: 0,
		transition: { type: "spring" as const, stiffness: 260, damping: 22 },
	},
};

const featureVariants = {
	hidden: { opacity: 0, x: -18 },
	show: {
		opacity: 1,
		x: 0,
		transition: { type: "spring" as const, stiffness: 280, damping: 24 },
	},
};

const FEATURES = [
	{
		icon: GraduationCap,
		text: "CO-PO-PSO Attainment",
		color: "from-indigo-400 to-violet-400",
	},
	{
		icon: BookOpen,
		text: "Marks Management",
		color: "from-sky-400 to-cyan-400",
	},
	{
		icon: Award,
		text: "Accreditation Reports",
		color: "from-amber-400 to-orange-400",
	},
	{
		icon: Users,
		text: "Multi-role Access",
		color: "from-emerald-400 to-teal-400",
	},
];

const orbs = [
	{
		size: "w-72 h-72",
		pos: "top-[-80px] right-[-60px]",
		delay: 0,
		color: "from-indigo-500/20 to-violet-500/20",
	},
	{
		size: "w-56 h-56",
		pos: "bottom-[-60px] left-[-40px]",
		delay: 1.2,
		color: "from-sky-500/15 to-cyan-500/15",
	},
	{
		size: "w-40 h-40",
		pos: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
		delay: 0.6,
		color: "from-pink-500/10 to-purple-500/10",
	},
];

export function LoginHero() {
	return (
		<div className="relative hidden md:block overflow-hidden">
			{/* Rich multi-stop gradient background */}
			<div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950" />

			{/* Animated gradient overlay pulse */}
			<motion.div
				className="absolute inset-0 bg-gradient-to-tr from-indigo-600/30 via-transparent to-violet-600/20"
				animate={{
					opacity: [0.4, 0.7, 0.4],
					scale: [1, 1.04, 1],
				}}
				transition={{
					duration: 7,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			/>

			{/* Decorative floating orbs */}
			{orbs.map((orb, i) => (
				<motion.div
					key={i}
					className={`absolute ${orb.pos} ${orb.size} rounded-full bg-gradient-to-br ${orb.color} blur-3xl pointer-events-none`}
					animate={{
						scale: [1, 1.12, 1],
						opacity: [0.6, 1, 0.6],
					}}
					transition={{
						duration: 5 + i,
						repeat: Infinity,
						ease: "easeInOut",
						delay: orb.delay,
					}}
				/>
			))}

			{/* Grid dot pattern */}
			<div
				className="absolute inset-0 opacity-[0.06]"
				style={{
					backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)`,
					backgroundSize: "32px 32px",
				}}
			/>

			{/* Content */}
			<motion.div
				className="relative flex h-full flex-col justify-center px-10 py-12 z-10"
				variants={containerVariants}
				initial="hidden"
				animate="show"
			>
				{/* University Logo & Name */}
				<motion.div
					className="flex items-center gap-4 mb-10"
					variants={slideUp}
				>
					<motion.div
						className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shrink-0 overflow-hidden shadow-2xl"
						whileHover={{ scale: 1.08, rotate: 3 }}
						transition={{
							type: "spring",
							stiffness: 300,
							damping: 20,
						}}
					>
						<picture>
							<source srcSet="/tulogo.webp" type="image/webp" />
							<img
								src="/tulogo.png"
								alt="Tezpur University"
								width={48}
								height={48}
								fetchPriority="high"
								decoding="async"
								className="w-12 h-12 object-contain"
							/>
						</picture>
					</motion.div>
					<div>
						<h3 className="text-xl font-bold text-white leading-tight">
							Tezpur University
						</h3>
						<p className="text-indigo-300 text-sm mt-0.5">
							A Central University • Est. 1994
						</p>
					</div>
				</motion.div>

				{/* Sparkle badge */}
				<motion.div
					className="flex items-center gap-2 mb-5"
					variants={slideUp}
				>
					<div className="flex items-center gap-1.5 bg-indigo-500/20 border border-indigo-400/30 rounded-full px-3 py-1">
						<Sparkles className="w-3.5 h-3.5 text-indigo-300" />
						<span className="text-xs font-semibold text-indigo-300 tracking-wide">
							CO-PO Attainment & Analytics Platform
						</span>
					</div>
				</motion.div>

				{/* Main Heading */}
				<motion.div
					className="mb-8 flex flex-col items-center"
					variants={slideUp}
				>
					<h2 className="text-3xl font-black text-white leading-tight mb-3 tracking-tight">
						Outcome Based{" "}
						<span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-pink-300 bg-clip-text text-transparent">
							Education System
						</span>
					</h2>
					<p className="text-slate-300/80 leading-relaxed text-sm max-w-xs">
						Streamline academic assessments and accreditation with
						our comprehensive CO-PO mapping and attainment platform.
					</p>
				</motion.div>

				{/* Features Grid */}
				<motion.div
					className="grid grid-cols-2 gap-3 mb-10"
					variants={containerVariants}
				>
					{FEATURES.map(({ icon: Icon, text, color }, i) => (
						<motion.div
							key={i}
							className="flex items-center gap-3 rounded-xl bg-white/[0.06] border border-white/[0.08] px-3.5 py-3 backdrop-blur-sm cursor-default"
							variants={featureVariants}
							whileHover={{
								scale: 1.04,
								backgroundColor: "rgba(255,255,255,0.1)",
								borderColor: "rgba(255,255,255,0.18)",
							}}
							transition={{
								type: "spring",
								stiffness: 380,
								damping: 24,
							}}
						>
							<motion.div
								className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${color}`}
								animate={{ y: [0, -2, 0] }}
								transition={{
									duration: 2.8 + i * 0.5,
									repeat: Infinity,
									ease: "easeInOut",
									delay: i * 0.3,
								}}
							>
								<Icon className="h-4 w-4 text-white" />
							</motion.div>
							<p className="text-white/90 text-xs font-semibold leading-snug">
								{text}
							</p>
						</motion.div>
					))}
				</motion.div>

				{/* Sanskrit Motto */}
				<motion.div
					className="pt-6 border-t border-white/[0.1]"
					variants={slideUp}
				>
					<p className="text-indigo-300/70 italic text-sm leading-relaxed">
						"विज्ञान यज्ञे जुहोम"
					</p>
					<p className="text-slate-400/60 text-xs mt-1">
						We offer ourselves to the fire of knowledge
					</p>
				</motion.div>
			</motion.div>
		</div>
	);
}
