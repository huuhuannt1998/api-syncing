import openai
import json

def generate_json_based_on_input(api_key, model_engine, example_instruction, user_request):
    # Format the prompt to include the example instruction and user's request
    prompt = f"{example_instruction}\n\nGiven this new request: '{user_request}', generate the corresponding JSON."
    
    openai.api_key = api_key
    
    response = openai.Completion.create(
        engine=model_engine,
        prompt=prompt,
        max_tokens=3000,  # Adjust based on expected complexity
        temperature=0.5,  # Adjust for creativity if needed
        top_p=1.0,
        n=1,
    )
    
    try:
        # Attempt to parse the response as JSON
        generated_json = json.loads(response.choices[0].text.strip())
        return generated_json
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")
        return None

def main():
    # Path to your JSON file
    json_file_path = '/Users/hbui11/Desktop/api-syncing/test-gpt4/test1.json'  # Update this path
    
    # Read the example JSON file to use as a template
    with open(json_file_path, 'r') as file:
        example_json = json.load(file)
    
    # Example instruction
    example_instruction = f"I want to generate an access control policy as a JSON file. Here is an example request and its corresponding JSON:\n\nRequest: 'U2 wants to turn on the switch in the living room in U1's account at 08:00, Day. U1 allows.'\n\n{json.dumps(example_json, indent=4)}"
    
    # User input for a new request
    user_request = input("Enter the new request: ")
    
    # API Key and Model Engine
    api_key = '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'  # Replace with your actual API key
    model_engine = "gpt-4-turbo-preview"  # Or the model you intend to use
    
    # Generate the JSON based on user input
    generated_json = generate_json_based_on_input(api_key, model_engine, example_instruction, user_request)
    
    if generated_json:
        print("Generated JSON:")
        print(json.dumps(generated_json, indent=4))
    else:
        print("Failed to generate valid JSON.")

if __name__ == "__main__":
    main()
