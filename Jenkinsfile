// Jenkinsfile untuk React.js - Sederhana (Pull dan Install Dependencies)
// Simpan sebagai Jenkinsfile di root repository

pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS'  // Menggunakan tool NodeJS versi 22.17.0 yang sudah dikonfigurasi
    }
    
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
        
        stage('Build Project') {
            steps {
                echo '🔨 Building React.js project...'
                sh 'npm run build'
                echo '✅ Build completed successfully!'
            }
        }
        
        stage('Deploy to Dev Server') {
            steps {
                echo '🚀 Deploying to development server via webhook...'
                script {
                    // Trigger deployment webhook ke Motorsights
                    sh """
                        echo '📤 Triggering deployment webhook...'
                        TIMESTAMP=\$(date -u +%Y-%m-%dT%H:%M:%SZ)
                        curl --location 'https://webhook-bangjeje.motorsights.com/webhook/deploy/sistem-b' \\
                            --header 'Content-Type: application/json' \\
                            --data "{
                                \\"ref\\": \\"refs/heads/develop\\",
                                \\"commits\\": [
                                    {
                                        \\"id\\": \\"${env.GIT_COMMIT}\\",
                                        \\"message\\": \\"Deploy from Jenkins Build #${env.BUILD_NUMBER}\\",
                                        \\"timestamp\\": \\"\$TIMESTAMP\\"
                                    }
                                ],
                                \\"repository\\": {
                                    \\"name\\": \\"msi-fe-apps\\",
                                    \\"full_name\\": \\"itmsi/msi\\"
                                }
                            }"
                        echo '✅ Webhook sent successfully!'
                    """
                }
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
