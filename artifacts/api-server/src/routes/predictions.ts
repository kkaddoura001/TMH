import { Router } from "express";
import rateLimit from "express-rate-limit";
import { db, predictionsTable, predictionVotesTable } from "@workspace/db";
import { eq, and, count } from "drizzle-orm";

const router = Router();

const voteRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many votes from this IP, please try again later" },
});

router.post("/:id/vote", voteRateLimit, async (req, res) => {
  try {
    const predictionId = Number(req.params.id);
    const { choice, voterToken } = req.body;

    if (!choice || !voterToken) {
      return res.status(400).json({ error: "choice and voterToken are required" });
    }
    if (choice !== "yes" && choice !== "no") {
      return res.status(400).json({ error: "choice must be 'yes' or 'no'" });
    }

    const [prediction] = await db
      .select({ editorialStatus: predictionsTable.editorialStatus })
      .from(predictionsTable)
      .where(eq(predictionsTable.id, predictionId));

    if (!prediction) {
      return res.status(404).json({ error: "Prediction not found" });
    }
    if (prediction.editorialStatus !== "approved") {
      return res.status(403).json({ error: "Voting is not open for this prediction" });
    }

    const [existing] = await db
      .select()
      .from(predictionVotesTable)
      .where(
        and(
          eq(predictionVotesTable.predictionId, predictionId),
          eq(predictionVotesTable.voterToken, voterToken)
        )
      );

    if (existing) {
      return res.status(409).json({ error: "Already voted on this prediction" });
    }

    await db.insert(predictionVotesTable).values({
      predictionId,
      choice,
      voterToken,
      country: null,
    });

    const [yesCount] = await db
      .select({ count: count() })
      .from(predictionVotesTable)
      .where(
        and(
          eq(predictionVotesTable.predictionId, predictionId),
          eq(predictionVotesTable.choice, "yes")
        )
      );
    const [noCount] = await db
      .select({ count: count() })
      .from(predictionVotesTable)
      .where(
        and(
          eq(predictionVotesTable.predictionId, predictionId),
          eq(predictionVotesTable.choice, "no")
        )
      );

    const total = yesCount.count + noCount.count;
    const yesPercentage = total > 0 ? Math.round((yesCount.count / total) * 100) : 50;
    const noPercentage = 100 - yesPercentage;

    await db
      .update(predictionsTable)
      .set({
        yesPercentage,
        noPercentage,
        totalCount: total,
        updatedAt: new Date(),
      })
      .where(eq(predictionsTable.id, predictionId));

    return res.json({
      success: true,
      yesPercentage,
      noPercentage,
      totalCount: total,
    });
  } catch (err) {
    console.error("Prediction vote error:", err);
    return res.status(500).json({ error: "Failed to record prediction vote" });
  }
});

router.get("/:id/results", async (req, res) => {
  try {
    const predictionId = Number(req.params.id);
    const [prediction] = await db
      .select()
      .from(predictionsTable)
      .where(eq(predictionsTable.id, predictionId));

    if (!prediction) {
      return res.status(404).json({ error: "Prediction not found" });
    }

    return res.json({
      yesPercentage: prediction.yesPercentage,
      noPercentage: prediction.noPercentage,
      totalCount: prediction.totalCount,
    });
  } catch (err) {
    console.error("Prediction results error:", err);
    return res.status(500).json({ error: "Failed to fetch prediction results" });
  }
});

export default router;
