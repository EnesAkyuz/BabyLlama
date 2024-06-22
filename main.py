import os
from openai import OpenAI

# Initialize the OpenAI client
client = OpenAI()

def main():
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
            model="gpt-3.5-turbo",
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

if __name__ == "__main__":
    main()

