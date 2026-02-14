#!/bin/bash
# Ethos Academy — EC2 setup script
# Run on a fresh Ubuntu 24.04 instance (t3.medium, 30GB EBS)
#
# Usage:
#   scp -i your-key.pem deploy/setup-ec2.sh ubuntu@YOUR_EC2_IP:~
#   ssh -i your-key.pem ubuntu@YOUR_EC2_IP
#   chmod +x setup-ec2.sh && ./setup-ec2.sh

set -euo pipefail

echo "=== Installing Docker ==="
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

sudo usermod -aG docker $USER
echo "=== Docker installed ==="

echo "=== Cloning repo ==="
sudo apt-get install -y git
git clone https://github.com/allierays/ethos.git ~/ethos
cd ~/ethos

echo ""
echo "=== NEXT STEPS ==="
echo ""
echo "1. Create .env file:"
echo "   cp .env.example .env"
echo "   nano .env"
echo "   # Fill in: ANTHROPIC_API_KEY, NEO4J_USER=neo4j, NEO4J_PASSWORD=<strong-password>"
echo ""
echo "2. Log out and back in (for docker group):"
echo "   exit"
echo "   ssh -i your-key.pem ubuntu@YOUR_EC2_IP"
echo ""
echo "3. Launch:"
echo "   cd ~/ethos"
echo "   docker compose -f docker-compose.prod.yml up -d --build"
echo ""
echo "4. Seed Neo4j (after containers are healthy):"
echo "   docker compose -f docker-compose.prod.yml exec app python -m scripts.seed_graph"
echo ""
echo "5. Verify:"
echo "   curl http://localhost:8000/health"
echo "   curl http://localhost:3000"
echo ""
echo "6. Point DNS:"
echo "   A record: ethos-academy.com → YOUR_EC2_IP"
echo "   A record: api.ethos-academy.com → YOUR_EC2_IP"
echo "   Caddy handles SSL automatically once DNS propagates."
echo ""
