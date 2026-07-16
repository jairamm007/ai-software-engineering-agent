export interface DependencyNode {
  file: string;
  imports: string[];
}

export class DependencyGraph {
  private readonly adj = new Map<string, Set<string>>();
  private readonly reverseAdj = new Map<string, Set<string>>();

  addNode(file: string, imports: string[]) {
    if (!this.adj.has(file)) {
      this.adj.set(file, new Set());
    }

    for (const dep of imports) {
      this.adj.get(file)!.add(dep);

      if (!this.reverseAdj.has(dep)) {
        this.reverseAdj.set(dep, new Set());
      }
      this.reverseAdj.get(dep)!.add(file);
    }
  }

  getDependencies(file: string): string[] {
    return [...(this.adj.get(file) ?? [])];
  }

  getDependents(file: string): string[] {
    return [...(this.reverseAdj.get(file) ?? [])];
  }

  getBlastRadius(file: string, depth: number = 2): string[] {
    const affected = new Set<string>();
    let frontier = [file];

    for (let d = 0; d < depth && frontier.length > 0; d++) {
      const next: string[] = [];
      for (const node of frontier) {
        for (const dependent of this.getDependents(node)) {
          if (!affected.has(dependent) && dependent !== file) {
            affected.add(dependent);
            next.push(dependent);
          }
        }
      }
      frontier = next;
    }

    return [...affected];
  }

  detectCircular(): string[][] {
    const cycles: string[][] = [];
    const visiting = new Set<string>();
    const visited = new Set<string>();

    const visit = (node: string, trail: string[]) => {
      if (visiting.has(node)) {
        const cycleStart = trail.indexOf(node);
        if (cycleStart !== -1) {
          cycles.push(trail.slice(cycleStart));
        }
        return;
      }
      if (visited.has(node)) return;

      visiting.add(node);
      for (const dep of this.getDependencies(node)) {
        visit(dep, [...trail, node]);
      }
      visiting.delete(node);
      visited.add(node);
    };

    for (const node of this.adj.keys()) {
      visit(node, []);
    }

    return cycles;
  }

  getGraph(): Map<string, Set<string>> {
    return this.adj;
  }

  getAllNodes(): string[] {
    return [...this.adj.keys()];
  }
}
