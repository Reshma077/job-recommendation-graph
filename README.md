# Job Recommendation Graph

A graph-based job recommendation web application built using Node.js, Express.js, JavaScript, and CognoDB.

The application connects jobs, companies, and skills using a graph data model and allows users to search for jobs based on skills and location.

---

## Project Overview

Job Recommendation Graph helps users discover suitable job opportunities by exploring relationships between:

- Jobs
- Companies
- Skills
- Locations

Instead of treating jobs as isolated records, the application models the relationships between jobs, companies, and required skills using CognoDB.

---

## Why a Graph Database?

A graph database is a good fit for this application because the important information is based on relationships.

For example:

```text
Company
   |
   | OFFERED_BY
   |
  Job
   |
   | REQUIRES
   |
 Skill