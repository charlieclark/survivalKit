#!/bin/bash


#!/bin/bash

params=$@

#defaults
build=false
optimize=false

echo "building for production";

for PARAM in $params
do
	echo $PARAM
	if [ $PARAM = "-b" ]
	then
		build=true
	fi

	if [ $PARAM = "-o" ]
	then
		optimize=true
	fi
done

echo "compiling css";
sh bash/compileLess.sh;

#optimize images if passed -o
if [ $optimize = true ]; then
	echo "compressing jpgs";
	sh bash/optimizeJpg.sh;
	echo "compressing pngs";
	sh bash/pngSmash.sh;
fi

#build to ftp if passed -b
if [ $build = true ]; then
	sh bash/uploadToServer.sh;
fi

echo "minifying javascript";
node r.js -o build.js;

echo "finished building project";
