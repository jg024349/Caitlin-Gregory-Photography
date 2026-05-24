(function () {
  function getStatusElement(form) {
    var status = form.querySelector(".form-status");

    if (!status) {
      status = document.createElement("p");
      status.className = "form-status";
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");
      form.appendChild(status);
    }

    return status;
  }

  function setStatus(form, type, message) {
    var status = getStatusElement(form);
    status.className = "form-status form-status-" + type;
    status.textContent = message;
  }

  function setSubmitting(form, isSubmitting) {
    var button = form.querySelector("[type='submit']");

    if (!button) {
      return;
    }

    if (!button.dataset.originalText) {
      button.dataset.originalText = button.textContent;
    }

    button.disabled = isSubmitting;
    button.textContent = isSubmitting ? "Sending..." : button.dataset.originalText;
  }

  function serializeForm(form) {
    var formData = new FormData(form);
    var payload = {};

    formData.forEach(function (value, key) {
      payload[key] = typeof value === "string" ? value.trim() : value;
    });

    return payload;
  }

  document.querySelectorAll("[data-contact-form]").forEach(function (form) {
    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      setSubmitting(form, true);
      setStatus(form, "pending", "Sending your message...");

      try {
        var response = await fetch(form.action, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(serializeForm(form))
        });

        var result = await response.json().catch(function () {
          return {};
        });

        if (!response.ok) {
          throw new Error(result.error || "Something went wrong. Please try again.");
        }

        form.reset();
        setStatus(form, "success", "Thank you. Your message has been sent, and Caitlin will be in touch soon.");
      } catch (error) {
        setStatus(form, "error", error.message || "Something went wrong. Please email Caitlin directly.");
      } finally {
        setSubmitting(form, false);
      }
    });
  });
})();
