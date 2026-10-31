import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const execFileAsync = promisify(execFile);
export const EGM_UPSTREAM_ROOT = process.env.EGM_UPSTREAM_DIR || join(homedir(), ".local", "share", "opencode", "egm-upstream");

async function git(args) {
  const { stdout = "" } = await execFileAsync(
    "git",
    ["-C", EGM_UPSTREAM_ROOT, ...args],
    { timeout: 120_000, maxBuffer: 8 * 1024 * 1024 },
  );
  return stdout.trim();
}

export async function updateEgmUpstream() {
  if (!existsSync(join(EGM_UPSTREAM_ROOT, ".git"))) {
    throw new Error(`EGM upstream checkout not found: ${EGM_UPSTREAM_ROOT}`);
  }
  const remote = await git(["remote", "get-url", "origin"]);
  if (!/github\.com[:/]google\/elephant-goldfish-model(?:\.git)?$/i.test(remote)) {
    throw new Error(`Refusing to update unexpected Git remote: ${remote}`);
  }
  const branch = await git(["branch", "--show-current"]);
  if (!branch) throw new Error("EGM upstream checkout is detached; refusing automatic update.");
  const tracking = await git(["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{upstream}"]);
  if (!tracking.startsWith("origin/")) {
    throw new Error(`Expected an origin/* tracking branch, found: ${tracking}`);
  }
  const dirty = await git(["status", "--porcelain", "--untracked-files=all"]);
  if (dirty) {
    throw new Error(`EGM upstream checkout has local changes. No update was performed.\n${dirty}`);
  }

  const previous = await git(["rev-parse", "--short", "HEAD"]);
  await git(["fetch", "--prune", "origin"]);
  const counts = await git(["rev-list", "--left-right", "--count", `HEAD...${tracking}`]);
  const [ahead, behind] = counts.split(/\s+/).map(Number);
  if (!Number.isFinite(ahead) || !Number.isFinite(behind)) {
    throw new Error(`Could not determine upstream commit distance: ${counts}`);
  }
  if (ahead > 0 && behind > 0) {
    throw new Error(`Local branch ${branch} and ${tracking} have diverged (${ahead} ahead, ${behind} behind). No update was performed.`);
  }
  if (ahead > 0) {
    throw new Error(`Local branch ${branch} is ${ahead} commit(s) ahead of ${tracking}. Refusing to overwrite local commits.`);
  }
  if (behind === 0) {
    return { updated: false, message: `EGM is already up to date at ${previous} (${branch}).` };
  }
  await git(["merge", "--ff-only", tracking]);
  const current = await git(["rev-parse", "--short", "HEAD"]);
  const subject = await git(["log", "-1", "--pretty=%s"]);
  return {
    updated: true,
    message: `Updated EGM ${previous} → ${current} (${behind} commit(s)). Latest change: ${subject}`,
  };
}
