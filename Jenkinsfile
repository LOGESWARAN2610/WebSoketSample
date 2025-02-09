pipeline {
    agent any

    environment {
        NODEJS_HOME = 'C:\\Program Files\\nodejs' // Update to your Node.js installation path
        PATH = "${NODEJS_HOME};${env.PATH}"
    }

    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'main', url: 'https://github.com/LOGESWARAN2610/WebSoketSample.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Build React App') {
            steps {
                bat 'npm run build'
            }
        }

        stage('Archive Build Artifacts') {
            steps {
                archiveArtifacts artifacts: 'dist/**', fingerprint: true
            }
        }

        stage('Copy Files to C Drive') {
            steps {
                powershell 'Copy-Item -Path dist\\* -Destination C:\\react-build\\ -Recurse -Force'
            }
        }
    }
}
