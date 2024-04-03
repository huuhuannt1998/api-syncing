import os
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

# Set OpenAI API key
os.environ['OPENAI_API_KEY'] = "KEY"

user_request = input("Enter your request (e.g., 'U2 wants to use the smart irrigation system in the garden through U1's account at 14:30, Day. U1 rejects.'): \n")

prompt = ChatPromptTemplate.from_template(
    """
    I want to generate an access control policy as a json file. In this policy, U2 uses Alexa and U1 uses Smartthings. U2 sends a command to U1 to request the access to the smart device. The request looks like this \"U2 wants to turn on the switch in the living room in U1's account at 08:00, Day. U1 allows.\" and the json file looks like this:
        {{
        "name": "shadowConn",
        "trigger": {{
            "src": {{
                "user": "U1",
                "platform": ["Smartthings"],
                "device": "switch"
            }},
            "dst": {{
                "user": "U2",
                "platform": ["Alexa"],
                "device": "switch"
            }}
        }},
        "condition": {{
            "location": ["living room"],
            "time": ["08:00", "day"]
        }},
        "decision": {{
            "requester": "U2",
            "approver": "U1",
            "outcome": ["accept"]
        }},
        "actions": [
            {{
                "if": {{
                    "decision": "accept",
                    "equals": {{
                        "left": {{
                            "device": {{
                                "deviceId": "",
                                "component": "main",
                                "capability": "switch",
                                "attribute": "switch"
                            }}
                        }},
                        "right": {{
                            "string": "on"
                        }}
                    }},
                    "then": [
                        {{
                            "command": {{
                                "devices": [""],
                                "commands": [
                                    {{
                                        "component": "main",
                                        "capability": "switch",
                                        "command": "on"
                                    }}
                                ]
                            }}
                        }}
                    ],
                    "else": [
                        {{
                            "command": {{
                                "devices": [""],
                                "commands": [
                                    {{
                                        "component": "main",
                                        "capability": "switch",
                                        "command": "off"
                                    }}
                                ]
                            }}
                        }}
                    ]
                }}
            }}
        ]
        }}

    Use this {topic} to create the JSON file. No extra explanation needed. Do not change the decision value in the if statement.
    """
)

output_parser = StrOutputParser()
model = ChatOpenAI(model="gpt-4-turbo-preview")

chain = (
    {"topic": RunnablePassthrough()} 
    | prompt
    | model
    | output_parser
)

result = chain.invoke(user_request)

print(result)
