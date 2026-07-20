# GitOps Learning Log — kind + Helm + ArgoCD

Running log of the GitOps/Kubernetes learning environment being built on an Ubuntu 24.04 LTS VM (VMware, bridged networking), browsed from a separate Windows host. Companion to `iac.md` (Azure/Terraform) and `ci-cd.md` (GitHub Actions) — this doc covers the local kind/ArgoCD side. Update it as the setup progresses; treat it as a runbook + concept reference, not just a changelog.

## Environment

- VM: Ubuntu 24.04.3 LTS, 4 vCPU, 8.3GB RAM, 40GB disk (~16GB free), Docker 29.1.3 pre-installed, docker usable without `sudo`.
- Networking: VMware **bridged** adapter — VM has its own LAN-routable IP, directly reachable from the Windows host with no port-forwarding/NAT tricks.
- Browser access happens from the Windows host, not the VM itself — every hostname we expose needs an entry in the **Windows** hosts file (`C:\Windows\System32\drivers\etc\hosts`), pointed at the VM's IP (`hostname -I` on the VM to get it).
- Infra repo root: `~/gmao-infra` on the VM (git-initialized), separate from the app repo (GMAO monorepo with `gmao-backend`/`gmao-frontend`) — this is the GitOps two-repo split: app repo builds/pushes images, infra repo declares what should run.

## 1. Cleaning up a prior project's leftovers

Before starting, the VM had a leftover kind cluster (`aegis-cluster`, 3 nodes) from an earlier project, occupying host ports 80/443.

Inspected before deleting anything (never delete cluster state blind):
```bash
kind get clusters
docker ps -a
docker images
docker volume ls
docker network ls
kubectl config get-contexts
helm list -A
sudo ss -tulpn | grep -E ':80|:443|:6443|:8080'
```
`helm list -A` came back empty — nothing was actually deployed on the old cluster, just idle infra squatting on the ports we needed. Deleted it and swept up orphaned Docker objects it left behind:
```bash
kind delete cluster --name aegis-cluster
docker volume prune -f
docker network prune -f
```
`kind delete cluster` removes the node containers + kubeconfig context automatically; `docker volume/network prune` clean up anything Docker didn't auto-remove alongside those containers.

## 2. Toolchain install

Installed on the VM: `kind`, `kubectl`, `helm` (in that order the first time; `helm` was missed initially and installed later when the ingress-nginx step needed it).

```bash
# kind
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.27.0/kind-linux-amd64
chmod +x ./kind && sudo mv ./kind /usr/local/bin/kind

# kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl && sudo mv kubectl /usr/local/bin/

# helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```
Result: Helm v3.21.3, kubectl matching latest stable, kind v0.27.0.

**Why kind specifically:** it runs each Kubernetes "node" as a Docker container (`kindest/node` image) rather than a nested VM — that's why a working, sudo-less Docker was a prerequisite. Chosen over minikube/k3s because its multi-node control-plane/worker split most closely mirrors a real cluster, which matters for a "production-simulated" learning goal.

## 3. kind cluster

Config file: `~/gmao-infra/bootstrap/kind-config.yaml`
```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
name: gmao-cluster
nodes:
  - role: control-plane
    extraPortMappings:
      - containerPort: 80
        hostPort: 80
        protocol: TCP
      - containerPort: 443
        hostPort: 443
        protocol: TCP
    kubeadmConfigPatches:
      - |
        kind: InitConfiguration
        nodeRegistration:
          kubeletExtraArgs:
            node-labels: "ingress-ready=true"
  - role: worker
  - role: worker
```
Topology: 1 control-plane + 2 workers — enough to schedule pods across multiple nodes for realism, without over-taxing a 4-vCPU/8GB VM.

- `extraPortMappings` on the control-plane maps the VM's host ports 80/443 straight into that node container — this is the "door" an Ingress controller will sit behind later.
- `node-labels: ingress-ready=true` tags the control-plane node so the ingress-nginx Helm chart can be told (via `nodeSelector`) to schedule its controller pod specifically there — the only node with the 80/443 mapping. Without the label, the ingress pod could land on a worker with no route to those host ports and nothing would be reachable.

Created with:
```bash
kind create cluster --config ~/gmao-infra/bootstrap/kind-config.yaml
```
Verified: `kubectl get nodes -o wide` (all 3 `Ready`, v1.29.2) and `kubectl cluster-info`.

## 4. Ingress controller (ingress-nginx)

**Concept:** Pods have unstable internal IPs; a `Service` gives a stable *internal* endpoint but isn't reachable from outside the cluster by default. Options to expose it externally:
- `Service type: LoadBalancer` — needs a cloud provider to provision a real LB; hangs `Pending` forever on kind (no cloud provider).
- `Service type: NodePort` — exposes a random high port (30000-32767) per service; works but no hostname routing, one ugly port per app.
- **Ingress** — a single controller pod (itself a reverse proxy) reads `Ingress` resources as routing rules and fronts every app in the cluster behind one address, routed by hostname/path. Standard production pattern — this is why we chose it and pre-mapped ports 80/443 in the kind config.

Install:
```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx --create-namespace \
  --set controller.service.type=NodePort \
  --set controller.hostPort.enabled=true \
  --set-string controller.nodeSelector."ingress-ready"=true \
  --set controller.nodeSelector."kubernetes\.io/os"=linux \
  --set controller.tolerations[0].key=node-role.kubernetes.io/control-plane \
  --set controller.tolerations[0].operator=Exists \
  --set controller.tolerations[0].effect=NoSchedule
```

