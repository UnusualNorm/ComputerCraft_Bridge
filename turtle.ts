import type { Computer } from "./mod.ts";

const genericRun = (computer: Computer, funcion: string, ...args: any[]) =>
  computer.eval(`return ${funcion}(table.unpack(arg))`, ...args);

const genericNumberHandler = async (
  output: Promise<any[]>,
): Promise<number> => {
  const [number] = await output;
  if (typeof number !== "number") {
    throw new Error("Expected number to be number");
  }
  return number;
};

const genericBooleanHandler = async (
  output: Promise<any[]>,
): Promise<boolean> => {
  const [success] = await output;
  if (typeof success !== "boolean") {
    throw new Error("Expected success to be boolean");
  }
  return success;
};

const genericSuccessReasonHandler = async (
  output: Promise<any[]>,
): Promise<[boolean, string | undefined]> => {
  const [success, reason] = await output;
  if (typeof success !== "boolean") {
    throw new Error("Expected success to be boolean");
  }
  if (reason !== undefined && typeof reason !== "string") {
    throw new Error("Expected reason to be string");
  }
  return [success, reason];
};

export class Turtle {
  public static craft(
    computer: Computer,
    limit?: number,
  ): Promise<[boolean, string | undefined]> {
    return genericSuccessReasonHandler(
      genericRun(computer, "turtle.craft", limit),
    );
  }

  public static forward(
    computer: Computer,
  ): Promise<[boolean, string | undefined]> {
    return genericSuccessReasonHandler(genericRun(computer, "turtle.forward"));
  }

  public static back(
    computer: Computer,
  ): Promise<[boolean, string | undefined]> {
    return genericSuccessReasonHandler(genericRun(computer, "turtle.back"));
  }

  public static up(computer: Computer): Promise<[boolean, string | undefined]> {
    return genericSuccessReasonHandler(genericRun(computer, "turtle.up"));
  }

  public static down(
    computer: Computer,
  ): Promise<[boolean, string | undefined]> {
    return genericSuccessReasonHandler(genericRun(computer, "turtle.down"));
  }

  public static turnLeft(
    computer: Computer,
  ): Promise<[boolean, string | undefined]> {
    return genericSuccessReasonHandler(genericRun(computer, "turtle.turnLeft"));
  }

  public static turnRight(
    computer: Computer,
  ): Promise<[boolean, string | undefined]> {
    return genericSuccessReasonHandler(
      genericRun(computer, "turtle.turnRight"),
    );
  }

  public static dig(
    computer: Computer,
    side?: "left" | "right",
  ): Promise<[boolean, string | undefined]> {
    return genericSuccessReasonHandler(
      genericRun(computer, "turtle.dig", side),
    );
  }

  public static digUp(
    computer: Computer,
    side?: "left" | "right",
  ): Promise<[boolean, string | undefined]> {
    return genericSuccessReasonHandler(
      genericRun(computer, "turtle.digUp", side),
    );
  }

  public static digDown(
    computer: Computer,
    side?: "left" | "right",
  ): Promise<[boolean, string | undefined]> {
    return genericSuccessReasonHandler(
      genericRun(computer, "turtle.digDown", side),
    );
  }

  public static place(
    computer: Computer,
    text?: string,
  ): Promise<[boolean, string | undefined]> {
    return genericSuccessReasonHandler(
      genericRun(computer, "turtle.place", text),
    );
  }

  public static placeUp(
    computer: Computer,
    text?: string,
  ): Promise<[boolean, string | undefined]> {
    return genericSuccessReasonHandler(
      genericRun(computer, "turtle.placeUp", text),
    );
  }

  public static placeDown(
    computer: Computer,
    text?: string,
  ): Promise<[boolean, string | undefined]> {
    return genericSuccessReasonHandler(
      genericRun(computer, "turtle.placeDown", text),
    );
  }

  public static drop(
    computer: Computer,
    count?: number,
  ): Promise<[boolean, string | undefined]> {
    return genericSuccessReasonHandler(
      genericRun(computer, "turtle.drop", count),
    );
  }

  public static dropUp(
    computer: Computer,
    count?: number,
  ): Promise<[boolean, string | undefined]> {
    return genericSuccessReasonHandler(
      genericRun(computer, "turtle.dropUp", count),
    );
  }

  public static dropDown(
    computer: Computer,
    count?: number,
  ): Promise<[boolean, string | undefined]> {
    return genericSuccessReasonHandler(
      genericRun(computer, "turtle.dropDown", count),
    );
  }

