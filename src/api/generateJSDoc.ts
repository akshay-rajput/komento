export async function getGeneratedJSDoc(
  functionCode: string,
  eid: string
): Promise<string> {
  try {
    const response = await fetch(
      "https://fwhzpfrjozntigdlpytn.supabase.co/functions/v1/generateJSDocComments",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-eid": `${eid}`,
        },
        body: JSON.stringify({ functionCode }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch: ${response.status} ${response.statusText}`
      );
    }
    const generatedComment = await response.json();
    if (typeof generatedComment === "string") {
      return generatedComment || "";
    } else {
      throw new Error("Unexpected response type: Expected a string.");
    }
  } catch (error) {
    console.error("Error: ", error);
    throw new Error("Error while generating jsdoc comments");
  }
}
