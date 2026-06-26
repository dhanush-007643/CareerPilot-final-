# Kubernetes — Local Deployment Guide (Minikube)

This guide demonstrates deploying CareerPilot on a local Kubernetes cluster using **Minikube**. This is for learning and demonstration purposes — production deployment uses Render + Vercel.

---

## Prerequisites

| Tool | Install |
|------|---------|
| **Docker** | [docker.com/get-docker](https://docs.docker.com/get-docker/) |
| **Minikube** | [minikube.sigs.k8s.io/docs/start](https://minikube.sigs.k8s.io/docs/start/) |
| **kubectl** | [kubernetes.io/docs/tasks/tools](https://kubernetes.io/docs/tasks/tools/) |

---

## Step 1: Start Minikube

```bash
minikube start --driver=docker
minikube addons enable ingress
```

---

## Step 2: Build Docker Images Inside Minikube

```bash
# Point Docker CLI to Minikube's Docker daemon
eval $(minikube docker-env)      # Linux/Mac
# minikube docker-env | Invoke-Expression   # PowerShell

# Build images
docker build -t dhaanush19/careerpilot-backend:latest ../backend/
docker build -t dhaanush19/careerpilot-frontend:latest ../frontend/
```

---

## Step 3: Configure Secrets

Edit `secret.yaml` and replace placeholder values with base64-encoded credentials:

```bash
# Encode a value
echo -n "your_real_value" | base64

# Example: encode MongoDB URI
echo -n "mongodb://mongo:27017/careerpilot" | base64
# Output: bW9uZ29kYjovL21vbmdvOjI3MDE3L2NhcmVlcnBpbG90
```

---

## Step 4: Deploy All Resources

```bash
# Apply everything in order
kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secret.yaml
kubectl apply -f mongo-deployment.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f ingress.yaml

# Or apply all at once
kubectl apply -f .
```

---

## Step 5: Verify Deployment

```bash
# Check all resources in the namespace
kubectl get all -n careerpilot

# Check pod status
kubectl get pods -n careerpilot

# Check services
kubectl get svc -n careerpilot

# Check ingress
kubectl get ingress -n careerpilot

# View backend logs
kubectl logs -n careerpilot -l app=cp-backend --tail=50
```

---

## Step 6: Access the Application

### Option A: Via Ingress (recommended)

Add to your hosts file (`/etc/hosts` or `C:\Windows\System32\drivers\etc\hosts`):

```
<minikube-ip>  careerpilot.local
```

Get the Minikube IP:

```bash
minikube ip
```

Then open: **http://careerpilot.local**

### Option B: Via NodePort / Port-Forward

```bash
# Forward frontend
kubectl port-forward -n careerpilot svc/cp-frontend 3000:80

# Forward backend (in another terminal)
kubectl port-forward -n careerpilot svc/cp-backend 5000:5000
```

Then open: **http://localhost:3000**

---

## Useful Commands

```bash
# Scale backend replicas
kubectl scale deployment cp-backend -n careerpilot --replicas=3

# Restart a deployment
kubectl rollout restart deployment cp-backend -n careerpilot

# Delete everything
kubectl delete namespace careerpilot

# Dashboard
minikube dashboard
```

---

## Architecture

```
                    ┌─────────────────────┐
                    │   Nginx Ingress     │
                    │   careerpilot.local  │
                    └────────┬────────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
       /api, /socket.io                     /
              │                             │
    ┌─────────▼─────────┐       ┌──────────▼──────────┐
    │   cp-backend (×2)  │       │  cp-frontend (×2)   │
    │   Node.js:5000     │       │  Nginx:80            │
    └─────────┬──────────┘       └─────────────────────┘
              │
    ┌─────────▼──────────┐
    │   MongoDB          │
    │   :27017            │
    │   (PVC: 1Gi)       │
    └────────────────────┘
```
