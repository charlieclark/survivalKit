#!/bin/bash

echo compiling less;

#cant install globally
~/.npm/less/1.4.1/package/bin/lessc public/assets/css/global.less public/assets/css/global.css


#lessc public/assets/css/global.less public/assets/css/global.css

#deleting all css files that arent global.css - these sometimes get created when using and ide that auto-compiles

for file in $(find . -name '*.css'); do
    
	echo $file | grep global; 

	HASSTRING=$?;

	if [ "$HASSTRING" == 1 ]
    then
        rm $file
    fi

done;