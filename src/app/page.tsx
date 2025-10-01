"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Target, Zap, Users, CheckCircle2, Calendar, TrendingUp, Award, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import GenerateAssets from "@/components/GenerateAssets";

interface Assets {
  logo: string;
  heroBackground: string;
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [assets, setAssets] = useState<Assets | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const calendlyUrl = "https://calendly.com/your-coach-link";

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
      icon: Zap,
      title: "Rapid Transformations",
      description: "Proven methods that deliver visible results faster than traditional approaches"
    },
    {
      icon: Users,
      title: "Expert Coaching",
      description: "One-on-one guidance from certified professionals who understand your journey"
    },
    {
      icon: TrendingUp,
      title: "Sustainable Results",
      description: "Build habits that last a lifetime, not just for a season"
    }
  ];

  const transformations = [
    {
      name: "Sarah M.",
      result: "Lost 45 lbs in 6 months",
      quote: "Breakthrough Fitness completely changed my relationship with exercise and nutrition."
    },
    {
      name: "Mike R.",
      result: "Gained 20 lbs muscle",
      quote: "The personalized approach made all the difference. I finally achieved the physique I wanted."
    },
    {
      name: "Jennifer L.",
      result: "Marathon Ready in 12 weeks",
      quote: "From couch to marathon finisher. The structured program and support were incredible."
    }
  ];

  if (!assets) {
    return <GenerateAssets onAssetsGenerated={setAssets} />;
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Sticky Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-black/95 backdrop-blur-lg shadow-2xl border-b border-red-600/20" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-600/50">
              <img
                src={assets.logo}
                alt="Breakthrough Fitness"
                className="w-10 h-10 object-cover rounded-full"
              />
            </div>
            <div>
              <div className="text-2xl font-black text-white tracking-tight">BREAKTHROUGH</div>
              <div className="text-xs font-bold text-red-600 tracking-widest">FITNESS</div>
            </div>
          </div>
          <Button
            onClick={openCalendly}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-6 text-lg rounded-full shadow-2xl shadow-red-600/50 transition-all hover:scale-105"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Book Your Call
          </Button>
        </div>
      </motion.nav>

      {/* Hero Section - Improved Typography */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={assets.heroBackground}
            alt="Gym"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black" />
        </div>

        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-800/20 rounded-full blur-3xl animate-pulse delay-700" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 text-center">
          {/* Logo Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-3 bg-red-600/10 backdrop-blur-sm border border-red-600/30 rounded-full px-6 py-3">
              <Sparkles className="w-5 h-5 text-red-600" />
              <span className="text-red-600 font-bold text-sm tracking-wider">ELITE TRANSFORMATION PROGRAM</span>
            </div>
          </motion.div>

          {/* Main Headline - Improved Hierarchy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <h1 className="text-7xl md:text-9xl font-black mb-4 leading-none">
              <span className="text-white block mb-2">YOUR</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-red-700 block mb-2 drop-shadow-2xl">
                BREAKTHROUGH
              </span>
              <span className="text-white/90 text-5xl md:text-7xl block">STARTS HERE</span>
            </h1>
          </motion.div>

          {/* Subheadline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-12 max-w-4xl mx-auto"
          >
            <p className="text-2xl md:text-3xl text-gray-300 mb-6 font-light leading-relaxed">
              Transform your body, elevate your mindset,
              <br />
              <span className="text-white font-semibold">unlock the strength you never knew you had</span>
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-red-600" />
                <span>Expert 1-on-1 Coaching</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-red-600" />
                <span>Proven Results</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-red-600" />
                <span>Custom Programs</span>
              </div>
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-8"
          >
            <Button
              onClick={openCalendly}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black px-16 py-10 text-2xl md:text-3xl rounded-full shadow-2xl shadow-red-600/50 transition-all hover:scale-105 group border-2 border-red-500"
            >
              BOOK FREE CONSULTATION
              <ArrowRight className="w-7 h-7 ml-4 group-hover:translate-x-2 transition-transform" />
            </Button>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-gray-400"
          >
            <p className="text-sm mb-2">✓ Limited spots available this month</p>
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
              className="w-1.5 h-1.5 bg-red-600 rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Benefits Section */}
      <section className="py-32 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-block mb-6">
              <span className="text-red-600 font-bold text-sm tracking-widest uppercase">Why Choose Us</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-white mb-6">
              THE <span className="text-red-600">BREAKTHROUGH</span> DIFFERENCE
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              We don't just train bodies. We transform lives through personalized coaching and unwavering support.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-black/50 border-gray-800 p-10 hover:border-red-600 transition-all duration-300 group h-full backdrop-blur-sm">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-600/20 to-red-800/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-red-600/20">
                    <benefit.icon className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{benefit.title}</h3>
                  <p className="text-gray-400 leading-relaxed text-lg">{benefit.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Transformations Section - Testimonials Only */}
      <section className="py-32 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.1),transparent_70%)]" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-block mb-6">
              <span className="text-red-600 font-bold text-sm tracking-widest uppercase">Success Stories</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-white mb-6">
              REAL PEOPLE. <span className="text-red-600">REAL RESULTS</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Join hundreds who have already achieved their breakthrough
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {transformations.map((transformation, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-gradient-to-br from-gray-900 to-black border-gray-800 p-8 hover:border-red-600 transition-all duration-300 h-full group">
                  <Award className="w-12 h-12 text-red-600 mb-6 group-hover:scale-110 transition-transform" />
                  <h4 className="text-2xl font-bold text-white mb-2">{transformation.name}</h4>
                  <div className="text-red-600 font-bold text-lg mb-4">{transformation.result}</div>
                  <p className="text-gray-400 italic leading-relaxed">"{transformation.quote}"</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Process Section */}
      <section className="py-32 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-block mb-6">
              <span className="text-red-600 font-bold text-sm tracking-widest uppercase">How It Works</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-white mb-6">
              YOUR PATH TO <span className="text-red-600">SUCCESS</span>
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
                <div className="text-8xl font-black bg-gradient-to-br from-red-600/30 to-red-600/10 bg-clip-text text-transparent mb-6">{item.step}</div>
                <h3 className="text-3xl font-bold text-white mb-4">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed text-lg">{item.description}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 -right-6 w-12">
                    <ArrowRight className="w-8 h-8 text-red-600/30" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 bg-gradient-to-br from-red-600 via-red-700 to-red-800 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,0,0,0.4),transparent_70%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_8s_linear_infinite]" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-6xl md:text-8xl font-black text-white mb-8 leading-none">
              READY FOR YOUR
              <br />
              <span className="text-black">BREAKTHROUGH?</span>
            </h2>
            <p className="text-2xl md:text-3xl text-white/95 mb-12 leading-relaxed font-light">
              Stop waiting for the perfect moment.
              <span className="block mt-4 font-bold text-3xl md:text-4xl">Your transformation begins today.</span>
            </p>
            <Button
              onClick={openCalendly}
              className="bg-black hover:bg-gray-900 text-white font-black px-16 py-10 text-2xl md:text-3xl rounded-full shadow-2xl transition-all hover:scale-105 group border-4 border-white/20"
            >
              <Calendar className="w-7 h-7 mr-4" />
              BOOK YOUR FREE CALL
              <ArrowRight className="w-7 h-7 ml-4 group-hover:translate-x-2 transition-transform" />
            </Button>
            <p className="text-white/90 mt-8 text-lg font-medium">
              ✓ No pressure • No obligation • Just results
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-16 border-t border-red-600/20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-600/50">
              <img
                src={assets.logo}
                alt="Breakthrough Fitness"
                className="w-12 h-12 object-cover rounded-full"
              />
            </div>
            <div className="text-left">
              <div className="text-2xl font-black text-white tracking-tight">BREAKTHROUGH</div>
              <div className="text-xs font-bold text-red-600 tracking-widest">FITNESS</div>
            </div>
          </div>
          <p className="text-gray-500 text-sm mb-2">
            © 2024 Breakthrough Fitness. All rights reserved.
          </p>
          <p className="text-gray-600 text-sm font-semibold">
            Transform Your Body. Transform Your Life.
          </p>
        </div>
      </footer>

      {/* Floating CTA Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5 }}
        className="fixed bottom-8 right-8 z-50 hidden lg:block"
      >
        <Button
          onClick={openCalendly}
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold px-8 py-6 text-lg rounded-full shadow-2xl shadow-red-600/50 transition-all hover:scale-110 border-2 border-red-500"
        >
          <Calendar className="w-5 h-5 mr-2" />
          Book Now
        </Button>
      </motion.div>
    </div>
  );
}
