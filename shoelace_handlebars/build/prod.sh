#!/bin/bash

echo "building for production";

sh bash/compileLess.sh;

sh bash/pngSmash.sh;

grunt;

echo "finished building project";
