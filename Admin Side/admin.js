/* =====================================================
   JAN NITI ADMIN PORTAL
   MAIN JAVASCRIPT
===================================================== */


/* =====================================================
   GLOBAL VARIABLES
===================================================== */

let selectedComplaintId = null;
let complaintsCache = [];


/* =====================================================
   GET COMPLAINTS FROM BACKEND
===================================================== */

function getComplaints() {
    return complaintsCache;
}


/* =====================================================
   SAVE COMPLAINTS TO BACKEND
===================================================== */

async function updateComplaintStatusAPI(
    complaintId,
    newStatus
) {

    const response = await fetch(
        `http://127.0.0.1:8000/api/submissions/${complaintId}/status`,
        {
            method: "PATCH",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                status: newStatus
            })
        }
    );

    if (!response.ok) {
        const errorData = await response.json();

        console.error(
            "Status update error:",
            errorData
        );

        throw new Error(
            "Failed to update complaint status"
        );
    }

    return await response.json();
}


/* =====================================================
   NAVIGATION
===================================================== */

const navButtons =
    document.querySelectorAll(".nav-button");


const pageSections =
    document.querySelectorAll(".page-section");


const pageTitle =
    document.getElementById("pageTitle");


const pageTitles = {

    dashboard:
        "Development Dashboard",

    complaints:
        "Complaint Management",

    analysis:
        "Complaint Analysis",

    priority:
        "Priority Issues"

};


/* =====================================================
   SHOW PAGE FUNCTION
===================================================== */

function showPage(sectionName) {


    /* Hide all pages */

    pageSections.forEach(
        section => {

            section.classList.remove(
                "active-section"
            );

        }
    );


    /* Show selected page */

    const selectedSection =
        document.getElementById(
            sectionName
        );


    if (selectedSection) {

        selectedSection.classList.add(
            "active-section"
        );

    }


    /* Change page title */

    pageTitle.textContent =
        pageTitles[sectionName] ||
        "Government Administration";


    /* Change active sidebar button */

    navButtons.forEach(
        button => {

            button.classList.remove(
                "active"
            );


            if (
                button.dataset.section ===
                sectionName
            ) {

                button.classList.add(
                    "active"
                );

            }

        }
    );


    /* Refresh data */

    loadAllData();


    /* Scroll to top */

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });


    /* Close mobile menu */

    document
        .getElementById("sidebar")
        .classList.remove("open");

}


/* =====================================================
   SIDEBAR BUTTON EVENTS
===================================================== */

navButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            function() {

                const section =
                    this.dataset.section;


                showPage(section);

            }
        );

    }
);


/* =====================================================
   DASHBOARD INTERNAL BUTTONS
===================================================== */

const sectionButtons =
    document.querySelectorAll(
        "[data-section-target]"
    );


sectionButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            function() {

                const section =
                    this.dataset.sectionTarget;


                showPage(section);

            }
        );

    }
);


/* =====================================================
   MOBILE MENU
===================================================== */

document
    .getElementById("menuButton")
    .addEventListener(
        "click",
        function() {

            document
                .getElementById("sidebar")
                .classList.toggle("open");

        }
    );


/* =====================================================
   CURRENT DATE
===================================================== */

function setCurrentDate() {

    const dateElement =
        document.getElementById(
            "currentDate"
        );


    const today =
        new Date();


    dateElement.textContent =
        today.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );

}


setCurrentDate();


/* =====================================================
   PRIORITY SCORE
===================================================== */

function calculatePriority(
    complaint
) {

    let score = 40;


    /* Severity */

    if (
        complaint.severity ===
        "High"
    ) {

        score += 40;

    }

    else if (
        complaint.severity ===
        "Medium"
    ) {

        score += 20;

    }

    else {

        score += 5;

    }


    /* Status */

    if (
        complaint.status ===
        "Submitted"
    ) {

        score += 10;

    }


    if (
        complaint.status ===
        "Under Review"
    ) {

        score += 5;

    }


    /* Maximum 99 */

    return Math.min(
        score,
        99
    );

}


/* =====================================================
   PRIORITY CLASS
===================================================== */

