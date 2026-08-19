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
   SUBMIT COMPLAINT - BACKEND API
========================================= */

const complaintForm =
    document.getElementById("complaintForm");
/* =========================================
   GET REAL USER LOCATION
========================================= */

function getUserLocation() {
    return new Promise((resolve, reject) => {

        if (!navigator.geolocation) {
            reject(
                new Error(
                    "Geolocation is not supported by this browser."
                )
            );
            return;
        }

        navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }
        );
    });
}

complaintForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        /* Get severity */
        const selectedSeverity =
            document.querySelector(
                'input[name="severity"]:checked'
            );

        if (!selectedSeverity) {
            alert("Please select severity.");
            return;
        }

        /* Get form values */
        const name =
            document.getElementById("name").value.trim();

        const phone =
            document.getElementById("phone").value.trim();

        const village =
            document.getElementById("village").value.trim();

        const district =
            document.getElementById("district").value.trim();

        const category =
            document.getElementById("category").value;

        const language =
            document.getElementById("language").value;

        const severity =
            selectedSeverity.value;

        const description =
            document.getElementById("description")
                .value
                .trim();


        /* =========================================
           SEND DATA TO FASTAPI
        ========================================= */

        try {

            // =========================================
            // GET REAL GPS LOCATION
            // =========================================

            const position = await getUserLocation();

            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            console.log("Real GPS location:", latitude, longitude);


            // =========================================
            // SEND DATA TO FASTAPI
            // =========================================

            const response = await fetch(
                "http://127.0.0.1:8000/api/submissions",
                {
                    method: "POST",

                    headers: {
                       "Content-Type": "application/json"
                  },

                  body: JSON.stringify({
                     title: `${category} complaint in ${village}`,
                     description: description,
                     category: category,
                     ward: `${village}, ${district}`,

                     name: name,
                     phone: phone,
                     village: village,
                     district: district,
                     language: language,

                     latitude: latitude,
                     longitude: longitude
            })
        }
    );


            /* =========================================
               CHECK RESPONSE
            ========================================= */

            if (!response.ok) {

                const errorData =
                    await response.json();

                console.error(
                    "Backend error:",
                    errorData
                );

                alert(
                    "Failed to submit complaint. Please try again."
                );

                return;
            }


            /* =========================================
               GET BACKEND RESPONSE
            ========================================= */

            const result =
                await response.json();

            console.log(
                "Backend response:",
                result
            );


            /* =========================================
               GET REAL DATABASE ID
            ========================================= */

            const backendId =
                result.data?.id ||
                result.id;


            const complaintId =
                backendId
                    ? `CMP-${backendId}`
                    : generateComplaintId();


            /* =========================================
               SAVE LAST ID
            ========================================= */

            localStorage.setItem(
                "lastComplaintId",
                complaintId
            );


            /* =========================================
               SHOW SUCCESS
            ========================================= */

            document.getElementById(
                "generatedId"
            ).textContent = complaintId;


            document.getElementById(
                "success"
            ).classList.remove("hidden");


            /* =========================================
               RESET FORM
            ========================================= */

            complaintForm.reset();

            photoPreview.style.display =
                "none";

            fileName.textContent = "";


            /* =========================================
               SCROLL TO SUCCESS
            ========================================= */

            document.getElementById(
                "success"
            ).scrollIntoView({
                behavior: "smooth"
            });


            console.log(
                "Complaint successfully stored in database:",
                result
            );

        } catch (error) {

            console.error(
                "Connection error:",
                error
            );

            alert(
                "Cannot connect to backend. Make sure FastAPI is running on port 8000."
            );
        }

    }
);


/* =========================================
   TRACK COMPLAINT - BACKEND CONNECTED
========================================= */

const trackForm = document.getElementById("trackForm");

if (trackForm) {

    trackForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const enteredId = document
            .getElementById("trackId")
            .value
            .trim()
            .toUpperCase();

        const result = document.getElementById("trackResult");

        result.classList.remove("hidden");

        /* Remove CMP- prefix */
        const submissionId = enteredId.replace(/^CMP-/i, "");

        /* Validate ID */
        if (!submissionId || isNaN(submissionId)) {

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

                    <h3>Invalid Complaint ID</h3>

                    <p style="
                        color:#64748b;
                        margin-top:5px;
                    ">
                        Please enter a valid Complaint ID
                        such as CMP-1.
                    </p>
                </div>
            `;

            return;
        }

        try {

            console.log(
                "Tracking submission:",
                submissionId
            );

            /* =========================================
               GET ONE SUBMISSION FROM FASTAPI
            ========================================= */

            const response = await fetch(
                `http://127.0.0.1:8000/api/submissions/${submissionId}`
            );

            console.log(
                "Tracking response status:",
                response.status
            );

            if (!response.ok) {

                if (response.status === 404) {
                    throw new Error(
                        "Complaint not found"
                    );
                }

                throw new Error(
                    "Failed to fetch complaint"
                );
            }

            const responseData = await response.json();

            console.log(
                "Backend complaint:",
                responseData
            );

            /*
               The GET /{submission_id} endpoint
               should return one submission.
            */

            const complaint =
                responseData.data ?? responseData;

            if (!complaint || !complaint.id) {

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

                        <h3>Complaint Not Found</h3>

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


            /* =========================================
               GET CURRENT STATUS
            ========================================= */

            const status =
                complaint.status || "Submitted";


            const submittedComplete = true;

            const underReviewComplete =
                status === "Under Review" ||
                status === "Action Planned" ||
                status === "Resolved";

            const actionComplete =
                status === "Action Planned" ||
                status === "Resolved";

            const resolvedComplete =
                status === "Resolved";


            /* =========================================
               FORMAT DATE
            ========================================= */

            let submittedDate = "N/A";

            if (complaint.created_at) {

                submittedDate =
                    new Date(
                        complaint.created_at
                    ).toLocaleDateString(
                        "en-IN",
                        {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                        }
                    );
            }


            /* =========================================
               DISPLAY RESULT
            ========================================= */

            result.innerHTML = `

                <div class="result-header">

                    <div>

                        <h3>
                            ${complaint.category || "Complaint"}
                        </h3>

                        <p>
                            Complaint ID:
                            <strong>
                                CMP-${complaint.id}
                            </strong>
                        </p>

                        <p>
                            Submitted:
                            ${submittedDate}
                        </p>

                    </div>

                    <div class="status-badge">
                        ${status}
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
                        ${complaint.ward || ""}
                    </strong>


                    <p style="
                        font-size:12px;
                        color:#64748b;
                        margin-top:12px;
                    ">
                        PROBLEM
                    </p>

                    <p>
                        ${complaint.description || ""}
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


        } catch (error) {

            console.error(
                "Tracking error:",
                error
            );

            result.innerHTML = `
                <div style="
                    text-align:center;
                    padding:20px;
                ">

                    <div style="
                        font-size:35px;
                        margin-bottom:10px;
                    ">
                        ❌
                    </div>

                    <h3>
                        Unable to Track Complaint
                    </h3>

                    <p style="
                        color:#64748b;
                        margin-top:5px;
                    ">
                        ${error.message}
                    </p>

                </div>
            `;
        }

    });

}

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