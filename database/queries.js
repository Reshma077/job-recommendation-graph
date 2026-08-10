const queries = {

    // Get jobs, companies and required skills
    allJobs: `
        MATCH (j:Job)-[:OFFERED_BY]->(c:Company)
        MATCH (j)-[:REQUIRES]->(s:Skill)

        RETURN
            j.title AS title,
            j.location AS location,
            j.salary AS salary,
            c.name AS company,
            collect(s.name) AS skills

        ORDER BY j.title
    `,


    // Search jobs by skill and location
    searchJobs: `
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


    // Multi-hop graph recommendation
    multiHopRecommendation: `
        MATCH path =
            (c:Company)<-[:OFFERED_BY]-
            (j:Job)-[:REQUIRES]->
            (s:Skill)

        RETURN
            c.name AS company,
            j.title AS job,
            s.name AS skill,
            length(path) AS hops
    `
};


module.exports = queries;