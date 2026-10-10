import assert from "node:assert/strict";
import {
  formatReportDeadline,
  getReportDeadline,
  isReportDeadlinePassed,
} from "./reportDeadline";

const settings = { day: 31, time: "23:59" };
const deadline = getReportDeadline(2026, 2, settings);

assert.equal(deadline.toISOString(), "2026-02-28T16:59:00.000Z");
assert.equal(
  isReportDeadlinePassed(2026, 2, settings, new Date("2026-02-28T16:58:59.999Z")),
  false,
);
assert.equal(
  isReportDeadlinePassed(2026, 2, settings, new Date("2026-02-28T16:59:00.000Z")),
  true,
);
assert.match(formatReportDeadline(deadline), /28 Februari 2026 .*23[.:]59 WIB/);

console.log("reportDeadline checks passed");
