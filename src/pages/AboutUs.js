// src/pages/AboutUs.js
import React from "react";
import { motion } from "framer-motion";
import { Users, Globe, Brush, Rocket, Quote } from "lucide-react";

export default function AboutUs() {
    const values = [
        {
            icon: <Globe size={32} className="text-blue-400" />,
            title: "Cultural Unity",
            desc: "Blending East & West storytelling into one creative universe.",
        },
        {
            icon: <Brush size={32} className="text-red-400" />,
            title: "Creativity",
            desc: "Limitless imagination powering the future of animation.",
        },
        {
            icon: <Rocket size={32} className="text-purple-400" />,
            title: "Innovation",
            desc: "Building immersive metaverse-powered experiences.",
        },
    ];

    const team = [
        {
            name: "Jane Doe",
            role: "CEO & Founder",
            image: "/team1.jpg", // public/team1.jpg
            quote: "Innovation drives the future.",
        },
        {
            name: "John Smith",
            role: "Lead Developer",
            image: "/team2.jpg", // public/team2.jpg
            quote: "Code is the bridge to imagination.",
        },
        {
            name: "Sarah Lee",
            role: "Creative Director",
            image: "/team3.jpg", // public/team3.jpg
            quote: "Design is intelligence made visible.",
        },
    ];


    return (
        <motion.div
            className="min-h-screen bg-black text-white px-8 py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
            {/* Hero Section */}
            <section className="text-center mb-20">
                <motion.h1
                    className="text-6xl font-bold mb-6"
                    style={{ fontFamily: "Japanese-3017, sans-serif" }} // EAST font
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                >
                    About <span className="text-blue-400">ANIMAC</span>
                </motion.h1>
                <motion.p
                    className="text-lg max-w-2xl mx-auto text-gray-300"
                    style={{ fontFamily: "Acknowledgement, sans-serif" }} // WEST font
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                >
                    ANIMAC is the bridge between Eastern and Western animation — a hub
                    where creativity, culture, and technology collide to shape the
                    metaverse of tomorrow.
                </motion.p>
            </section>

            {/* Values Section */}
            <section className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-24">
                {values.map((val, i) => (
                    <motion.div
                        key={i}
                        className="p-8 bg-gray-900 rounded-2xl shadow-xl text-center hover:scale-105 transition-transform"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: i * 0.2 }}
                    >
                        <div className="mb-4 flex justify-center">{val.icon}</div>
                        <h3
                            className="text-2xl font-semibold mb-2 text-blue-400"
                            style={{ fontFamily: "Japanese-3017, sans-serif" }} // EAST
                        >
                            {val.title}
                        </h3>
                        <p
                            className="text-gray-400"
                            style={{ fontFamily: "Acknowledgement, sans-serif" }} // WEST
                        >
                            {val.desc}
                        </p>
                    </motion.div>
                ))}
            </section>

            {/* Our Story */}
            <motion.section
                className="max-w-4xl mx-auto mb-24 text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
            >
                <h2
                    className="text-4xl font-bold mb-6 text-red-400"
                    style={{ fontFamily: "Japanese-3017, sans-serif" }} // EAST
                >
                    Our Story
                </h2>
                <p
                    className="text-gray-300 leading-relaxed text-lg"
                    style={{ fontFamily: "Acknowledgement, sans-serif" }} // WEST
                >
                    Born from a passion to merge cultural worlds, ANIMAC redefines how we
                    experience animation. From Lagos to Tokyo, from Hollywood to Seoul,
                    we’re building a global community of dreamers, creators, and
                    innovators pushing the limits of imagination.
                </p>
            </motion.section>

            {/* Our Team */}
            <motion.section
                className="max-w-6xl mx-auto mb-24"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
            >
                <h2
                    className="text-4xl font-bold mb-12 text-center text-blue-400"
                    style={{ fontFamily: "Japanese-3017, sans-serif" }} // EAST
                >
                    Our Team
                </h2>
                <div className="grid md:grid-cols-3 gap-10 text-center">
                    {team.map((member, i) => (
                        <motion.div
                            key={i}
                            className="p-6 bg-gray-900 rounded-2xl shadow-lg hover:scale-105 transition-transform"
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: i * 0.2 }}
                        >
                            <img
                                src={member.img}
                                alt={member.name}
                                className="w-32 h-32 mx-auto rounded-full border-4 border-blue-400 mb-4"
                            />
                            <h3
                                className="text-xl font-semibold"
                                style={{ fontFamily: "Japanese-3017, sans-serif" }} // EAST
                            >
                                {member.name}
                            </h3>
                            <p
                                className="text-gray-400"
                                style={{ fontFamily: "Acknowledgement, sans-serif" }} // WEST
                            >
                                {member.role}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* Quote Section */}
            <motion.section
                className="bg-gray-900 max-w-4xl mx-auto p-12 rounded-2xl text-center shadow-xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
            >
                <Quote className="mx-auto mb-4 text-red-400" size={40} />
                <p
                    className="text-2xl italic text-gray-300 mb-4"
                    style={{ fontFamily: "Acknowledgement, sans-serif" }} // WEST
                >
                    “Animation is the language of the soul, transcending borders and
                    building bridges between worlds.”
                </p>
                <p
                    className="text-gray-500"
                    style={{ fontFamily: "Japanese-3017, sans-serif" }} // EAST
                >
                    — ANIMAC Philosophy
                </p>
            </motion.section>
        </motion.div>
    );
}