function getPriorityClass(
    score
) {

    if (score >= 80) {

        return "priority-high";

    }


    if (score >= 60) {

        return "priority-medium";

    }


    return "priority-low";

}


/* =====================================================
   SEVERITY CLASS
===================================================== */

function getSeverityClass(
    severity
) {

    if (
        severity ===
        "High"
    ) {

        return "severity-high";

    }


    if (
        severity ===
        "Medium"
    ) {

        return "severity-medium";

    }


    return "severity-low";

}


/* =====================================================
   STATUS CLASS
===================================================== */

function getStatusClass(
    status
) {

    if (
        status ===
        "Under Review"
    ) {

        return "status-review";

    }


    if (
        status ===
        "Action Planned"
    ) {

        return "status-action";

    }


    if (
        status ===
        "Resolved"
    ) {

        return "status-resolved";

    }


    return "status-submitted";

}


/* =====================================================
   LOAD EVERYTHING FROM FASTAPI
===================================================== */

async function loadAllData() {

    try {

        console.log(
            "Loading complaints from FastAPI..."
        );

        const response = await fetch(
            "http://127.0.0.1:8000/api/submissions/"
        );

        if (!response.ok) {
            throw new Error(
                "Failed to load complaints"
            );
        }

        const responseData =
            await response.json();

        console.log(
            "Backend complaints:",
            responseData
        );

        /*
           Support both:
           [ complaint, complaint ]
           and
           { data: [ complaint, complaint ] }
        */

        complaintsCache =
            Array.isArray(responseData)
                ? responseData
                : (
                    responseData.data ||
                    responseData.results ||
                    []
                );

        /*
           Make sure every complaint has
           a status for the admin UI.
        */

        complaintsCache =
        complaintsCache.map(
           complaint => ({
            ...complaint,

            status:
                complaint.status ||
                "Submitted",

            severity:
                complaint.severity ||
                "Medium",

            location:
                complaint.village ||
                complaint.district ||
                "Not specified"
        })
    );

        console.log(
            "Complaints loaded:",
            complaintsCache
        );


        /* Update dashboard */

        updateStatistics(
            complaintsCache
        );

        renderDashboardTable(
            complaintsCache
        );

        renderComplaintsTable(
            complaintsCache
        );

        renderPriorityList(
            complaintsCache
        );

        renderCategoryList(
            complaintsCache
        );

        renderAnalysis(
            complaintsCache
        );

        renderPriorityTable(
            complaintsCache
        );


    } catch (error) {

        console.error(
            "Backend loading error:",
            error
        );

        complaintsCache = [];

        updateStatistics(
            complaintsCache
        );

        renderDashboardTable(
            complaintsCache
        );

        renderComplaintsTable(
            complaintsCache
        );

        renderPriorityList(
            complaintsCache
        );

        renderCategoryList(
            complaintsCache
        );

        renderAnalysis(
            complaintsCache
        );

        renderPriorityTable(
            complaintsCache
        );

        showToast(
            "Cannot connect to CivicAI backend."
        );
    }
}

/* =====================================================
   STATISTICS
===================================================== */

function updateStatistics(
    complaints
) {

    const total =
        complaints.length;


    const pending =
        complaints.filter(
            complaint =>
                complaint.status ===
                "Submitted"
        ).length;


    const review =
        complaints.filter(
            complaint =>
                complaint.status ===
                "Under Review"
        ).length;


    const resolved =
        complaints.filter(
            complaint =>
                complaint.status ===
                "Resolved"
        ).length;


    document.getElementById(
        "totalComplaints"
    ).textContent =
        total;


    document.getElementById(
        "pendingComplaints"
    ).textContent =
        pending;


    document.getElementById(
        "reviewComplaints"
    ).textContent =
        review;


    document.getElementById(
        "resolvedComplaints"
    ).textContent =
        resolved;


    document.getElementById(
        "notificationCount"
    ).textContent =
        pending;

}


/* =====================================================
   DASHBOARD TABLE
===================================================== */

