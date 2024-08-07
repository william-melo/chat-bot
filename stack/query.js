async function query(data) {
  const response = await fetch(
    "https://api.stack-ai.com/inference/v0/run/50bdde64-2744-4e08-a623-d4c6624348b9/66b18335cca58cf680e8e07e",
    {
      headers: {
        Authorization: "Bearer acda1312-1f44-415e-9d7e-188bb20eee3e",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(data),
    }
  );
  const result = await response.json();
  return result;
}

module.exports = {
  query,
};
