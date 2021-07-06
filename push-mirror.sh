#!/bin/sh

####### Fn Definitions #########

pushMirror() {
    reposDir=$1
    if [ -d $reposDir ]; then
        cd "$reposDir"
        # loop through all dirs
        for dirName in */; do
            cd $dirName
            echo "$dirName"
            echo "https://user:$PERSONALACCESSTOKEN@git.daimler.com/mirror/$dirName"
            git push --mirror "https://user:$PERSONALACCESSTOKEN@git.daimler.com/mirror/$dirName"
            cd ..
        done
        cd ..
    else
        echo "$reposDir does not exist."
    fi
}

######## Execute ###########

# call the function by writing it's name
pushMirror "2021-07-06-repos"
