# 部署文档

[中文文档](readme_zh.md) | [English Documentation](README.md)

## 快速开始

## 服务端部署流程

🔗 [Docker 部署配置文件夹](https://github.com/wszgrcy/audio-asr/tree/main/docker/deploy)

### 1. 选择部署版本

根据你的操作系统和硬件配置选择合适的 `docker-compose` 文件：

> ⚠️ 说明：以下硬件配置为 Whisper 的要求。如果你已有兼容 OpenAI `transcriptions` 接口的服务，可在 `docker-compose.yml` 中注释掉 Whisper 相关服务。

| 平台    | 硬件配置             | 配置文件                                               |
| ------- | -------------------- | ------------------------------------------------------ |
| Linux   | NVIDIA GPU           | `docker-compose.cuda.yml`                              |
| Linux   | AMD GPU              | `docker-compose.rocm.yml`                              |
| Linux   | 仅 CPU               | `docker-compose.yml`                                   |
| Windows | NVIDIA/AMD/Intel GPU | [手动部署 Whisper (Vulkan)](#windows-手动部署-whisper) |
| Windows | 仅 CPU               | `docker-compose.yml`                                   |

#### windows-手动部署-whisper

- 修改 docker-compose.yml

注释掉 Docker 中的 whisper 服务：

```yaml
services:
  db:
    # ... db 配置保持不变 ...

  server:
    # ... server 配置保持不变 ...

  # whisper:
  #   image: ghcr.io/ggml-org/whisper.cpp:main
  #   container_name: whisper
  #   volumes:
  #     - ./models:/models
  #   command: "..."
```

- 下载 Whisper

Windows 下推荐使用 Vulkan 手动部署 Whisper.cpp。

🔗 [下载 Windows 版本](https://github.com/jonasthilo/whisper.cpp/releases)

> ⚠️ 官方暂时没有预构建的制品，此为 fork 仓库。

- 启动 Whisper 服务

⚠️ **重要**：必须使用 **PowerShell** 启动，不要使用 Git Bash 或 MSYS2 终端。

```powershell
./whisper-server -et 2.0 --suppress-nst -m ./models/ggml-small-q8_0.bin --request-path /v1/audio/ --port 8080 --host 0.0.0.0 --inference-path transcriptions
```

---

### 2. 复制部署文件

将选择的文件复制到目标位置并重命名为 `docker-compose.yml`。

#### Linux/macOS 示例

```bash
# CUDA 版本
cp docker/deploy/docker-compose.cuda.yml /your/deploy/path/docker-compose.yml

# ROCm 版本
cp docker/deploy/docker-compose.rocm.yml /your/deploy/path/docker-compose.yml

# CPU 版本
cp docker/deploy/docker-compose.yml /your/deploy/path/docker-compose.yml

cd /your/deploy/path/
```

#### Windows (PowerShell) 示例

```powershell
Copy-Item "docker\deploy\docker-compose.yml" "C:\whisper-deploy\docker-compose.yml"
cd C:\whisper-deploy
```

---

### 3. 配置环境变量

复制 `.env` 并编辑 `.env` 文件，配置以下关键参数：

```env
# openssl rand -base64 32
BETTER_AUTH_SECRET=your-secret-key
# 暂时用不到
BETTER_AUTH_URL=http://your-domain:port

# 初始密码
ADMIN_PASSWORD=12345678

# 数据库配置
DATABASE_URL=postgres://postgres:postgres12345678@db:5432/postgres?sslmode=disable
```

---

### 4. 准备模型文件

- 非 GPU 部署建议选择小模型以节省资源
- 🔗 [模型下载地址](https://huggingface.co/ggerganov/whisper.cpp/tree/main)
- 将模型文件放入与 `docker-compose.yml` 同级的 `models/` 目录

---

### 5. 启动服务

```bash
# 启动所有服务
docker-compose up -d

# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## 客户端

### 下载

🔗 [客户端下载地址](https://github.com/wszgrcy/audio-asr/releases)

### 登录

打开客户端后，使用以下默认账号登录：

- **账号**：`admin@admin.com`
- **密码**：`ADMIN_PASSWORD` 环境变量中配置的密码（默认为 `12345678`）

### android手机版本要求
- 如果要进行外放音频录制,那么应该在android 10及以上
- 手机webview版本应当在120以上才能更好的获得支持,低于此版本需要手动升级webview
---

## 目录结构说明

```
deploy/
├── docker-compose.yml        # CPU 版本（默认，跨平台兼容）
├── docker-compose.cuda.yml   # NVIDIA GPU CUDA 版本
├── docker-compose.rocm.yml   # AMD GPU ROCm/Vulkan 版本
├── .env                      # 环境变量配置文件（需要手动创建）
├── .env.example              # 环境变量示例文件（可选）
├── models/                   # 模型存储目录（需要手动创建）
└── data/                     # 数据库数据目录（自动创建）
```
