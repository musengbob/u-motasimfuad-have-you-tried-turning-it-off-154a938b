import * as fs from "node:fs";
import * as path from "node:path";

// Competition rule: the entry is one funny single-line reply, 1-199 characters,
// that a hopeless tech support agent gives a desperate customer.
// Why this line should land: it takes the stock support line everyone knows
// ("turn it off and on again") and twists it — the agent cheerfully applies
// the same fix to the customer's expectations instead of the machine. The
// agent's uselessness is the joke, the customer is never the butt of it, and
// the desperation is felt in "the only thing still running" rather than
// explained. Tight, fresh, and clear on a first read.

// Finisher revision (2026-11-25): the phase-1 build wrote main.ts in a single
// top-level pass. This revision extracts the gate, the entry builder, and the
// main wiring into named units so the build transcript reproduces the file
// from its recorded reasoning. The entry text is byte-identical to phase 1.

const GATE = {
  MIN_CHARS: 1,
  MAX_CHARS: 199,
} as const;

function buildEntryLine(): string {
  return "Have you tried turning it off and on again? Brilliant — now try turning your expectations off and on again, they're the only thing still running.";
}

function resolveOutputDir(): string {
  if (process.env.MAKEFUN_OUTPUT_DIR && process.env.MAKEFUN_OUTPUT_DIR.trim() !== "") {
    return process.env.MAKEFUN_OUTPUT_DIR;
  }
  if (process.env.OUTPUT_PATH && process.env.OUTPUT_PATH.trim() !== "") {
    return path.dirname(process.env.OUTPUT_PATH);
  }
  if (process.env.MAKEFUN_BOT_DIR && process.env.MAKEFUN_BOT_DIR.trim() !== "") {
    return "/output";
  }
  return path.join(process.cwd(), "output");
}

function validateEntry(readBack: string, line: string): void {
  const codePoints = [...readBack].length;
  if (readBack !== line) {
    console.error("Validation failed: entry.txt is not byte-identical to the line.");
    process.exit(1);
  }
  if (codePoints < GATE.MIN_CHARS || codePoints > GATE.MAX_CHARS) {
    console.error(
      `Validation failed: ${codePoints} characters, must be ${GATE.MIN_CHARS}-${GATE.MAX_CHARS}.`,
    );
    process.exit(1);
  }
  if (readBack.trim().length === 0) {
    console.error("Validation failed: line is only whitespace.");
    process.exit(1);
  }
  if (readBack.includes("\n")) {
    console.error("Validation failed: entry must be a single line.");
    process.exit(1);
  }
}

function main(): void {
  const line = buildEntryLine();
  const outDir = resolveOutputDir();
  fs.mkdirSync(outDir, { recursive: true });

  const outPath = path.join(outDir, "entry.txt");
  fs.writeFileSync(outPath, line, "utf8");

  const readBack = fs.readFileSync(outPath, "utf8");
  validateEntry(readBack, line);

  const codePoints = [...readBack].length;
  const bytes = Buffer.byteLength(readBack, "utf8");
  console.log(`Wrote ${codePoints} characters (${bytes} bytes) to ${outPath}:`);
  console.log(readBack);
  console.log(
    `Validation passed: byte-identical, single line, within ${GATE.MIN_CHARS}-${GATE.MAX_CHARS} characters.`,
  );
}

main();
