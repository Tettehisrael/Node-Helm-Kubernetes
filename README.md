# Deploying a Node.js Application to Kubernetes Using Helm and Helm Chart


## step 1: Create a Basic Node.js Application
We will be creating an Express server Node.js application. We will create a folder and name it Node-App and open it with our Vs-code.
Run the following command to initialize the folder

```
npm init -y
npm install express
```

We need to install the `cors` package which is a Node.js module for providing Express middleware to enable CORS with various options. Run the following command to install the CORS package.</br>
`npm install cors –save`

To run the Express server, run the following command.</br>
`node index.js`


## Step 2:  Containerizing the Application using Docker 


Creating a Docker file.
Copy the following command into the Docker file.
```
# It will pull node:18-alpine as the base image from Docker Hub
FROM node:18-alpine
# It creates the container working directory named `node`
WORKDIR /node
# It copies all the dependencies and libraries to the working directory
COPY package.json .
#It installs all the dependencies and libraries to the container
RUN npm install
#It copies all the source code and configuration files to the container working directory
COPY . .
#it exposes and runs the container to port 4000
EXPOSE 4000
#It is the command to start and run the container for the Node.js application
CMD ["node", "index.js"]
```

Run the following command in your terminal to build the docker image</br>
` docker build -t <docker hub username>/node-app .`

To push your image, run the following command. We will first login in to our Docker registry which is our Docker Hub</br>
`docker login`

Run the following command to push the image to the Docker Registry.</br>
`docker push < docker hub username>/node-app`

Run the following command to run the containerized node-application.</br>
`docker run -p 4000:4000 <docker hub username>/node-app`


## Step 3: Installing Helm

Run the following command in your terminal.</br>
`minikube start  –driver=docker` 

install  helm on our cluster. Run the following command</br>
`brew install helm`

To see the helm commands, run the following commands.</br>
`helm`

Run the following command to check the helm version.</br>
`helm version`


# Step 4: Creating helm chart

Run the following command to create a helm chart.</br>
`helm create node-app-chart`


Run the following command to get the structure of the helm chart.</br>
`ls-node-app-chart`


modify the `values.yaml` file 
```
replicaCount: 2

image:
     repository: <Docker Hub username>/node-app
     pullPolicy: IfNotPresent
     tag: "latest"
service:
   type: LoadBalancer
   port: 4000
   targetPort: 4000
   protocol: TCP 
   name: node-app-service

resources: {}
limits:
      cpu: 100m
      memory: 256Mi
requests:
       cpu: 100m
       memory: 256Mi

autoscaling:
    enabled: false
    minReplicas: 1
    maxReplicas: 100
    targetCPUUtilizationPercentage: 80
```

modify  `deployment.yaml` file.

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "node-app-chart.fullname" . }}
  labels:
    {{- include "node-app-chart.labels" . | nindent 4 }}
spec:
  {{- if not.Values.autoscaling.enabled }}
  replicas: {{ .Values.replicaCount }}
  {{- end }}
  selector:
    matchLabels:
      {{- include "node-app-chart.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      {{- with .Values.podAnnotations }}
      annotations:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      labels:
        {{- include "node-app-chart.selectorLabels" . | nindent 8 }}
    spec:
      {{- with .Values.imagePullSecrets }}
      imagePullSecrets:
        {{- toYaml . | nindent 8 }}
      {{- end }}
    containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default.Chart.AppVersion }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          ports:
            - name: http
              containerPort: 4000
              protocol: TCP
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
```

modify `service.yaml`.
```
apiVersion: v1
kind: Service
metadata:
  name: {{ include "node-app-chart.fullname" . }}
  labels:
    {{- include "node-app-chart.labels" . | nindent 4 }}
spec:
  type: {{ .Values.service.type }}
  ports:
    - port: {{ .Values.service.port }}
      targetPort: {{ .Values.service.targetPort }}
      protocol: {{ .Values.service.protocol }}
      name: {{ .Values.service.name }}
  selector:
    {{- include "node-app-chart.selectorLabels" . | nindent 4 }}
```

## Step 5: Deploying the Node.js application to Kubernetes 

To deploy our Node.js application to kubernetes using Helm chart, run the following command</br>
`helm install node-app-chart –generate-name`

Now let's confirm our created pods, deployments and services. We will be using the Kubectl command.</br>
`kubectl get pods`

Now run the following command to get kubernetes deployment</br>
`kubectl get deployment`

Now run the following command to get kubernetes service</br>
`kubectl get service`



## Step 6: Accessing the Node.js Application using Kubernetes Service

Now run the minikube command to access the application</br>
`minikube service node-app-chart`


