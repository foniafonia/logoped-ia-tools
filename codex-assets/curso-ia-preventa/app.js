const containmentMessage = "Función temporalmente desactivada por seguridad. La landing queda visible, pero no se enviarán datos ni pagos.";
const staticCourseStatus = {
    discount_price_cents: 4900,
    full_price_cents: 7900,
    phase: "preventa",
    seats_left: 20,
    seat_limit: 20,
    reservation_hold_hours: 48,
};

const reservationForm = document.getElementById("reservation-form");
const feedbackBox = document.getElementById("form-feedback");
const checkoutButton = document.getElementById("checkout-button");

let latestReservationEmail = "";

function setTextIfPresent(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function euros(cents) {
    return `${(cents / 100).toFixed(2).replace(".", ",")} €`;
}

function phaseLabel(phase) {
    if (phase === "preventa") return "Preventa";
    if (phase === "precio_final") return "Precio final";
    return "Cerrado";
}

function setFeedback(message, kind = "success") {
    feedbackBox.classList.remove("hidden", "is-success", "is-error");
    feedbackBox.classList.add(kind === "success" ? "is-success" : "is-error");
    feedbackBox.innerHTML = message;
}

function setBusy(isBusy) {
    reservationForm.querySelectorAll("button").forEach((button) => {
        button.disabled = isBusy;
    });
}

async function loadStatus() {
    const course = staticCourseStatus;
    const submitButton = reservationForm.querySelector('button[type="submit"]');

    setTextIfPresent("discount-deadline-label", "1 de mayo de 2026");
    setTextIfPresent("discount-price", euros(course.discount_price_cents));
    setTextIfPresent("full-price", euros(course.full_price_cents));
    setTextIfPresent("phase-label", phaseLabel(course.phase));
    setTextIfPresent("seats-left-hero", course.seats_left);
    setTextIfPresent("seats-left-panel", course.seats_left);
    setTextIfPresent("seat-limit-panel", course.seat_limit);
    setTextIfPresent("hold-hours-label", `${course.reservation_hold_hours} h`);
    setTextIfPresent("discount-box-label", euros(course.discount_price_cents));
    setTextIfPresent("full-price-box-label", euros(course.full_price_cents));
    setTextIfPresent("hero-discount-price", euros(course.discount_price_cents));
    setTextIfPresent("stripe-status-label", "Desactivado por seguridad");

    submitButton.disabled = false;
    submitButton.textContent = "Ver aviso de seguridad";
    checkoutButton.disabled = true;
}

async function createReservation(formData) {
    throw new Error(containmentMessage);
}

async function createCheckout(email) {
    throw new Error(containmentMessage);
}

reservationForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setFeedback(containmentMessage, "error");
    return;
    setBusy(true);

    const formData = Object.fromEntries(new FormData(reservationForm).entries());
    formData.consent = Boolean(formData.consent);
    latestReservationEmail = formData.email;

    try {
        const data = await createReservation(formData);
        const reservation = data.reservation;
        checkoutButton.disabled = false;
        const reservationMode = reservation.status === "reserved";
        const timingLine = reservationMode
            ? `Tu plaza queda priorizada temporalmente hasta <strong>${new Date(reservation.reserved_until).toLocaleString("es-ES")}</strong>.<br>
               El descuento actual queda disponible hasta <strong>${new Date(reservation.discount_expires_at).toLocaleString("es-ES")}</strong> o hasta fin de preventa.<br>`
            : `Tus datos han quedado listos para cerrar la inscripción al precio vigente.<br>`;
        setFeedback(
            `
                <strong>Pre-reserva guardada.</strong><br>
                Código: <strong>${reservation.reservation_code}</strong><br>
                ${timingLine}
                El pago real está desactivado por modo seguro.
            `,
            "success"
        );
        await loadStatus();
    } catch (error) {
        setFeedback(error.message, "error");
    } finally {
        setBusy(false);
    }
});

checkoutButton.addEventListener("click", async () => {
    setFeedback(containmentMessage, "error");
    return;
    const emailField = reservationForm.querySelector('input[name="email"]');
    const email = latestReservationEmail || emailField.value;
    if (!email) {
        setFeedback("Primero guarda tu pre-reserva con un email válido.", "error");
        return;
    }

    checkoutButton.disabled = true;
    try {
        const data = await createCheckout(email);
        window.location.href = data.checkout_url;
    } catch (error) {
        setFeedback(error.message, "error");
        checkoutButton.disabled = false;
    }
});

loadStatus();
