import { spawn } from "node:child_process";

export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  timedOut: boolean;
}

export const exec = (
  command: string,
  args: string[],
  options: {
    cwd?: string;
    timeoutMs?: number;
    env?: Record<string, string>;
  } = {}
): Promise<ExecResult> =>
  new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env
        ? { ...process.env, ...options.env }
        : process.env,
      windowsHide: true,
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;
    let settled = false;

    const timeout =
      options.timeoutMs ?? 120_000;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, timeout);

    child.stdout?.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr?.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({
        stdout,
        stderr: `${stderr}\n${error.message}`,
        exitCode: 1,
        timedOut,
      });
    });

    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ stdout, stderr, exitCode: code ?? 1, timedOut });
    });
  });

export const isDockerAvailable = async (): Promise<boolean> => {
  const result = await exec("docker", ["info"], { timeoutMs: 15_000 });
  return result.exitCode === 0;
};

export const imageExists = async (image: string): Promise<boolean> => {
  const result = await exec("docker", ["image", "inspect", image], {
    timeoutMs: 15_000,
  });
  return result.exitCode === 0;
};

export const pullImage = async (image: string): Promise<boolean> => {
  const result = await exec("docker", ["pull", image], {
    timeoutMs: 600_000,
  });
  return result.exitCode === 0;
};

export const buildImage = async (
  image: string,
  dockerfileDir: string,
  timeoutMs = 600_000
): Promise<boolean> => {
  const result = await exec(
    "docker",
    ["build", "-t", image, "."],
    { cwd: dockerfileDir, timeoutMs }
  );
  return result.exitCode === 0;
};

export const ensureImage = async (
  image: string,
  buildDockerfileDir?: string
): Promise<boolean> => {
  if (await imageExists(image)) return true;
  if (buildDockerfileDir) {
    return buildImage(image, buildDockerfileDir);
  }
  return pullImage(image);
};

export interface RunContainerOptions {
  image: string;
  hostPath: string; // repo dir to mount at /workspace
  command: string;
  network?: "none" | "bridge";
  extraArgs?: string[];
  timeoutMs?: number;
  env?: Record<string, string>;
  cpus?: number;
  memoryMb?: number;
}

/**
 * Runs a command inside a Docker container with the repo mounted at
 * /workspace. Falls back to executing directly on the host when Docker is
 * unavailable. CPU/memory are pinned for comparable perf runs.
 */
export const runInContainer = async (
  options: RunContainerOptions
): Promise<ExecResult> => {
  const {
    image,
    hostPath,
    command,
    network = "none",
    extraArgs = [],
    timeoutMs = 120_000,
    env = {},
    cpus = 1,
    memoryMb = 512,
  } = options;

  const dockerOk = await isDockerAvailable();
  if (!dockerOk) {
    return execShellFallback(command, { cwd: hostPath, timeoutMs });
  }

  await ensureImage(image);

  const args = [
    "run",
    "--rm",
    `--cpus=${cpus}`,
    `--memory=${memoryMb}m`,
    `--memory-swap=${memoryMb}m`,
    network === "none" ? "--network=none" : "--network=bridge",
    "-v",
    `${hostPath}:/workspace`,
    "-w",
    "/workspace",
    ...extraArgs,
    image,
    "sh",
    "-lc",
    command,
  ];

  const result = await exec("docker", args, {
    timeoutMs: timeoutMs + 20_000,
    env,
  });

  if (result.exitCode === 125) {
    return execShellFallback(command, { cwd: hostPath, timeoutMs });
  }

  return result;
};

const execShellFallback = async (
  command: string,
  options: { cwd?: string; timeoutMs?: number }
): Promise<ExecResult> => {
  console.log(`⚠️ Docker unavailable; running locally: ${command}`);
  return exec("sh", ["-lc", command], options);
};
