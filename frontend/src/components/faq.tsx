"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const faqs = [
        {
            q: "What is DevArena?",
            a: "DevArena is an AI-powered competitive programming analytics platform that helps programmers track performance, identify weaknesses, analyze contest history, and build personalized improvement roadmaps.",
        },
        {
            q: "Which platforms does DevArena support?",
            a: "Currently, DevArena supports LeetCode and Codeforces. Support for CodeChef, AtCoder, and other competitive programming platforms is planned for future releases.",
        },
        {
            q: "Is DevArena free to use?",
            a: "Yes. Core features such as profile analytics, contest tracking, topic analysis, and public profiles are completely free to use.",
        },
        {
            q: "What is Arena Score?",
            a: "Arena Score is DevArena's unified rating metric that combines performance data from multiple coding platforms to provide a single measure of competitive programming progress.",
        },
        {
            q: "How does the AI Coach work?",
            a: "The AI Coach analyzes your ratings, solved problems, contest history, and topic strengths to generate personalized recommendations and learning roadmaps.",
        },
        {
            q: "How often is my data updated?",
            a: "Your profile data is synchronized periodically to ensure ratings, contest history, and problem-solving statistics remain up to date.",
        },
        {
            q: "Can I compare my progress with friends?",
            a: "Yes. DevArena allows you to add friends, compare ratings, track growth trends, and compete on leaderboards.",
        },
        {
            q: "How are weak topics identified?",
            a: "DevArena analyzes your solved problems, contest performance, and topic-wise success rates to determine areas where improvement could have the greatest impact on your rating.",
        },
        {
            q: "Do I need to share my passwords?",
            a: "No. DevArena only requires your public usernames and never asks for your coding platform passwords.",
        },
        {
            q: "Can I make my profile public?",
            a: "Yes. Every user can generate a shareable public profile showcasing ratings, achievements, topic mastery, and growth history.",
        },
        {
            q: "How can DevArena help me improve my rating?",
            a: "By combining analytics, AI-powered insights, contest reviews, and personalized practice recommendations, DevArena helps you focus on the topics and problems that matter most for your growth.",
        },
        {
            q: "Is my data secure?",
            a: "Absolutely. User data is stored securely, and DevArena only accesses publicly available information from supported coding platforms.",
        },
    ];

    return (
        <section id="faqs" className="py-24 px-6 md:px-12 max-w-4xl mx-auto relative z-10">
            <div className="flex flex-col items-center mb-16 relative">
                {/* Decorative blueprint marks */}
                <div className="absolute -top-4 -left-8 w-8 h-8 border-t-2 border-l-2 border-blueprint-blue/40 hidden md:block"></div>
                <div className="absolute -bottom-4 -right-8 w-8 h-8 border-b-2 border-r-2 border-blueprint-blue/40 hidden md:block"></div>

                <h2 className="font-sketch text-5xl md:text-6xl text-sketch-black font-bold text-center mb-4">
                    Frequently Asked Questions
                </h2>
                <div className="w-24 h-1 border-t-4 border-dashed border-blueprint-blue"></div>
            </div>

            <div className="flex flex-col gap-6">
                {faqs.map((faq, index) => {
                    const isOpen = openIndex === index;
                    return (
                        <div
                            key={index}
                            className={`bg-white p-6 rough-border shadow-[4px_4px_0px_#171717] transition-all duration-300 cursor-pointer hover:-translate-y-1 ${isOpen ? 'ring-2 ring-blueprint-blue' : ''}`}
                            onClick={() => setOpenIndex(isOpen ? null : index)}
                        >
                            <div className="flex justify-between items-center gap-4">
                                <h3 className={`font-sketch text-2xl md:text-3xl font-bold transition-colors ${isOpen ? 'text-blueprint-blue' : 'text-sketch-black'}`}>
                                    {faq.q}
                                </h3>
                                <ChevronDown className={`text-sketch-black min-w-6 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blueprint-blue' : ''}`} />
                            </div>
                            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] mt-4 opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                <div className="overflow-hidden">
                                    <p className="font-mono font-bold text-sketch-black/80 leading-relaxed border-t-2 border-dashed border-sketch-black/20 pt-4">
                                        {faq.a}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
