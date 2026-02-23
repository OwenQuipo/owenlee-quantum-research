# Quantum Structural Limits

A research-driven investigation of the structural constraints that define quantum information.

This repository reconstructs and tests foundational operational limits — including no-cloning, entanglement monogamy, channel degradability, capacity collapse, error correction, and information geometry — through formal analysis and reproducible computational experiments.

The goal is not novelty.  
The goal is disciplined reconstruction, structured experimentation, and conceptual synthesis.

---

## Motivation

Quantum information is defined as much by what cannot be done to it as by what can.

Unlike classical information, quantum states:

- cannot be copied,
- cannot be broadcast,
- cannot be freely shared,
- and cannot survive arbitrary noise.

These constraints are not engineering limitations; they are structural features of the theory. This project studies those features operationally and computationally, with an emphasis on understanding how limits shape the architecture of quantum computation.

---

## Core Questions

This repository is organized around the following guiding questions:

- What does it operationally mean to “copy” a quantum state?
- Why does entanglement obey strict monogamy constraints?
- How do degradability and capacity collapse enforce non-duplicability?
- How does quantum error correction protect information without violating no-cloning?
- Can geometric quantities (e.g., Quantum Fisher Information) predict fragility under noise?

Each question is explored both formally (derivations, theoretical notes) and computationally (simulations, reproducible experiments, benchmarked results).

---

## Aspects of Investigation

### 1. No-Cloning and Access Structure  
Operational definitions of cloning, approximate cloning bounds, and the role of degradable/antidegradable channels.

### 2. Entanglement Monogamy  
Numerical verification of monogamy inequalities and visualization of correlation trade-offs.

### 3. Error Correction vs Duplication  
Logical encoding, stabilizer structure, and how redundancy differs fundamentally from copying.

### 4. Information Geometry and Fragility  
Quantum Fisher Information, distinguishability metrics, and robustness under noise.

---

## Methodology

- Reconstruct known results from first principles.
- Verify structural limits numerically.
- Compare across small systems where exact simulation is possible.
- Maintain reproducibility and explicit assumptions.
- Separate formal derivation from interpretation.

All experiments are designed to be small-scale, transparent, and extensible.

---

## Philosophy of the Project

This repository does not treat philosophy as speculative metaphysics.  
Instead, philosophical questions arise downstream of formal results.

When quantum information refuses duplication, collapses under certain channels, or survives only through encoded structure, the question is not merely “how,” but “what kind of entity behaves this way?”

Operational limits provide the entry point.

---

## Status

This is a long-term, cumulative investigation.  
Work progresses through milestone-based experiments and structured theory notes.

See `research_log/` for current progress and next objectives.

---
