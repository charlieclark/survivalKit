#!/bin/bash

#brew install pngquant

echo compressing files


 if hash pngquant 2>/dev/null; then
        echo "nice pngquant is installed";
    else
        echo "you need to install png quant to smash em pngs";
        exit 1;
    fi


for file in $(find . -name '*.png'); do
    pngquant 256 $file
done;

echo delting uncompressed files
for file in $(find . -name '*.png'); do

echo $file | grep fs8; 

HASSTRING=$?;
NUMBER=1;

    if [ "$HASSTRING" == "$NUMBER" ]
    then
        rm $file
    fi
done;

echo renaming compressed files

for file in $(find . -name '*.png'); do
        NEW=`echo $file | sed s/-fs8// `;
        mv $file $NEW
done;