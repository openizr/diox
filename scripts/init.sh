#!/bin/bash

# Strict error handling.
set -eu
set -o pipefail

read -p "Please enter the application name (snake_case): " app_name
read -p "Please enter the application description: " app_description
read -p "Please enter your full name: " author_name
read -p "Please enter your git username: " author_username
read -p "Please enter your email: " author_email

sed -i "s%APP_NAME%$app_name%g" package.json
sed -i "s%APP_NAME%$app_name%g" README.md

sed -i "s%APP_DESCRIPTION%$app_description%g" package.json
sed -i "s%APP_DESCRIPTION%$app_description%g" README.md

sed -i "s%AUTHOR_NAME%$author_name%g" package.json
sed -i "s%AUTHOR_USERNAME%$author_username%g" package.json
sed -i "s%AUTHOR_EMAIL%$author_email%g" package.json

yarn install

echo "successfully initialized template!'