**Gotcha hit:** first attempt used `--set controller.nodeSelector."ingress-ready"=true` (no `-string`), which failed:
```
Error: INSTALLATION FAILED: 1 error occurred:
	* Deployment in version "v1" cannot be handled as a Deployment: json: cannot unmarshal bool into Go struct field PodSpec.spec.template.spec.nodeSelector of type string
```
Reason: bare `--set foo=true` coerces `true` into a YAML **boolean**, but `nodeSelector` values must be strings. Fixed with `--set-string` for that one flag. Had to `helm uninstall ingress-nginx -n ingress-nginx` first to clear the failed release record before retrying.

Other flags: `hostPort.enabled=true` binds the controller pod directly to the node's host ports (the ones mapped to the VM's 80/443); the `tolerations` block lets the pod ignore the control-plane node's default "don't schedule regular workloads here" taint, since we're deliberately pinning it there via `nodeSelector`.

Verified via:
```bash
kubectl get pods -n ingress-nginx -w   # → 1/1 Running (readiness probe took ~1-2 min, normal)
curl -I http://localhost                # → HTTP/1.1 404 Not Found (correct: no Ingress rules defined yet)
```
`-I` = curl sends a `HEAD` request and prints only response headers, no body — quick "is it alive" check without pulling content. (Note: lowercase `-i` instead prints headers *plus* body on a normal GET — different flag.)

## 5. ArgoCD

**Concept:** ArgoCD is a controller running *inside* the cluster that continuously diffs "what's declared in a git repo" against "what's actually running," and syncs the cluster to match (manually or automatically). This is the core of GitOps: git becomes the source of truth — you commit to git instead of running `kubectl apply` by hand. Its own objects are just more Kubernetes resources; the central one is the `Application` CRD, which points ArgoCD at a repo + path + destination namespace.

Install:
```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl get pods -n argocd -w
```
Deploys `argocd-server`, `argocd-repo-server`, `argocd-application-controller`, `argocd-applicationset-controller`, `argocd-dex-server`, `argocd-redis`, `argocd-notifications-controller`. All came up `1/1 Running` (a couple of early restarts on `applicationset-controller` were normal startup-ordering noise — it started before `redis`/`repo-server` were ready).

### CLI install
```bash
curl -SL -o argocd-linux-amd64 https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
sudo install -m 555 argocd-linux-amd64 /usr/local/bin/argocd
rm argocd-linux-amd64
```
- Dropped `-s` (silent) from the download `curl` after the first run *looked* stuck — `-sSL` suppresses the progress bar entirely, so a large (~120MB) download can appear frozen when it's actually fine. Checked with `ls -la` in a second terminal (growing file size = still downloading) before deciding whether to worry.
- `-m 555` on `install` sets the installed binary's permissions directly (like `chmod`): `555` octal = `r-xr-xr-x` — everyone can read/execute, nobody (even root) can write without an explicit `chmod` first. Fine for a system-wide CLI tool.
- `rm argocd-linux-amd64` deletes the now-redundant downloaded copy — the real installed binary lives at `/usr/local/bin/argocd` (on `PATH`); keeping the original download around would just waste disk space.

### Exposing the ArgoCD UI via Ingress
`argocd-server` normally terminates its own TLS and expects gRPC-aware routing, which complicates plain HTTP ingress. Standard fix: switch it to "insecure" mode (serve plain HTTP internally) and let ingress-nginx own TLS/routing instead.

```bash
kubectl patch configmap argocd-cmd-params-cm -n argocd --type merge \
  -p '{"data":{"server.insecure":"true"}}'
kubectl rollout restart deployment argocd-server -n argocd
kubectl rollout status deployment argocd-server -n argocd
```

Ingress manifest — `~/gmao-infra/argocd/argocd-ingress.yaml`:
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: argocd-server-ingress
  namespace: argocd
  annotations:
    nginx.ingress.kubernetes.io/backend-protocol: "HTTP"
    nginx.ingress.kubernetes.io/ssl-redirect: "false"
spec:
  ingressClassName: nginx
  rules:
    - host: argocd.gmao.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: argocd-server
                port:
                  number: 80
```
```bash
kubectl apply -f ~/gmao-infra/argocd/argocd-ingress.yaml
```

**Hostname resolution** — since the browser is on the Windows host, not the VM, the hosts entry had to go on Windows (`C:\Windows\System32\drivers\etc\hosts`, edited as Administrator), pointed at the VM's bridged-network IP (from `hostname -I` on the VM):
```
<VM_IP>  argocd.gmao.local
```
Verified from PowerShell:
```powershell
curl.exe -I http://argocd.gmao.local
# → HTTP/1.1 200 OK
```

### Login
```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d; echo
```
Logged into `http://argocd.gmao.local` in the browser as `admin` with that password, then rotated it immediately (Settings → Accounts → admin → Update password, or `argocd account update-password` via CLI) — the initial secret is meant to be single-use/rotated, not kept long-term even in a learning cluster.

## Where we are / what's next

Cluster + ingress + ArgoCD are fully up, ArgoCD UI reachable and logged in with a rotated password. No `Application` resources exist yet — the ArgoCD UI is currently empty.

Next steps (not yet done):
1. Write the first Helm chart (`gmao-backend`) by hand — templates, `values.yaml`, understand what Helm actually generates.
2. Set up the App-of-Apps pattern in `~/gmao-infra/argocd/applications/` so ArgoCD manages itself declaratively.
3. Deploy MySQL + Redis via upstream Helm charts (Bitnami) as ArgoCD Applications.
4. Wire CI in the app repo to push images to GHCR on push to `main`.
5. Install Argo CD Image Updater to close the loop: new image tag in GHCR → auto-commit to infra repo values.yaml → ArgoCD syncs.
