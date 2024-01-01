import {
  dirname,
  fromFileUrl,
} from "https://deno.land/std@0.201.0/path/mod.ts";
import { deserialize, isSerializedCast, serialize } from "./serialization.ts";

const __filename = fromFileUrl(import.meta.url);
const __dirname = dirname(__filename);

const baseClientCode = await Deno.readTextFile(`${__dirname}/client.lua`);
export const createClientCode = (
  secure: boolean,
  host: string,
  pathname: string,
): string =>
  `ConnectionUrl = "${
    secure ? "wss" : "ws"
  }://${host}${pathname}"\n${baseClientCode}`;

export class Computer extends EventTarget {
  private socket: WebSocket;

  public remoteCallbacks: Map<number, (...args: any[]) => Promise<any[]>>;
  public localCallbacks: Map<
    number,
    (...args: any[]) => any[] | Promise<any[]>
  >;

  private evalRequests: Map<number, [
    resolve: (output: any[]) => void,
    reject: (reason: string) => void,
  ]>;

  private remoteCallbackRequests: Map<number, [
    resolve: (output: any[]) => void,
    reject: (reason: string) => void,
  ]>;

  constructor(
    socket: WebSocket,
  ) {
    super();
    this.socket = socket;
    this.remoteCallbacks = new Map();
    this.localCallbacks = new Map();

    this.remoteCallbackRequests = new Map();
    this.evalRequests = new Map();

    this.socket.addEventListener("close", () => {
      for (const request of this.evalRequests.values()) {
        const [, reject] = request;
        reject("Connection closed");
      }
      this.evalRequests.clear();
      for (const request of this.remoteCallbackRequests.values()) {
        const [, reject] = request;
        reject("Connection closed");
      }
      this.remoteCallbackRequests.clear();

      this.remoteCallbacks.clear();
      this.localCallbacks.clear();
      this.dispatchEvent(new Event("close"));
    });

    this.socket.addEventListener("message", async (event) => {
      let message;
      try {
        message = JSON.parse(event.data);
      } catch (error) {
        return;
      }

      if (!Array.isArray(message)) return;
      const [type, ...args] = message;

      switch (type) {
        case "eval_resolve": {
          const [id, rawOutput, outputCast] = args;
          if (typeof id !== "number") return;
          if (!Array.isArray(rawOutput)) return;
          if (!Array.isArray(outputCast)) return;
          if (!isSerializedCast(outputCast)) return;

          let output;
          try {
            output = deserialize(rawOutput, outputCast, (id) => {
              const callback = this.remoteCallbacks.get(id);
              if (!callback) throw new Error("Callback not found");
              return callback;
            });
          } catch (error) {
            return;
          }

          const request = this.evalRequests.get(id);
          if (!request) return;
          this.evalRequests.delete(id);
          const [resolve] = request;
          resolve(output);
          break;
        }
        case "eval_reject": {
          const [id, reason] = args;
          if (typeof id !== "number") return;
          if (reason != undefined && typeof reason !== "string") return;

          const request = this.evalRequests.get(id);
          if (!request) return;
          this.evalRequests.delete(id);
          const [, reject] = request;
          reject(reason);
          break;
        }
        case "callback_create": {
          const [id] = args;
          if (typeof id !== "number") return;
          const callback = (...rawArgs: any[]) => {
            const requestId = this.getUniqueMapKey(
              this.remoteCallbackRequests,
            );
            const promise = new Promise<any[]>((resolve, reject) =>
              this.remoteCallbackRequests.set(requestId, [resolve, reject])
            );

            const [args, argsCast] = serialize(rawArgs, (callback) => {
              const callbackId = this.getUniqueMapKey(this.localCallbacks);
              this.localCallbacks.set(callbackId, callback);
              this.socket.send(JSON.stringify(["callback_create", callbackId]));
              return callbackId;
            });

            this.socket.send(
              JSON.stringify([
                "callback_request",
                requestId,
                id,
                args,
                argsCast,
              ]),
            );
            return promise;
          };
          this.remoteCallbacks.set(id, callback);
          break;
        }
        case "callback_resolve": {
          const [id, rawOutput, outputCast] = args;
          if (typeof id !== "number") return;
          if (!Array.isArray(rawOutput)) return;
          if (!Array.isArray(outputCast)) return;
          if (!isSerializedCast(outputCast)) return;

          let output;
          try {
            output = deserialize(rawOutput, outputCast, (id) => {
              const callback = this.remoteCallbacks.get(id);
              if (!callback) throw new Error("Callback not found");
              return callback;
            });
          } catch (error) {
            return;
          }

          const request = this.remoteCallbackRequests.get(id);
          if (!request) return;
          this.remoteCallbackRequests.delete(id);
          const [resolve] = request;
          resolve(output);
          break;
        }
        case "callback_reject": {
          const [id, reason] = args;
          if (typeof id !== "number") return;
          if (reason != undefined && typeof reason !== "string") return;

          const request = this.remoteCallbackRequests.get(id);
          if (!request) return;
          this.remoteCallbackRequests.delete(id);
          const [, reject] = request;
          reject(reason);
          break;
        }
        case "callback_request": {
          const [requestId, callbackId, rawArgs, argsCast] = args;
          if (typeof requestId !== "number") return;
          if (typeof callbackId !== "number") return;
          if (!Array.isArray(rawArgs)) return;
          if (!Array.isArray(argsCast)) return;
          if (!isSerializedCast(argsCast)) return;

          let callbackArgs;
          try {
            callbackArgs = deserialize(rawArgs, argsCast, (id) => {
              const callback = this.remoteCallbacks.get(id);
              if (!callback) throw new Error("Callback not found");
              return callback;
            });
          } catch (error) {
            return;
          }

          const callback = this.localCallbacks.get(callbackId);
          if (!callback) {
            this.socket.send(
              JSON.stringify([
                "callback_reject",
                requestId,
                "Callback not found",
              ]),
            );
            return;
          }

          let rawOutput;
          try {
            rawOutput = await callback(...callbackArgs);
          } catch (error) {
            this.socket.send(
              JSON.stringify(["callback_reject", requestId, error.message]),
            );
            return;
          }

          const [output, outputCast] = serialize(rawOutput, (callback) => {
            const callbackId = this.getCallbackIdByCallback(callback);
            if (callbackId === undefined) {
              throw new Error("Callback not found");
            }
            return callbackId;
          });

          this.socket.send(
            JSON.stringify([
              "callback_resolve",
              requestId,
              output,
              outputCast,
            ]),
          );
          break;
        }
        case "callback_delete": {
          const [id] = args;
          if (typeof id !== "number") return;
          this.remoteCallbacks.delete(id);
          break;
        }
        case "event": {
          const [eventName, rawArgs, argsCast] = args;
          if (typeof eventName !== "string") return;
          if (!Array.isArray(rawArgs)) return;
          if (!Array.isArray(argsCast)) return;
          if (!isSerializedCast(argsCast)) return;

          let eventArgs;
          try {
            eventArgs = deserialize(rawArgs, argsCast, (id) => {
              const callback = this.remoteCallbacks.get(id);
              if (!callback) throw new Error("Callback not found");
              return callback;
            });
          } catch (error) {
            return;
          }

          this.dispatchEvent(new CustomEvent(eventName, { detail: eventArgs }));
          break;
        }
      }
    });
  }

