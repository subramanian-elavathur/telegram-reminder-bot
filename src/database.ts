import GlitchDB from "glitch-db";

const GLITCH_DB_CACHE_SIZE = 1000;

const database = new GlitchDB(process.env.DB_DIRECTORY, GLITCH_DB_CACHE_SIZE);

export default database;
