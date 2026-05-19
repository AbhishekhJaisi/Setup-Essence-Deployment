const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");
const axios = require("axios");

const server = new McpServer({
    name: "event_management_app",
    version: "1.0.0",
});

// node backend/mcp/eventMcpServer.js

server.tool(
    "get_all_events",
    "Fetch events from the Event Management System",
    {
        city: z.string().optional(),
        category: z.string().optional(),
    },
    async ({ city, category }) => {
        const res = await axios.get("http://localhost:4000/api/events/view-events", {
            params: { city, category },
        });

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(res.data, null, 2),
                },
            ],
        };
    }
);

async function startServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.log("MCP server is running...");
}

startServer();
