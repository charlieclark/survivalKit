#!/bin/sh

#sudo npm install -g jpegtran-bin

for jpg in $(find . -name '*.jpg'); do
    echo "crushing $jpg ..."
    jpegtran-bin -copy none -optimize -perfect "$jpg" > temp.jpg
 
    # preserve original on error
    if [ $? = 0 ]; then
        mv -f temp.jpg $jpg
    else
        rm temp.jpg
    fi
done;
