import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const About = () => {
	return (
		<div className="bg-gray-50 min-h-screen">
			{/* Hero Section  */}
			<div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16 relative overflow-hidden">
				{/* Subtle background pattern */}
				<div className="absolute inset-0 opacity-10">
					<svg
						className="h-full w-full"
						width="100%"
						height="100%"
						xmlns="http://www.w3.org/2000/svg"
					>
						<defs>
							<pattern
								id="small-grid"
								width="20"
								height="20"
								patternUnits="userSpaceOnUse"
							>
								<path
									d="M 20 0 L 0 0 0 20"
									fill="none"
									stroke="white"
									strokeWidth="1"
								/>
							</pattern>
						</defs>
						<rect
							width="100%"
							height="100%"
							fill="url(#small-grid)"
						/>
					</svg>
				</div>

				<div className="container mx-auto px-4 text-center relative z-10">
					<motion.h1
						className="text-4xl md:text-5xl font-bold mb-4"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						Who We Are
					</motion.h1>
					<motion.p
						className="text-xl md:text-2xl max-w-3xl mx-auto"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
					>
						Connecting you with trusted professionals for every home
						need.
					</motion.p>
				</div>
			</div>

			{/* Main Content */}
			<div className="container mx-auto px-4 py-16">
				{/* Spacer */}
				<div className="py-8"></div>
				{/* Our Mission */}
				<motion.section
					className="max-w-4xl mx-auto mb-20"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
						Our Mission
					</h2>
					<p className="text-lg text-gray-700 leading-relaxed text-center">
						Our mission is to make home maintenance simple, fast,
						and stress-free by connecting homeowners across Israel with reliable
						and vetted service providers. From Jerusalem to Tel Aviv, Haifa to Beer Sheva,
						we believe every Israeli deserves a well-maintained home without the hassle of
						finding trustworthy professionals.
					</p>
				</motion.section>

				{/* How It Works */}
				<motion.section
					className="mb-20"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
				>
					<h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">
						How It Works
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{/* Step 1 */}
						<div className="bg-white p-8 rounded-xl shadow-md text-center">
							<div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
								<svg
									className="w-8 h-8 text-primary-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
									/>
								</svg>
							</div>
							<h3 className="text-xl font-semibold mb-3">
								Browse Services
							</h3>
							<p className="text-gray-600">
								Explore available professionals in your area
								with detailed profiles, ratings, and reviews.
							</p>
						</div>

						{/* Step 2 */}
						<div className="bg-white p-8 rounded-xl shadow-md text-center">
							<div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
								<svg
									className="w-8 h-8 text-primary-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
									/>
								</svg>
							</div>
							<h3 className="text-xl font-semibold mb-3">
								Book Easily
							</h3>
							<p className="text-gray-600">
								Choose your preferred time and provider with
								just a few clicks. No phone calls or complicated
								scheduling.
							</p>
						</div>

						{/* Step 3 */}
						<div className="bg-white p-8 rounded-xl shadow-md text-center">
							<div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
								<svg
									className="w-8 h-8 text-primary-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M5 13l4 4L19 7"
									/>
								</svg>
							</div>
							<h3 className="text-xl font-semibold mb-3">
								Relax
							</h3>
							<p className="text-gray-600">
								Let our vetted professionals handle the rest.
								Track progress and provide feedback after
								service completion.
							</p>
						</div>
					</div>
				</motion.section>

				{/* Why Choose Us */}
				<motion.section
					className="mb-20"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.3 }}
				>
					<h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">
						Why Choose Us
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						{/* Feature 1 */}
						<div className="flex items-start">
							<div className="bg-primary-100 p-3 rounded-full mr-4">
								<svg
									className="w-6 h-6 text-primary-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
									/>
								</svg>
							</div>
							<div>
								<h3 className="text-xl font-semibold mb-2">
									Verified Service Providers
								</h3>
								<p className="text-gray-600">
									Every professional on our platform undergoes
									thorough background checks and verification
									to ensure quality and reliability.
								</p>
							</div>
						</div>

						{/* Feature 2 */}
						<div className="flex items-start">
							<div className="bg-primary-100 p-3 rounded-full mr-4">
								<svg
									className="w-6 h-6 text-primary-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
							<div>
								<h3 className="text-xl font-semibold mb-2">
									Transparent Pricing
								</h3>
								<p className="text-gray-600">
									No hidden fees or surprise charges. See
									exact pricing upfront before booking any
									service.
								</p>
							</div>
						</div>

						{/* Feature 3 */}
						<div className="flex items-start">
							<div className="bg-primary-100 p-3 rounded-full mr-4">
								<svg
									className="w-6 h-6 text-primary-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
									/>
								</svg>
							</div>
							<div>
								<h3 className="text-xl font-semibold mb-2">
									Real Customer Reviews
								</h3>
								<p className="text-gray-600">
									Authentic reviews and ratings from real
									customers help you make informed decisions
									about service providers.
								</p>
							</div>
						</div>

						{/* Feature 4 */}
						<div className="flex items-start">
							<div className="bg-primary-100 p-3 rounded-full mr-4">
								<svg
									className="w-6 h-6 text-primary-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
									/>
								</svg>
							</div>
							<div>
								<h3 className="text-xl font-semibold mb-2">
									Easy Booking & Secure Payments
								</h3>
								<p className="text-gray-600">
									Book services in minutes and pay securely
									through our platform with multiple payment
									options.
								</p>
							</div>
						</div>
					</div>
				</motion.section>

				{/* Our Team */}
				<motion.section
					className="mb-20"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.4 }}
				>
					<h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">
						Our Team
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{/* Team Member 1 */}
						<div className="bg-white p-6 rounded-xl shadow-md text-center">
							<div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-2 border-primary-100">
								<img
									src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80"
									alt="CEO"
									className="w-full h-full object-cover"
								/>
							</div>
							<h3 className="text-xl font-semibold mb-1">
								Avi Cohen
							</h3>
							<p className="text-primary-600 mb-3">
								CEO & Founder
							</p>
							<p className="text-gray-600 text-sm">
								With over 15 years in the home service industry across Israel,
								Avi founded Hausly to connect Israelis with trusted
								professionals throughout the country.
							</p>
						</div>

						{/* Team Member 2 */}
						<div className="bg-white p-6 rounded-xl shadow-md text-center">
							<div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-2 border-primary-100">
								<img
									src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80"
									alt="CTO"
									className="w-full h-full object-cover"
								/>
							</div>
							<h3 className="text-xl font-semibold mb-1">
								Layla Masarweh
							</h3>
							<p className="text-primary-600 mb-3">
								Chief Technology Officer
							</p>
							<p className="text-gray-600 text-sm">
								A graduate of the Technion, Layla leads our technology team with a focus on
								creating intuitive, user-friendly experiences
								for both customers and service providers across Israel.
							</p>
						</div>

						{/* Team Member 3 */}
						<div className="bg-white p-6 rounded-xl shadow-md text-center">
							<div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-2 border-primary-100">
								<img
									src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80"
									alt="COO"
									className="w-full h-full object-cover"
								/>
							</div>
							<h3 className="text-xl font-semibold mb-1">
								Yonatan Berkovich
							</h3>
							<p className="text-primary-600 mb-3">
								Chief Operations Officer
							</p>
							<p className="text-gray-600 text-sm">
								Yonatan ensures our platform connects customers
								with the best service providers from Tel Aviv to Haifa,
								through rigorous vetting and quality control processes.
							</p>
						</div>
					</div>
				</motion.section>

				{/* Contact CTA */}
				<motion.section
					className="bg-gray-100 rounded-2xl p-8 md:p-12 text-center max-w-4xl mx-auto"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.5 }}
				>
					<h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
						Have Questions?
					</h2>
					<p className="text-lg text-gray-700 mb-8">
						Our support team is here to help you with any questions
						or concerns.
					</p>
					<div className="flex flex-col sm:flex-row justify-center gap-4">
						<Link
							to="/contact"
							className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
						>
							Contact Us
						</Link>
						<Link
							to="/faq"
							className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
						>
							View FAQ
						</Link>
					</div>
				</motion.section>
			</div>

			{/* Footer Spacing */}
			<div className="py-12"></div>
		</div>
	);
};

export default About;
