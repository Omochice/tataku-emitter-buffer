import type { Denops } from "jsr:@denops/std@7.4.0";
import * as fn from "jsr:@denops/std@7.4.0/function";
import { assert, is } from "jsr:@core/unknownutil@4.3.0";
import type { EmitterFactory } from "jsr:@omochice/tataku-vim@1.1.0";

const isOption = is.ObjectOf({
  bufname: is.String,
});

const emitter: EmitterFactory = (denops: Denops, option: unknown) => {
  assert(option, isOption);
  const state = { bufnr: -1 };
  return new WritableStream<string[]>({
    start: async () => {
      state.bufnr = await fn.bufnr(denops, option.bufname);
    },
    write: async (chunk: string[]) => {
      const linenr = await fn.line(denops, "$");
      const lastLine = await fn.getbufline(denops, state.bufnr, linenr);
      const [currentLine, ...newLines] = chunk.join("").split(/\r?\n/);

      await fn.setbufline(
        denops,
        state.bufnr,
        linenr,
        lastLine + currentLine,
      );
      if (newLines.length > 0) {
        await fn.appendbufline(
          denops,
          state.bufnr,
          linenr,
          newLines,
        );
      }
    },
  });
};

export default emitter;
