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
                script {
                    def workspaceDir = pwd()
                    if (!fileExists("${workspaceDir}/.git")) {
                        echo "Repo belum ada, lakukan git clone"
                        sh "git clone --branch ${env.BRANCH_NAME} git@github.com:itmsi/msi.git ."
                    } else {
                        echo "Repo sudah ada, lakukan git fetch & pull"
                        sh "git fetch origin"
                        sh "git reset --hard origin/${env.BRANCH_NAME}"
                    }
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
