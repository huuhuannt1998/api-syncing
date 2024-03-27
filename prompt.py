import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
)

# openai.api_key = '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'

response = client.chat.completions.create(
  model="gpt-4-turbo-preview",
  messages=[
    {
      "role": "system",
      "content": "I want to generate an access control policy as a json file. In this policy, U2 uses Alexa and U1 uses Smartthings. U2 sends a command to U1 to request the access to the smart device. The request looks like this \"U2 wants to turn on the switch in the living room in U1's account at 08:00, Day. U1 allows.\" and the json file looks like this \n\n{\n    \"name\": \"shadowConn\",\n    \"trigger\": {\n      \"src\": {\n        \"user\": \"U1\",\n        \"platform\": [\"Smartthings\"],\n        \"device\": \"switch\"\n      },\n      \"dst\": {\n        \"user\": \"U2\",\n        \"platform\": [\"Alexa\"],\n        \"device\": \"switch\"\n      }\n    },\n    \"condition\": {\n      \"location\": [\"living room\"],\n      \"time\": [\"08:00\", \"day\"]\n    },\n    \"decision\": {\n      \"requester\": \"U2\",\n      \"approver\": \"U1\",\n      \"outcome\": [\"accept\"]\n    },\n    \"actions\": [\n      {\n        \"if\": {\n          \"decision\": \"accept\",\n          \"equals\": {\n            \"left\": {\n              \"device\": {\n                \"deviceId\": \"\",\n                \"component\": \"main\",\n                \"capability\": \"switch\",\n                \"attribute\": \"switch\"\n              }\n            },\n            \"right\": {\n              \"string\": \"on\"\n            }\n          },\n          \"then\": [\n            {\n              \"command\": {\n                \"devices\": [\"\"],\n                \"commands\": [\n                  {\n                    \"component\": \"main\",\n                    \"capability\": \"switch\",\n                    \"command\": \"on\"\n                  }\n                ]\n              }\n            }\n          ],\n          \"else\": [\n            {\n              \"command\": {\n                \"devices\": [\"\"],\n                \"commands\": [\n                  {\n                    \"component\": \"main\",\n                    \"capability\": \"switch\",\n                    \"command\": \"off\"\n                  }\n                ]\n              }\n            }\n          ]\n        }\n      }\n    ]\n  }\n\n"
    },
    {
      "role": "user",
      "content": "U2 wants to turn on the switch in the living room in U1's account at 22:00, Night. U1 rejects."
    },
    {
      "role": "assistant",
      "content": "Based on the new request where U2 wants to turn on the switch in the living room in U1's account at 22:00, Night, and U1 rejects the request, the JSON file reflecting this scenario would look like this:\n\n```json\n{\n  \"name\": \"shadowConn\",\n  \"trigger\": {\n    \"src\": {\n      \"user\": \"U1\",\n      \"platform\": [\"Smartthings\"],\n      \"device\": \"switch\"\n    },\n    \"dst\": {\n      \"user\": \"U2\",\n      \"platform\": [\"Alexa\"],\n      \"device\": \"switch\"\n    }\n  },\n  \"condition\": {\n    \"location\": [\"living room\"],\n    \"time\": [\"22:00\", \"night\"]\n  },\n  \"decision\": {\n    \"requester\": \"U2\",\n    \"approver\": \"U1\",\n    \"outcome\": [\"reject\"]\n  },\n  \"actions\": [\n    {\n      \"if\": {\n        \"decision\": \"accept\",\n        \"equals\": {\n          \"left\": {\n            \"device\": {\n              \"deviceId\": \"\",\n              \"component\": \"main\",\n              \"capability\": \"switch\",\n              \"attribute\": \"switch\"\n            }\n          },\n          \"right\": {\n            \"string\": \"on\"\n          }\n        },\n        \"then\": [\n          {\n            \"command\": {\n              \"devices\": [\"\"],\n              \"commands\": [\n                {\n                  \"component\": \"main\",\n                  \"capability\": \"switch\",\n                  \"command\": \"on\"\n                }\n              ]\n            }\n          }\n        ],\n        \"else\": [\n          {\n            \"command\": {\n              \"devices\": [\"\"],\n              \"commands\": [\n                {\n                  \"component\": \"main\",\n                  \"capability\": \"switch\",\n                  \"command\": \"off\"\n                }\n              ]\n            }\n          }\n        ]\n      }\n    }\n  ]\n}\n```\n\nIn this updated JSON file, the `\"condition\"` section now reflects the new requested time of `\"22:00\", \"night\"`, and the `\"decision\"` section now indicates that the outcome is `\"reject\"`. The actions remain structured to handle both acceptance and rejection scenarios, but given the decision, the relevant action would be to keep the switch off, as indicated in the `\"else\"` part of the `\"if\"` statement."
    },
    {
      "role": "user",
      "content": "U2 wants to control the smart window blinds in the bedroom in U1's account at 11:00, Day. U1 rejects.\n"
    },
    {
      "role": "assistant",
      "content": "For the scenario where U2 wants to control the smart window blinds in the bedroom in U1's account at 11:00, Day, and U1 rejects the request, the JSON file would be structured as follows:\n\n```json\n{\n  \"name\": \"shadowConn\",\n  \"trigger\": {\n    \"src\": {\n      \"user\": \"U1\",\n      \"platform\": [\"Smartthings\"],\n      \"device\": \"window blinds\"\n    },\n    \"dst\": {\n      \"user\": \"U2\",\n      \"platform\": [\"Alexa\"],\n      \"device\": \"window blinds\"\n    }\n  },\n  \"condition\": {\n    \"location\": [\"bedroom\"],\n    \"time\": [\"11:00\", \"day\"]\n  },\n  \"decision\": {\n    \"requester\": \"U2\",\n    \"approver\": \"U1\",\n    \"outcome\": [\"reject\"]\n  },\n  \"actions\": [\n    {\n      \"if\": {\n        \"decision\": \"accept\",\n        \"equals\": {\n          \"left\": {\n            \"device\": {\n              \"deviceId\": \"\",\n              \"component\": \"main\",\n              \"capability\": \"windowBlinds\",\n              \"attribute\": \"windowBlinds\"\n            }\n          },\n          \"right\": {\n            \"string\": \"open\" // Assuming the desired action was to open the blinds\n          }\n        },\n        \"then\": [\n          {\n            \"command\": {\n              \"devices\": [\"\"],\n              \"commands\": [\n                {\n                  \"component\": \"main\",\n                  \"capability\": \"windowBlinds\",\n                  \"command\": \"open\"\n                }\n              ]\n            }\n          }\n        ],\n        \"else\": [\n          {\n            \"command\": {\n              \"devices\": [\"\"],\n              \"commands\": [\n                {\n                  \"component\": \"main\",\n                  \"capability\": \"windowBlinds\",\n                  \"command\": \"close\" // Assuming the default or rejection state is to close the blinds\n                }\n              ]\n            }\n          }\n        ]\n      }\n    }\n  ]\n}\n```\n\nThis JSON file reflects the specific request involving the smart window blinds in the bedroom, with the condition set for 11:00 during the day. Given that U1 rejects the request, the decision is marked as `\"reject\"`, and the actions are structured to handle both acceptance and rejection scenarios. In this case, the `\"else\"` part of the `\"if\"` statement indicates the action to be taken upon rejection, which is assumed to be closing the blinds. Note that the specific commands for controlling window blinds (e.g., `\"open\"`, `\"close\"`) might need to be adjusted based on the actual capabilities of the smart device and the platform's API."
    }
  ],
  temperature=0.5,
  max_tokens=3000,
  top_p=1,
  frequency_penalty=0,
  presence_penalty=0
)