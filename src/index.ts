import { Hono, type Context } from "hono";
import { Effect } from "effect";
import { getTodoById } from "./service/todoService";
import { DbConnection } from "./repository/todoRepository";
import { pg } from "./db";
import type { ContentfulStatusCode } from "hono/utils/http-status";

const app = new Hono();

app.get("todo/:id", async (c) => {
  const handler = Effect.gen(function* () {
    const id = c.req.param("id");
    const todo = yield* getTodoById(id);
    return c.json(todo);
  });

  return Effect.runPromise(
    handler.pipe(
      Effect.provideService(DbConnection, { pg }),
      Effect.catchTags({
        MissingIdError: (e) => errorResponse(c, `Invalid ID: ${e.id}`, 400),
        NotFoundError: () => errorResponse(c, "Not found", 404),
        DbError: () => errorResponse(c, "Internal error", 500),
      }),
    ),
  );
});

const errorResponse = (
  c: Context,
  message: string,
  status: ContentfulStatusCode,
) => Effect.succeed(c.json({ error: message }, status));