  public static select(
    computer: Computer,
    slot: number,
  ): Promise<boolean> {
    return genericBooleanHandler(genericRun(computer, "turtle.select", slot));
  }

  public static getItemCount(
    computer: Computer,
    slot?: number,
  ): Promise<number> {
    return genericNumberHandler(
      genericRun(computer, "turtle.getItemCount", slot),
    );
  }

  public static getItemSpace(
    computer: Computer,
    slot?: number,
  ): Promise<number> {
    return genericNumberHandler(
      genericRun(computer, "turtle.getItemSpace", slot),
    );
  }

  public static detect(
    computer: Computer,
  ): Promise<boolean> {
    return genericBooleanHandler(genericRun(computer, "turtle.detect"));
  }

  public static detectUp(
    computer: Computer,
  ): Promise<boolean> {
    return genericBooleanHandler(genericRun(computer, "turtle.detectUp"));
  }

  public static detectDown(
    computer: Computer,
  ): Promise<boolean> {
    return genericBooleanHandler(genericRun(computer, "turtle.detectDown"));
  }

  public static compare(
    computer: Computer,
  ): Promise<boolean> {
    return genericBooleanHandler(genericRun(computer, "turtle.compare"));
  }

  public static compareUp(
    computer: Computer,
  ): Promise<boolean> {
    return genericBooleanHandler(
      genericRun(computer, "turtle.compareUp"),
    );
  }

  public static compareDown(
    computer: Computer,
  ): Promise<boolean> {
    return genericBooleanHandler(
      genericRun(computer, "turtle.compareDown"),
    );
  }

  public static attack(
    computer: Computer,
    side?: "left" | "right",
  ): Promise<[boolean, string | undefined]> {
    return genericSuccessReasonHandler(
      genericRun(computer, "turtle.attack", side),
    );
  }

  public static attackUp(
    computer: Computer,
    side?: "left" | "right",
  ): Promise<[boolean, string | undefined]> {
    return genericSuccessReasonHandler(
      genericRun(computer, "turtle.attackUp", side),
    );
  }

  public static attackDown(
    computer: Computer,
    side?: "left" | "right",
  ): Promise<[boolean, string | undefined]> {
    return genericSuccessReasonHandler(
      genericRun(computer, "turtle.attackDown", side),
    );
  }

  public static suck(
    computer: Computer,
    count?: number,
  ): Promise<[boolean, string | undefined]> {
    return genericSuccessReasonHandler(
      genericRun(computer, "turtle.suck", count),
    );
  }

  public static suckUp(
    computer: Computer,
    count?: number,
  ): Promise<[boolean, string | undefined]> {
    return genericSuccessReasonHandler(
      genericRun(computer, "turtle.suckUp", count),
    );
  }

  public static suckDown(
    computer: Computer,
    count?: number,
  ): Promise<[boolean, string | undefined]> {
    return genericSuccessReasonHandler(
      genericRun(computer, "turtle.suckDown", count),
    );
  }

  public static async getFuelLevel(
    computer: Computer,
  ): Promise<number | "unlimited"> {
    const [fuel] = await genericRun(computer, "turtle.getFuelLevel");
    if (fuel === "unlimited") {
      return fuel;
    }

    if (typeof fuel !== "number") {
      throw new Error("Expected fuel to be number or unlimited");
    }
    return fuel;
  }

  public static refuel(
    computer: Computer,
    count?: number,
  ): Promise<[boolean, string | undefined]> {
    return genericSuccessReasonHandler(
      genericRun(computer, "turtle.refuel", count),
    );
  }

  public static compareTo(
    computer: Computer,
    slot: number,
  ): Promise<boolean> {
    return genericBooleanHandler(
      genericRun(computer, "turtle.compareTo", slot),
    );
  }

  public static transferTo(
    computer: Computer,
    slot: number,
    count?: number,
  ): Promise<boolean> {
    return genericBooleanHandler(
      genericRun(computer, "turtle.transferTo", slot, count),
    );
  }

  public static getSelectedSlot(
    computer: Computer,
  ): Promise<number> {
    return genericNumberHandler(
      genericRun(computer, "turtle.getSelectedSlot"),
    );
  }

