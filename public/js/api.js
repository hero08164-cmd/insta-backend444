const API_BASE = "/api";

async function request(url, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${url}`, options);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Request Failed");
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export async function uploadPosts(formData) {
  return request("/posts/upload", {
    method: "POST",
    body: formData
  });
}

export async function getPendingPosts() {
  return request("/posts/pending");
}

export async function getHistoryPosts() {
  return request("/posts/history");
}

export async function getDashboard() {
  return request("/dashboard");
}

export async function getSettings() {
  return request("/settings");
}

export async function saveSettings(data) {
  return request("/settings", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
}

export async function runCron() {
  return request("/cron/run", {
    method: "POST"
  });
}