export async function fetchConToken(percorso, opzioni = {}) {
  const response = await fetch(percorso, {
    ...opzioni,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.replace("/login");
  }

  return response;
}
