#!/bin/bash

PHOTON='https://raw.githubusercontent.com/connors/photon/master/dist'

mkdir -p static/photon/css
mkdir -p static/photon/fonts

echo "Downloading photon.."
curl $PHOTON'/css/photon.css' -o static/photon/css/photon.css $PHOTON'/fonts/photon-entypo.eot' -o static/photon/fonts/photon-entypo.eot $PHOTON'/fonts/photon-entypo.svg' -o static/photon/fonts/photon-entypo.svg $PHOTON'/fonts/photon-entypo.ttf' -o static/photon/fonts/photon-entypo.ttf $PHOTON'/fonts/photon-entypo.woff' -o static/photon/fonts/photon-entypo.woff
