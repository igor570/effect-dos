import { SQL } from "bun";

export const pg = new SQL("postgres://user:pass@localhost:5432/mydb");
