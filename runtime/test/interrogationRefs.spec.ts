import { describe, expect, it } from "vitest";
import {
  characterIdToCharacterWindowToken,
  characterIdToInterrogationSourceRef,
  characterWindowTokenToCharacterId,
  interrogationSourceRefToCharacterId,
} from "../src/utils/interrogationRefs.js";

describe("interrogation ref helpers", () => {
  it("maps character ids to interrogation source refs", () => {
    expect(characterIdToInterrogationSourceRef("char_sharif")).toBe("INT-SHARIF-01");
    expect(characterIdToInterrogationSourceRef("char_abu_khaled")).toBe("INT-ABU-KHALED-01");
  });

  it("maps interrogation refs and window tokens back to character ids", () => {
    expect(interrogationSourceRefToCharacterId("INT-ABU-KHALED-01")).toBe("char_abu_khaled");
    expect(characterWindowTokenToCharacterId("CHAR-ABU-KHALED")).toBe("char_abu_khaled");
    expect(characterIdToCharacterWindowToken("char_abu_khaled")).toBe("CHAR-ABU-KHALED");
  });

  it("ignores non-suspect sources", () => {
    expect(interrogationSourceRefToCharacterId("CHIEF-DESK")).toBeNull();
    expect(characterWindowTokenToCharacterId("TIMELINE-BOARD")).toBeNull();
  });
});
