#!/bin/bash

# DIRECTORY TO THE REPOSITORY
REPOSITORY="../repo"

# This deploy key must not have challenge key.
# Uncomment this, if your keys doesn't have default names.
#SSH_KEY="/home/<user>/.ssh/<secret_key>"

eval $(ssh-agent -s)
ssh-add $SSH_KEY

# test login just in case.
ssh -T git@github.com

cd $REPOSITORY

git pull
