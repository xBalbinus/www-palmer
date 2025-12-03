"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Target, Zap, Users, CheckCircle2, Calendar, TrendingUp, Award, Sparkles, Phone, LogIn } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  
  // Static assets
  const assets = {
    logo: "/assets/logo.png"
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const calendlyUrl = "https://calendly.com/contact-coachpalmer/30min";

  const openCalendly = () => {
    window.open(calendlyUrl, "_blank");
  };

  const benefits = [
    {
      icon: Target,
      title: "Personalized Programs",
      description: "Custom-tailored fitness plans designed around your goals, lifestyle, and body type"
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Advanced stat tracking and analytics to monitor your fitness journey and celebrate every milestone"
    },
    {
      icon: Users,
      title: "Expert Coaching",
      description: "One-on-one guidance from certified professionals who understand your journey"
    },
    {
      icon: Award,
      title: "Sustainable Results",
      description: "Build habits that last a lifetime, not just for a season"
    }
  ];

  const included = [
    {
      icon: CheckCircle2,
      title: "Custom Training Plan",
      items: [
        "Personalized workout routines based on your fitness level",
        "Progressive programming that adapts as you grow",
        "Exercise form videos and detailed instructions",
        "Flexible scheduling that fits your lifestyle"
      ]
    },
    {
      icon: Calendar,
      title: "Weekly Check-ins",
      items: [
        "1-on-1 video calls with your coach",
        "Progress reviews and plan adjustments",
        "Form checks and technique refinement",
        "Motivation and accountability support"
      ]
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      items: [
        "Advanced analytics dashboard",
        "Body composition tracking",
        "Performance metrics and PRs",
        "Photo progress timeline"
      ]
    },
    {
      icon: Zap,
      title: "Nutrition Guidance",
      items: [
        "Customized meal planning support",
        "Macro and calorie recommendations",
        "Supplement guidance",
        "Flexible dieting education"
      ]
    },
    {
      icon: Users,
      title: "Community Access",
      items: [
        "Private fitness community group",
        "Peer support and motivation",
        "Monthly challenges and competitions",
        "Success story sharing"
      ]
    },
    {
      icon: Award,
      title: "Lifetime Resources",
      items: [
        "Exercise video library access",
        "Educational content and guides",
        "Recipe database",
        "Ongoing email support"
      ]
    }
  ];


  return (
    <main className="min-h-screen bg-black">
      {/* Sticky Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 border-b transition-colors duration-300 ${
          scrolled 
            ? "bg-black/95 backdrop-blur-lg shadow-xl border-red-900/10" 
            : "bg-transparent border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-5">
          <div className="flex justify-between items-center">
            {/* Logo Section */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Image
                src={assets.logo}
                alt="Breakthrough Fitness Logo - Personal Training and Fitness Coaching"
                width={56}
                height={56}
                className="object-contain w-8 h-8 sm:w-14 sm:h-14"
              />
              <div className="hidden sm:block">
                <div className="text-2xl font-black text-white tracking-tight">BREAKTHROUGH</div>
                <div className="text-xs font-bold text-red-800 tracking-widest">FITNESS</div>
              </div>
            </div>
            
            {/* CTA Section */}
            <div className="flex items-center gap-2 sm:gap-3">
              <a href="tel:+1234567890" className="hidden md:flex items-center gap-2 text-white font-black text-lg xl:text-xl tracking-wide hover:text-red-300 transition-colors drop-shadow-lg">
                <Phone className="w-5 h-5" />
                (123) 456-7890
              </a>
              <Button
                onClick={openCalendly}
                className="bg-red-800 hover:bg-red-900 text-white font-medium px-4 py-2 sm:px-6 sm:py-2.5 lg:px-8 lg:py-3 text-xs sm:text-sm lg:text-base rounded-full shadow-sm hover:shadow-md transition-all hover:scale-105"
              >
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Book Your Call</span>
                <span className="sm:hidden">Book</span>
              </Button>
              
              {/* Mobile Phone Button */}
              <a href="tel:+1234567890" className="md:hidden bg-red-800/90 hover:bg-red-900 text-white p-2 rounded-full transition-all shadow-sm hover:shadow-md">
                <Phone className="w-4 h-4" />
              </a>

              {/* Client Login Button */}
              <Link
                href="/login"
                className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all"
                title="Client Login"
              >
                <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section - Improved Typography */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black" />

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-red-900/15 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-red-950/15 rounded-full blur-3xl animate-pulse delay-700" />
          <div className="absolute top-3/4 right-1/3 w-48 h-48 sm:w-64 sm:h-64 bg-red-800/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 py-16 sm:py-32 text-center">
          {/* Logo Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-4 sm:mb-8"
          >
            <div className="inline-flex items-center gap-2 sm:gap-3 bg-red-900/5 backdrop-blur-sm border border-red-900/20 rounded-full px-3 sm:px-6 py-1.5 sm:py-3">
              <Sparkles className="w-3 h-3 sm:w-5 sm:h-5 text-red-800 flex-shrink-0" />
              <span className="text-red-800 font-semibold text-[10px] sm:text-sm tracking-wider uppercase">Elite Transformation Program</span>
            </div>
          </motion.div>

          {/* Main Headline - Improved Hierarchy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-4 sm:mb-8"
          >
            <h1 className="text-3xl sm:text-7xl md:text-8xl lg:text-9xl font-black mb-2 sm:mb-4 leading-tight px-2 sm:px-0">
              <span className="text-white block mb-1 sm:mb-2">YOUR</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-700 via-red-800 to-red-900 block mb-1 sm:mb-2 drop-shadow-xl text-[1.75rem] sm:text-7xl md:text-8xl lg:text-9xl">
                BREAKTHROUGH
              </span>
              <span className="text-white/90 text-xl sm:text-5xl md:text-6xl lg:text-7xl block">STARTS HERE</span>
            </h1>
          </motion.div>

          {/* Subheadline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-6 sm:mb-12 max-w-4xl mx-auto"
          >
            <p className="text-base sm:text-2xl md:text-3xl text-gray-300 mb-3 sm:mb-6 font-light leading-relaxed px-2 sm:px-0">
              Transform your body, elevate your mindset,
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              <span className="text-white font-semibold">unlock the strength you never knew you had</span>
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-6 text-xs sm:text-sm text-gray-400">
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <CheckCircle2 className="w-3 h-3 sm:w-5 sm:h-5 text-red-800" />
                <span>Expert 1-on-1 Coaching</span>
              </div>
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <CheckCircle2 className="w-3 h-3 sm:w-5 sm:h-5 text-red-800" />
                <span>Proven Results</span>
              </div>
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <CheckCircle2 className="w-3 h-3 sm:w-5 sm:h-5 text-red-800" />
                <span>Custom Programs</span>
              </div>
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-4 sm:mb-8"
          >
            <Button
              onClick={openCalendly}
              className="bg-gradient-to-r from-red-800 to-red-900 hover:from-red-900 hover:to-red-950 text-white font-semibold px-8 sm:px-10 md:px-12 py-3 sm:py-4 md:py-5 text-sm sm:text-base md:text-lg lg:text-xl rounded-full shadow-md hover:shadow-lg transition-all hover:scale-105 group w-full sm:w-auto"
            >
              <span className="hidden sm:inline">BOOK FREE CONSULTATION</span>
              <span className="sm:hidden">BOOK FREE CALL</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ml-2 sm:ml-3 group-hover:translate-x-2 transition-transform" />
            </Button>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-gray-400"
          >
            <p className="text-xs sm:text-sm mb-1 sm:mb-2">✓ Limited spots available this month</p>
            <p className="text-xs text-gray-500">Join 500+ clients who transformed their lives</p>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-red-800 rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-24 md:py-32 bg-gray-900">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-16 md:mb-20"
          >
            <div className="inline-block mb-3 sm:mb-6">
              <span className="text-red-800 font-semibold text-xs sm:text-sm tracking-widest uppercase">Why Choose Us</span>
            </div>
            <h2 className="text-2xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-3 sm:mb-6">
              THE <span className="text-red-800">BREAKTHROUGH</span> DIFFERENCE
            </h2>
            <p className="text-sm sm:text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed px-2 sm:px-0">
              We don&apos;t just train bodies. We transform lives through personalized coaching and unwavering support.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-black/50 border-gray-800 p-4 sm:p-8 md:p-10 hover:border-red-900/50 transition-all duration-300 group h-full backdrop-blur-sm">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-red-800/15 to-red-950/15 rounded-2xl flex items-center justify-center mb-3 sm:mb-6 group-hover:scale-110 transition-transform shadow-md shadow-red-900/10">
                    <benefit.icon className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 text-red-800" />
                  </div>
                  <h3 className="text-lg sm:text-2xl font-bold text-white mb-2 sm:mb-4">{benefit.title}</h3>
                  <p className="text-gray-400 leading-relaxed text-sm sm:text-base md:text-lg">{benefit.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="py-16 sm:py-24 md:py-32 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(127,29,29,0.05),transparent_70%)]" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16 md:mb-20"
          >
            <div className="inline-block mb-4 sm:mb-6">
              <span className="text-red-800 font-semibold text-xs sm:text-sm tracking-widest uppercase">Everything You Get</span>
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 sm:mb-6">
              WHAT&apos;S <span className="text-red-800">INCLUDED</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-3xl mx-auto px-4 sm:px-0">
              Everything you need to achieve your fitness breakthrough in one comprehensive program
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {included.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-gradient-to-br from-gray-900 to-black border-gray-800 p-6 sm:p-8 hover:border-red-900/50 transition-all duration-300 h-full group">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-red-800/15 to-red-950/15 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform shadow-md shadow-red-900/10">
                    <item.icon className="w-6 h-6 sm:w-7 sm:h-7 text-red-800" />
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4">{item.title}</h3>
                  <ul className="space-y-2">
                    {item.items.map((feature, i) => (
                      <li key={i} className="text-gray-400 flex items-start">
                        <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-red-800 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-xs sm:text-sm leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Process Section */}
      <section className="py-16 sm:py-24 md:py-32 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16 md:mb-20"
          >
            <div className="inline-block mb-4 sm:mb-6">
              <span className="text-red-800 font-semibold text-xs sm:text-sm tracking-widest uppercase">How It Works</span>
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 sm:mb-6">
              YOUR PATH TO <span className="text-red-800">SUCCESS</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: "01", title: "Book Your Call", description: "Schedule a free consultation to discuss your goals and challenges" },
              { step: "02", title: "Get Your Plan", description: "Receive a personalized fitness and nutrition program designed for you" },
              { step: "03", title: "Transform", description: "Execute with expert guidance and achieve results you never thought possible" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center relative"
              >
                <div className="text-6xl sm:text-7xl md:text-8xl font-black bg-gradient-to-br from-red-800/20 to-red-900/10 bg-clip-text text-transparent mb-4 sm:mb-6">{item.step}</div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm sm:text-base md:text-lg px-4 sm:px-0">{item.description}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 -right-6 w-12">
                    <ArrowRight className="w-8 h-8 text-red-800/20" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 sm:py-24 md:py-32 bg-gradient-to-br from-red-800 via-red-900 to-red-950 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,0,0,0.4),transparent_70%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_8s_linear_infinite]" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black text-white mb-6 sm:mb-8 leading-none">
              READY FOR YOUR
              <br />
              <span className="text-black">BREAKTHROUGH?</span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/95 mb-8 sm:mb-12 leading-relaxed font-light px-4 sm:px-0">
              Stop waiting for the perfect moment.
              <span className="block mt-2 sm:mt-4 font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl">Your transformation begins today.</span>
            </p>
            <Button
              onClick={openCalendly}
              className="bg-black hover:bg-gray-900 text-white font-semibold px-8 sm:px-10 md:px-12 py-3 sm:py-4 md:py-5 text-sm sm:text-base md:text-lg lg:text-xl rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 group border border-white/20"
            >
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-2 sm:mr-3" />
              <span className="hidden sm:inline">BOOK YOUR FREE CALL</span>
              <span className="sm:hidden">BOOK FREE CALL</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ml-2 sm:ml-3 group-hover:translate-x-2 transition-transform" />
            </Button>
            <p className="text-white/90 mt-6 sm:mt-8 text-sm sm:text-base md:text-lg font-medium">
              ✓ No pressure • No obligation • Just results
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-12 sm:py-16 border-t border-red-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <Image
              src={assets.logo}
              alt="Breakthrough Fitness Logo - Transform Your Body, Transform Your Life"
              width={64}
              height={64}
              className="object-contain w-12 h-12 sm:w-16 sm:h-16"
            />
            <div className="text-left">
              <div className="text-xl sm:text-2xl font-black text-white tracking-tight">BREAKTHROUGH</div>
              <div className="text-xs font-bold text-red-800 tracking-widest">FITNESS</div>
            </div>
          </div>
          <p className="text-gray-500 text-xs sm:text-sm mb-1 sm:mb-2">
            © 2024 Breakthrough Fitness. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs sm:text-sm font-semibold">
            Transform Your Body. Transform Your Life.
          </p>
        </div>
      </footer>

      {/* Floating CTA Button - Desktop Only */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5 }}
        className="fixed bottom-8 right-8 z-50 hidden lg:block"
      >
        <Button
          onClick={openCalendly}
          className="bg-gradient-to-r from-red-800 to-red-900 hover:from-red-900 hover:to-red-950 text-white font-medium px-5 py-2.5 text-sm rounded-full shadow-md hover:shadow-lg transition-all hover:scale-105"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Book Now
        </Button>
      </motion.div>
    </main>
  );
}
