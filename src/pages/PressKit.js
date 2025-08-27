// src/pages/PressKit.js
import React from "react";
import { motion } from "framer-motion";
import { Download, FileText } from "lucide-react";
import clsx from 'clsx';
import { ArrowDown} from 'lucide-react';

export default function PressKit() {
    const assets = [
        { title: "ANIMAC Brand Guidelines", file: "/assets/ANIMAC-BrandGuidelines.pdf" },
        { title: "ANIMAC Logos Pack", file: "/assets/ANIMAC-Logos.zip" },
        { title: "ANIMAC Social Media Kit", file: "/assets/ANIMAC-SocialKit.zip" },
        { title: "Press Images", file: "/assets/ANIMAC-PressImages.zip" },
    ];

    const portalData = [
        {
            id: 'abg',
            title: 'ANIMAC Brand Guidelines',
            subtitle: 'Anime Culture',
            description:
                'Dive deep into the world of anime, manga, and Japanese pop culture. From seasonal breakdowns to studio spotlights.',
            color: 'east',
            gradient: 'from-east-600 via-east-700 to-east-800',
            borderColor: 'border-east-500/30',
            hoverGlow: 'hover-glow-east',
            textGlow: 'text-glow-east',
            file: "/assets/ANIMAC-BrandGuidelines.pdf",
        },
        {
            id: 'alp',
            title: 'ANIMAC Logos Pack',
            subtitle: 'Movies & Cartoons',
            description:
                'Explore Hollywood blockbusters, indie animations, and western cartoon classics. Reviews, features, and deep dives.',
            color: 'east',
            gradient: 'from-east-600 via-east-700 to-east-800',
            borderColor: 'border-east-500/30',
            hoverGlow: 'hover-glow-east',
            textGlow: 'text-glow-east',
            file: "/assets/ANIMAC-Logos.zip",
        },
        {
            id: 'asmk',
            title: 'ANIMAC Social Media Kit',
            subtitle: 'Movies & Cartoons',
            description:
                'Explore Hollywood blockbusters, indie animations, and western cartoon classics. Reviews, features, and deep dives.',
            color: 'east',
            gradient: 'from-east-600 via-east-700 to-east-800',
            borderColor: 'border-east-500/30',
            hoverGlow: 'hover-glow-east',
            textGlow: 'text-glow-east',
            file: "/assets/ANIMAC-SocialKit.zip",
        },
        {
            id: 'api',
            title: 'ANIMAC Press Images',
            subtitle: 'Movies & Cartoons',
            description:
                'Explore Hollywood blockbusters, indie animations, and western cartoon classics. Reviews, features, and deep dives.',
            color: 'east',
            gradient: 'from-east-600 via-east-700 to-east-800',
            borderColor: 'border-east-500/30',
            hoverGlow: 'hover-glow-east',
            textGlow: 'text-glow-east',
            file: "/assets/ANIMAC-PressImages.zip",
        },
    ];

    return (
        <motion.div className="min-h-screen bg-black text-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>

            {/* HERO SECTION */}
            <section className="relative h-[50vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-900 via-black to-blue-900">
                <img
                    src={process.env.PUBLIC_URL + "/assets/animac-press-hero.jpg"}
                    alt="Press Hero"
                    className="absolute inset-0 w-full h-full object-cover z-0"
                />
                <div className="absolute inset-0 bg-black/60 z-10" />
                <div className="relative z-20 text-center px-4 max-w-4xl">
                    <motion.h1
                        className="text-5xl md:text-6xl mb-4 text-blue-400"
                        style={{ fontFamily: "Azonix, sans-serif" }}
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        Press Kit
                    </motion.h1>
                    <motion.p
                        className="text-lg text-gray-300"
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                    >
                        Download ANIMAC brand assets, logos, and media resources for press and media coverage.
                    </motion.p>
                </div>
            </section>

            <section className="max-w-6xl mx-auto py-20 px-6">
                <motion.h2
                    className="text-4xl mb-12 text-center text-pink-400"
                    style={{ fontFamily: "Azonix, sans-serif" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                >
                    Available Assets
                </motion.h2>

                {/* Portals */}
                <div className="container mx-auto px-4 py-16">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                        {portalData.map((portal, index) => (
                            <motion.div
                                key={portal.id}
                                initial={{ x: index === 0 ? -100 : 100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: index * 0.3, duration: 0.8 }}
                                className="group"
                            >
                                <Link to={assets.file} aria-label={`Enter ${portal.title} portal`}>
                                    <div
                                        className={clsx(
                                            'relative overflow-hidden rounded-2xl bg-gradient-to-br p-1 transition-all duration-500 group-hover:scale-105',
                                            portal.gradient,
                                            portal.hoverGlow
                                        )}
                                    >
                                        <div className="bg-netflix-dark rounded-xl p-8 h-full">
                                            {/* Header */}
                                            <div className="flex items-start justify-between mb-6">
                                                <div>
                                                    <h2
                                                        className={clsx(
                                                            'font-bold mb-2',
                                                            portal.textGlow,
                                                            portal.id === 'east' && 'font-japanese text-5xl',
                                                            portal.id === 'west' && 'font-ackno text-4xl'
                                                        )}
                                                    >
                                                        {portal.title}
                                                    </h2>
                                                    <p className="text-xl font-montserrat font-medium text-gray-300">{portal.subtitle}</p>
                                                </div>

                                                <motion.div
                                                    whileHover={{ x: 5 }}
                                                    className={clsx(
                                                        'p-3 rounded-full border',
                                                        `bg-${portal.color}-500/20`,
                                                        `border-${portal.color}-500/30`
                                                    )}
                                                >
                                                    <ArrowDown className={`text-${portal.color}-400`} size={24} />
                                                </motion.div>
                                            </div>

                                            {/* Description */}
                                            <p className="text-gray-400 font-inter leading-relaxed mb-8">{portal.description}</p>


                                            {/* CTA Button */}
                                            <motion.div whileHover={{ scale: 1.02 }} className="mt-8">
                                                <div
                                                    className={clsx(
                                                        `w-full py-3 px-6 text-white font-montserrat font-semibold rounded-lg text-center transition-all duration-300`,
                                                        `bg-gradient-to-r from-${portal.color}-600 to-${portal.color}-500`,
                                                        `hover:from-${portal.color}-700 hover:to-${portal.color}-600`
                                                    )}
                                                >
                                                    Enter {assets.title} Portal
                                                </div>
                                            </motion.div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>


                {/* DOWNLOADABLE ASSETS */}

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {assets.map((asset, i) => (
                        <motion.div
                            key={i}
                            className="relative rounded-2xl overflow-hidden shadow-lg group bg-gradient-to-b from-gray-900 to-gray-800 p-6 flex flex-col justify-between hover:scale-105 transition-transform duration-300"
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: i * 0.2 }}
                        >
                            <div className="mb-4 flex justify-center">
                                <FileText size={36} className="text-blue-400" />
                            </div>
                            <h3 className="text-2xl text-blue-400 mb-2" style={{ fontFamily: "Azonix, sans-serif" }}>
                                {asset.title}
                            </h3>
                            <a
                                href={asset.file}
                                download
                                className="mt-auto px-4 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors text-center"
                            >
                                <Download size={20} className="inline-block mr-2" /> Download
                            </a>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* QUOTE SECTION */}
            <motion.section
                className="bg-gradient-to-br from-gray-900 via-black to-gray-900 py-16 px-6 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
            >
                <p className="text-2xl italic text-gray-200 mb-4" style={{ fontFamily: "Montserrat, sans-serif" }}>
                    “Access ANIMAC media resources to tell the story of imagination, creativity, and innovation that powers our universe.”
                </p>
                <p className="text-gray-400" style={{ fontFamily: "Azonix, sans-serif" }}>— ANIMAC Media</p>
            </motion.section>
        </motion.div>
    );
}