  public registerCallback(
    callback: (...args: any[]) => any[] | Promise<any[]>,
  ): number {
    const callbackId = this.getUniqueMapKey(this.localCallbacks);
    this.localCallbacks.set(callbackId, callback);
    this.socket.send(JSON.stringify(["callback_create", callbackId]));
    return callbackId;
  }

  public unregisterCallback(callbackId: number): void {
    this.localCallbacks.delete(callbackId);
    this.socket.send(JSON.stringify(["callback_delete", callbackId]));
  }

  private getCallbackIdByCallback(
    callback: (...args: any[]) => any[] | Promise<any[]>,
  ): number | undefined {
    for (const [id, registeredCallback] of this.localCallbacks) {
      if (registeredCallback === callback) return id;
    }
    return undefined;
  }

  private getUniqueMapKey(map: Map<number, any>): number {
    let id = 0;
    while (map.has(id)) id++;
    return id;
  }

  public eval(
    code: string,
    ...rawArgs: any[]
  ): Promise<any[]> {
    const requestId = this.getUniqueMapKey(this.evalRequests);
    const promise = new Promise<any[]>((resolve, reject) =>
      this.evalRequests.set(requestId, [resolve, reject])
    );

    const tmpCallbacks: number[] = [];
    const [args, argsCast] = serialize(rawArgs, (callback) => {
      let callbackId = this.getCallbackIdByCallback(callback);
      if (callbackId === undefined) {
        callbackId = this.registerCallback(callback);
        tmpCallbacks.push(callbackId);
      }
      return callbackId;
    });

    this.socket.send(
      JSON.stringify(["eval_request", requestId, code, args, argsCast]),
    );
    return promise.then((output) => {
      for (const callbackId of tmpCallbacks) {
        this.unregisterCallback(callbackId);
      }
      return output;
    }).catch((reason) => {
      for (const callbackId of tmpCallbacks) {
        this.unregisterCallback(callbackId);
      }
      throw reason;
    });
  }

  async sleep(time: number): Promise<void> {
    await this.eval(`sleep(${time})`);
  }

  async write(text: string): Promise<number> {
    const out = await this.eval(`return write(table.unpack(arg))`, text);
    if (typeof out[0] !== "number") throw new Error("Expected number");
    return out[0];
  }

  async print(...values: any[]): Promise<number> {
    const out = await this.eval(`return print(table.unpack(arg))`, ...values);
    if (typeof out[0] !== "number") throw new Error("Expected number");
    return out[0];
  }

  async printError(...values: any[]): Promise<void> {
    await this.eval(`printError(table.unpack(arg))`, ...values);
  }

  async read(
    replaceChar?: string,
    history?: string[],
    completeFn?: (partial: string) => string[] | Promise<string[]>,
    defaultValue?: string,
  ): Promise<string> {
    const out = await this.eval(
      "return read(table.unpack(arg))",
      replaceChar,
      history,
      completeFn
        ? async (partial: string) => [await completeFn(partial)]
        : undefined,
      defaultValue,
    );
    return out[0];
  }

  public get _HOST(): Promise<string> {
    return this.eval("return _HOST").then((out) => {
      if (typeof out[0] !== "string") throw new Error("Expected string");
      return out[0];
    });
  }

  public get _CC_DEFAULT_SETTINGS(): Promise<string> {
    return this.eval("return _CC_DEFAULT_SETTINGS").then((out) => {
      if (typeof out[0] !== "string") throw new Error("Expected string");
      return out[0];
    });
  }
}

export const createHandler = (
  onConnection: (
    computer: Computer,
  ) => void,
): (req: Request) => Response =>
(
  req: Request,
) => {
  if (req.headers.get("upgrade") === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(req);
    const computer = new Computer(socket);
    socket.addEventListener("open", () => onConnection(computer));
    return response;
  }

  const { pathname, host, protocol } = new URL(req.url);
  const secure = protocol === "https:" || protocol === "wss:";
  return new Response(createClientCode(secure, host, pathname));
};
