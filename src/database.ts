import GlitchDB from "glitch-db";

const GLITCH_DB_CACHE_SIZE = 0;

const database = new GlitchDB(process.env.DB_DIRECTORY, GLITCH_DB_CACHE_SIZE);

export default database;
