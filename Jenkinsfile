# Jenkinsfile untuk React.js - Sederhana (Pull dan Install Dependencies)
# Simpan sebagai Jenkinsfile di root repository

pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                echo '📥 Pulling code from repository...'
                checkout scm
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
        
        stage('Node.js Info') {
            steps {
                echo '🟢 Node.js Information:'
                sh 'node --version || echo "Node.js not installed"'
                sh 'npm --version || echo "npm not installed"'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo '📦 Installing React.js dependencies...'
                sh 'npm install'
                echo '✅ Dependencies installed successfully!'
            }
        }
        
        stage('Verify Installation') {
            steps {
                echo '🔍 Verifying installation:'
                sh 'ls -la node_modules/ | head -10'
                echo '📊 Package.json scripts available:'
                sh 'npm run --silent 2>/dev/null || echo "No scripts defined"'
            }
        }
    }
    
    post {
        always {
            echo '✅ Pipeline completed!'
            echo 'Build finished at: ' + new Date().toString()
            echo 'React.js project ready for development!'
        }
        
        success {
            echo '🎉 Success: Dependencies installed successfully!'
        }
        
        failure {
            echo '❌ Failed: Check npm install logs for errors'
        }
    }
}
