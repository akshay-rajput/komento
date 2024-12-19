export async function getGeneratedJSDoc(functionCode: string): Promise<string> {
  const API_URL = process.env.GENERATE_DOC_URL;
  const ANON_KEY = process.env.SUPABASE_ANON_KEY;

  if (!API_URL || !ANON_KEY) {
    return Promise.reject(new Error("API URL & ANON_KEY are required."));
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ANON_KEY}`
      },
      body: JSON.stringify({ functionCode }),
    });
  
    if(!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }
    const generatedComment = await response.json();
    if (typeof generatedComment === "string") {
      return generatedComment || "";
    } else {
      throw new Error("Unexpected response type: Expected a string.");
    }
  } catch(error) {
    console.error("Error: ", error);
    throw new Error('Error while generating jsdoc comments');
  }
}
