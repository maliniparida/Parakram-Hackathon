/* =========================================
   JAN NITI - CITIZEN PORTAL
   JavaScript
========================================= */


/* =========================================
   MOBILE MENU
========================================= */

const mobileMenu = document.getElementById("mobileMenu");
const navbar = document.querySelector(".navbar");

mobileMenu.addEventListener("click", () => {

    navbar.classList.toggle("show");

});


/* Close mobile menu after clicking a link */

document.querySelectorAll(".nav-link").forEach(link => {

    link.addEventListener("click", () => {

        navbar.classList.remove("show");

    });

});


/* =========================================
   COMPLAINT ID GENERATOR
========================================= */

function generateComplaintId() {

    let number = localStorage.getItem("janNitiComplaintNumber");

    if (!number) {

        number = 1000;

    }

    number = Number(number) + 1;

    localStorage.setItem(
        "janNitiComplaintNumber",
        number
    );

    return `CMP-${number}`;

}


/* =========================================
   GET SAVED COMPLAINTS
========================================= */

function getComplaints() {

    const complaints =
        localStorage.getItem("janNitiComplaints");

    if (!complaints) {

        return [];

    }

    return JSON.parse(complaints);

}


/* =========================================
   SAVE COMPLAINTS
========================================= */

function saveComplaints(complaints) {

    localStorage.setItem(
        "janNitiComplaints",
        JSON.stringify(complaints)
    );

}


/* =========================================
   PHOTO PREVIEW
========================================= */

const photoInput =
    document.getElementById("photo");

const photoPreview =
    document.getElementById("photoPreview");

const fileName =
    document.getElementById("fileName");


photoInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) {

        photoPreview.style.display = "none";

        fileName.textContent = "";

        return;

    }

    fileName.textContent =
        `Selected file: ${file.name}`;


    const reader = new FileReader();


    reader.onload = function (event) {

        photoPreview.src =
            event.target.result;

        photoPreview.style.display =
            "block";

    };


    reader.readAsDataURL(file);

});


/* =========================================
   SUBMIT COMPLAINT
========================================= */

const complaintForm =
    document.getElementById("complaintForm");


complaintForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        /* Get severity */

        const selectedSeverity =
            document.querySelector(
                'input[name="severity"]:checked'
            );


        /* Generate Complaint ID */

        const complaintId =
            generateComplaintId();


        /* Create complaint object */

        const complaint = {

            id: complaintId,

            name:
                document.getElementById("name").value.trim(),

            phone:
                document.getElementById("phone").value.trim(),

            village:
                document.getElementById("village").value.trim(),

            district:
                document.getElementById("district").value.trim(),

            category:
                document.getElementById("category").value,

            language:
                document.getElementById("language").value,

            severity:
                selectedSeverity.value,

            description:
                document.getElementById("description").value.trim(),

            status:
                "Submitted",

            date:
                new Date().toLocaleDateString(
                    "en-IN",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                )

        };


        /* Get old complaints */

        const complaints =
            getComplaints();


        /* Add new complaint */

        complaints.push(complaint);


        /* Save */

        saveComplaints(complaints);


        /* Store last ID */

        localStorage.setItem(
            "lastComplaintId",
            complaintId
        );


        /* Show success */

        document.getElementById(
            "generatedId"
        ).textContent = complaintId;


        document.getElementById(
            "success"
        ).classList.remove("hidden");


        /* Reset form */

        complaintForm.reset();


        /* Reset photo */

        photoPreview.style.display =
            "none";

        fileName.textContent = "";


        /* Scroll to success */

        document.getElementById(
            "success"
        ).scrollIntoView({
            behavior: "smooth"
        });

    }
);


/* =========================================
   TRACK COMPLAINT
========================================= */

const trackForm =
    document.getElementById("trackForm");


trackForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const enteredId =
            document
                .getElementById("trackId")
                .value
                .trim()
                .toUpperCase();


        const complaints =
            getComplaints();


        const complaint =
            complaints.find(
                item =>
                    item.id.toUpperCase() ===
                    enteredId
            );


        const result =
            document.getElementById(
                "trackResult"
            );


        result.classList.remove("hidden");


        /* Complaint not found */

        if (!complaint) {

            result.innerHTML = `

                <div style="
                    text-align:center;
                    padding:20px;
                ">

                    <div style="
                        font-size:35px;
                        margin-bottom:10px;
                    ">
                        ⚠️
                    </div>

                    <h3>
                        Complaint Not Found
                    </h3>

                    <p style="
                        color:#64748b;
                        margin-top:5px;
                    ">
                        Please check your Complaint ID
                        and try again.
                    </p>

                </div>

            `;

            return;

        }


        /* Determine status */

        const status =
            complaint.status;


        const submittedComplete =
            true;


        const underReviewComplete =
            status === "Under Review" ||
            status === "Action Planned" ||
            status === "Resolved";


        const actionComplete =
            status === "Action Planned" ||
            status === "Resolved";


        const resolvedComplete =
            status === "Resolved";


        result.innerHTML = `

            <div class="result-header">

                <div>

                    <h3>
                        ${complaint.category}
                    </h3>

                    <p>
                        Complaint ID:
                        <strong>${complaint.id}</strong>
                    </p>

                    <p>
                        Submitted:
                        ${complaint.date}
                    </p>

                </div>


                <div class="status-badge">

                    ${complaint.status}

                </div>

            </div>


            <div style="
                margin-top:20px;
                padding:15px;
                background:#f8fafc;
                border-radius:8px;
            ">

                <p style="
                    font-size:12px;
                    color:#64748b;
                ">
                    LOCATION
                </p>

                <strong>
                    ${complaint.village},
                    ${complaint.district}
                </strong>


                <p style="
                    font-size:12px;
                    color:#64748b;
                    margin-top:12px;
                ">
                    PROBLEM
                </p>

                <p>
                    ${complaint.description}
                </p>

            </div>


            <div class="timeline">


                <div class="
                    timeline-item
                    ${submittedComplete ? "completed" : ""}
                ">

                    <strong>
                        Complaint Submitted
                    </strong>

                    <p>
                        Your complaint has been received.
                    </p>

                </div>


                <div class="
                    timeline-item
                    ${underReviewComplete ? "completed" : "current"}
                ">

                    <strong>
                        Under Review
                    </strong>

                    <p>
                        The complaint is being reviewed.
                    </p>

                </div>


                <div class="
                    timeline-item
                    ${actionComplete ? "completed" : ""}
                ">

                    <strong>
                        Action Planned
                    </strong>

                    <p>
                        Appropriate action is being planned.
                    </p>

                </div>


                <div class="
                    timeline-item
                    ${resolvedComplete ? "completed" : ""}
                ">

                    <strong>
                        Resolved
                    </strong>

                    <p>
                        The complaint has been resolved.
                    </p>

                </div>


            </div>

        `;


        result.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }
);


/* =========================================
   COPY COMPLAINT ID
========================================= */

function copyComplaintId() {

    const id =
        document.getElementById(
            "generatedId"
        ).textContent;


    navigator.clipboard.writeText(id);


    showToast(
        "Complaint ID copied!"
    );

}


/* =========================================
   TOAST
========================================= */

function showToast(message) {

    const toast =
        document.getElementById("toast");


    toast.textContent =
        message;


    toast.classList.add("show");


    setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}


/* =========================================
   AUTO-FILL LAST COMPLAINT ID
========================================= */

window.addEventListener(
    "load",
    function () {

        const lastId =
            localStorage.getItem(
                "lastComplaintId"
            );


        if (lastId) {

            document.getElementById(
                "trackId"
            ).value = lastId;

        }

    }
);