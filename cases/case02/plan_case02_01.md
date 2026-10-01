# Plan: Case 02 - The Clockmaker's Echo (01)

## Narrative Arc: The First Shadow
In Case 01, we established the basic investigative loop. Case 02 shifts the paradigm: the "Mirror" case. The player is given a task that looks like a routine insurance fraud investigation (a local bookstore fire), but the 12-second corrupted video file from Case 01 starts being used as a decryption key or a recursive seed for evidence reinterpretation.

### Core Seed: The Clockmaker's Fingerprint
- **Inventory Carryover**: `DIG-03-CORRUPT-12S` (Digital Evidence).
- **The Twist**: Evidence in Case 02 will exist in "Superposition". It will show one thing until the player "observes" it through the lens of the 12s video metadata, revealing a secondary layer (The Mirror World).

## Technical Objectives

### 1. Cross-Case Persistence Integration
- **Clarity Modifier Application**: Case 02 will load with the `clarity_modifier` calculated from Case 01's route resolution.
- **Hidden Context**: Loading specific "Trinity Hooks" based on the `is_clockmaker_suspicious_1` flag from Case 01.

### 2. New Mechanic: Investigative Mirroring
- **Superposition State**: Evidence with two valid interpretations.
- **System Change**: Enhance `ReinterpretationSystem` to handle `globalFlag` dependencies derived from the 12s video analysis.

## Proposed Components

### Case Data
- **[NEW] [case02.json](file:///D:/game/cases/case02/case02.json)**
- **[NEW] [blueprints.json](file:///D:/game/cases/case02/blueprints.json)**

### Narrative Hooks
- **High Clarity Start**: Chief Desk commends the player's "subtle awareness". Player receives an extra "Internal Memo" seed.
- **Low Clarity Start**: Player is warned about "missing the motive" in Case 01. Chief Desk assumes a biased financial motive for Case 02.

## Verification Plan
1. **Scenario: Mirror Revelation**: Verify that loading the 12s video metadata correctly flips a superposition evidence state.
2. **Scenario: Route Divergence**: Test that Case 02 starting conditions differ based on Case 01 closure flags.
