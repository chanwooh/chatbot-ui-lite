import { Message, OpenAIModel } from "@/types";
import { createParser, ParsedEvent, ReconnectInterval } from "eventsource-parser";

export const OpenAIStream = async (messages: Message[]) => {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const res = await fetch("http://kalibot.azurewebsites.net/chatbot/query", {
    headers: {
      "Content-Type": "application/json",
      //Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    method: "POST",
    body: JSON.stringify({
      question: messages.at(-1)?.content,
    })
  });

  if (res.status !== 200) {
    throw new Error("OpenAI API returned an error");
  }

  // TODO: Support streaming answers
  // const stream = new ReadableStream({
  //   async start(controller) {
  //     const onParse = (event: ParsedEvent | ReconnectInterval) => {
  //       if (event.type === "event") {
  //         const data = event.data;

  //         if (data === "[DONE]") {
  //           controller.close();
  //           return;
  //         }

  //         try {
  //           // const json = JSON.parse(data);
  //           // const text = json.choices[0].delta.content;
  //           const text = data;
  //           const queue = encoder.encode(text);
  //           controller.enqueue(queue);
  //         } catch (e) {
  //           controller.error(e);
  //         }
  //       }
  //     };

  //     const parser = createParser(onParse);

  //     for await (const chunk of res.body as any) {
  //       parser.feed(decoder.decode(chunk));
  //     }
  //   }
  // });

  const answer = await res.text();
  return answer;
};
