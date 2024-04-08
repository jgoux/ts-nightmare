import dataModel from "./dataModel.json" with { type: "json" };
import { getSeedClient } from "@snaplet/seed/dialects/postgres/client";
import { userModels } from "./userModels.js";

const seedConfigPath = "/Users/jgoux/Documents/code/seed-alpha-playground/seed.config.ts";

export const createSeedClient = getSeedClient({ dataModel, seedConfigPath, userModels });