function renderDashboardTable(
    complaints
) {

    const table =
        document.getElementById(
            "dashboardTable"
        );


    if (
        complaints.length === 0
    ) {

        table.innerHTML = `
        
            <tr>
            
                <td
                    colspan="7"
                    style="
                        text-align:center;
                        padding:35px;
                        color:#71808A;
                    "
                >
                
                    No complaints submitted yet.
                
                </td>
            
            </tr>
        
        `;

        return;

    }


    const recent =
        [...complaints]
            .reverse()
            .slice(0, 6);


    table.innerHTML =
        recent.map(
            complaint =>
                createTableRow(
                    complaint,
                    false
                )
        ).join("");

}


/* =====================================================
   COMPLAINT TABLE
===================================================== */

function renderComplaintsTable(
    complaints
) {

    const table =
        document.getElementById(
            "complaintsTable"
        );


    const search =
        document
            .getElementById(
                "searchInput"
            )
            .value
            .toLowerCase();


    const status =
        document
            .getElementById(
                "statusFilter"
            )
            .value;


    const severity =
        document
            .getElementById(
                "severityFilter"
            )
            .value;


    const filtered =
        complaints.filter(
            complaint => {

                const text =
                    `
                    ${complaint.id}
                    ${complaint.category}
                    ${complaint.village}
                    ${complaint.district}
                    ${complaint.name}
                    `
                    .toLowerCase();


                const searchMatch =
                    text.includes(
                        search
                    );


                const statusMatch =
                    status === "All" ||
                    complaint.status ===
                    status;


                const severityMatch =
                    severity === "All" ||
                    complaint.severity ===
                    severity;


                return (
                    searchMatch &&
                    statusMatch &&
                    severityMatch
                );

            }
        );


    if (
        filtered.length === 0
    ) {

        table.innerHTML = `
        
            <tr>
            
                <td
                    colspan="8"
                    style="
                        text-align:center;
                        padding:40px;
                        color:#71808A;
                    "
                >
                
                    No matching complaints found.
                
                </td>
            
            </tr>
        
        `;

        return;

    }


    table.innerHTML =
        filtered
            .slice()
            .reverse()
            .map(
                complaint =>
                    createTableRow(
                        complaint,
                        true
                    )
            )
            .join("");

}


/* =====================================================
   CREATE TABLE ROW
===================================================== */

function createTableRow(
    complaint,
    detailed
) {

    const priority =
        calculatePriority(
            complaint
        );


    const severityClass =
        getSeverityClass(
            complaint.severity
        );


    const statusClass =
        getStatusClass(
            complaint.status
        );


    return `

        <tr>

            <td>

                <span class="complaint-id">
                    CMP-${complaint.id}
                </span>

            </td>


            <td>

                <strong>
                    ${complaint.category || "General"}
                </strong>

            </td>


            ${
                detailed

                ?

                `
                <td>
                    ${complaint.name || "Citizen"}
                </td>
                `

                :

                ""
            }


            <td>

                ${
                    complaint.village ||
                    complaint.district ||
                    complaint.location ||
                    "Not specified"
                }

            </td>


            ${
                !detailed

                ?

                ""

                :

                ""
            }


            <td>

                <span class="${severityClass}">
                    ${complaint.severity || "Low"}
                </span>

            </td>


            <td>

                <span
                    class="status-badge ${statusClass}"
                >

                    ${complaint.status || "Submitted"}

                </span>

            </td>


            <td>

                <span
                    class="${getPriorityClass(
                        priority
                    )}"
                >

                    ${priority}

                </span>

            </td>


            <td>

                <button
                    class="view-button"
                    onclick="
                        openComplaint(
                            '${complaint.id}'
                        )
                    "
                >

                    View

                </button>

            </td>

        </tr>

    `;

}


/* =====================================================
   PRIORITY LIST
===================================================== */

