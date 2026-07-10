export interface DependencyNode {
  file: string;
  imports: string[];
}

export class DependencyGraph {
  private readonly graph = new Map<
    string,
    Set<string>
  >();

  addNode(
    file: string,
    imports: string[]
  ) {
    if (!this.graph.has(file)) {
      this.graph.set(file, new Set());
    }

    for (const dependency of imports) {
      this.graph.get(file)!.add(dependency);
    }
  }

  getDependencies(
    file: string
  ) {
    return [
      ...(this.graph.get(file) ?? []),
    ];
  }

  getGraph() {
    return this.graph;
  }
}