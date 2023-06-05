#!/bin/bash

docker buildx build --platform linux/arm64 -t forcemultiplier .
docker ps -q --filter ancestor=forcemultiplier | xargs docker stop
docker ps -a -q --filter status=exited | xargs docker rm
docker system prune -f
docker run -d -e OPENAI_API_KEY="${OPENAI_API_KEY}" -p 8501:8501 forcemultiplier
