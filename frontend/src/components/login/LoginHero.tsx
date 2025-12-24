import { GraduationCap, BookOpen, Award, Users } from "lucide-react";

export function LoginHero() {
	return (
		<div className="relative hidden md:block bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-800">
			<div className="absolute inset-0 bg-black/10"></div>
			{/* Decorative pattern */}
			<div className="absolute inset-0 opacity-5">
				<div
					className="absolute top-0 left-0 w-full h-full"
					style={{
						backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
					}}
				/>
			</div>
			<div className="relative flex h-full flex-col justify-center px-10 py-12">
				{/* University Logo & Name */}
				<div className="relative flex justify-center mb-10">
					<div className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg">
						<img
							src="/tulogo.png"
							alt="Tezpur University"
							className="h-14 w-14 object-contain"
						/>
					</div>
					<div className="text-center">
						<h3 className="text-xl font-bold text-white">
							Tezpur University
						</h3>
						<p className="text-blue-200 text-sm">
							A Central University | Est. 1994
						</p>
					</div>
				</div>

				{/* Main Heading */}
				<div className="mb-8">
					<h2 className="text-3xl font-bold text-white leading-tight mb-4">
						NBA Outcome Based
						<br />
						Education System
					</h2>
					<p className="text-blue-100 leading-relaxed">
						Streamline your academic assessment and accreditation
						processes with our comprehensive CO-PO mapping system.
					</p>
				</div>

				{/* Features Grid */}
				<div className="grid grid-cols-2 gap-x-6 gap-y-5 mb-10">
					<FeatureItem
						icon={GraduationCap}
						text="CO-PO-PSO Attainment"
					/>
					<FeatureItem icon={BookOpen} text="Marks Management" />
					<FeatureItem icon={Award} text="Accreditation Reports" />
					<FeatureItem icon={Users} text="Multi-role Access" />
				</div>

				{/* Sanskrit Motto */}
				<div className="pt-6 border-t border-white/20">
					<p className="text-blue-200 italic text-sm">
						"विज्ञान यज्ञे जुहोम" — We offer ourselves to the fire
						of knowledge
					</p>
				</div>
			</div>
		</div>
	);
}

function FeatureItem({
	icon: Icon,
	text,
}: {
	icon: React.ElementType;
	text: string;
}) {
	return (
		<div className="flex items-center gap-3">
			<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
				<Icon className="h-4 w-4 text-white" />
			</div>
			<p className="text-white text-sm font-medium">{text}</p>
		</div>
	);
}
