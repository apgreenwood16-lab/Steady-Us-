import { describe, expect, it } from "vitest";
import {
  COST_CHANGE_INPUT_STEP,
  CURRENCY_INPUT_MIN,
  CURRENCY_INPUT_STEP,
} from "../client/src/lib/plannerFieldConfig";

describe("planner field configuration", () => {
  it("allows flexible whole-pound currency entry instead of forcing increments of 50", () => {
    expect(CURRENCY_INPUT_STEP).toBe("1");
    expect(CURRENCY_INPUT_MIN).toBe("0");
  });

  it("allows expected monthly cost changes to be entered in single-pound increments", () => {
    expect(COST_CHANGE_INPUT_STEP).toBe("1");
  });
});
