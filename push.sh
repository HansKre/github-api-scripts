#!/bin/sh

####### Fn Definitions #########

function invalidatePushUrl {
    # loop through all dirs
    for dirName in */; do
        cd $dirName
        echo "$dirName"
        # set a new push-url for remote
        git remote set-url --push origin no_push
        git remote -v
        cd ..
    done
}

function basicJqExample {
    # sudo apt install jq
    # retrieve all names from json-files as array
    # example repo-url: https://user:12345@git.foo.com/mirror/mvi-core.git

    # outputs an array of {name: <name>, url: <url>}-objects to stdout
    cat repos1.json | jq --arg token "$PERSONALACCESSTOKEN" '[.[] | { name: .name, url: ("https://user:" + $token + "@git.foo.com/mirror/" + (.name) +".git") }]'
}

function changePushUrl {
    if [ -z "$PERSONALACCESSTOKEN" ] || [ -z "$URL" ]; then
        echo "github personal access token needs to be provided as environment variable, e.g. 'export PERSONALACCESSTOKEN=12345' or 'export URL=git.foo.com/mirror/' "
    else
        local rawJsonData
        mergeJsonFiles rawJsonData

        # jsonData=$(cat repos1.json | jq --arg token "$PERSONALACCESSTOKEN" --arg url "$URL" '[.[] | { name: .name, url: ("https://user:" + $token + "@" + $url + (.name) +".git") }]')
        jsonData=$(echo $rawJsonData | jq --arg token "$PERSONALACCESSTOKEN" --arg url "$URL" '[.[] | { name: .name, url: ("https://user:" + $token + "@" + $url + (.name) +".git") }]')

        # echo "$jsonData"
        # echo $jsonData | jq '. | length'

        # jq --compact-output (or -c) outputs each object on a newline.
        # -r gets rid of the quotes
        # echo $jsonData | jq -c -r '.[].name'
        for row in $(echo $jsonData | jq -c '.[]'); do
            name=$(echo $row | jq -r '.name')
            url=$(echo $row | jq -r '.url')

            cd "repos/$name"
            # set a new push-url for remote
            git remote set-url --push origin $url
            git remote -v
            cd ..
            cd ..
        done
    fi
}

function pullThenPush {
    if [ -z "$PERSONALACCESSTOKEN" ]; then
        echo "github personal access token needs to be provided as environment variable, e.g. 'export PERSONALACCESSTOKEN=12345'"
    else
        jsonData=$(echo $rawJsonData | jq --arg token "$PERSONALACCESSTOKEN" --arg url "$URL" '[.[] | { name: .name, url: ("https://user:" + $token + "@" + $url + (.name) +".git") }]')

        # jq --compact-output (or -c) outputs each object on a newline.
        # -r gets rid of the quotes
        # echo $jsonData | jq -c -r '.[].name'
        for row in $(echo $jsonData | jq -c '.[]'); do
            name=$(echo $row | jq -r '.name')
            url=$(echo $row | jq -r '.url')

            cd "repos/$name"
            # http://blog.plataformatec.com.br/2013/05/how-to-properly-mirror-a-git-repository/
            # $ git clone --mirror git@example.com/upstream-repository.git
            # $ cd upstream-repository.git
            # $ git push --mirror git@example.com/new-location.git

            git pull --all
            git push --all
            cd ..
            cd ..
        done
    fi
}

function mergeJsonFiles() {
    # example:
    # file1.json:  "list" : [ {"id: 123, "fname":"SAM" }, {"id: 125, "fname":"JOE" } .....]
    # file2.json: "list" : [ {"id: 783, "fname":"Danny" }, {"id: 785, "fname":"Kingmo" } .....]
    # jq -n '{ list: [ inputs.list ] | add }' file1.json file2.json

    # use inputs function to get the content of all the JSON files together and append them together
    # -n: Don't read any input at all! Instead, the filter is run once using null as the input.
    # jq -n '[inputs] | add' repos1.json repos2.json repos3.json >test2.json
    # jq -n '[inputs] | . | add' repos1.json repos2.json repos3.json >test2.json

    # user first parameter as nameref
    # https://stackoverflow.com/questions/10582763/how-to-return-an-array-in-bash-without-using-globals
    local -n returnVar=$1
    returnVar=$(jq -n '[inputs] | add' repos1.json repos2.json repos3.json)
}

######## Execute ###########

# call the function by writing it's name
changePushUrl
