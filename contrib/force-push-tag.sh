#! /usr/bin/env bash

git tag --force --annotate production --message 'production tag'
git push --tags origin +production:production
