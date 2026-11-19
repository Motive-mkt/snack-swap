/*
  FTC 16 CFR Part 465 — only REAL reviews from real people may go here.
  Only add real quotes you have permission to use, word for word. If the reviewer received
  the guide free (or any other material connection exists) set `disclosure` accordingly.
  The site only renders this list when SITE.SHOW_VERIFIED_REVIEWS === true.
*/
export type Review = {
  name: string;
  detail: string; // e.g. "Nairobi" or "Age 27, Austin TX"
  swapTried: string;
  quote: string; // the reviewer's own words, unedited
  disclosure: "verified-buyer" | "free-advance-copy";
};

export const REVIEWS: Review[] = [];
