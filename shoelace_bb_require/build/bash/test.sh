#!/bin/bash

params=$@

#defaults
build=false

for PARAM in $params
do
	echo $PARAM
	if [ $PARAM = "-b" ]
	then
		build=true
	fi
done

echo $build