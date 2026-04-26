# Deployment Guide

[中文文档](readme_zh.md) | [English Documentation](README.md)

## Quick Start

## Server Deployment Process

🔗 [Docker Deployment Configuration Folder](https://github.com/wszgrcy/audio-asr/tree/main/docker/deploy)

### 1. Choose Deployment Version

Select the appropriate `docker-compose` file based on your operating system and hardware configuration:

> ⚠️ Note: The following hardware configurations are requirements for Whisper. If you already have a service compatible with the OpenAI `transcriptions` API, you can comment out the Whisper-related services in `docker-compose.yml`.

| Platform | Hardware Configuration     | Configuration File                                       |
| -------- | -------------------------- | -------------------------------------------------------- |
| Linux    | NVIDIA GPU                 | `docker-compose.cuda.yml`                                |
| Linux    | AMD GPU                    | `docker-compose.rocm.yml`                                |
| Linux    | CPU Only                   | `docker-compose.yml`                                     |
| Windows  | NVIDIA/AMD/Intel GPU       | [Manual Whisper Deployment (Vulkan)](#windows-manual-whisper-deployment) |
| Windows  | CPU Only                   | `docker-compose.yml`                                     |

#### windows-manual-whisper-deployment

- Modify docker-compose.yml

Comment out the whisper service in Docker:

```yaml
services:
  db:
    # ... db configuration remains unchanged ...

  server:
    # ... server configuration remains unchanged ...

  # whisper:
  #   image: ghcr.io/ggml-org/whisper.cpp:main
  #   container_name: whisper
  #   volumes:
  #     - ./models:/models
  #   command: "..."
```

- Download Whisper

For Windows, it is recommended to manually deploy Whisper.cpp using Vulkan.

🔗 [Download Windows Version](https://github.com/jonasthilo/whisper.cpp/releases)

> ⚠️ The official repository does not currently have pre-built artifacts; this is a forked repository.

- Start Whisper Service

⚠️ **Important**: You must use **PowerShell** to start, do not use Git Bash or MSYS2 terminal.

```powershell
./whisper-server -et 2.0 --suppress-nst -m ./models/ggml-small-q8_0.bin --request-path /v1/audio/ --port 8080 --host 0.0.0.0 --inference-path transcriptions
```

---

### 2. Copy Deployment Files

Copy the selected file to the target location and rename it to `docker-compose.yml`.

#### Linux/macOS Example

```bash
# CUDA version
cp docker/deploy/docker-compose.cuda.yml /your/deploy/path/docker-compose.yml

# ROCm version
cp docker/deploy/docker-compose.rocm.yml /your/deploy/path/docker-compose.yml

# CPU version
cp docker/deploy/docker-compose.yml /your/deploy/path/docker-compose.yml

cd /your/deploy/path/
```

#### Windows (PowerShell) Example

```powershell
Copy-Item "docker\deploy\docker-compose.yml" "C:\whisper-deploy\docker-compose.yml"
cd C:\whisper-deploy
```

---

### 3. Configure Environment Variables

Copy `.env` and edit the `.env` file to configure the following key parameters:

```env
# openssl rand -base64 32
BETTER_AUTH_SECRET=your-secret-key
# Not currently in use
BETTER_AUTH_URL=http://your-domain:port

# Initial password
ADMIN_PASSWORD=12345678

# Database configuration
DATABASE_URL=postgres://postgres:postgres12345678@db:5432/postgres?sslmode=disable
```

---

### 4. Prepare Model Files

- For non-GPU deployments, it is recommended to choose smaller models to save resources
- 🔗 [Model Download Link](https://huggingface.co/ggerganov/whisper.cpp/tree/main)
- Place the model files in the `models/` directory at the same level as `docker-compose.yml`

---

### 5. Start Services

```bash
# Start all services
docker-compose up -d

# Check running status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Client

### Download

🔗 [Client Download Link](https://github.com/wszgrcy/audio-asr/releases)

### Login

After opening the client, login with the following default credentials:

- **Username**: `admin@admin.com`
- **Password**: The password configured in the `ADMIN_PASSWORD` environment variable (default is `12345678`)

### Android Phone Version Requirements
- To perform speaker audio recording, Android 10 or above is required
- The mobile WebView version should be 120 or above for better support; below this version requires manual WebView upgrade

---

## Directory Structure

```
deploy/
├── docker-compose.yml        # CPU version (default, cross-platform compatible)
├── docker-compose.cuda.yml   # NVIDIA GPU CUDA version
├── docker-compose.rocm.yml   # AMD GPU ROCm/Vulkan version
├── .env                      # Environment variable configuration file (manually created)
├── .env.example              # Environment variable example file (optional)
├── models/                   # Model storage directory (manually created)
└── data/                     # Database data directory (auto-created)
```

