docker buildx build --platform linux/arm64 -t forcemultiplier .
docker run -d -e OPENAI_API_KEY="${OPENAI_API_KEY}" -p 8501:8501 forcemultiplier