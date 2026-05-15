async function checkBackendStatus() {
  const response = await fetch("/api/health");
  const data = await response.json();

  console.log(data);
}

checkBackendStatus();