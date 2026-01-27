// Jenkinsfile untuk Git Pull Sederhana
// Simpan sebagai Jenkinsfile di root repository

pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo '📥 Checkout repository'
                checkout scm
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

        stage('Deploy to Nginx') {
            steps {
                echo '🚀 Deploying to Nginx'
                sh '''
                  sudo rm -rf /var/www/msione/dist/*
                  sudo cp -r dist/* /var/www/msione/dist/
                  sudo nginx -t
                  sudo systemctl reload nginx
                '''
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
