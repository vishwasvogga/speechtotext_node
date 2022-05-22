# speechtotext_node
Continuous text to speech recognition backend in node js.


1)Create account in WIT.AI and train your model

2) Add the env file in root (.env)
witai_server_access_token= WIT.AI Server access token
witai_speech_to_text_endpoint=https://api.wit.ai/speech
port=3001
host=0.0.0.0
basic_auth_key=basic auth password for this server api call
basic_auth_user=basic auth username for this server api call

3) Update the intents and actions in SynthesisSpeech.js and time_action_controller.js

4) node index.js to run the server
