"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface Assets {
  logo: string;
  heroBackground: string;
}

interface GenerateAssetsProps {
  onAssetsGenerated: (assets: Assets) => void;
}

export default function GenerateAssets({ onAssetsGenerated }: GenerateAssetsProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAssets = async () => {
    setIsGenerating(true);
    
    // Simulate asset generation with placeholder images
    setTimeout(() => {
      const assets: Assets = {
        logo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop&crop=face",
        heroBackground: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&h=1080&fit=crop"
      };
      
      onAssetsGenerated(assets);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-red-600/50">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <div className="w-8 h-8 bg-red-600 rounded-full"></div>
          </div>
        </div>
        
        <h1 className="text-4xl font-black text-white mb-4">BREAKTHROUGH FITNESS</h1>
        <p className="text-gray-400 mb-8">Generating your personalized fitness experience...</p>
        
        <button
          onClick={generateAssets}
          disabled={isGenerating}
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold px-8 py-4 rounded-full shadow-2xl shadow-red-600/50 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? "Generating..." : "Generate Assets"}
        </button>
      </motion.div>
    </div>
  );
}