  public static async getFuelLimit(
    computer: Computer,
  ): Promise<number | "unlimited"> {
    const [fuel] = await genericRun(computer, "turtle.getFuelLimit");
    if (fuel === "unlimited") {
      return fuel;
    }

    if (typeof fuel !== "number") {
      throw new Error("Expected fuel to be number or unlimited");
    }
    return fuel;
  }

  public static equipLeft(
    computer: Computer,
  ): Promise<[boolean, string | undefined]> {
    return genericSuccessReasonHandler(
      genericRun(computer, "turtle.equipLeft"),
    );
  }

  public static equipRight(
    computer: Computer,
  ): Promise<[boolean, string | undefined]> {
    return genericSuccessReasonHandler(
      genericRun(computer, "turtle.equipRight"),
    );
  }

  public static inspect(computer: Computer): Promise<[true, {
    name: string;
    state: Record<string, unknown>;
    tags: Record<string, boolean>;
  }]>;
  public static inspect(computer: Computer): Promise<[false, string]>;
  public static async inspect(
    computer: Computer,
  ): Promise<[
    boolean,
    {
      name: string;
      state: Record<string, unknown>;
      tags: Record<string, boolean>;
    } | string,
  ]> {
    const [success, result] = await genericRun(
      computer,
      "turtle.inspect",
    );

    if (typeof success !== "boolean") {
      throw new Error("Expected success to be boolean");
    }

    if (success) {
      if (typeof result !== "object") {
        throw new Error("Expected result to be object");
      }

      // TODO: Check if result is correct

      return [true, result];
    } else {
      if (typeof result !== "string") {
        throw new Error("Expected result to be string");
      }

      return [false, result];
    }
  }

  public static inspectUp(computer: Computer): Promise<[true, {
    name: string;
    state: Record<string, unknown>;
    tags: Record<string, boolean>;
  }]>;
  public static inspectUp(computer: Computer): Promise<[false, string]>;
  public static async inspectUp(
    computer: Computer,
  ): Promise<[
    boolean,
    {
      name: string;
      state: Record<string, unknown>;
      tags: Record<string, boolean>;
    } | string,
  ]> {
    const [success, result] = await genericRun(
      computer,
      "turtle.inspectUp",
    );

    if (typeof success !== "boolean") {
      throw new Error("Expected success to be boolean");
    }

    if (success) {
      if (typeof result !== "object") {
        throw new Error("Expected result to be object");
      }

      // TODO: Check if result is correct

      return [true, result];
    } else {
      if (typeof result !== "string") {
        throw new Error("Expected result to be string");
      }

      return [false, result];
    }
  }

  public static inspectDown(computer: Computer): Promise<[true, {
    name: string;
    state: Record<string, unknown>;
    tags: Record<string, boolean>;
  }]>;
  public static inspectDown(computer: Computer): Promise<[false, string]>;
  public static async inspectDown(
    computer: Computer,
  ): Promise<[
    boolean,
    {
      name: string;
      state: Record<string, unknown>;
      tags: Record<string, boolean>;
    } | string,
  ]> {
    const [success, result] = await genericRun(
      computer,
      "turtle.inspectDown",
    );

    if (typeof success !== "boolean") {
      throw new Error("Expected success to be boolean");
    }

    if (success) {
      if (typeof result !== "object") {
        throw new Error("Expected result to be object");
      }

      // TODO: Check if result is correct

      return [true, result];
    } else {
      if (typeof result !== "string") {
        throw new Error("Expected result to be string");
      }

      return [false, result];
    }
  }

  public static getItemDetail(
    computer: Computer,
    slot: number | undefined,
    detailed: false | undefined,
  ): Promise<
    {
      name: string;
      count: number;
    } | undefined
  >;
  public static getItemDetail(
    computer: Computer,
    slot: number | undefined,
    detailed: true,
  ): Promise<
    {
      name: string;
      count: number;
      damage: number;
      maxDamage: number;
      displayName: string;
      lore: string[];
    } | undefined
  >;
  public static async getItemDetail(
    computer: Computer,
    slot?: number,
    detailed?: boolean,
  ): Promise<
    | {
      name: string;
      count: number;
    }
    | {
      name: string;
      count: number;
    }
    | undefined
  > {
    const [result] = await genericRun(
      computer,
      "turtle.getItemDetail",
      slot,
      detailed,
    );

    if (result === undefined) {
      return undefined;
    }

    if (typeof result !== "object") {
      throw new Error("Expected result to be object or undefined");
    }

    // TODO: Check if result is correct

    return result;
  }
}
