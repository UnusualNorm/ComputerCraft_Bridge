export type SerializedCast =
  | boolean
  | SerializedCast[]
  | { [key: string]: SerializedCast };

export const isSerializedCast = (
  value: unknown,
): value is SerializedCast =>
  typeof value === "boolean" ||
  (Array.isArray(value) && value.every((value) => isSerializedCast(value))) ||
  (typeof value === "object" &&
    value !== null &&
    Object.values(value).every((value) => isSerializedCast(value)));

export const deserialize = (
  value: any,
  cast: SerializedCast,
  getRemoteCallback: (id: number) => (...args: any[]) => Promise<any[]>,
): any => {
  if (Array.isArray(value) && !Array.isArray(cast)) {
    throw new Error("Expected cast to be an array");
  }
  if (typeof value === "object" && typeof cast !== "object") {
    throw new Error("Expected cast to be an object");
  }

  if (Array.isArray(value)) {
    return value.map((value, index) =>
      deserialize(
        value,
        (cast as SerializedCast[])[index],
        getRemoteCallback,
      )
    );
  }
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map((
        [key, value],
      ) => [
        key,
        deserialize(
          value,
          (cast as { [key: string]: SerializedCast })[key],
          getRemoteCallback,
        ),
      ]),
    );
  }
  if (typeof value === "number" && cast === true) {
    return getRemoteCallback(value);
  }
  return value;
};

export const serialize = (
  value: any,
  getLocalCallback: (
    callback: (...args: any[]) => any[] | Promise<any[]>,
  ) => number,
): [any, SerializedCast] => {
  if (typeof value === "function") {
    return [getLocalCallback(value), true];
  }
  if (Array.isArray(value)) {
    const bundles = value.map((value) => serialize(value, getLocalCallback));
    return [
      bundles.map(([value]) => value),
      bundles.map(([, cast]) => cast),
    ];
  }

  if (typeof value === "object" && value !== null) {
    const bundles = Object.entries(value).map(([key, value]) => [
      key,
      serialize(value, getLocalCallback),
    ]);

    return [
      Object.fromEntries(bundles.map(([key, [value]]) => [key, value])),
      Object.fromEntries(bundles.map(([key, [, cast]]) => [key, cast])),
    ];
  }

  return [value, false];
};
