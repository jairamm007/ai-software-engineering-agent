import { agentGraph } from "../agents/graph.state.js";

export interface AskRepositoryInput {
  question: string;
  repositoryId?: string;
  filePath?: string;
}

export const askRepository = async ({
  question,
  repositoryId,
  filePath,
}: AskRepositoryInput) => {
  const result = await agentGraph.invoke({
    question,
    repositoryId,
    filePath,
  });

  if (result.answer) {
    const firstChunk = result.chunks?.[0];

    return {
      type: "answer",
      answer: result.answer,
      source: firstChunk
        ? {
            filePath: firstChunk.filePath,
            startLine: firstChunk.startLine,
            endLine: firstChunk.endLine,
            confidence: Math.round((1 - firstChunk.distance) * 100),
          }
        : null,
    };
  }

  if (result.reviewResult) {
    const firstChunk = result.chunks?.[0];

    return {
      type: "review",
      answer: result.reviewResult.summary,
      source: firstChunk
        ? {
            filePath: firstChunk.filePath,
            startLine: firstChunk.startLine,
            endLine: firstChunk.endLine,
            confidence: Math.round((1 - firstChunk.distance) * 100),
          }
        : null,
    };
  }

  if (result.fixResult) {
    const firstChunk = result.chunks?.[0];

    return {
      type: "fix",
      answer: result.fixResult,
      source: firstChunk
        ? {
            filePath: firstChunk.filePath,
            startLine: firstChunk.startLine,
            endLine: firstChunk.endLine,
            confidence: Math.round((1 - firstChunk.distance) * 100),
          }
        : null,
    };
  }

  if (result.commitResult) {
    const firstChunk = result.chunks?.[0];

    return {
      type: "commit",
      answer: result.commitResult,
      source: firstChunk
        ? {
            filePath: firstChunk.filePath,
            startLine: firstChunk.startLine,
            endLine: firstChunk.endLine,
            confidence: Math.round((1 - firstChunk.distance) * 100),
          }
        : null,
    };
  }

  if (result.architecture) {
    const firstChunk = result.chunks?.[0];

    return {
      type: "architecture",
      answer: result.architecture,
      source: firstChunk
        ? {
            filePath: firstChunk.filePath,
            startLine: firstChunk.startLine,
            endLine: firstChunk.endLine,
            confidence: Math.round((1 - firstChunk.distance) * 100),
          }
        : null,
    };
  }

  if (result.documentation) {
    const firstChunk = result.chunks?.[0];

    return {
      type: "documentation",
      answer: result.documentation,
      source: firstChunk
        ? {
            filePath: firstChunk.filePath,
            startLine: firstChunk.startLine,
            endLine: firstChunk.endLine,
            confidence: Math.round((1 - firstChunk.distance) * 100),
          }
        : null,
    };
  }

  if (result.pullRequest) {
    const firstChunk = result.chunks?.[0];

    return {
      type: "pullRequest",
      answer: result.pullRequest,
      source: firstChunk
        ? {
            filePath: firstChunk.filePath,
            startLine: firstChunk.startLine,
            endLine: firstChunk.endLine,
            confidence: Math.round((1 - firstChunk.distance) * 100),
          }
        : null,
    };
  }

  if (result.testResult) {
    const firstChunk = result.chunks?.[0];

    return {
      type: "test",
      answer: result.testResult,
      source: firstChunk
        ? {
            filePath: firstChunk.filePath,
            startLine: firstChunk.startLine,
            endLine: firstChunk.endLine,
            confidence: Math.round((1 - firstChunk.distance) * 100),
          }
        : null,
    };
  }

  if (result.securityResult) {
    const firstChunk = result.chunks?.[0];

    return {
      type: "security",
      answer: result.securityResult,
      source: firstChunk
        ? {
            filePath: firstChunk.filePath,
            startLine: firstChunk.startLine,
            endLine: firstChunk.endLine,
            confidence: Math.round((1 - firstChunk.distance) * 100),
          }
        : null,
    };
  }

  return {
    type: "unknown",
    answer: "No response generated.",
  };
};
