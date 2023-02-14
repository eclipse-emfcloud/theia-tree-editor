def kubernetes_config = """
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: node
    image: eclipsetheia/theia-blueprint:builder
    tty: true
    resources:
      limits:
        memory: "4Gi"
        cpu: "2"
      requests:
        memory: "4Gi"
        cpu: "2"
    command:
    - cat
    volumeMounts:
    - mountPath: "/home/jenkins"
      name: "jenkins-home"
      readOnly: false
    - mountPath: "/.yarn"
      name: "yarn-global"
      readOnly: false
  volumes:
  - name: "jenkins-home"
    emptyDir: {}
  - name: "yarn-global"
    emptyDir: {}
"""

pipeline {
    agent {
        kubernetes {
            label 'emfcloud-agent-pod'
            yaml kubernetes_config
        }
    }
    
    options {
        buildDiscarder logRotator(numToKeepStr: '15')
    }
    
    environment {
        YARN_CACHE_FOLDER = "${env.WORKSPACE}/yarn-cache"
        SPAWN_WRAP_SHIM_ROOT = "${env.WORKSPACE}"
        EMAIL_TO = "ndoschek+eclipseci@eclipsesource.com, lkoehler+theia-tree-editor-ci@eclipsesource.com"
        PUPPETEER_SKIP_DOWNLOAD="true"
    }

    stages {
        stage('Build') {
            steps {
                container('node') {
                    withCredentials([string(credentialsId: "github-bot-token", variable: 'GITHUB_TOKEN')]) {
                        sh "yarn --ignore-engines --unsafe-perm"
                    }
                }
            }
        }

        stage('Deploy (master only)') {
            when { branch 'master' }
            steps {
                build job: 'deploy-theia-tree-editor-npm', wait: false
            }
        }
    }

    post {
        failure {
            script {
                if (env.BRANCH_NAME == 'master') {
                    echo "Build result FAILURE: Send email notification to ${EMAIL_TO}"
                    emailext attachLog: true,
                    body: 'Job: ${JOB_NAME}<br>Build Number: ${BUILD_NUMBER}<br>Build URL: ${BUILD_URL}',
                    mimeType: 'text/html', subject: 'Build ${JOB_NAME} (#${BUILD_NUMBER}) FAILURE', to: "${EMAIL_TO}"
                }
            }
        }
        unstable {
            script {
                if (env.BRANCH_NAME == 'master') {
                    echo "Build result UNSTABLE: Send email notification to ${EMAIL_TO}"
                    emailext attachLog: true,
                    body: 'Job: ${JOB_NAME}<br>Build Number: ${BUILD_NUMBER}<br>Build URL: ${BUILD_URL}',
                    mimeType: 'text/html', subject: 'Build ${JOB_NAME} (#${BUILD_NUMBER}) UNSTABLE', to: "${EMAIL_TO}"
                }
            }
        }
        fixed {
            script {
                if (env.BRANCH_NAME == 'master') {
                    echo "Build back to normal: Send email notification to ${EMAIL_TO}"
                    emailext attachLog: false,
                    body: 'Job: ${JOB_NAME}<br>Build Number: ${BUILD_NUMBER}<br>Build URL: ${BUILD_URL}',
                    mimeType: 'text/html', subject: 'Build ${JOB_NAME} back to normal (#${BUILD_NUMBER})', to: "${EMAIL_TO}"
                }
            }
        }
    }
}
