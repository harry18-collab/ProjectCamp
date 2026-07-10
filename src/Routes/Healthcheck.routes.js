import { Router} from "express";
import { healthcheck } from "../controllers/Healtcheck.connection.js";

const router=Router()

router.route("/").get(healthcheck)

export default router