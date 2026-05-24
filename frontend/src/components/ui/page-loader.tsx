export function PageLoader() {
	return (
		<div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/70 dark:bg-gray-950/70 backdrop-blur-md overflow-hidden">
			{/* Inline CSS Animations to bypass framer-motion in the initial loader bundle */}
			<style>{`
				@keyframes loader-shimmer {
					0% { transform: translateX(-100%); }
					100% { transform: translateX(170%); }
				}
				@keyframes loader-pulse {
					0%, 100% {
						transform: scale(1);
						box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.15);
					}
					50% {
						transform: scale(1.04);
						box-shadow: 0 20px 25px -5px rgba(99, 102, 241, 0.30);
					}
				}
				@keyframes loader-diagonal {
					0% { transform: translateX(-100%) skewX(-15deg); }
					100% { transform: translateX(100%) skewX(-15deg); }
				}
				.animate-loader-shimmer {
					animation: loader-shimmer 1.6s linear infinite;
				}
				.animate-loader-pulse {
					animation: loader-pulse 2.2s ease-in-out infinite;
				}
				.animate-loader-diagonal {
					animation: loader-diagonal 2s ease-in-out infinite;
				}
			`}</style>

			{/* Top edge shimmer loading bar */}
			<div className="absolute top-0 left-0 w-full h-1 bg-gray-100 dark:bg-gray-900 overflow-hidden">
				<div
					className="h-full bg-gradient-to-r from-indigo-500 via-violet-600 to-indigo-500 animate-loader-shimmer"
					style={{ width: "60%" }}
				/>
			</div>

			{/* Glowing central radial aura */}
			<div className="absolute w-[350px] h-[350px] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-[80px] pointer-events-none" />

			{/* Central animated container */}
			<div className="flex flex-col items-center gap-6 relative z-10">
				{/* Logo frame with breathing pulsing and scale effects */}
				<div className="w-20 h-20 rounded-2xl bg-white dark:bg-gray-900 border border-indigo-100 dark:border-indigo-950 flex items-center justify-center shadow-xl relative overflow-hidden group animate-loader-pulse">
					{/* Embedded shimmers */}
					<div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent w-full animate-loader-diagonal" />
					
					<picture>
						<source srcSet="/tulogo.webp" type="image/webp" />
						<img
							src="/tulogo.png"
							alt="Tezpur University Logo"
							className="w-14 h-14 object-contain drop-shadow-md select-none"
						/>
					</picture>
				</div>

				{/* Text indicators with soft staggers */}
				<div className="text-center space-y-1.5">
					<h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-wider uppercase bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text">
						Tezpur University
					</h3>
					<div className="flex items-center justify-center gap-1">
						<span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest animate-pulse">
							NBA OBE System
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
