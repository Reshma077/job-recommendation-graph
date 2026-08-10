const jobsContainer = document.getElementById("jobsContainer");


// ========================================
// Load all jobs
// ========================================

async function loadJobs() {

    jobsContainer.innerHTML = `
        <div class="loading">
            Loading jobs...
        </div>
    `;

    try {

        const response = await fetch("/api/jobs");

        const jobs = await response.json();

        if (!response.ok) {
            throw new Error("Failed to load jobs");
        }

        displayJobs(jobs);

    } catch (error) {

        console.error(error);

        jobsContainer.innerHTML = `
            <div class="empty">
                Unable to connect to the job database.
                Please try again.
            </div>
        `;
    }
}


// ========================================
// Display jobs
// ========================================

function displayJobs(jobs) {

    if (!jobs || jobs.length === 0) {

        jobsContainer.innerHTML = `
            <div class="empty">
                No jobs found.
            </div>
        `;

        return;
    }


    jobsContainer.innerHTML = jobs.map(job => {

        const skills = job.skills
            .map(skill => `
                <span class="skill">
                    ${skill}
                </span>
            `)
            .join("");


        return `
            <div class="job-card">

                <h3>
                    ${job.title}
                </h3>

                <div class="company">
                    ${job.company}
                </div>

                <div class="info">
                    📍 ${job.location}
                </div>

                <div class="info">
                    💰 ${job.salary}
                </div>

                <div class="skills">
                    ${skills}
                </div>

            </div>
        `;

    }).join("");
}


// ========================================
// Search jobs
// ========================================

async function findJobs() {

    const skill =
        document.getElementById("skill").value.trim();

    const location =
        document.getElementById("location").value.trim();


    if (!skill && !location) {

        loadJobs();

        return;
    }


    jobsContainer.innerHTML = `
        <div class="loading">
            Searching jobs...
        </div>
    `;


    try {

        const response = await fetch("/api/jobs");

        const jobs = await response.json();


        const filteredJobs = jobs.filter(job => {

            const skillMatch =
                !skill ||
                job.skills.some(
                    s => s.toLowerCase().includes(
                        skill.toLowerCase()
                    )
                );

            const locationMatch =
                !location ||
                job.location.toLowerCase().includes(
                    location.toLowerCase()
                );

            return skillMatch && locationMatch;

        });


        displayJobs(filteredJobs);

    } catch (error) {

        console.error(error);

        jobsContainer.innerHTML = `
            <div class="empty">
                Something went wrong.
            </div>
        `;
    }
}


// ========================================
// Load jobs when page opens
// ========================================

loadJobs();