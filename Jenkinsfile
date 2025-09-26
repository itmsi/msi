// Jenkinsfile untuk Git Pull Sederhana
// Simpan sebagai Jenkinsfile di root repository

pipeline {
    agent any
    
    stages {
        stage('Git Pull') {
            steps {
                echo '📥 Pulling code from repository...'
                checkout scm
                echo '✅ Code pulled successfully!'
            }
        }
        
        stage('Info') {
            steps {
                echo '📋 Project Information:'
                echo 'Repository: ' + env.JOB_NAME
                echo 'Branch: ' + env.BRANCH_NAME
                echo 'Build Number: ' + env.BUILD_NUMBER
                echo 'Workspace: ' + env.WORKSPACE
            }
        }
    }
    
    post {
        always {
            echo '✅ Pipeline completed!'
            echo 'Build finished at: ' + new Date().toString()
        }
        
        success {
            echo '🎉 Success: Code pulled successfully!'
        }
        
        failure {
            echo '❌ Failed: Check git pull logs for errors'
        }
    }
}
