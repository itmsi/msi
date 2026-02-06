// Jenkinsfile untuk Git Pull Sederhana
// Simpan sebagai Jenkinsfile di root repository

pipeline {
    agent any
    
    options {
        skipDefaultCheckout(true)
    }

    stages {
          stage('Pull Branch') {
            steps {
                echo "Pulling branch ${env.BRANCH_NAME}"
                withCredentials([string(credentialsId: 'GITHUB_TOKEN', variable: 'TOKEN')]) {
                    sh """
                        if [ ! -d .git ]; then
                            git clone --branch ${env.BRANCH_NAME} https://${TOKEN}@github.com/itmsi/msi.git .
                        else
                            git fetch origin
                            git checkout ${env.BRANCH_NAME}
                            git pull --force
                        fi
                    """
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '📦 Installing dependencies'
                sh 'npm install'
            }
        }

        stage('Build') {
            steps {
                echo '🏗️ Building React app'
                sh 'npm run build'
            }
        }

    }

    post {
        always {
            echo '✅ Pipeline completed!'
            echo 'Build finished at: ' + new Date().toString()
        }
        
        success {
            echo '🎉 Build & Deploy SUCCESS'
        }
        failure {
            echo '❌ Build or Deploy FAILED'
        }
    }
}
