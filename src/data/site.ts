/**
 * Site-level content. Same rule as games.ts: `null` means genuinely unsupplied,
 * never filled with plausible-sounding text.
 */

export const site = {
  name: "Bar Ronen",
  /** Roles, stated once. Bar's discipline is the same across every title. */
  role: "Technical Artist & Team Lead",

  /**
   * The design carries a `showEmployer` toggle because naming a current
   * employer while job-hunting is a judgement call. Set this to the studio
   * name to show the line; leave it null and the line is omitted entirely.
   */
  employer: null as string | null,

  /** Bar's own words, verbatim. */
  about:
    "Technical Artist and team lead with a strong Unity background and experience " +
    "shipping and supporting live mobile games. I build tools, solve production and " +
    "performance problems, and work closely with art and development teams while " +
    "staying hands-on in Unity.",

  resume: "/Bar_Ronen_CV.pdf",

  contact: {
    email: "barzie02@gmail.com",
    linkedin: "https://www.linkedin.com/in/bar-ronen",
    github: "https://github.com/Barziee",
  },
};
