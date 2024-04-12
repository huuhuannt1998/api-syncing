import rule_engine
import requests
import json
import aiohttp
import asyncio


rule = rule_engine.Rule(
    'decision.outcome == "accept"'
)

json_string = {
    "trigger": {
        "src": {
            "user1": "U1",
            "platform": "Smartthings"
        },
        "dst": {
            "user": "U2",
            "platform": "Alexa"
        },
        "device_type": "smart_light"
    },
    "condition": {
        "location": ["living room"],
        "time": ["08:00", ["day"]]
    },
    "decision": {
        "requester": "U1",
        "approver": "U2",
        "outcome": "accept"
    },
    "actions": [
        {
            "if": {
                "decision": "accept",
                "equals": {
                    "left": {
                        "device": {
                            "deviceId1": "Light123",
                            "component": "main",
                            "capability": "switch",
                            "attribute": "switch"
                        }
                    },
                    "right": {
                        "string": "on"
                    }
                },
                "then": [
                    {
                        "command": {
                            "devicesId2": "a7940a66-f91c-4c51-a279-9d2a332fde91",
                            "commands": [
                                {
                                    "component": "main",
                                    "capability": "switch",
                                    "command": "on"
                                }
                            ]
                        }
                    }
                ],
                "else": [
                    {
                        "command": {
                            "devicesId2": "Light123",
                            "commands": [
                                {
                                    "component": "main",
                                    "capability": "switch",
                                    "command": "off"
                                }
                            ]
                        }
                    }
                ]
            }
        }
    ]
}

result = rule.matches(json_string) 

print("Result: ", result)

def fetch_device_status_from_smartthings(device_id):
    try:
        headers = {
            'Authorization': 'Bearer 64988233-33ea-4dee-9e8a-d042a10ed6f9'
        }
        url = f'https://api.smartthings.com/v1/devices/{device_id}/status'
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # Raises an HTTPError for bad responses
        device_status = response.json()['components']['main']['switch']['switch']['value']
        return device_status
    except requests.exceptions.RequestException as error:
        print(f'Error fetching device status from SmartThings: {error}')
        return 'unknown'


actions = json_string['actions']

then_commands = actions[0]['if']['then']

commands = then_commands[0]['command']

print("Command: ", commands)

if_then_section = actions[0]['if']['then']

# Now, get to the 'command' key inside the first 'then' item
command_section = if_then_section[0]['command']

# Access 'devicesId2' inside 'command'
devices_id2 = command_section['devicesId2']

# Print the 'devicesId2'
print("devices_id2: ", devices_id2)

# if result:
#     print(result)

print("Status before: ", fetch_device_status_from_smartthings(devices_id2))



url = "https://api.smartthings.com/v1/devices/a7940a66-f91c-4c51-a279-9d2a332fde91/commands"

payload = "{\n  \"commands\": [\n    {\n      \"component\": \"main\",\n      \"capability\": \"switch\",\n      \"command\": \"on\"\n    }\n  ]\n}"
headers = {
  'Content-Type': 'text/plain',
  'Authorization': 'Bearer 64988233-33ea-4dee-9e8a-d042a10ed6f9'
}

response = requests.request("POST", url, headers=headers, data=payload)

print(response.text)

print("Status after: ", fetch_device_status_from_smartthings(devices_id2))