function renderPriorityList(
    complaints
) {

    const container =
        document.getElementById(
            "dashboardPriorityList"
        );


    if (
        complaints.length === 0
    ) {

        container.innerHTML = `

            <p
                style="
                    color:#71808A;
                    font-size:10px;
                    padding:15px 0;
                "
            >
                Priority issues will appear
                after complaints are submitted.
            </p>

        `;

        return;

    }


    const sorted =
        [...complaints]
            .sort(
                (a, b) =>
                    calculatePriority(b) -
                    calculatePriority(a)
            )
            .slice(0, 5);


    container.innerHTML =
        sorted.map(
            (complaint, index) => {

                const score =
                    calculatePriority(
                        complaint
                    );


                return `

                    <div class="priority-item">

                        <div class="rank-circle">

                            ${String(
                                index + 1
                            ).padStart(2, "0")}

                        </div>


                        <div class="priority-info">

                            <strong>
                                ${complaint.category}
                            </strong>

                            <small>
                                ${complaint.id}
                                •
                                ${complaint.severity}
                            </small>

                        </div>


                        <div class="priority-score">

                            <strong>
                                ${score}
                            </strong>

                            <small>
                                Priority
                            </small>

                        </div>

                    </div>

                `;

            }
        ).join("");

}


/* =====================================================
   CATEGORY LIST
===================================================== */

function renderCategoryList(
    complaints
) {

    const container =
        document.getElementById(
            "dashboardCategoryList"
        );


    if (
        complaints.length === 0
    ) {

        container.innerHTML = `

            <p
                style="
                    color:#71808A;
                    font-size:10px;
                    padding:15px 0;
                "
            >
                No category data available.
            </p>

        `;

        return;

    }


    const categories =
        getCategoryCounts(
            complaints
        );


    const max =
        Math.max(
            ...Object.values(
                categories
            )
        );


    container.innerHTML =
        Object.entries(
            categories
        )
        .map(
            ([category, count]) => {

                const width =
                    Math.round(
                        (count / max) * 100
                    );


                return `

                    <div class="category-item">

                        <div
                            class="category-heading"
                        >

                            <span>
                                ${category}
                            </span>

                            <strong>
                                ${count}
                            </strong>

                        </div>


                        <div class="progress">

                            <div
                                class="progress-bar"
                                style="
                                    width:${width}%;
                                "
                            ></div>

                        </div>

                    </div>

                `;

            }
        )
        .join("");

}


/* =====================================================
   CATEGORY COUNTS
===================================================== */

function getCategoryCounts(
    complaints
) {

    const categories = {};


    complaints.forEach(
        complaint => {

            const category =
                complaint.category ||
                "General";


            categories[category] =
                (
                    categories[category] ||
                    0
                ) + 1;

        }
    );


    return Object.fromEntries(

        Object.entries(
            categories
        ).sort(
            ([, a], [, b]) =>
                b - a
        )

    );

}


/* =====================================================
   ANALYSIS
===================================================== */

function renderAnalysis(
    complaints
) {

    renderAnalysisCategories(
        complaints
    );


    renderStatusAnalysis(
        complaints
    );


    renderSummary(
        complaints
    );

}


/* =====================================================
   ANALYSIS CATEGORY
===================================================== */

function renderAnalysisCategories(
    complaints
) {

    const container =
        document.getElementById(
            "analysisCategoryList"
        );


    const categories =
        getCategoryCounts(
            complaints
        );


    if (
        Object.keys(
            categories
        ).length === 0
    ) {

        container.innerHTML = `
        
            <p
                style="
                    color:#71808A;
                    font-size:10px;
                "
            >
                No data available.
            </p>
        
        `;

        return;

    }


    const total =
        complaints.length;


    container.innerHTML =
        Object.entries(
            categories
        )
        .map(
            ([category, count]) => {

                const percentage =
                    Math.round(
                        (
                            count /
                            total
                        ) * 100
                    );


                return `

                    <div class="category-item">

                        <div
                            class="category-heading"
                        >

                            <span>
                                ${category}
                            </span>

                            <strong>
                                ${count}
                                (${percentage}%)
                            </strong>

                        </div>


                        <div class="progress">

                            <div
                                class="progress-bar"
                                style="
                                    width:${percentage}%;
                                "
                            ></div>

                        </div>

                    </div>

                `;

            }
        )
        .join("");

}


