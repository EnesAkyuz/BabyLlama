"""

from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
import os
from flask_cors import CORS


# Constants
AUDIO_UPLOAD_PATH = 'uploaded_audio'  # Renamed from UPLOAD_FOLDER
MAX_AUDIO_SIZE = 16 * 1024 * 1024  # Renamed and reused from MAX_CONTENT_LENGTH
ALLOWED_AUDIO_EXTENSIONS = {'mp3', 'wav', 'ogg'}  # More specific naming

app = Flask(__name__)
CORS(app)
app.config['AUDIO_UPLOAD_PATH'] = AUDIO_UPLOAD_PATH
app.config['MAX_AUDIO_SIZE'] = MAX_AUDIO_SIZE

if not os.path.exists(app.config['AUDIO_UPLOAD_PATH']):
    os.makedirs(app.config['AUDIO_UPLOAD_PATH'])

@app.route('/upload', methods=['POST'])
def upload_audio_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    if file and '.' in file.filename and file.filename.rsplit('.', 1)[1].lower() in ALLOWED_AUDIO_EXTENSIONS:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['AUDIO_UPLOAD_PATH'], filename)
        file.save(filepath)
        return jsonify({'message': 'Audio uploaded successfully', 'path': filepath}), 200
    return jsonify({"error": "Invalid file type"}), 400

@app.route('/audio/<filename>', methods=['GET'])
def get_audio_file(filename):
    return send_from_directory(app.config['AUDIO_UPLOAD_PATH'], filename)

@app.route('/audio', methods=['GET'])
def list_audio_files():
    files = os.listdir(app.config['AUDIO_UPLOAD_PATH'])
    return jsonify(files)

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
  with open('output.mp3', 'wb') as f:
    async for msg in conn:
      f.write(msg['audio'])

async def writer_task(conn, prompt):
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
    app.run(debug=True, port=5000)
    gpt()
    # create_story()

"""


from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
import os
import threading
import asyncio
from openai import OpenAI, AsyncOpenAI
from lmnt.api import Speech

# Constants
AUDIO_UPLOAD_PATH = 'uploaded_audio'
MAX_AUDIO_SIZE = 16 * 1024 * 1024
ALLOWED_AUDIO_EXTENSIONS = {'mp3', 'wav', 'ogg'}
MODEL = 'gpt-3.5-turbo'
DEFAULT_PROMPT = 'Tell me a bedtime story.'
VOICE_ID = 'lily'

app = Flask(__name__)
app.config['AUDIO_UPLOAD_PATH'] = AUDIO_UPLOAD_PATH
app.config['MAX_AUDIO_SIZE'] = MAX_AUDIO_SIZE

if not os.path.exists(app.config['AUDIO_UPLOAD_PATH']):
    os.makedirs(app.config['AUDIO_UPLOAD_PATH'])

@app.route('/upload', methods=['POST'])
def upload_audio_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    if file and '.' in file.filename and file.filename.rsplit('.', 1)[1].lower() in ALLOWED_AUDIO_EXTENSIONS:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['AUDIO_UPLOAD_PATH'], filename)
        file.save(filepath)
        return jsonify({'message': 'Audio uploaded successfully', 'path': filepath}), 200
    return jsonify({"error": "Invalid file type"}), 400

@app.route('/audio/<filename>', methods=['GET'])
def get_audio_file(filename):
    return send_from_directory(app.config['AUDIO_UPLOAD_PATH'], filename)

@app.route('/audio', methods=['GET'])
def list_audio_files():
    files = os.listdir(app.config['AUDIO_UPLOAD_PATH'])
    return jsonify(files)

@app.route('/synthesize', methods=['POST'])
def synthesize():
    data = request.json
    asyncio.run_coroutine_threadsafe(handle_synthesis(data['prompt']), asyncio.get_event_loop())
    return jsonify({"message": "Synthesis started"}), 202

async def handle_synthesis(prompt):
    speech = Speech(os.getenv('LMNT_API_KEY'))
    conn = await speech.synthesize_streaming(VOICE_ID, return_extras=False, language='en')
    t1 = asyncio.create_task(reader_task(conn))
    t2 = asyncio.create_task(writer_task(conn, prompt))
    await t1
    await t2
    await speech.close()

async def reader_task(conn):
    with open('output.mp3', 'wb') as f:
        async for msg in conn:
            f.write(msg['audio'])

async def writer_task(conn, prompt):
    client = AsyncOpenAI(api_key=os.getenv('OPENAI_API_KEY'))
    response = await client.chat.completions.create(model=MODEL, messages=[{'role': 'user', 'content': prompt}], stream=True)
    async for chunk in response:
        if chunk.choices[0].delta.content:
            content = chunk.choices[0].delta.content
            await conn.append_text(content)

    await conn.finish()

@app.route('/gpt', methods=['POST'])
def chat_with_gpt():
    user_input = request.json.get('prompt', DEFAULT_PROMPT)
    response = chat_gpt(user_input)
    return jsonify({"response": response})

def chat_gpt(prompt):
    client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
    completion = client.Completion.create(
        model=MODEL,
        prompt=prompt,
        max_tokens=150
    )
    return completion.choices[0].text.strip()

def run_asyncio_loop():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_forever()

thread = threading.Thread(target=run_asyncio_loop, daemon=True)
thread.start()

if __name__ == "__main__":
    from flask_cors import CORS
    CORS(app)  # Enables CORS for all domains, adjust as necessary for production
    app.run(debug=True, port=5000)

