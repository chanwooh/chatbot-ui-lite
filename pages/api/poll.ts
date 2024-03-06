export const config = {
    runtime: "edge"
  };
  
  const handler = async (req: Request): Promise<Response> => {
    try {
      const urlParams = new URLSearchParams(new URL(req.url).search);
      const id = urlParams.get('id');
      // http://kalibot.azurewebsites.net/get_result_by_id?id=${id}
      // http://localhost:5001/get_result_by_id?id=${id}
      const response = await fetch(`http://kalibot.azurewebsites.net/get_result_by_id?id=${id}`, {
        method: "GET"
      });
  
      return response;
    } catch (error) {
      console.error(error);
      return new Response("Error", { status: 500 });
    }
  };
  
  export default handler;
  