/* =====================================================
   STATUS ANALYSIS
===================================================== */

function renderStatusAnalysis(
    complaints
) {

    const container =
        document.getElementById(
            "statusAnalysis"
        );


    const statuses = {

        "Submitted": 0,

        "Under Review": 0,

        "Action Planned": 0,

        "Resolved": 0

    };


    complaints.forEach(
        complaint => {

            if (
                statuses[
                    complaint.status
                ] !== undefined
            ) {

                statuses[
                    complaint.status
                ]++;

            }

        }
    );


    const total =
        complaints.length || 1;


    container.innerHTML =
        Object.entries(
            statuses
        )
        .map(
            ([status, count]) => {

                const percentage =
                    Math.round(
                        (
                            count /
                            total
                        ) * 100
                    );


                return `

                    <div class="category-item">

                        <div
                            class="category-heading"
                        >

                            <span>
                                ${status}
                            </span>

                            <strong>
                                ${count}
                            </strong>

                        </div>


                        <div class="progress">

                            <div
                                class="progress-bar"
                                style="
                                    width:${percentage}%;
                                "
                            ></div>

                        </div>

                    </div>

                `;

            }
        )
        .join("");

}


/* =====================================================
   SUMMARY
===================================================== */

function renderSummary(
    complaints
) {

    const container =
        document.getElementById(
            "summaryGrid"
        );


    const high =
        complaints.filter(
            complaint =>
                complaint.severity ===
                "High"
        ).length;


    const medium =
        complaints.filter(
            complaint =>
                complaint.severity ===
                "Medium"
        ).length;


    const low =
        complaints.filter(
            complaint =>
                complaint.severity ===
                "Low"
        ).length;


    const resolved =
        complaints.filter(
            complaint =>
                complaint.status ===
                "Resolved"
        ).length;


    container.innerHTML = `

        <div class="summary-box">

            <span>
                High Severity
            </span>

            <strong>
                ${high}
            </strong>

        </div>


        <div class="summary-box">

            <span>
                Medium Severity
            </span>

            <strong>
                ${medium}
            </strong>

        </div>


        <div class="summary-box">

            <span>
                Low Severity
            </span>

            <strong>
                ${low}
            </strong>

        </div>


        <div class="summary-box">

            <span>
                Resolved
            </span>

            <strong>
                ${resolved}
            </strong>

        </div>

    `;

}


/* =====================================================
   PRIORITY TABLE
===================================================== */

