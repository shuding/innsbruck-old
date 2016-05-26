#!/bin/bash

PHOTON='https://raw.githubusercontent.com/connors/photon/master/dist'

mkdir -p export/static/photon/css
mkdir -p export/static/photon/fonts

echo "Downloading photon.."
curl $PHOTON'/css/photon.css' -o export/static/photon/css/photon.css $PHOTON'/fonts/photon-entypo.eot' -o export/static/photon/fonts/photon-entypo.eot $PHOTON'/fonts/photon-entypo.svg' -o export/static/photon/fonts/photon-entypo.svg $PHOTON'/fonts/photon-entypo.ttf' -o export/static/photon/fonts/photon-entypo.ttf $PHOTON'/fonts/photon-entypo.woff' -o export/static/photon/fonts/photon-entypo.woff
