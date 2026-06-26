pipeline {
    agent any

    environment {
        DOCKER_CREDENTIALS_ID = 'docker-hub-credentials'
        DOCKER_REGISTRY = 'dhaanush19'
        BACKEND_IMAGE = "${DOCKER_REGISTRY}/careerpilot-backend"
        FRONTEND_IMAGE = "${DOCKER_REGISTRY}/careerpilot-frontend"
        IMAGE_TAG = "${env.BUILD_ID}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend Image') {
            steps {
                dir('backend') {
                    script {
                        docker.build("${BACKEND_IMAGE}:${IMAGE_TAG}")
                    }
                }
            }
        }

        stage('Build Frontend Image') {
            steps {
                dir('frontend') {
                    script {
                        docker.build("${FRONTEND_IMAGE}:${IMAGE_TAG}")
                    }
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                script {
                    /* Uncomment and configure credentials in Jenkins to push
                    docker.withRegistry('', DOCKER_CREDENTIALS_ID) {
                        docker.image("${BACKEND_IMAGE}:${IMAGE_TAG}").push()
                        docker.image("${BACKEND_IMAGE}:latest").push()
                        
                        docker.image("${FRONTEND_IMAGE}:${IMAGE_TAG}").push()
                        docker.image("${FRONTEND_IMAGE}:latest").push()
                    }
                    */
                    echo "Skipping push: uncomment in Jenkinsfile to push to registry"
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    /*
                    withKubeConfig([credentialsId: 'k8s-config']) {
                        // Apply Kubernetes manifests
                        sh 'kubectl apply -f k8s/'
                        
                        // Update deployments with new image tags
                        sh "kubectl set image deployment/cp-backend cp-backend=${BACKEND_IMAGE}:${IMAGE_TAG}"
                        sh "kubectl set image deployment/cp-frontend cp-frontend=${FRONTEND_IMAGE}:${IMAGE_TAG}"
                    }
                    */
                    echo "Skipping deploy: uncomment in Jenkinsfile to deploy to k8s"
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}
