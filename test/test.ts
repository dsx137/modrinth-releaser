import "@actions/core";

await (async () => {
  const dotenv = await import("dotenv");
  dotenv.config();
  const originalWrite = process.stdout.write.bind(process.stdout);
  process.stdout.write = (
    str: string | Uint8Array,
    encoding?: BufferEncoding | ((err?: Error) => void),
    cb?: (err?: Error) => void
  ): boolean => {
    if (typeof encoding === "function") {
      cb = encoding;
      encoding = undefined;
    }

    if (process.env.ACTIONS_STEP_DEBUG === "true" || (typeof str === "string" && !str.startsWith("::debug::"))) {
      return originalWrite(str, encoding as BufferEncoding, cb);
    }

    return true;
  };
  await import("../src/index");
})();
