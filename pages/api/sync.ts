export const config = {
  runtime: "edge"
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const response = await fetch("http://kalibot.azurewebsites.net/gdrive/sync", {
      headers: {
        "Content-Type": "application/json",
        //Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      method: "POST",
      body: JSON.stringify({
        delete_old_indices: true,
      })
    });

    return response;
  } catch (error) {
    console.error(error);
    return new Response("Error", { status: 500 });
  }
};

export default handler;
