/* ===========================================================================
   ILLUSTRATIVE ONLY. Nothing in this file is model output.

   Each entry is one context: `v` holds a preference position per candidate,
   `w` holds the positions the same candidates take once the leading one is
   out of the comparison. The leader, the replacement and every count are
   derived from these arrays and are never written down.

   Removing the leader must not promote a mid-ranked candidate. Every `w` is
   authored the way the model actually behaves: the whole field rises a little
   against a weaker set, and the only order change is the second and third
   swapping, which is why `v` keeps those two within about 0.03 of each other.

   The leader in `v` is the candidate that lifts off the rail, so it may not be
   one of the top two rows: there is no headroom above them for it.
   =========================================================================== */

var DECIDE_CTX = [
  {
    v: [0.34, 0.69, 0.51, 0.88, 0.19, 0.67, 0.44, 0.28, 0.57],
    w: [0.39, 0.74, 0.57, 0.88, 0.23, 0.78, 0.49, 0.34, 0.61]
  },
  {
    v: [0.61, 0.29, 0.83, 0.42, 0.81, 0.36, 0.90, 0.55, 0.23],
    w: [0.66, 0.34, 0.87, 0.47, 0.91, 0.41, 0.90, 0.60, 0.28]
  },
  {
    v: [0.78, 0.45, 0.31, 0.66, 0.52, 0.24, 0.75, 0.86, 0.39],
    w: [0.83, 0.50, 0.36, 0.71, 0.57, 0.29, 0.86, 0.86, 0.44]
  }
];
