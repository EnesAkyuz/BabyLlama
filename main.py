# openai dependencies
import os
import sys

from openai import OpenAI, AsyncOpenAI

# lmnt dependencies
import asyncio
from lmnt.api import Speech
import argparse

# Initialize the OpenAI client
client = OpenAI()

MODEL = 'gpt-3.5-turbo'
DEFAULT_PROMPT = 'Tell me a bedtime story.'
VOICE_ID = 'lily'
def gpt():
    # Initialize chat history
    chat_history = []

    while True:
        user_input = input("Enter your message (or type 'exit' to quit): ")
        if user_input.lower() == 'exit':
            print("Exiting...")
            break

        # Add user's message to chat history
        chat_history.append({"role": "user", "content": user_input})

        stream = client.chat.completions.create(
            model=MODEL,
            messages=chat_history,
            stream=True,
        )

        response = ''
        for chunk in stream:
            if chunk.choices[0].delta.content is not None:
                response += chunk.choices[0].delta.content

        print(response)

        # Add GPT's response to chat history
        chat_history.append({"role": "assistant", "content": response})

async def reader_task(conn):
  """Streams audio data from the server and writes it to `output.mp3`."""
  with open('output.mp3', 'wb') as f:
    async for msg in conn:
      f.write(msg['audio'])

async def writer_task(conn, prompt):
  """Streams text from ChatGPT to LMNT."""
  client = AsyncOpenAI(api_key=os.getenv('OPENAI_API_KEY'))
  response = await client.chat.completions.create(model=MODEL,
                                                  messages=[{'role': 'user', 'content': prompt}],
                                                  stream=True)

  async for chunk in response:
    if not chunk.choices[0] or not chunk.choices[0].delta or not chunk.choices[0].delta.content:
      continue
    content = chunk.choices[0].delta.content
    await conn.append_text(content)
    print(content, end='', flush=True)

  await conn.finish()

async def main(args):
  speech = Speech(os.getenv('LMNT_API_KEY'))
  conn = await speech.synthesize_streaming(VOICE_ID, return_extras=False, language=args.language)

  t1 = asyncio.create_task(reader_task(conn))
  t2 = asyncio.create_task(writer_task(conn, args.prompt))

  await t1
  await t2
  await speech.close()

def create_story():
    parser = argparse.ArgumentParser()
    parser.add_argument('prompt', default=DEFAULT_PROMPT, nargs='?')
    parser.add_argument('-l', '--language', required=False, default='en', help='Language code')
    asyncio.run(main(parser.parse_args()))


if __name__ == "__main__":
    gpt()
    # create_story()



