import React, { useState } from "react";
import { motion } from "framer-motion";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message sent!");
  };

  return (
    <motion.div
      className="min-h-screen bg-black text-white p-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-4xl font-bold mb-4 text-red-400">Contact Us</h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-w-xl"
      >
        <input
          type="text"
          placeholder="Your Name"
          className="w-full p-3 rounded bg-gray-900 border border-gray-700"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Your Email"
          className="w-full p-3 rounded bg-gray-900 border border-gray-700"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <textarea
          placeholder="Message"
          rows="5"
          className="w-full p-3 rounded bg-gray-900 border border-gray-700"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        ></textarea>
        <button
          type="submit"
          className="px-6 py-3 bg-red-600 rounded-lg hover:bg-red-500"
        >
          Send Message
        </button>
      </form>
    </motion.div>
  );
}
