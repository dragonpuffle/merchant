# Полное руководство по деплою приложения Audio Guide API

## Содержание

1. [Обзор архитектуры](#обзор-архитектуры)
2. [Подготовка к деплою](#подготовка-к-деплою)
3. [Локальный деплой на виртуальной машине](#локальный-деплой-на-виртуальной-машине)
4. [Настройка сетевого экрана (Firewall)](#настройка-сетевого-экрана-firewall)
5. [Настройка маршрутизации портов](#настройка-маршрутизации-портов)
6. [Получение и настройка внешнего IP-адреса](#получение-и-настройка-внешнего-ip-адреса)
7. [Проверка доступности](#проверка-доступности)
8. [Облачные стратегии развертывания](#облачные-стратегии-развертывания)
9. [Безопасность и SSL](#безопасность-и-ssl)
10. [Мониторинг и логирование](#мониторинг-и-логирование)
11. [Траблшутинг](#траблшутинг)

---

## Обзор архитектуры

### Технологический стек

- **Backend**: Python 3.11, FastAPI
- **Frontend**: React, TypeScript, Vite, Nginx
- **Containerization**: Docker, Docker Compose
- **Reverse Proxy**: Nginx

### Порты

| Сервис | Внутренний порт | Внешний порт | Описание |
|--------|----------------|--------------|----------|
| Backend | 8000 | 8000 | FastAPI сервер |
| Frontend | 80 | 80 | Nginx веб-сервер |

### Архитектура сети

```
Интернет → [Firewall] → [Внешний IP] → [ВМ:80] → Nginx → Frontend
                                              ↓
                                         Backend:8000
```

---

## Подготовка к деплою

### 1. Клонирование репозитория

```bash
# На виртуальной машине
cd /opt
git clone <ваш-репозиторий> audio-guide
cd audio-guide
```

### 2. Настройка переменных окружения

Создайте файл `.env` в корневой директории:

```bash
cp .env.example .env
nano .env
```

Обязательные переменные:

```env
# Telegram Bot
BOT_TOKEN=ваш_telegram_bot_token

# Yandex Maps API
YANDEX_MAPS_API_KEY=ваш_yandex_maps_api_key

# Backend Configuration
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
CORS_ORIGINS=*

# Для продакшена замените CORS_ORIGINS на конкретные домены
# CORS_ORIGINS=https://ваш-домен.com,https://www.ваш-домен.com
```

### 3. Установка Docker

**Ubuntu/Debian:**
```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка необходимых пакетов
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Добавление официального репозитория Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Установка Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Добавление пользователя в группу docker
sudo usermod -aG docker $USER

# Применение изменений (выйдите и войдите снова)
newgrp docker
```

**CentOS/RHEL:**
```bash
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

---

## Локальный деплой на виртуальной машине

### 1. Сборка и запуск контейнеров

```bash
# Перейдите в директорию проекта
cd /opt/audio-guide

# Сборка и запуск всех сервисов
docker compose up -d --build

# Проверка статуса контейнеров
docker compose ps

# Просмотр логов
docker compose logs -f
```

### 2. Проверка работы контейнеров

```bash
# Проверка здоровья контейнеров
docker compose ps

# Проверка backend API
curl http://localhost:8000/api/v1/health

# Проверка frontend
curl http://localhost/

# Просмотр логов backend
docker compose logs backend

# Просмотр логов frontend
docker compose logs frontend
```

### 3. Управление контейнерами

```bash
# Остановка всех контейнеров
docker compose stop

# Запуск остановленных контейнеров
docker compose start

# Перезапуск контейнеров
docker compose restart

# Остановка и удаление контейнеров
docker compose down

# Остановка и удаление контейнеров с томами
docker compose down -v

# Пересборка с очисткой кэша
docker compose build --no-cache
docker compose up -d
```

---

## Настройка сетевого экрана (Firewall)

### UFW (Ubuntu/Debian)

#### 1. Проверка статуса UFW

```bash
sudo ufw status verbose
```

#### 2. Настройка правил UFW

```bash
# Разрешить SSH (важно для доступа к серверу)
sudo ufw allow 22/tcp
sudo ufw allow OpenSSH

# Разрешить HTTP
sudo ufw allow 80/tcp

# Разрешить HTTPS (если планируете использовать SSL)
sudo ufw allow 443/tcp

# Разрешить доступ к backend API (если нужен прямой доступ)
sudo ufw allow 8000/tcp

# Включить UFW
sudo ufw enable

# Проверка статуса
sudo ufw status numbered
```

#### 3. Дополнительные правила (ограничение доступа)

```bash
# Разрешить доступ с конкретного IP-адреса
sudo ufw allow from 192.168.1.100 to any port 8000

# Разрешить доступ с подсети
sudo ufw allow from 192.168.1.0/24 to any port 8000

# Удалить правило
sudo ufw delete [номер_правила]
```

### firewalld (CentOS/RHEL)

#### 1. Проверка статуса firewalld

```bash
sudo systemctl status firewalld
```

#### 2. Настройка правил firewalld

```bash
# Добавление правил
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https

# Добавление порта backend
sudo firewall-cmd --permanent --add-port=8000/tcp

# Перезагрузка firewalld
sudo firewall-cmd --reload

# Проверка активных правил
sudo firewall-cmd --list-all
```

#### 3. Ограничение доступа по IP

```bash
# Разрешить доступ с конкретного IP
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="192.168.1.100" port protocol="tcp" port="8000" accept'

# Разрешить доступ с подсети
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="192.168.1.0/24" port protocol="tcp" port="8000" accept'

# Перезагрузка
sudo firewall-cmd --reload
```

### iptables (универсальный метод)

```bash
# Просмотр текущих правил
sudo iptables -L -n -v

# Разрешить SSH
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# Разрешить HTTP
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT

# Разрешить HTTPS
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# Разрешить backend
sudo iptables -A INPUT -p tcp --dport 8000 -j ACCEPT

# Разрешить установленные соединения
sudo iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Сохранение правил (Ubuntu/Debian)
sudo apt install iptables-persistent
sudo netfilter-persistent save

# Сохранение правил (CentOS/RHEL)
sudo service iptables save
```

---

## Настройка маршрутизации портов

### 1. Проверка прослушиваемых портов

```bash
# Проверка прослушиваемых портов
sudo netstat -tlnp
# или
sudo ss -tlnp

# Проверка конкретного порта
sudo lsof -i :80
sudo lsof -i :8000
```

### 2. Настройка Docker портов

В файле [`docker-compose.yml`](docker-compose.yml:1) порты уже настроены:

```yaml
services:
  backend:
    ports:
      - "8000:8000"  # host:container
  
  frontend:
    ports:
      - "80:80"      # host:container
```

### 3. Изменение портов (если необходимо)

Если нужно изменить порты, отредактируйте [`docker-compose.yml`](docker-compose.yml:1):

```yaml
services:
  backend:
    ports:
      - "8080:8000"  # Изменить внешний порт на 8080
  
  frontend:
    ports:
      - "8081:80"    # Изменить внешний порт на 8081
```

После изменений перезапустите контейнеры:

```bash
docker compose down
docker compose up -d
```

### 4. Настройка Nginx для проксирования

В файле [`frontend/nginx.conf`](frontend/nginx.conf:1) уже настроено проксирование:

```nginx
# Proxy API requests to backend
location /api/ {
    proxy_pass http://backend:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

---

## Получение и настройка внешнего IP-адреса

### 1. Определение типа виртуальной машины

Определите, где находится ваша виртуальная машина:

- **Локальная виртуальная машина** (VirtualBox, VMware, Hyper-V)
- **Облачная ВМ** (AWS, Azure, Google Cloud, DigitalOcean, Yandex Cloud и т.д.)
- **VPS** (Timeweb, Beget, Reg.ru и т.д.)

### 2. Локальная виртуальная машина

#### VirtualBox

1. **Настройка сетевого адаптера:**
   - Откройте настройки ВМ
   - Перейдите в Network → Adapter 1
   - Выберите "Bridged Adapter" (Мостовой адаптер)
   - Выберите активный сетевой интерфейс хоста

2. **Получение IP-адреса:**
   ```bash
   # На виртуальной машине
   ip addr show
   # или
   ifconfig
   ```

3. **Настройка Port Forwarding (если используется NAT):**
   - Settings → Network → Adapter 1 → Port Forwarding
   - Добавьте правила:
     - Host Port: 8080 → Guest Port: 80
     - Host Port: 8000 → Guest Port: 8000

#### VMware

1. **Настройка сетевого адаптера:**
   - VM Settings → Network Adapter
   - Выберите "Bridged" или "NAT"

2. **Для NAT настройте Port Forwarding:**
   - Edit → Virtual Network Editor
   - Выберите NAT сеть → NAT Settings → Port Forwarding
   - Добавьте правила для портов 80 и 8000

#### Hyper-V

1. **Настройка виртуального коммутатора:**
   - Hyper-V Manager → Virtual Switch Manager
   - Создайте "External Network" (внешний коммутатор)

2. **Настройка Port Forwarding (PowerShell):**
   ```powershell
   # Добавление правила для порта 80
   netsh interface portproxy add v4tov4 listenport=80 listenaddress=0.0.0.0 connectport=80 connectaddress=<IP-ВМ>
   
   # Добавление правила для порта 8000
   netsh interface portproxy add v4tov4 listenport=8000 listenaddress=0.0.0.0 connectport=8000 connectaddress=<IP-ВМ>
   ```

### 3. Облачная виртуальная машина

#### AWS EC2

1. **Получение публичного IP:**
   - В консоли AWS → EC2 → Instances
   - Публичный IP отображается в разделе "Public IPv4 address"

2. **Настройка Security Groups:**
   - EC2 → Security Groups
   - Edit inbound rules:
     - Type: HTTP, Port: 80, Source: 0.0.0.0/0
     - Type: Custom TCP, Port: 8000, Source: 0.0.0.0/0 (или ограничьте по IP)
     - Type: SSH, Port: 22, Source: Ваш IP

3. **Elastic IP (статический IP):**
   - EC2 → Elastic IPs → Allocate Elastic IP
   - Associate Elastic IP с вашим инстансом

#### Google Cloud Platform (GCP)

1. **Получение внешнего IP:**
   - Compute Engine → VM instances
   - Внешний IP отображается в разделе "External IP"

2. **Настройка Firewall Rules:**
   - VPC Network → Firewall
   - Create Firewall Rule:
     - Name: allow-http
     - Targets: All instances
     - Source filter: IPv4 ranges
     - Source IPv4 ranges: 0.0.0.0/0
     - Allowed protocols and ports: tcp:80

3. **Static IP:**
   - VPC Network → External IP addresses
   - Reserve static address

#### DigitalOcean

1. **Получение публичного IP:**
   - Droplets → Ваш droplet
   - Публичный IP отображается в разделе "IPv4 Address"

2. **Настройка Firewall:**
   - Networking → Firewalls
   - Create Firewall:
     - Inbound Rules:
       - HTTP (Port 80) - All IPv4
       - Custom (Port 8000) - All IPv4 (или ограничьте)
       - SSH (Port 22) - Ваш IP

#### Yandex Cloud

1. **Получение публичного IP:**
   - Compute Cloud → Virtual machines
   - Публичный IP отображается в разделе "Public IP"

2. **Настройка Security Groups:**
   - Virtual Private Cloud → Security groups
   - Create security group:
     - Inbound rules:
       - Port: 80, Protocol: tcp, Source: 0.0.0.0/0
       - Port: 8000, Protocol: tcp, Source: 0.0.0.0/0
       - Port: 22, Protocol: tcp, Source: Ваш IP

### 4. Проверка внешнего IP

```bash
# На виртуальной машине
curl ifconfig.me
# или
curl icanhazip.com
# или
ip addr show
```

---

## Проверка доступности

### 1. Локальная проверка на ВМ

```bash
# Проверка backend API
curl http://localhost:8000/api/v1/health

# Проверка frontend
curl http://localhost/

# Проверка по IP-адресу ВМ
curl http://127.0.0.1:8000/api/v1/health
curl http://127.0.0.1:80/
```

### 2. Проверка с другого компьютера в локальной сети

```bash
# Замените <IP-ВМ> на реальный IP-адрес вашей виртуальной машины
curl http://<IP-ВМ>:8000/api/v1/health
curl http://<IP-ВМ>:80/
```

### 3. Проверка из интернета

```bash
# Замените <PUBLIC-IP> на публичный IP-адрес
curl http://<PUBLIC-IP>/
curl http://<PUBLIC-IP>/api/v1/health
```

### 4. Проверка с помощью онлайн-инструментов

- **Can You See Me**: https://www.canyouseeme.org/
  - Введите порт 80 или 8000
  - Проверьте, виден ли порт извне

- **Port Checker**: https://www.portchecktool.com/
- **Ping.eu**: https://ping.eu/port-cheker/

### 5. Проверка DNS (если настроен домен)

```bash
# Проверка DNS записи
nslookup ваш-домен.com
dig ваш-домен.com

# Проверка HTTP
curl -I http://ваш-домен.com
```

---

## Облачные стратегии развертывания

### Стратегия 1: Развертывание на облачном VPS (Рекомендуется для небольших проектов)

#### Преимущества:
- Полный контроль над сервером
- Низкая стоимость (от $5/месяц)
- Простота настройки
- Подходит для MVP и небольших проектов

#### Подходящие провайдеры:
- **DigitalOcean** (от $5/месяц)
- **Linode** (от $5/месяц)
- **Vultr** (от $5/месяц)
- **Timeweb Cloud** (от 100 руб/месяц)
- **Beget** (от 200 руб/месяц)
- **Reg.ru** (от 150 руб/месяц)

#### Шаги развертывания:

1. **Создание VPS:**
   ```bash
   # Пример для DigitalOcean через CLI
   doctl compute droplet create audio-guide \
     --region nyc1 \
     --image ubuntu-22-04-x64 \
     --size s-1vcpu-1gb \
     --ssh-keys <SSH-KEY-ID>
   ```

2. **Подключение к серверу:**
   ```bash
   ssh root@<SERVER-IP>
   ```

3. **Установка Docker:**
   (См. раздел "Подготовка к деплою")

4. **Клонирование и запуск:**
   ```bash
   cd /opt
   git clone <репозиторий> audio-guide
   cd audio-guide
   cp .env.example .env
   nano .env  # Настройте переменные
   docker compose up -d --build
   ```

5. **Настройка Firewall:**
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

6. **Настройка домена (опционально):**
   - Добавьте A-запись в DNS провайдера
   - Настройте SSL (см. раздел "Безопасность и SSL")

---

### Стратегия 2: Развертывание на PaaS (Platform as a Service)

#### Преимущества:
- Автоматическое масштабирование
- Встроенный CI/CD
- Управление SSL сертификатами
- Простота деплоя
- Pay-as-you-go модель

#### Подходящие провайдеры:
- **Render** (бесплатный план для статических сайтов)
- **Railway** (от $5/месяц)
- **Heroku** (от $7/месяц)
- **Fly.io** (от $5/месяц)
- **Northflank** (бесплатный план)

#### Пример развертывания на Railway:

1. **Подготовка проекта:**
   ```bash
   # Создайте файл railway.toml
   cat > railway.toml << EOF
   [build]
   builder = "DOCKERFILE"
   dockerfilePath = "Dockerfile"
   EOF
   ```

2. **Развертывание через CLI:**
   ```bash
   # Установка Railway CLI
   npm install -g @railway/cli

   # Авторизация
   railway login

   # Инициализация проекта
   railway init

   # Добавление переменных окружения
   railway variables set BOT_TOKEN=ваш_токен
   railway variables set YANDEX_MAPS_API_KEY=ваш_ключ

   # Деплой
   railway up
   ```

#### Пример развертывания на Render:

1. **Разделение на два сервиса:**
   - Backend (Web Service)
   - Frontend (Static Site)

2. **Backend (render.yaml):**
   ```yaml
   services:
     - type: web
       name: audio-guide-backend
       env: docker
       dockerfilePath: ./backend/Dockerfile
       envVars:
         - key: BOT_TOKEN
           sync: false
         - key: YANDEX_MAPS_API_KEY
           sync: false
   ```

3. **Frontend (render.yaml):**
   ```yaml
   services:
     - type: web
       name: audio-guide-frontend
       env: docker
       dockerfilePath: ./frontend/Dockerfile
       envVars:
         - key: VITE_API_URL
           value: https://audio-guide-backend.onrender.com
   ```

---

### Стратегия 3: Развертывание на Kubernetes (для масштабируемых приложений)

#### Преимущества:
- Автоматическое масштабирование
- Высокая доступность
- Управление конфигурациями
- Подходит для крупных проектов

#### Подходящие провайдеры:
- **Google Kubernetes Engine (GKE)**
- **AWS Elastic Kubernetes Service (EKS)**
- **Azure Kubernetes Service (AKS)**
- **DigitalOcean Kubernetes**
- **Yandex Managed Service for Kubernetes**

#### Пример конфигурации Kubernetes:

1. **Namespace:**
   ```yaml
   # namespace.yaml
   apiVersion: v1
   kind: Namespace
   metadata:
     name: audio-guide
   ```

2. **ConfigMap:**
   ```yaml
   # configmap.yaml
   apiVersion: v1
   kind: ConfigMap
   metadata:
     name: audio-guide-config
     namespace: audio-guide
   data:
     BACKEND_HOST: "0.0.0.0"
     BACKEND_PORT: "8000"
     CORS_ORIGINS: "*"
   ```

3. **Secret:**
   ```yaml
   # secret.yaml
   apiVersion: v1
   kind: Secret
   metadata:
     name: audio-guide-secrets
     namespace: audio-guide
   type: Opaque
   stringData:
     BOT_TOKEN: "ваш_токен"
     YANDEX_MAPS_API_KEY: "ваш_ключ"
   ```

4. **Backend Deployment:**
   ```yaml
   # backend-deployment.yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: backend
     namespace: audio-guide
   spec:
     replicas: 2
     selector:
       matchLabels:
         app: backend
     template:
       metadata:
         labels:
           app: backend
       spec:
         containers:
         - name: backend
           image: ваш-registry/audio-guide-backend:latest
           ports:
           - containerPort: 8000
           envFrom:
           - configMapRef:
               name: audio-guide-config
           - secretRef:
               name: audio-guide-secrets
   ```

5. **Service:**
   ```yaml
   # backend-service.yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: backend
     namespace: audio-guide
   spec:
     selector:
       app: backend
     ports:
     - protocol: TCP
       port: 8000
       targetPort: 8000
   ```

6. **Ingress:**
   ```yaml
   # ingress.yaml
   apiVersion: networking.k8s.io/v1
   kind: Ingress
   metadata:
     name: audio-guide-ingress
     namespace: audio-guide
     annotations:
       cert-manager.io/cluster-issuer: "letsencrypt-prod"
   spec:
     tls:
     - hosts:
       - ваш-домен.com
       secretName: audio-guide-tls
     rules:
     - host: ваш-домен.com
       http:
         paths:
         - path: /api
           pathType: Prefix
           backend:
             service:
               name: backend
               port:
                 number: 8000
         - path: /
           pathType: Prefix
           backend:
             service:
               name: frontend
               port:
                 number: 80
   ```

---

### Стратегия 4: Serverless (для функций и API)

#### Преимущества:
- Оплата только за использование
- Автоматическое масштабирование
- Нет управления серверами
- Подходит для API-first приложений

#### Подходящие провайдеры:
- **AWS Lambda + API Gateway**
- **Google Cloud Functions**
- **Azure Functions**
- **Vercel** (для frontend)
- **Netlify** (для frontend)

#### Пример развертывания на Vercel (Frontend):

1. **Установка Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Деплой:**
   ```bash
   cd frontend
   vercel
   ```

3. **Настройка переменных окружения:**
   ```bash
   vercel env add VITE_API_URL
   ```

---

### Стратегия 5: Гибридное развертывание

#### Архитектура:
- **Frontend**: Vercel/Netlify (CDN)
- **Backend**: Cloud VPS или PaaS
- **Static Assets**: Cloud Storage (S3, Yandex Object Storage)

#### Преимущества:
- Оптимальная производительность
- Гибкость в выборе технологий
- Эффективное использование ресурсов

#### Пример конфигурации:

1. **Frontend на Vercel:**
   ```bash
   cd frontend
   vercel --prod
   ```

2. **Backend на Railway:**
   ```bash
   cd backend
   railway up
   ```

3. **Статические файлы на S3:**
   ```bash
   aws s3 sync ./images s3://audio-guide-assets/images
   aws s3 sync ./audio s3://audio-guide-assets/audio
   ```

---

## Безопасность и SSL

### 1. Установка SSL сертификата с Let's Encrypt

#### Использование Certbot

```bash
# Установка Certbot
sudo apt install certbot python3-certbot-nginx -y

# Получение сертификата
sudo certbot --nginx -d ваш-домен.com -d www.ваш-домен.com

# Автоматическое обновление
sudo certbot renew --dry-run
```

#### Конфигурация Nginx с SSL

Создайте файл `nginx-ssl.conf`:

```nginx
server {
    listen 80;
    server_name ваш-домен.com www.ваш-домен.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ваш-домен.com www.ваш-домен.com;

    # SSL сертификаты
    ssl_certificate /etc/letsencrypt/live/ваш-домен.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ваш-домен.com/privkey.pem;

    # SSL настройки
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Безопасные заголовки
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Остальная конфигурация...
}
```

### 2. Настройка HTTPS для Docker Compose

Обновите [`docker-compose.yml`](docker-compose.yml:1):

```yaml
services:
  frontend:
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx-ssl.conf:/etc/nginx/conf.d/default.conf
      - ./certs:/etc/letsencrypt:ro
```

### 3. Использование Cloudflare (опционально)

1. **Регистрация в Cloudflare**
2. **Добавление домена**
3. **Изменение NS записей**
4. **Настройка SSL:**
   - SSL/TLS → Full (strict)
   - Always Use HTTPS: ON
   - Automatic HTTPS Rewrites: ON

### 4. Дополнительные меры безопасности

```bash
# Ограничение доступа к API по IP
sudo ufw allow from 192.168.1.0/24 to any port 8000

# Настройка fail2ban для защиты от брутфорса
sudo apt install fail2ban -y

# Создание конфигурации для nginx
sudo nano /etc/fail2ban/jail.local
```

Содержимое `/etc/fail2ban/jail.local`:

```ini
[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
```

---

## Мониторинг и логирование

### 1. Мониторинг контейнеров

```bash
# Просмотр логов всех контейнеров
docker compose logs -f

# Просмотр логов конкретного сервиса
docker compose logs -f backend
docker compose logs -f frontend

# Просмотр последних 100 строк
docker compose logs --tail=100 backend

# Просмотр логов за определенное время
docker compose logs --since 1h backend
```

### 2. Мониторинг ресурсов

```bash
# Использование ресурсов контейнеров
docker stats

# Использование диска
docker system df

# Очистка неиспользуемых ресурсов
docker system prune -a
```

### 3. Настройка логирования

Создайте файл `docker-compose.logging.yml`:

```yaml
version: '3.8'

services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
  
  frontend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 4. Использование Prometheus + Grafana

Создайте файл `monitoring/docker-compose.yml`:

```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
  
  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

---

## Траблшутинг

### Проблема: Контейнеры не запускаются

**Диагностика:**
```bash
docker compose ps
docker compose logs backend
docker compose logs frontend
```

**Решения:**
1. Проверьте наличие Docker: `docker --version`
2. Проверьте права доступа: `sudo usermod -aG docker $USER`
3. Проверьте порты: `sudo lsof -i :80`, `sudo lsof -i :8000`
4. Пересоберите контейнеры: `docker compose build --no-cache`

### Проблема: Не удается подключиться извне

**Диагностика:**
```bash
# Проверка firewall
sudo ufw status

# Проверка прослушиваемых портов
sudo netstat -tlnp

# Проверка с локального хоста
curl http://localhost:8000/api/v1/health

# Проверка с IP-адреса
curl http://<IP-ВМ>:8000/api/v1/health
```

**Решения:**
1. Откройте порты в firewall
2. Проверьте настройки сетевого адаптера ВМ
3. Убедитесь, что BACKEND_HOST=0.0.0.0
4. Проверьте настройки облачного провайдера (Security Groups)

### Проблема: CORS ошибки

**Диагностика:**
```bash
# Проверьте настройки CORS в .env
cat .env | grep CORS
```

**Решения:**
1. Обновите CORS_ORIGINS в `.env`:
   ```env
   CORS_ORIGINS=https://ваш-домен.com,https://www.ваш-домен.com
   ```
2. Перезапустите контейнеры: `docker compose restart`

### Проблема: Проблемы с API

**Диагностика:**
```bash
# Проверка здоровья API
curl http://localhost:8000/api/v1/health

# Просмотр логов backend
docker compose logs backend

# Проверка переменных окружения
docker compose exec backend env
```

**Решения:**
1. Проверьте наличие необходимых переменных в `.env`
2. Убедитесь, что BOT_TOKEN и YANDEX_MAPS_API_KEY установлены
3. Проверьте подключение к базе данных (если используется)

### Проблема: Проблемы с Nginx

**Диагностика:**
```bash
# Проверка конфигурации Nginx
docker compose exec frontend nginx -t

# Просмотр логов Nginx
docker compose logs frontend

# Проверка доступа к файлам
docker compose exec frontend ls -la /usr/share/nginx/html
```

**Решения:**
1. Проверьте конфигурацию [`nginx.conf`](frontend/nginx.conf:1)
2. Убедитесь, что файлы скопированы правильно
3. Проверьте права доступа к файлам

### Проблема: Проблемы с SSL

**Диагностика:**
```bash
# Проверка сертификата
sudo certbot certificates

# Проверка конфигурации Nginx
sudo nginx -t

# Проверка порта 443
sudo netstat -tlnp | grep 443
```

**Решения:**
1. Обновите сертификат: `sudo certbot renew`
2. Проверьте конфигурацию Nginx
3. Убедитесь, что порт 443 открыт в firewall

---

## Краткая проверка деплоя

После завершения деплоя выполните этот чек-лист:

```bash
# 1. Проверка контейнеров
docker compose ps
# Ожидается: Оба контейнера в статусе "Up"

# 2. Проверка логов
docker compose logs --tail=20
# Ожидается: Нет ошибок

# 3. Проверка API
curl http://localhost:8000/api/v1/health
# Ожидается: {"status":"healthy"}

# 4. Проверка frontend
curl http://localhost/
# Ожидается: HTML код страницы

# 5. Проверка firewall
sudo ufw status
# Ожидается: Порты 80, 443, 8000 открыты

# 6. Проверка извне
curl http://<PUBLIC-IP>/
# Ожидается: HTML код страницы
```

---

## Рекомендации по выбору стратегии

| Сценарий | Рекомендуемая стратегия | Стоимость | Сложность |
|----------|------------------------|-----------|-----------|
| MVP / Хакатон | VPS (DigitalOcean/Timeweb) | $5-10/месяц | Низкая |
| Небольшой проект | VPS или PaaS (Railway) | $5-15/месяц | Средняя |
| Средний проект | Kubernetes или PaaS | $20-50/месяц | Высокая |
| Крупный проект | Kubernetes + CDN | $100+/месяц | Очень высокая |
| Serverless API | Lambda/Cloud Functions | Pay-as-you-go | Средняя |

---

## Дополнительные ресурсы

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [UFW Essentials](https://help.ubuntu.com/community/UFW)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

---

## Контакты и поддержка

Если у вас возникли проблемы с деплоем:

1. Проверьте логи: `docker compose logs -f`
2. Проверьте документацию проекта: [`README.md`](README.md:1)
3. Создайте issue в репозитории проекта

---

**Удачи с деплоем! 🚀**
