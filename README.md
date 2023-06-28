<p align="center">
  <img src="https://github.com/lspahija/force-multiplier/assets/44912218/acc05b50-8a2f-4fad-9912-55139621b004" alt="FM">
</p>

# Force Multiplier

### Feedback is All You Need

Most workers today are tasked with producing some sort of artifact (e.g. code, legal contract, documentation, essay, etc.)

The process might look something like this:
    
1. supervisor gives their subordinate worker a task to write a legal contract
2. subordinate worker goes off and writes a draft of a legal contract, which might take days or weeks
3. subordinate worker brings draft to supervisor for review
4. supervisor provides feedback
5. subordinate worker modifies legal contract, taking supervisor's feedback into account
6. steps 3-5 repeat until supervisor is satisfied with the legal contract

The main bottleneck in the above process is the subordinate worker taking time to write and modify the contract.
Luckily, modern LLMs are orders of magnitude faster than humans at doing precisely this.

Force Multiplier allows the user to iteratively provide feedback to GPT-4, which then modifies the artifact (the legal contract in the example above) until the user is satisfied with the result.

The goal of Force Multiplier is to multiply the user's productivity by enabling them to become a supervisor that leverages GPT-4 as a subordinate worker.

https://github.com/lspahija/force-multiplier/assets/44912218/6c76aeb7-385f-4804-9818-c24f8dbbb4f0

### Efficiency

Force Multiplier only modifies the portions of your artifact that require modification, given your feedback. The rest of the artifact remains unchanged. This allows for fast iteration because it's not necessary to wait for the LLM to regenerate the entire artifact after each piece of feedback is given.

### Core Functionality

Force Multiplier allows you to input any block of text as your initial document (artifact). You can then provide your feedback on this document, in terms of specific changes or overall sentiment. Force Multiplier will take your feedback, interpret it, and automatically modify your document in accordance with the feedback you provided.

You can iteratively provide feedback and watch your document change before your eyes until you arrive at your desired end result.

## Run it Locally  
1. Clone the repo
```bash
git clone git@github.com:lspahija/force-multiplier.git
```
2. Change directory to AIUI
```bash
cd force-multiplier
```
3. Build Docker image
```bash
docker build -t forcemultiplier .
``` 
or if on arm64 architecture (including Apple Silicon): 
```bash
docker buildx build --platform linux/arm64 -t forcemultiplier .
```
4. Create Docker container from image
```bash
docker run -d -e OPENAI_API_KEY=<YOUR_API_KEY> -p 8000:80 forcemultiplier
```
5. Navigate to `localhost:8000` in a modern browser

## Demo
https://force-multiplier-production.up.railway.app/
