import { Effect, Data } from "effect";
import { repoGetTodoById } from "../repository/todoRepository";

class MissingIdError extends Data.TaggedError("MissingIdError")<{
  id: string;
}> {}

export const getTodoById = (id: string) =>
  Effect.gen(function* () {
    if (id.trim() === "") return yield* Effect.fail(new MissingIdError({ id }));
    const todo = yield* repoGetTodoById(id);
    return todo;
  });
