import { createServer } from "node:http";

import { env } from "./config/env.js";
import { app } from "./app.js";
import { initializeSocket } from "./socket/socket.js";

const httpServer = createServer(app);

initializeSocket(httpServer);

httpServer.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
});
