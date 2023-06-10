#!/bin/bash
set -e

CONTAINER_LABEL="created_by=forcemultiplier_script"

check_env_var() {
    if [[ -z "${!1}" ]]; then
        echo "Error: $1 is not set."
        exit 1
    fi
}

remove_containers() {
    if [ "$(docker ps -a -q -f "label=$1")" ]; then
        docker rm -f $(docker ps -a -q -f "label=$1")
    fi
}

build_docker() {
    ARCH=$(uname -m)
    if [ "$ARCH" == "arm64" ]; then
        docker buildx build --platform linux/arm64 -t forcemultiplier .
    else
        docker build -t forcemultiplier .
    fi
}

run_docker() {
    if [ "$1" == "MOCK" ]; then
        docker run -d -e OPENAI_API_KEY=${OPENAI_API_KEY} -e MOCK_COMPLETION=true -p 8000:80 --label "$CONTAINER_LABEL" forcemultiplier
    else
        docker run -d -e OPENAI_API_KEY=${OPENAI_API_KEY} -e MOCK_COMPLETION=false -p 8000:80 --label "$CONTAINER_LABEL" forcemultiplier
    fi
}

check_env_var "OPENAI_API_KEY"
remove_containers "$CONTAINER_LABEL"
build_docker
run_docker "$1"
