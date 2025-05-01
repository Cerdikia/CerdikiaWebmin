// common/fetcher.js
const FetchData = async ({
  url,
  method = "GET",
  token = null,
  body = null,
  headers = {},
}) => {
  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...headers,
      },
      ...(body && { body: JSON.stringify(body) }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Request failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Fetcher error:", error);
    throw error;
  }
};

export default FetchData;
