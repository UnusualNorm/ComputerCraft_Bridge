import { Computer, createHandler } from "./mod.ts";
import { Turtle } from "./turtle.ts";

enum Direction {
  North,
  East,
  South,
  West,
}

const computers: Computer[] = [];

Deno.serve(createHandler(async (computer) => {
  console.log(
    `Client connected! (${await computer._HOST})`,
  );

  computers.push(computer);

  // const history = ["potato", "orange", "apple"];
  // const choices = ["apple", "orange", "banana", "strawberry"];

  // await computer.write("> ");
  // const input = await computer.read(
  //   undefined,
  //   history,
  //   (partial) =>
  //     choices.filter((choice) => choice.startsWith(partial)).map((
  //       choice,
  //     ) => choice.substring(partial.length)),
  //   "potato",
  // );
  // await computer.print(input);
}));

const asyncPrompt = async (prompt: string): Promise<string | null> => {
  const buf = new Uint8Array(1024);
  await Deno.stdout.write(new TextEncoder().encode(prompt));
  const n = await Deno.stdin.read(buf);
  if (n === null) return null;
  return new TextDecoder().decode(buf.subarray(0, n)).trim();
};

const repl = async () => {
  const input = await asyncPrompt("> ");
  if (input === null) return;
  computers.forEach((computer) => computer.eval(input));
  repl();
};
repl();
