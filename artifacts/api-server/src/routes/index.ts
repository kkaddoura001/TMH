import { Router, type IRouter } from "express";
import healthRouter from "./health";
import pollsRouter from "./polls";
import profilesRouter from "./profiles";
import categoriesRouter from "./categories";
import applyRouter from "./apply";
import newsletterRouter from "./newsletter";
import adminRouter from "./admin";
import cmsRouter from "./cms";
import majlisRouter from "./majlis";
import ideationRouter from "./ideation";

const router: IRouter = Router();

router.use(healthRouter);
router.use(pollsRouter);
router.use(profilesRouter);
router.use(categoriesRouter);
router.use(applyRouter);
router.use(newsletterRouter);
router.use(adminRouter);
router.use(cmsRouter);
router.use(majlisRouter);
router.use(ideationRouter);

export default router;
