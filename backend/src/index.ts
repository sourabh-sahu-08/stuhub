import http from "http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";

const app = createApp();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: env.CLIENT_URL,
    credentials: true
  }
});

app.set("io", io);

io.on("connection", (socket) => {
  socket.on("join", (userId: string) => socket.join(userId));
  socket.emit("notification", {
    title: "Connected to Stuhub",
    body: "Realtime campus updates are live."
  });
});

await connectDatabase();

server.listen(env.PORT, () => {
  console.log(`Stuhub API listening on http://localhost:${env.PORT}`);
});
