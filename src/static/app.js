document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  function createDetailRow(label, value, className = "") {
    const row = document.createElement("p");

    if (className) {
      row.className = className;
    }

    const labelElement = document.createElement("strong");
    labelElement.textContent = `${label}: `;

    row.append(labelElement, value);
    return row;
  }

  function createParticipantsSection(activityName, participants) {
    const safeParticipants = Array.isArray(participants) ? participants : [];
    const section = document.createElement("div");
    section.className = "participants-section";

    const title = document.createElement("h5");
    title.className = "participants-title";
    title.textContent = "Participants";
    section.appendChild(title);

    if (safeParticipants.length === 0) {
      const emptyState = document.createElement("p");
      emptyState.className = "participants-empty";
      emptyState.textContent = "No one has signed up yet.";
      section.appendChild(emptyState);
      return section;
    }

    const list = document.createElement("ul");
    list.className = "participants-list";

    safeParticipants.forEach((participant) => {
      const item = document.createElement("li");

      const email = document.createElement("span");
      email.className = "participant-email";
      email.textContent = participant;

      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "participant-remove-button";
      removeButton.dataset.activityName = activityName;
      removeButton.dataset.participantEmail = participant;
      removeButton.title = "Unregister participant";
      removeButton.setAttribute("aria-label", `Remove ${participant}`);
      removeButton.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9z" />
        </svg>
      `;

      item.append(email, removeButton);
      list.appendChild(item);
    });

    section.appendChild(list);
    return section;
  }

  function renderActivities(activities) {
    activitiesList.innerHTML = "";
    activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

    const fragment = document.createDocumentFragment();

    Object.entries(activities).forEach(([name, details]) => {
      const activityCard = document.createElement("article");
      activityCard.className = "activity-card";

      const title = document.createElement("h4");
      title.textContent = name;

      const description = document.createElement("p");
      description.className = "activity-description";
      description.textContent = details.description;

      const spotsLeft = details.max_participants - details.participants.length;
      const availabilityLabel = spotsLeft === 1 ? "spot left" : "spots left";

      const schedule = createDetailRow("Schedule", details.schedule);
      const availability = createDetailRow(
        "Availability",
        `${spotsLeft} ${availabilityLabel}`,
        "activity-status"
      );

      activityCard.append(title, description, schedule, availability);
      activityCard.appendChild(createParticipantsSection(name, details.participants));
      fragment.appendChild(activityCard);

      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      activitySelect.appendChild(option);
    });

    activitiesList.appendChild(fragment);
  }

  function showMessage(type, text) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");

      if (!response.ok) {
        throw new Error(`Failed to fetch activities: ${response.status}`);
      }

      const activities = await response.json();

      renderActivities(activities);
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage("success", result.message);
        signupForm.reset();
        await fetchActivities();
      } else {
        showMessage("error", result.detail || "An error occurred");
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      showMessage("error", "Failed to sign up. Please try again.");
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  activitiesList.addEventListener("click", async (event) => {
    const removeButton = event.target.closest(".participant-remove-button");

    if (!removeButton) {
      return;
    }

    const activityName = removeButton.dataset.activityName;
    const participantEmail = removeButton.dataset.participantEmail;

    if (!activityName || !participantEmail) {
      return;
    }

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activityName)}/signup?email=${encodeURIComponent(participantEmail)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage("success", result.message);
        await fetchActivities();
      } else {
        showMessage("error", result.detail || "Failed to unregister participant");
      }

      messageDiv.classList.remove("hidden");
    } catch (error) {
      showMessage("error", "Failed to unregister participant. Please try again.");
      messageDiv.classList.remove("hidden");
      console.error("Error unregistering participant:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
