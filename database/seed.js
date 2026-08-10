require("dotenv").config();

const neo4j = require("neo4j-driver");

const driver = neo4j.driver(
    process.env.COGNODB_URI,
    neo4j.auth.basic(
        process.env.COGNODB_USERNAME,
        process.env.COGNODB_PASSWORD
    )
);

async function seedDatabase() {
    const session = driver.session();

    try {
        console.log("Clearing old data...");

        await session.run(`
            MATCH (n)
            DETACH DELETE n
        `);

        console.log("Adding job data...");

        await session.run(`
            CREATE
            (c1:Company {
                name: 'TechNova Solutions'
            }),

            (c2:Company {
                name: 'CloudSphere Technologies'
            }),

            (c3:Company {
                name: 'DataWorks India'
            }),

            (j1:Job {
                title: 'Python Full Stack Developer',
                location: 'Hyderabad',
                salary: '6-10 LPA'
            }),

            (j2:Job {
                title: 'JavaScript Developer',
                location: 'Hyderabad',
                salary: '5-8 LPA'
            }),

            (j3:Job {
                title: 'Data Analyst',
                location: 'Bangalore',
                salary: '5-9 LPA'
            }),

            (s1:Skill {
                name: 'Python'
            }),

            (s2:Skill {
                name: 'Flask'
            }),

            (s3:Skill {
                name: 'JavaScript'
            }),

            (s4:Skill {
                name: 'Node.js'
            }),

            (s5:Skill {
                name: 'SQL'
            }),

            (s6:Skill {
                name: 'React'
            }),

            (j1)-[:OFFERED_BY]->(c1),
            (j2)-[:OFFERED_BY]->(c2),
            (j3)-[:OFFERED_BY]->(c3),

            (j1)-[:REQUIRES]->(s1),
            (j1)-[:REQUIRES]->(s2),
            (j1)-[:REQUIRES]->(s5),

            (j2)-[:REQUIRES]->(s3),
            (j2)-[:REQUIRES]->(s4),
            (j2)-[:REQUIRES]->(s6),

            (j3)-[:REQUIRES]->(s5),
            (j3)-[:REQUIRES]->(s1)
        `);

        console.log("Database seeded successfully!");

    } catch (error) {

        console.error("Seed error:");
        console.error(error);

    } finally {

        await session.close();
        await driver.close();

    }
}

seedDatabase();