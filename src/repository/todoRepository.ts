import { SQL } from "bun";
import { Effect, Data, Context } from "effect";

export class DbError extends Data.TaggedError("DbError")<{
  cause: unknown;
}> {}

export class NotFoundError extends Data.TaggedError("NotFoundError")<{
  id: string;
}> {}

interface DbConnectionImpl {
  pg: SQL;
}

export class DbConnection extends Context.Tag("DbConnection")<
  DbConnection,
  DbConnectionImpl
>() {}

export interface Todo {
  id: string;
  body: string;
  completed: boolean;
}

export const repoGetTodoById = (
  id: string,
): Effect.Effect<Todo, NotFoundError | DbError, DbConnection> =>
  Effect.gen(function* () {
    const db = yield* DbConnection;
    const rows = yield* Effect.tryPromise({
      try: () => db.pg`SELECT * FROM todos WHERE id = ${id}`,
      catch: (e) => new DbError({ cause: e }),
    });

    if (rows.length === 0) {
      return yield* Effect.fail(new NotFoundError({ id }));
    }

    return rows[0] as Todo;
  });
