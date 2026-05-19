require('dotenv').config();
const express = require("express");
const Groq = require("groq-sdk");
const router = express.Router();
const axios = require("axios");
const { successResponse, errorResponse } = require("../utils/responseHelper")

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are EventBot, a helpful assistant for a club management
system.
Help members with upcoming events, registrations, schedules, and club policies.
Keep replies short and friendly - 2 to 3 sentences max.`;

router.post("/chat", async (req, res) => {
    const { message, history = [] } = req.body;
    console.log("User message:", message);
    console.log("Fetching latest events from DB...");

    try {

        let siteData = "";

        if (message.toLowerCase().includes("event") || message.toLowerCase().includes("events")) {
            const eventRes = await axios.get("http://localhost:4000/api/events/view-events");

            const events = eventRes.data?.data?.events || eventRes.data?.data || eventRes.data || [];

            const smallEvents = Array.isArray(events)
                ? events.slice(0, 5).map(event => ({
                    title: event.title,
                    city: event.city,
                    category: event.category,
                    venueName: event.venueName,
                    eventDate: new Date(event.eventDate).toDateString(),
                    spotsLeft: event.spotsLeft,
                }))
                : [];

            siteData = JSON.stringify(smallEvents, null, 2);
            console.log("Events fetched:", smallEvents.length, smallEvents[0]?.title);
            console.log("siteData preview:", siteData.slice(0, 200));
        }

        const response = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            max_tokens: 300,
            messages: [
                { role: "system", content: SYSTEM_PROMPT },

                {
                    role: "system",
                    content: siteData
                        ? `Use only this real event data. Do not invent events:\n${siteData}`
                        : "No event data was fetched.",
                },
                ...history,
                { role: "user", content: message }
            ]
        });

        const reply = response.choices[0].message.content;
        res.json({ reply });
    }
    catch (err) {
        console.log("CHATBOT ERROR:", err.message);
        console.log("FULL ERROR:", err.response?.data);

        return res.status(500).json({
            success: false,
            reply: "Bot unavailable right now.",
            error: err.message,
        });
    }
}
)

module.exports = router;