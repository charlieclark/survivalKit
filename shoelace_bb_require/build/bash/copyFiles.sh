#!/bin/bash

#run this from root to copy over files to dedicated svn repo

destFolder="$HOME/Desktop/git-svn/local"

find $destFolder/* -maxdepth 0 -name '.git' -prune -o -exec rm -rf '{}' ';'

cp -R . $destFolder