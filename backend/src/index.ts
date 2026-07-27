import http from "http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";

import { setupSocketServer } from "./socket/chat.js";

const app = createApp();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: env.NODE_ENV === "production" ? env.CLIENT_URL : true,
    credentials: true
  }
});

app.set("io", io);

setupSocketServer(io);

await connectDatabase();

server.listen(env.PORT, () => {
  console.log(`Stuhub API listening on http://localhost:${env.PORT}`);
});
