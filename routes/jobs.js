const express = require("express");
const router = express.Router();

const neo4j = require("neo4j-driver");

const driver = neo4j.driver(
    process.env.COGNODB_URI,
    neo4j.auth.basic(
        process.env.COGNODB_USERNAME,
        process.env.COGNODB_PASSWORD
    )
);

// Get all jobs
router.get("/", async (req, res) => {

    const session = driver.session();

    try {

        const result = await session.run(`
            MATCH (j:Job)-[:OFFERED_BY]->(c:Company)
            MATCH (j)-[:REQUIRES]->(s:Skill)

            RETURN
                j.title AS title,
                j.location AS location,
                j.salary AS salary,
                c.name AS company,
                collect(s.name) AS skills

            ORDER BY j.title
        `);

        const jobs = result.records.map(record => ({
            title: record.get("title"),
            location: record.get("location"),
            salary: record.get("salary"),
            company: record.get("company"),
            skills: record.get("skills")
        }));

        res.json(jobs);

    } catch (error) {

        console.error("Error loading jobs:", error);

        res.status(500).json({
            success: false,
            message: "Unable to load jobs"
        });

    } finally {

        await session.close();

    }
});

module.exports = router;