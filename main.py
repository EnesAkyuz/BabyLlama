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
"""
import socket
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from datetime import datetime
from werkzeug.utils import secure_filename

# openai dependencies
import sys
from openai import OpenAI, AsyncOpenAI, audio

# audio stuff
from pydub import AudioSegment
from pathlib import Path

# lmnt stuff
import requests
from lmnt.api import Speech

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'baby-llama/assets/'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Initialize the OpenAI client and chat history
chat_history = [
    {"role": "system", "content":"You are an assistant for new parents, do not use any possibly triggering answers. Be sure that your answers are short, easily digestable, understandable and do not cause panic. Always stay very calm and empathetic. Be knowledgeable and assuring. Do not write long essays of answers, try to be readably short."}
]
client = OpenAI()
MODEL = 'gpt-3.5-turbo'

@app.route('/upload-text', methods=['POST'])
def upload_text():

    # Get the data from React Native
    data = request.get_json()
    user_input = data["text"]

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

    # Add GPT's response to chat history
    chat_history.append({"role": "assistant", "content": response})
    processed_text = response

    return jsonify({
        'message': 'Text processed successfully',
        'processedText': processed_text
    })

@app.route('/upload-audio', methods=['POST'])
def upload_audio():
    if 'audio' not in request.files:
        return jsonify({'message': 'No audio file provided'}), 400

    audiofile = request.files['audio']
    if audiofile.filename == '':
        return jsonify({'message': 'No selected file'}), 400

    if audiofile:
        filename = secure_filename(audiofile.filename)
        filepath = os.path.join(os.getcwd(),app.config['UPLOAD_FOLDER'], filename)
        print(app.config['UPLOAD_FOLDER'])
        print(filepath)
        audiofile.save(filepath)

        # transcribe with whisper
        audio_file = open(filepath, "rb")
        transcript = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file
        )
        text = transcript.text

        # Add user's message to chat history
        chat_history.append({"role": "user", "content": text})

        stream = client.chat.completions.create(
            model=MODEL,
            messages=chat_history,
            stream=True,
        )

        response = ''
        for chunk in stream:
            if chunk.choices[0].delta.content is not None:
                response += chunk.choices[0].delta.content

        # Add GPT's response to chat history
        chat_history.append({"role": "assistant", "content": response})
        processed_text = response


        # # Define the outputs directory path
        outputs_dir = Path(__file__).parent / "baby-llama/assets"

        # # Create the outputs directory if it doesn't exist
        outputs_dir.mkdir(parents=True, exist_ok=True)

        # Define the output file path for speech.mp3
        speech_file_path = outputs_dir / "speech.mp3"

        response = audio.speech.create(
            model="tts-1",
            voice="alloy",
            input=processed_text,
        )

        # Write the response content to a file
        with speech_file_path.open('wb') as f:
            for chunk in response.iter_bytes():
                f.write(chunk)
        
        sound = AudioSegment.from_file(filepath)
        louder_sound = sound + 100  # Increase volume by 10 dB
        louder_sound.export(filepath, format="mp3")
        
        print(str(speech_file_path))
        return jsonify({
            'message': 'Audio processed successfully',
            'processedText': str(chat_history[-1]['content']),
            'audioFile': str(speech_file_path),
            'userInput': str(chat_history[-2]['content'])
        })

def get_ip_address():
    """Find the local IP address of the machine."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # doesn't even have to be reachable
        s.connect(('10.254.254.254', 1))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip

@app.route('/lmnt-call', methods=['POST'])
def lmnt_call():

    LMNT_API_KEY = os.getenv('LMNT_API_KEY')

    audio_file = request.files['audio']

    # 1. Upload audio to LMNT for voice cloning
    lmnt_response = requests.post(
        'https://api.lmnt.com/v1/voice-clone',
        headers={'Authorization': f'Bearer {LMNT_API_KEY}'},
        files={'audio': audio_file}
    )
    lmnt_data = lmnt_response.json()
    cloned_voice_url = lmnt_data['cloned_voice_url']  # Assume this is the URL of the cloned voice

    # 2. Generate content with ChatGPT
    stream = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "system", "content": "Create a bedtime story"}],
        stream=True,
        max_tokens=1000
    )

    story_text = ''
    for chunk in stream:
        if chunk.choices[0].delta.content is not None:
            story_text += chunk.choices[0].delta.content

    # 3. Synthesize the story using the cloned voice
    synthesis_response = requests.post(
        'https://api.lmnt.com/v1/synthesize',
        headers={'Authorization': f'Bearer {LMNT_API_KEY}'},
        json={
            'voice_url': cloned_voice_url,
            'text': story_text
        }
    )
    synthesized_story_url = synthesis_response.json()['synthesized_audio_url']

    return jsonify({
        'story_text': story_text,
        'synthesized_story_url': synthesized_story_url
    })

@app.route('/you-com-call', methods=['POST'])
def you_com_call():
    YOU_API_KEY = os.getenv('YOU_API_KEY')
    if not YOU_API_KEY:
        return jsonify({"error": "You.com API key is missing"}), 500

    # Get the query from the POST request data
    # data = request.json
    chat = ". ".join([d.get("content", "") for d in chat_history]).strip()
    query = chat or "baby-care" # Default to "baby-care" if no query is provided

    headers = {
        "X-API-Key": YOU_API_KEY
    }

    params = {
        "query": query
    }

    # Make the request to You.com API
    response = requests.get(
        f"https://api.ydc-index.io/search",
        params=params,
        headers=headers
    )

    if response.status_code == 200:
        articles = response.json().get('hits', [])
        # Extract URLs and titles
        results = [{"title": article.get('title'), "url": article.get('url')} for article in articles]
        return jsonify(results)
    else:
        return jsonify({"error": "Failed to fetch articles from You.com"}), response.status_code


if __name__ == '__main__':
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    ip_address = get_ip_address()
    print(f"Running Flask server on IP address: {ip_address}")
    app.run(debug=True, host=ip_address, port=5000)
