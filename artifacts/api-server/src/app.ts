import express, { type Express } from "express";
import cors from "cors";
import path from "path";
import router from "./routes";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

app.get("/download/tmh-platform.html", (_req, res) => {
  res.download(
    path.resolve("/home/runner/workspace/tmh-platform-standalone.html"),
    "tmh-platform.html"
  );
});

export default app;
