// src/pages/AboutUs.js
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Brush, Rocket, Quote } from "lucide-react";

export default function AboutUs() {
    const values = [
        { icon: <Globe size={36} className="text-blue-400" />, title: "Cultural Unity", desc: "Blending East & West storytelling into one creative universe." },
        { icon: <Brush size={36} className="text-pink-400" />, title: "Creativity", desc: "Limitless imagination powering the future of animation." },
        { icon: <Rocket size={36} className="text-purple-400" />, title: "Innovation", desc: "Building immersive metaverse-powered experiences." },
    ];

    const team = [
        { name: "Arinze Xylo", role: "Operative Director", image: "/assets/team1.jpg", quote: "Innovation drives the future and we are that future." },
        { name: "Augustine Eleon", role: "Lead Developer", image: "/assets/team2.jpg", quote: "Code is the bridge between imagination and reality." },
        { name: "Jesse Rumour", role: "Community director", image: "/assets/team3.jpg", quote: "A community of minds is one that cannot perish." },
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


    return (
        <motion.div className="min-h-screen bg-black text-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>

            {/* HERO SECTION */}
            <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-900 via-black to-blue-900">
                <img
                    src={process.env.PUBLIC_URL + " "}
                    alt="Hero Background"
                    className="absolute inset-0 w-full h-full object-contain mx-auto my-auto z-0"
                    style={{ maxHeight: '80vh' }}
                />
                <div className="absolute inset-0 bg-black/40 z-20" />
                <div className="relative z-30 text-center max-w-4xl px-4">
                    <motion.h1
                        className="text-6xl md:text-7xl mb-6"
                        style={{ fontFamily: "Azonix, sans-serif" }}
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        About <span className="bg-gradient-to-r from-east-500 to-west-500 bg-clip-text text-transparent">ANIMAC</span>
                    </motion.h1>
                    <motion.p
                        className="text-xl text-gray-300"
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                    >
                        Where culture meets creativity — shaping the metaverse through imagination, innovation, and storytelling.
                    </motion.p>
                </div>
            </section>


            {/* VALUES */}
            <section className="max-w-6xl mx-auto py-20 px-6 grid md:grid-cols-3 gap-10">
                {values.map((val, i) => (
                    <motion.div
                        key={i}
                        className="p-8 rounded-2xl shadow-xl text-center bg-gradient-to-b from-gray-900 to-gray-800 hover:scale-105 transition-transform"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: i * 0.2 }}
                    >
                        <div className="mb-6 flex justify-center">{val.icon}</div>
                        <h3 className="text-2xl mb-3 mb-6 bg-gradient-to-r from-east-500 to-west-500 bg-clip-text text-transparent" style={{ fontFamily: "Azonix, sans-serif" }}>{val.title}</h3>
                        <p className="text-gray-400" style={{ fontFamily: "Montserrat, sans-serif" }}>{val.desc}</p>
                    </motion.div>
                ))}
            </section>

            {/* OUR STORY */}
            <section className="relative py-20 px-6 bg-center bg-cover" style={{ backgroundImage: `url(${process.env.PUBLIC_URL + "/assets/animac-metaverse-2.jpg"})` }}>
                <div className="absolute inset-0 bg-black/90" />
                <motion.div className="relative z-10 max-w-4xl mx-auto text-center" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                    <h2 className="text-4xl mb-6 text-pink-400" style={{ fontFamily: "Azonix, sans-serif" }}>Our Story</h2>
                    <p className="text-lg text-gray-300 leading-relaxed" style={{ fontFamily: "Montserrat, sans-serif" }}>
                        Born from a passion to merge cultural worlds, ANIMAC redefines how we experience animation. From Lagos to Tokyo, from Hollywood to Seoul, we’re building a global community of dreamers, creators, and innovators pushing the limits of imagination.
                    </p>
                </motion.div>
            </section>

            {/* ADDITIONAL SECTION */}
            <section className="relative mt-16 py-20 px-6 bg-fixed bg-center bg-cover" style={{ backgroundImage: `url(${process.env.PUBLIC_URL + "/assets/animac-bg1.jpg"})` }}>
                <div className="absolute inset-0 bg-black/60" />
                <motion.div className="relative z-10 max-w-4xl mx-auto text-center" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                    <h2 className="text-4xl mb-6 text-blue-400" style={{ fontFamily: "Azonix, sans-serif" }}>Our Vision</h2>
                    {/* Portrait slideshow inserted here */}
                    <PortraitSlideshow />
                    <p className="text-lg text-gray-300 leading-relaxed" style={{ fontFamily: "Montserrat, sans-serif" }}>
                        We envision a world where animation and storytelling transcend borders, connecting audiences globally through immersive digital experiences and cultural fusion.
                    </p>
                </motion.div>
            </section>

            {/* OUR TEAM */}
            <section className="max-w-6xl mx-auto py-20 px-6">
                <motion.h2
                    className="text-4xl mb-12 text-center text-blue-400"
                    style={{ fontFamily: "Azonix, sans-serif" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                >
                    Our Team
                </motion.h2>
                <div className="grid md:grid-cols-3 gap-10">
                    {team.map((member, i) => (
                        <motion.div
                            key={i}
                            className="relative rounded-2xl overflow-hidden shadow-lg group"
                            style={{ aspectRatio: '3 / 4' }} // Portrait orientation
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: i * 0.2 }}
                        >
                            {/* Background image */}
                            <div
                                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                                style={{ backgroundImage: `url(${member.image})` }}
                            />
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
                            {/* Content */}
                            <div className="relative z-10 p-6 flex flex-col justify-end h-full">
                                <h3
                                    className="text-2xl text-white mb-2"
                                    style={{ fontFamily: "Azonix, sans-serif" }}
                                >
                                    {member.name}
                                </h3>
                                <p
                                    className="text-gray-300 mb-4"
                                    style={{ fontFamily: "Montserrat, sans-serif" }}
                                >
                                    {member.role}
                                </p>
                                <p
                                    className="italic text-gray-400 text-sm"
                                    style={{ fontFamily: "Montserrat, sans-serif" }}
                                >
                                    “{member.quote}”
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* QUOTE SECTION */}
            <motion.section className="bg-gradient-to-br from-gray-900 via-black to-gray-900 py-16 px-6 text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
                <Quote className="mx-auto mb-6 text-pink-400" size={44} />
                <p className="text-2xl italic text-gray-200 mb-4" style={{ fontFamily: "Montserrat, sans-serif" }}>
                    “Animation is the language of the soul, transcending borders and building bridges between worlds.”
                </p>
                <p className="bg-gradient-to-r from-east-500 to-west-500 bg-clip-text text-transparent" style={{ fontFamily: "Azonix, sans-serif" }}>— ANIMAC Philosophy</p>
            </motion.section>
        </motion.div>
    );
}
