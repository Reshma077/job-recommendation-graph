require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const neo4j = require("neo4j-driver");

const app = express();


// ========================================
// Middleware
// ========================================

app.use(cors());
app.use(express.json());

// Serve frontend files from public folder
app.use(express.static(path.join(__dirname, "public")));


// ========================================
// CognoDB Connection
// ========================================

const driver = neo4j.driver(
    process.env.COGNODB_URI,
    neo4j.auth.basic(
        process.env.COGNODB_USERNAME,
        process.env.COGNODB_PASSWORD
    )
);


// ========================================
// Health Check
// ========================================

app.get("/api/health", async (req, res) => {

    const session = driver.session();

    try {

        const result = await session.run(
            "RETURN 'CognoDB connected successfully' AS message"
        );

        res.json({
            success: true,
            message: result.records[0].get("message")
        });

    } catch (error) {

        console.error("Database connection error:", error);

        res.status(500).json({
            success: false,
            message: "Database connection failed"
        });

    } finally {

        await session.close();

    }
});


// ========================================
// Get All Jobs
// ========================================

app.get("/api/jobs", async (req, res) => {

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


// ========================================
// Search Jobs Using Graph Database
// ========================================

app.get("/api/search", async (req, res) => {

    const skill = req.query.skill || "";
    const location = req.query.location || "";

    const session = driver.session();

    try {

        const result = await session.run(
            `
            MATCH (c:Company)<-[:OFFERED_BY]-(j:Job)-[:REQUIRES]->(s:Skill)

            WHERE
                toLower(s.name) CONTAINS toLower($skill)
                AND
                toLower(j.location) CONTAINS toLower($location)

            RETURN
                j.title AS title,
                j.location AS location,
                j.salary AS salary,
                c.name AS company,
                collect(s.name) AS skills

            ORDER BY j.title
            `,
            {
                skill: skill,
                location: location
            }
        );

        const jobs = result.records.map(record => ({

            title: record.get("title"),

            location: record.get("location"),

            salary: record.get("salary"),

            company: record.get("company"),

            skills: record.get("skills")

        }));

        res.json(jobs);

    } catch (error) {

        console.error("Search error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to search jobs"
        });

    } finally {

        await session.close();

    }
});


// ========================================
// Multi-Hop Graph Query
// ========================================

app.get("/api/graph", async (req, res) => {

    const session = driver.session();

    try {

        const result = await session.run(`
            MATCH path =
                (c:Company)<-[:OFFERED_BY]-
                (j:Job)-[:REQUIRES]->
                (s:Skill)

            RETURN
                c.name AS company,
                j.title AS job,
                s.name AS skill,
                length(path) AS hops

            ORDER BY company, job
        `);

        const graphData = result.records.map(record => ({

            company: record.get("company"),

            job: record.get("job"),

            skill: record.get("skill"),

            hops: record.get("hops").toNumber()

        }));

        res.json(graphData);

    } catch (error) {

        console.error("Graph query error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to execute graph query"
        });

    } finally {

        await session.close();

    }
});


// ========================================
// Root Route
// ========================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "public", "index.html")
    );

});


// ========================================
// Error Handler
// ========================================

app.use((err, req, res, next) => {

    console.error("Server error:", err);

    res.status(500).json({
        success: false,
        message: "Internal server error"
    });

});


// ========================================
// Start Server
// ========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(
        `Server running on http://localhost:${PORT}`
    );

});