import { Router, type IRouter } from "express";
import healthRouter from "./health";
import surveyRouter from "./survey";

const router: IRouter = Router();

router.use(healthRouter);
router.use(surveyRouter);

export default router;
