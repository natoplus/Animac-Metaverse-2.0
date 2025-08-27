// src/pages/PressKit.js
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText } from "lucide-react";
import clsx from 'clsx';
import { ArrowDown} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PressKit() {
    const assets = [
        { title: "ANIMAC Brand Guidelines", file: "/assets/ANIMAC-BrandGuidelines.pdf" },
        { title: "ANIMAC Logos Pack", file: "/assets/ANIMAC-Logos.zip" },
        { title: "ANIMAC Social Media Kit", file: "/assets/ANIMAC-SocialKit.zip" },
        { title: "Press Images", file: "/assets/ANIMAC-PressImages.zip" },
    ];

    const PortraitSlideshow = () => {
        // Update these with your actual local images and captions
        const slides = [
            {
                src: '/assets/our-vision1.jpg',
                alt: 'Anime trends',
                caption: ' ',
                link: '/buzzfeed/east',
            },
            {
                src: '/assets/our-vision2.jpg',
                alt: 'Western blockbusters',
                caption: ' ',
                link: '/buzzfeed/west',
            },
            {
                src: '/assets/our-vision3.jpg',
                alt: 'Cartoon behind scenes',
                caption: ' ',
                link: '/buzzfeed/west',
            },
            // Add more slides if needed
        ];

        const [current, setCurrent] = useState(0);

        useEffect(() => {
            const interval = setInterval(() => {
                setCurrent((prev) => (prev + 1) % slides.length);
            }, 5000); // 5 seconds

            return () => clearInterval(interval);
        }, [slides.length]);

        return (
            <div className="mx-auto mb-10 w-[300px] h-[450px] rounded-xl overflow-hidden relative shadow-xl cursor-pointer">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.a
                        key={current}
                        href={slides[current].link}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="block w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${slides[current].src})` }}
                        aria-label={slides[current].alt}
                        title={slides[current].caption}
                    >
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-transparent p-4 text-white text-center font-semibold text-lg">
                            {slides[current].caption}
                        </div>
                    </motion.a>
                </AnimatePresence>

                {/* Navigation dots */}
                <div className="absolute bottom-7 left-0 right-0 flex justify-center space-x-2">
                    {slides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrent(idx)}
                            className={`w-3 h-3 rounded-full transition ${idx === current ? 'bg-east-500' : 'bg-gray-600 hover:bg-gray-400'
                                }`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            </div>
        );
    };


    const portalData = [
        {
            id: 'abg',
            title: 'ANIMAC Brand Guidelines',
            subtitle: 'Rules for consistent branding.',
            description:
                ' A guide to using ANIMAC’s colors, typography, and visuals correctly.',
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
            subtitle: 'Official ANIMAC logos.',
            description:
                'Multiple logo formats for digital, print, and branding use',
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
            subtitle: 'Ready-to-use posts & assets.',
            description:
                'A collection of templates and graphics to boost ANIMAC’s presence across all platforms.',
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
            subtitle: 'High-quality media shots.',
            description:
                'Official images for press, articles, and features on ANIMAC.',
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
                    className="text-4xl mb-12 text-center bg-gradient-to-r from-east-500 to-west-500 bg-clip-text text-transparent"
                    style={{ fontFamily: "Azonix, sans-serif" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                >
                    Available Assets
                </motion.h2>
                
                {/* Portrait slideshow inserted here */}
                    <PortraitSlideshow />

                {/* DOWNLOADABLE ASSETS */}

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
                                                <div>
                                                  <a
                                                    className={clsx(
                                                        `w-full py-3 px-6 text-white font-montserrat font-semibold rounded-lg text-center transition-all duration-300`,
                                                        `bg-gradient-to-r from-${portal.color}-600 to-${portal.color}-500`,
                                                        `hover:from-${portal.color}-700 hover:to-${portal.color}-600`
                                                    )}
                                                    href={assets.file}
                                                    download
                                                >
                                                    <Download size={20} className="inline-block mr-2" /> Enter {assets.title} Portal
                                                  </a>
                                                </div>
                                            </motion.div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
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
