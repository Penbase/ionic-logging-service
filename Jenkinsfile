#!groovy
@Library('jenkins-library@master') _
import com.penbase.rocketchat.RocketChat
import jenkins.plugins.rocketchatnotifier.*
import hudson.model.*

// à laisser en dehors de la pipeline
def FULL_BUILD = currentBuild.rawBuild.getCause(jenkins.branch.BranchEventCause) == null && currentBuild.rawBuild.getCause(org.jenkinsci.plugins.workflow.cps.replay.ReplayCause)?.getOriginal()?.getCause(jenkins.branch.BranchEventCause) == null

pipeline {
    agent {
        label 'mac'
    }

    environment {
        // Github variables
        GITHUB_PROJECT = "Penbase/ionic-logging-service"
        GITHUB_TOKEN = credentials('Github-token')

        // Build variables
        SONAR_ANALYSIS = "false"
        SONAR_PROJECT = "${GITHUB_PROJECT.substring(GITHUB_PROJECT.indexOf('/') + 1)}.${PROJECT_VERSION}"
        SONAR_SOURCES = "src,projects/ionic-logging-service"
        SONAR_EXCLUSIONS = "dist,docker-compose/**,tests/**,vendor/**,node_modules/**,var/**,build/**"
        SONAR_TESTS = "tests"
        FULL_BUILD = "$FULL_BUILD"
        IS_PR = "$BRANCH_NAME".startsWith("PR-")
        PROJECT_VERSION = "$BRANCH_NAME".replaceAll("[^a-zA-Z0-9_]", "_")

        // Emplacement du répertoire dist
        DIST_LOCATION = "dist/ionic-logging-service"
        // Chemin du package.json dans lequel on modifie la version
        VERSION_LOCATION = "projects/ionic-logging-service/package.json"
        INSTALL_LOCATION = "projects/ionic-logging-service/"
        ROCKETCHAT_PREPROD_CHAN = "jenkins_mobile"
        PROJECT_NAME = "ionic-logging-service"
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '5'))
    }

    stages {
        stage('Build library and publish') {
            steps {
                script {
                    nodejs(nodeJSInstallationName: 'nodejs18') {
                        sh "npm install"
                        sh "cd " + INSTALL_LOCATION + " && " + " npm install"
                        sh "npm run test-ci"
                        if (env.TAG_NAME) {
                            updateVersion(env.TAG_NAME);
                            sh "npm run build-service"
                            sh "cd " + DIST_LOCATION + " && " + " npm publish"
                        } else {
                            sh "echo No tag found. There is nothing to build and publish"
                        }
                    }
                }
            }
        }

        stage('Deploy result') {
            when {
                expression {
                    return env.TAG_NAME
                }
            }
            steps {
                script {
                    def res = "";
                    res += ":pencil: Mise en production de *"+PROJECT_NAME+" ${env.TAG_NAME}* terminée"
                    res += "\nDependence npm : `\"@penbase/ionic-logging-service\" : \"${env.TAG_NAME}\"`"
                    println res

                    //Publish to rocket chat !

                    def chan = ROCKETCHAT_PREPROD_CHAN
                    if (RocketChat.sendMessage(res, chan)) {
                        println "Message sent to rocketchat into #" + chan
                    } else {
                        println "Unable to send message to rocketchat into #" + chan
                    }
                }
            }
        }
    }
    post {
        success {
            script {
                withCredentials([[$class: 'SSHUserPrivateKeyBinding', credentialsId: '1cc7647c-c0b0-4a9b-ae3b-9d8832a6ef7d', usernameVariable: 'USERNAME', keyFileVariable: 'IDENTITY_FILE']]) {
                    withEnv(["GIT_SSH_COMMAND=ssh -i $IDENTITY_FILE"]) {
                      sh "echo succeeded"
                    }
                }
            }
        }
        failure {
            emailext body: '$DEFAULT_CONTENT', recipientProviders: [[$class: 'CulpritsRecipientProvider']], subject: '$DEFAULT_SUBJECT'
        }
    }
}

def updateVersion(String newVersion) {
  sh "echo updateVersion method"
    def packageJson = readJSON file: VERSION_LOCATION
    sh "echo packageJson.version=" + packageJson.version
    if (newVersion.startsWith("v")) {
      newVersion = newVersion.substring(1)
      sh "echo newVersion = " + newVersion
    }
    packageJson.version = newVersion
    writeJSON file: VERSION_LOCATION, json: packageJson
}

