// src/pages/Careers.js
import React from "react";
import { motion } from "framer-motion";
import { Globe, Rocket, Brush } from "lucide-react";

export default function Careers() {
  const jobs = [
    { title: "Frontend Developer", location: "Remote", icon: <Globe size={36} className="text-blue-400" /> },
    { title: "3D Animator", location: "Lagos, Nigeria", icon: <Brush size={36} className="text-pink-400" /> },
    { title: "Backend Developer", location: "Remote", icon: <Rocket size={36} className="text-purple-400" /> },
    { title: "UI/UX Designer", location: "Seoul, South Korea", icon: <Brush size={36} className="text-green-400" /> },
  ];

  const perks = [
    "Work remotely or in our vibrant studios",
    "Collaborate with a global team of creatives",
    "Access to cutting-edge tools & technologies",
    "Continuous learning and mentorship programs",
    "Competitive salary & benefits",
  ];

  return (
    <motion.div className="min-h-screen bg-black text-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
      
      {/* HERO SECTION */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-900 via-black to-blue-900">
        <img
          src={process.env.PUBLIC_URL + "/assets/animac-careers-hero.jpg"}
          alt="Careers Hero"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute inset-0 bg-black/60 z-10" />
        <div className="relative z-20 text-center px-4 max-w-4xl">
          <motion.h1
            className="text-5xl md:text-6xl mb-4 text-red-400"
            style={{ fontFamily: "Azonix, sans-serif" }}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            Join <span className="text-blue-400">ANIMAC</span>
          </motion.h1>
          <motion.p
            className="text-lg text-gray-300"
            style={{ fontFamily: "Montserrat, sans-serif" }}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            Be part of a global creative team shaping the future of animation in the metaverse.
          </motion.p>
        </div>
      </section>

      {/* JOB OPENINGS */}
      <section className="max-w-6xl mx-auto py-20 px-6">
        <motion.h2
          className="text-4xl mb-12 text-center text-blue-400"
          style={{ fontFamily: "Azonix, sans-serif" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          Current Openings
        </motion.h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {jobs.map((job, i) => (
            <motion.div
              key={i}
              className="relative rounded-2xl overflow-hidden shadow-lg group bg-gradient-to-b from-gray-900 to-gray-800 p-6 flex flex-col justify-between"
              style={{ aspectRatio: "3 / 4" }}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: i * 0.2 }}
            >
              <div className="mb-4 flex justify-center">{job.icon}</div>
              <h3 className="text-2xl text-blue-400 mb-2" style={{ fontFamily: "Azonix, sans-serif" }}>{job.title}</h3>
              <p className="text-gray-400 mb-4" style={{ fontFamily: "Montserrat, sans-serif" }}>{job.location}</p>
              <button className="mt-auto px-4 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors">
                Apply Now
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* COMPANY CULTURE */}
      <section className="relative py-20 px-6 bg-fixed bg-center bg-cover" style={{ backgroundImage: `url(${process.env.PUBLIC_URL + "/assets/animac-metaverse-2.jpg"})` }}>
        <div className="absolute inset-0 bg-black/70" />
        <motion.div className="relative z-10 max-w-4xl mx-auto text-center text-gray-300" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h2 className="text-4xl mb-6 text-pink-400" style={{ fontFamily: "Azonix, sans-serif" }}>Our Culture & Perks</h2>
          <p className="text-lg mb-6" style={{ fontFamily: "Montserrat, sans-serif" }}>
            At ANIMAC, we value creativity, collaboration, and growth. Join our diverse team and enjoy:
          </p>
          <ul className="list-disc list-inside space-y-2 text-left md:text-center max-w-xl mx-auto" style={{ fontFamily: "Montserrat, sans-serif" }}>
            {perks.map((perk, idx) => (
              <li key={idx} className="text-gray-300">{perk}</li>
            ))}
          </ul>
        </motion.div>
      </section>

      {/* QUOTE SECTION */}
      <motion.section className="bg-gradient-to-br from-gray-900 via-black to-gray-900 py-16 px-6 text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
        <p className="text-2xl italic text-gray-200 mb-4" style={{ fontFamily: "Montserrat, sans-serif" }}>
          “Join ANIMAC, where imagination meets opportunity. Build, innovate, and shape the future of animation.”
        </p>
        <p className="text-gray-400" style={{ fontFamily: "Azonix, sans-serif" }}>— ANIMAC Careers</p>
      </motion.section>

    </motion.div>
  );
}