function renderPriorityTable(
    complaints
) {

    const table =
        document.getElementById(
            "priorityTable"
        );


    if (
        complaints.length === 0
    ) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    style="
                        text-align:center;
                        padding:40px;
                        color:#71808A;
                    "
                >

                    No priority issues available.

                </td>

            </tr>

        `;

        return;

    }


    const sorted =
        [...complaints]
            .sort(
                (a, b) =>
                    calculatePriority(b) -
                    calculatePriority(a)
            );


    table.innerHTML =
        sorted.map(
            (complaint, index) => {

                const score =
                    calculatePriority(
                        complaint
                    );


                return `

                    <tr>

                        <td>

                            <strong>
                                #${index + 1}
                            </strong>

                        </td>


                        <td>

                            <span
                                class="complaint-id"
                            >
                                ${complaint.id}
                            </span>

                        </td>


                        <td>
                            ${complaint.category}
                        </td>


                        <td>
                            ${
                                complaint.village ||
                                complaint.location ||
                                "Not specified"
                            }
                        </td>


                        <td>

                            <span
                                class="${getSeverityClass(
                                    complaint.severity
                                )}"
                            >

                                ${complaint.severity}

                            </span>

                        </td>


                        <td>

                            <span
                                class="status-badge ${getStatusClass(
                                    complaint.status
                                )}"
                            >

                                ${complaint.status}

                            </span>

                        </td>


                        <td>

                            <span
                                class="${getPriorityClass(
                                    score
                                )}"
                            >

                                ${score}

                            </span>

                        </td>


                        <td>

                            <button
                                class="view-button"
                                onclick="
                                    openComplaint(
                                        '${complaint.id}'
                                    )
                                "
                            >

                                View

                            </button>

                        </td>

                    </tr>

                `;

            }
        )
        .join("");

}


/* =====================================================
   OPEN COMPLAINT MODAL
===================================================== */

function openComplaint(complaintId) {

    const complaints = getComplaints();

    const complaint = complaints.find(
        item =>
            String(item.id) ===
            String(complaintId)
    );

    if (!complaint) {

        showToast(
            "Complaint not found."
        );

        return;
    }

    selectedComplaintId = complaintId;


    /* =================================================
       BASIC COMPLAINT INFORMATION
    ================================================= */

    document.getElementById(
        "modalTitle"
    ).textContent =
        complaint.category ||
        "Complaint";


    document.getElementById(
        "modalId"
    ).textContent =
        `Complaint ID: CMP-${complaint.id}`;


    document.getElementById(
        "modalDescription"
    ).textContent =
        complaint.description ||
        "No description provided.";


    document.getElementById(
        "modalStatus"
    ).value =
        complaint.status ||
        "Submitted";


    /* =================================================
       PRIORITY
    ================================================= */

    const priority =
        calculatePriority(
            complaint
        );


    /* =================================================
       MODAL DETAILS
    ================================================= */

    document.getElementById(
        "modalDetails"
    ).innerHTML = `

        <!-- CITIZEN INFORMATION -->

        <div class="detail-box">
            <span>Citizen Name</span>
            <strong>
                ${complaint.name || "Not provided"}
            </strong>
        </div>


        <div class="detail-box">
            <span>Mobile Number</span>
            <strong>
                ${complaint.phone || "Not provided"}
            </strong>
        </div>


        <!-- COMPLAINT INFORMATION -->

        <div class="detail-box">
            <span>Category</span>
            <strong>
                ${complaint.category || "General"}
            </strong>
        </div>


        <div class="detail-box">
            <span>Severity</span>
            <strong>
                ${complaint.severity || "Medium"}
            </strong>
        </div>


        <div class="detail-box">
            <span>Village</span>
            <strong>
                ${complaint.village || "Not provided"}
            </strong>
        </div>


        <div class="detail-box">
            <span>District</span>
            <strong>
                ${complaint.district || "Not provided"}
            </strong>
        </div>


        <div class="detail-box">
            <span>Ward</span>
            <strong>
                ${complaint.ward || "Not provided"}
            </strong>
        </div>


        <div class="detail-box">
            <span>Language</span>
            <strong>
                ${complaint.language || "Not provided"}
            </strong>
        </div>


        <!-- GPS -->

        <div class="detail-box">
            <span>GPS Latitude</span>
            <strong>
                ${
                    complaint.latitude !== null &&
                    complaint.latitude !== undefined
                        ? complaint.latitude
                        : "Not available"
                }
            </strong>
        </div>


        <div class="detail-box">
            <span>GPS Longitude</span>
            <strong>
                ${
                    complaint.longitude !== null &&
                    complaint.longitude !== undefined
                        ? complaint.longitude
                        : "Not available"
                }
            </strong>
        </div>


        <!-- DATE -->

        <div class="detail-box">
            <span>Submitted Date</span>
            <strong>
                ${
                    complaint.created_at
                        ? new Date(
                            complaint.created_at
                        ).toLocaleString("en-IN")
                        : "Not provided"
                }
            </strong>
        </div>


        <!-- PRIORITY -->

        <div class="detail-box">
            <span>Priority Score</span>
            <strong>
                ${priority}
            </strong>
        </div>


        <!-- GOOGLE MAPS -->

        ${
            complaint.latitude !== null &&
            complaint.latitude !== undefined &&
            complaint.longitude !== null &&
            complaint.longitude !== undefined
                ? `
                    <div class="detail-box">
                        <span>GPS Location</span>

                        <strong>

                            <a
                                href="https://www.google.com/maps?q=${complaint.latitude},${complaint.longitude}"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                📍 Open in Google Maps
                            </a>

                        </strong>

                    </div>
                `
                : ""
        }


        <!-- =========================================
             AI ANALYSIS
        ========================================== -->

        <div
            class="detail-box"
            style="
                grid-column: 1 / -1;
                margin-top: 15px;
            "
        >

            <span>
                🤖 AI ANALYSIS
            </span>

            <strong>
                CivicAI Intelligence
            </strong>

        </div>


        <div class="detail-box">

            <span>
                AI Category
            </span>

            <strong>
                ${
                    complaint.ai_category ||
                    "Not analyzed"
                }
            </strong>

        </div>


        <div class="detail-box">

            <span>
                Recommended Department
            </span>

            <strong>
                ${
                    complaint.ai_department ||
                    "Not determined"
                }
            </strong>

        </div>


        <div
            class="detail-box"
            style="
                grid-column: 1 / -1;
            "
        >

            <span>
                AI Summary
            </span>

            <strong>
                ${
                    complaint.ai_summary ||
                    "AI summary not available."
                }
            </strong>

        </div>


        <div
            class="detail-box"
            style="
                grid-column: 1 / -1;
            "
        >

            <span>
                AI Keywords
            </span>

            <strong>
                ${
                    complaint.ai_keywords ||
                    "No keywords available."
                }
            </strong>

        </div>

    `;


    /* =================================================
       SHOW MODAL
    ================================================= */

    document
        .getElementById("modalOverlay")
        .classList.remove("hidden");
}
/* =====================================================
   CLOSE MODAL
===================================================== */

document
    .getElementById(
        "closeModal"
    )
    .addEventListener(
        "click",
        closeModal
    );


function closeModal() {

    document
        .getElementById(
            "modalOverlay"
        )
        .classList.add(
            "hidden"
        );


    selectedComplaintId =
        null;

}


/* =====================================================
   CLICK OUTSIDE MODAL
===================================================== */

document
    .getElementById(
        "modalOverlay"
    )
    .addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                this
            ) {

                closeModal();

            }

        }
    );


/* =====================================================
   UPDATE STATUS - BACKEND API
===================================================== */

document
    .getElementById("updateStatusButton")
    .addEventListener(
        "click",
        async function() {

            if (!selectedComplaintId) {
                return;
            }

            const newStatus =
                document
                    .getElementById(
                        "modalStatus"
                    )
                    .value;

            try {

                console.log(
                    "Updating complaint:",
                    selectedComplaintId,
                    "→",
                    newStatus
                );


                await updateComplaintStatusAPI(
                    selectedComplaintId,
                    newStatus
                );


                /*
                   Reload fresh data from
                   SQLite through FastAPI.
                */

                await loadAllData();


                closeModal();


                showToast(
                    "Complaint status updated successfully."
                );


            } catch (error) {

                console.error(
                    "Status update failed:",
                    error
                );

                showToast(
                    "Failed to update complaint status."
                );
            }

        }
    );

/* =====================================================
   SEARCH
===================================================== */

document
    .getElementById(
        "searchInput"
    )
    .addEventListener(
        "input",
        function() {

            renderComplaintsTable(
                getComplaints()
            );

        }
    );


/* =====================================================
   STATUS FILTER
===================================================== */

document
    .getElementById(
        "statusFilter"
    )
    .addEventListener(
        "change",
        function() {

            renderComplaintsTable(
                getComplaints()
            );

        }
    );


/* =====================================================
   SEVERITY FILTER
===================================================== */

document
    .getElementById(
        "severityFilter"
    )
    .addEventListener(
        "change",
        function() {

            renderComplaintsTable(
                getComplaints()
            );

        }
    );


/* =====================================================
   REFRESH BUTTON
===================================================== */

document
    .getElementById(
        "refreshButton"
    )
    .addEventListener(
        "click",
        function() {

            loadAllData();


            showToast(
                "Dashboard data refreshed."
            );

        }
    );


/* =====================================================
   TOAST
===================================================== */

function showToast(
    message
) {

    const toast =
        document.getElementById(
            "toast"
        );


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(
        function() {

            toast.classList.remove(
                "show"
            );

        },
        2500
    );

}


/* =====================================================
   INITIAL LOAD
===================================================== */

loadAllData();