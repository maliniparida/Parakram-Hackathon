/* =========================================================
   JAN NITI — PROTOTYPE JAVASCRIPT
========================================================= */


/* =========================================================
   LOADING SCREEN
========================================================= */

window.addEventListener("load", () => {

    setTimeout(() => {

        const loader =
            document.getElementById("loadingScreen");

        if (loader) {
            loader.classList.add("hide");
        }

    }, 1000);

});


/* =========================================================
   NAVBAR SCROLL
========================================================= */

window.addEventListener("scroll", () => {

    const navbar =
        document.getElementById("navbar");

    if (!navbar) return;

    if (window.scrollY > 30) {
        navbar.classList.add("scrolled");
    } else {
        navbar.classList.remove("scrolled");
    }

});


/* =========================================================
   MOBILE MENU
========================================================= */

function toggleMobileMenu() {

    const menu =
        document.getElementById("mobileNav");

    menu.classList.toggle("show");

}


/* =========================================================
   CLOSE MOBILE MENU WHEN LINK CLICKED
========================================================= */

document.querySelectorAll(".mobile-nav a")
    .forEach(link => {

        link.addEventListener("click", () => {

            document
                .getElementById("mobileNav")
                .classList.remove("show");

        });

    });


/* =========================================================
   SMOOTH SCROLL
========================================================= */

function scrollToSection(id) {

    const section =
        document.getElementById(id);

    if (!section) return;

    section.scrollIntoView({
        behavior: "smooth"
    });

}


/* =========================================================
   START EXPERIENCE
========================================================= */

function startExperience() {

    scrollToSection("citizen");

    setTimeout(() => {

        openComplaintDemo();

    }, 900);

}


/* =========================================================
   COMPLAINT MODAL
========================================================= */

function openComplaintDemo() {

    const modal =
        document.getElementById("complaintModal");

    if (!modal) return;

    modal.classList.add("show");

    document.body.style.overflow = "hidden";

    showComplaintStep(1);

}


function closeComplaintDemo() {

    const modal =
        document.getElementById("complaintModal");

    modal.classList.remove("show");

    document.body.style.overflow = "";

}


/* =========================================================
   COMPLAINT STEPS
========================================================= */

function showComplaintStep(step) {

    document
        .querySelectorAll(".modal-step")
        .forEach(item => {

            item.classList.remove("active");

        });


    const selected =
        document.getElementById(
            `complaintStep${step}`
        );


    if (selected) {
        selected.classList.add("active");
    }

}


/* =========================================================
   SEVERITY
========================================================= */

let selectedSeverity = "Medium";


function selectSeverity(button, severity) {

    selectedSeverity = severity;

    document
        .querySelectorAll(".severity-option")
        .forEach(item => {

            item.classList.remove("selected");

        });

    button.classList.add("selected");

}


/* =========================================================
   SUBMIT DEMO COMPLAINT
========================================================= */

function submitDemoComplaint() {

    const location =
        document.getElementById("demoLocation").value;

    const category =
        document.getElementById("demoCategory").value;


    if (!location.trim()) {

        alert("Please enter a location.");

        return;

    }


    /*
        Generate a demonstration complaint ID.
    */

    const randomNumber =
        Math.floor(
            1000 + Math.random() * 8999
        );


    const complaintId =
        `CMP-${randomNumber}`;


    document.getElementById(
        "generatedComplaintId"
    ).textContent = complaintId;


    /*
        Update tracking screen dynamically.
    */

    const trackingTitle =
        document.querySelector(
            "#complaintStep3 .tracking-header h2"
        );

    if (trackingTitle) {
        trackingTitle.textContent = complaintId;
    }


    const trackingDescription =
        document.querySelector(
            "#complaintStep3 .tracking-header p"
        );

    if (trackingDescription) {

        trackingDescription.textContent =
            `${category} • ${location}`;

    }


    showComplaintStep(2);

}


/* =========================================================
   SHOW TRACKING
========================================================= */

function showTrackingDemo() {

    showComplaintStep(3);

}


/* =========================================================
   CLOSE MODAL WHEN CLICKING OUTSIDE
========================================================= */

document
    .getElementById("complaintModal")
    ?.addEventListener("click", event => {

        if (
            event.target.id ===
            "complaintModal"
        ) {

            closeComplaintDemo();

        }

    });


/* =========================================================
   DEMO GUIDE
========================================================= */

function closeGuide() {

    const guide =
        document.getElementById("demoGuide");

    if (!guide) return;

    guide.style.opacity = "0";

    guide.style.transform =
        "translateY(20px)";

    setTimeout(() => {

        guide.style.display = "none";

    }, 300);

}


/* =========================================================
   COUNTER ANIMATION
========================================================= */

function animateCounters() {

    const counters =
        document.querySelectorAll(".counter");


    counters.forEach(counter => {

        const target =
            Number(counter.dataset.target);

        let current = 0;

        const duration = 1200;

        const increment =
            target / (duration / 16);


        const updateCounter = () => {

            current += increment;

            if (current >= target) {

                counter.textContent =
                    target.toLocaleString();

                return;

            }

            counter.textContent =
                Math.floor(current)
                    .toLocaleString();


            requestAnimationFrame(
                updateCounter
            );

        };


        updateCounter();

    });

}


/* =========================================================
   COUNTER OBSERVER
========================================================= */

const governmentSection =
    document.getElementById("government");


if (governmentSection) {

    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        animateCounters();

                        observer.unobserve(
                            entry.target
                        );

                    }

                });

            },
            {
                threshold: 0.25
            }
        );


    observer.observe(
        governmentSection
    );

}


/* =========================================================
   NAV ACTIVE STATE
========================================================= */

const sections =
    document.querySelectorAll(
        "main section[id]"
    );


const navLinks =
    document.querySelectorAll(
        ".nav-link"
    );


window.addEventListener("scroll", () => {

    let currentSection = "";


    sections.forEach(section => {

        const sectionTop =
            section.offsetTop - 150;

        const sectionHeight =
            section.offsetHeight;


        if (
            window.scrollY >= sectionTop &&
            window.scrollY <
                sectionTop + sectionHeight
        ) {

            currentSection =
                section.id;

        }

    });


    navLinks.forEach(link => {

        link.classList.remove("active");


        const href =
            link.getAttribute("href");


        if (
            href ===
            `#${currentSection}`
        ) {

            link.classList.add("active");

        }

    });

});


/* =========================================================
   ESC KEY CLOSE MODAL
========================================================= */

document.addEventListener("keydown", event => {

    if (event.key === "Escape") {

        closeComplaintDemo();

    }

});


/* =========================================================
   DEMO SIDE ITEMS
========================================================= */

document
    .querySelectorAll(".side-item")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".side-item"
                    )
                    .forEach(item => {

                        item.classList
                            .remove("active");

                    });


                button.classList.add(
                    "active"
                );

            }
        );

    });


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "JAN NITI Prototype initialized successfully."
        );

    }
);